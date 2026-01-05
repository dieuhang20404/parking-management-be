import { sendEmail } from "../configs/email";
import { prisma, ReturnData } from "../configs/interface";
import { redis } from "../configs/redis";
import { v1 as uuidv1 } from "uuid"; 
import QRCode from "qrcode";
import net from "net";
import axios from "../configs/axios";
import FormData from 'form-data';
import { captureImage, openServo } from "../configs/esp32";
import { uploadBufferToCloudinary } from "../configs/cloudinary";

export const serviceError: ReturnData = {
    message: "Xảy ra lỗi ở service",
    data: false,
    code: -1
}

export const getAllTicketService = async (uuid: string): Promise<ReturnData> => {
    try {
        const tickets = await prisma.ticket.findMany({
            where: {
                uuid: uuid
            },
            orderBy: {
                id: "desc"
            },
            select: {
                id: true,
                plateNumber: true,
                timeIn: true,
                timeOut: true,
                uuid: true,
                qrCode: true,
                parkingLotId: true
            }
        })
        return({
            message: "Thành công",
            data: tickets,
            code: 0
        })
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const callAIService = async (imgUrl: string): Promise<ReturnData> => {
    try {
        const imageResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data);
        const form = new FormData();
        form.append('file', imageBuffer, { 
            filename: 'capture.jpg',
            contentType: imageResponse.headers['content-type'] || 'image/jpeg',
        });

        const aiUrl = process.env.FASTAPI_URL;
        if (!aiUrl) {
            return({
                message: "Không tìm thấy AI_URL",
                data: null,
                code: 1
            })
        }

        const response = await axios.post(aiUrl, form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 15000,
        });

        if (!response.data.plates) {
            return({
                message: "Không tìm thấy phát hiện được biển số",
                data: null,
                code: 1
            })
        }

        return({
            message: "Detect Success",
            data: response.data.plates.plate,
            code: 0
        })
    } catch (e) {
        console.log(e);
        return serviceError;
    }
};

export const getPlateNumberService = async (): Promise<ReturnData> => {
    try {
        const emptyPosition = await prisma.parkingLot.findMany({
            where: {
                status: 0
            },
            select: {
                id: true
            }
        })
        if (emptyPosition.length == 0) {
            return({
                message: "Bãi xe hết chỗ trống",
                data: false,
                code: 1
            })
        }

        const imageResult = await captureImage();

        const detectResult = await callAIService(imageResult);

        if (detectResult.code != 0) {
            return detectResult;
        }

        return({
            data: {
                imageUrl: imageResult,
                plateNumber: detectResult
            },
            code: 0,
            message: "Thành công"
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const createTicketService = async (uuid: string, plateNumber: string, imageIn: string): Promise<ReturnData> => {
    try {
        const now = new Date();
        const ticketData = {
            plateNumber: plateNumber,
            timeIn: now,
            uuid: uuid,
            imageIn: imageIn
        }
        const resultGenerate = await generateQrService(ticketData);
        if (resultGenerate.code != 0) {
            return({
                message: "Lỗi khi tạo mã QR Code",
                data: false,
                code: 1
            })
        }

        const resultUpload: any = await uploadBufferToCloudinary(resultGenerate.data.qrBuffer);

        // Tìm đỡ chỗ trống nếu không có thuật toán tìm kiếm 
        const emptyPosition = await getEmptyPositionService();

        if (emptyPosition.code != 0) {
            return({
                message: "Bãi xe không còn chỗ trống",
                data: false,
                code: 1
            })
        }
        
        // Người dùng xác nhận đúng biển số xe thì tạo vé giữ xe
        const ticket = await prisma.ticket.create({
            data: {
                plateNumber: plateNumber,
                timeIn: now,
                uuid: uuid,
                qrCode: resultUpload.url,
                imageIn: imageIn,
                parkingLotId: emptyPosition.data[0]
            }
        })

        // Gửi request mở servo
        const resultOpen = await openServo();

        // Hiện map chỉ đường

        return({
            message: "Thành công",
            data: ticket,
            code: 0
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const sendOtpService = async (): Promise<ReturnData> => {
    try {
        const existAdmin = await redis.get("admin");
        if (existAdmin) {
            return({
                message: "Tài khoản admin đang đăng nhập ở máy khác",
                data: false,
                code: 1
            })
        }
        const existOtp = await redis.get("otp");
        if (existOtp) {
            console.log(existOtp);
            const ttl = await redis.ttl("otp");
            const expiry = Date.now() + ttl * 1000;
            return({
                message: "Mã xác thực đã được gửi, vui lòng kiểm tra email",
                data: expiry,
                code: 2
            })
        }
        
        const otp = Array.from({length: 5}, () => {
            return Math.floor(Math.random() * 10)
        }).join("");

        await redis.set("otp", otp, "EX", 60 * 3);
        
        const expiry = Date.now() + 60 * 3 * 1000;

        await sendEmail(
            `
                Mã xác thực của bạn là: ${otp}
            `
        )
        return({
            message: "Mã xác thực đã được gửi vào email",
            code: 0,
            data: expiry
        })
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const checkOtpService = async (valueConfirm: string): Promise<ReturnData> => {
    try {
        const otpAuth = await redis.get("otp");
        if (!otpAuth) {
            return({
                message: "Không tìm thấy mã xác thực",
                data: false,
                code: 1
            })
        }
        if (valueConfirm != otpAuth) {
            return({
                message: "Mã xác thực không đúng",
                data: false,
                code: 1
            })
        }
        const uuid = uuidv1();
        await redis.set("admin", uuid, "EX", 60 * 60 * 24);
        await redis.del("otp");
        return({
            message: "Chính xác",
            code: 0,
            data: uuid
        })
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const getSensorPositionService = async (): Promise<ReturnData> => {
    try {
        const parkingLot = await prisma.parkingLot.findMany({
            where: {
                sensorId: {not: null}
            },
            select: {
                id: true
            }
        })
        const positionId = parkingLot.map((item: any) => (item.id))
        return({
            message: "Thành công",
            data: positionId,
            code: 0
        })
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const getEmptyPositionService = async (): Promise<ReturnData> => {
    try {
        const position = await prisma.parkingLot.findMany({
            where: {
                status: 0
            },
            select: {
                id: true
            }
        })
        const positionId = position.map((item: any) => (item.id))
        return({
            message: "Thành công",
            data: positionId,
            code: 0
        })
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const getHistoryService = async (): Promise<ReturnData> => {
    try {
        const history = await prisma.ticket.findMany({
            select: {
                id: true,
                plateNumber: true,
                timeIn: true,
                timeOut: true,
                parkingLotId: true,
                imageIn: true,
                imageOut: true
            }
        })
        return({
            message: "Thành công",
            data: history,
            code: 0
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const checkoutService = async (): Promise<ReturnData> => {
    try {
        const imageResult = await captureImage();
        // Giải hình ảnh
        
        // Cập nhật db

        
        return serviceError;
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const createTicketTestService = async (uuid: string): Promise<ReturnData> => {
    try {
        const now = new Date();
        const ticket = await prisma.ticket.create({
            data: {
                plateNumber: "59-XA-02299",
                timeIn: now,
                uuid: uuid,
                qrCode: "https://res.cloudinary.com/dibigdhgr/image/upload/v1767441127/frame_bqbjhk.png",
                imageIn: "https://res.cloudinary.com/dibigdhgr/image/upload/v1767441127/frame_bqbjhk.png",
                parkingLotId: 1
            }
        })

        return({
            message: "Thêm thành công",
            data: {
                id: ticket.id,
                plateNumber: ticket.plateNumber,
                timeIn: ticket.timeIn,
                timeOut: null,
                uuid: ticket.uuid,
                qrCode: ticket.qrCode,
                parkingLotId: ticket.parkingLotId
            },
            code: 0
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const generateQrService = async (qrData: any): Promise<ReturnData> => {
    try {
        const qrString = JSON.stringify(qrData);
        const qrCodeUrl = await QRCode.toDataURL(qrString);
        const qrCodeBuffer = await QRCode.toBuffer(qrString);
        return({
            message: "Tạo mã QR thành công",
            data: {
                qrImage: qrCodeUrl, 
                qrBuffer: qrCodeBuffer, 
                ...qrData
            },
            code: 0
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}
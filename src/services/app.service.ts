import { sendEmail } from "../configs/email";
import { prisma, ReturnData } from "../configs/interface";
import { redis } from "../configs/redis";
import { v1 as uuidv1 } from "uuid"; 
import QRCode from "qrcode";
import net from "net";

const serviceError: ReturnData = {
    message: "Xảy ra lỗi ở service",
    data: false,
    code: -1
}

export const testApiService = () => {
    return("abcd");
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

        // Lấy biển số xe

        return serviceError;
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const createTicketService = async (uuid: string): Promise<ReturnData> => {
    try {
        // Người dùng xác nhận đúng biển số xe thì tạo vé giữ xe

        // Update trạng thái chỗ đó (Update từ đây hoặc từ cảm biến gửi về)

        // Hiện map chỉ đường

        return serviceError;
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

export const checkoutService = async (qrCode: string): Promise<ReturnData> => {
    try {
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

// Xử lý dữ liệu cảm biến từ esp32
export const handleSensorDataService = async (sensorData: Array<{position: number, status: number}>): Promise<ReturnData> => {
    try {
        // Gửi lệnh yêu cầu ESP32 gửi trạng thái cảm biến
        await sendToEsp32("GET_STATUS");
        // sensorData là danh sách các object {position, status}
        // Cập nhật vào DB
        for (const sensor of sensorData) {
            await prisma.parkingLot.update({
                where: { id: sensor.position },
                data: { status: sensor.status }
            });
        }
        return({
            message: "Nhận dữ liệu cảm biến thành công",
            data: sensorData,
            code: 0
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

// Xử lý dữ liệu hình ảnh từ esp32
export const handleImageService = async (imageData: any): Promise<ReturnData> => {
    try {
        // Gửi lệnh yêu cầu ESP32 gửi hình ảnh
        await sendToEsp32("CAPTURE");
        // imageData: { imageBase64, ... } nhận từ ESP32
        // Lưu vào DB hoặc cloud nếu cần
        // await prisma.ticket.update({ where: { id: imageData.ticketId }, data: { imageIn: imageData.imageBase64 } });
        return({
            message: "Nhận dữ liệu hình ảnh thành công",
            data: imageData,
            code: 0
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

// Tạo mã QR từ dữ liệu nhận được
export const generateQrService = async (qrData: any): Promise<ReturnData> => {
    try {
        // Tạo mã QR từ dữ liệu nhận được
        const qrString = JSON.stringify(qrData);
        const qrCodeUrl = await QRCode.toDataURL(qrString);
        // Cập nhật vào DB (ví dụ bảng ticket)
        // await prisma.ticket.update({ where: { id: qrData.ticketId }, data: { qrCode: qrCodeUrl } });
        return({
            message: "Tạo mã QR thành công",
            data: { qr: qrCodeUrl, ...qrData },
            code: 0
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

// Gửi tín hiệu điều khiển servo cho esp32
export const sendServoSignalService = async (signal: string): Promise<ReturnData> => {
    try {
        // signal là số nguyên góc xoay
        const angle = parseInt(signal);
        if (isNaN(angle)) {
            return { message: "Góc servo không hợp lệ", data: false, code: 1 };
        }
        // Gửi lệnh tới ESP32
        const cmd = `SERVO:${angle}`;
        await sendToEsp32(cmd);
        return({
            message: "Gửi tín hiệu servo thành công",
            data: { angle },
            code: 0
        });
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

// Hàm gửi lệnh tới ESP32 qua TCP socket
async function sendToEsp32(cmd: string): Promise<void> {
    // Thông tin kết nối ESP32
    const esp32Host = process.env.ESP32_HOST || "10.138.174.88";
    const esp32Port = parseInt(process.env.ESP32_PORT || "4000");
    return new Promise((resolve, reject) => {
        const client = new net.Socket();
        client.connect(esp32Port, esp32Host, () => {
            client.write(cmd + "\n");
            client.end();
            resolve();
        });
        client.on("error", (err) => {
            reject(err);
        });
    });
}
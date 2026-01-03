import { sendEmail } from "../configs/email";
import { prisma, ReturnData } from "../configs/interface";
import { redis } from "../configs/redis";
import { v1 as uuidv1 } from "uuid"; 

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

        // Hiện map chỉ đường

        return serviceError;
    } catch(e) {
        console.log(e);
        return serviceError;
    }
}

export const sendOtpService = async (): Promise<ReturnData> => {
    try {
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
        const positionId = position.map((item) => (item.id))
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
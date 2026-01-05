import { getEmptyPositionService } from './../services/app.service';
import { Request, Response } from "express";
import { ReturnData } from "../configs/interface";
import * as service from "../services/app.service";
import { v1 as uuidv1 } from "uuid"; 
import { redis } from "../configs/redis";
import { getSocketIO } from '../configs/socket';

const controllerError: ReturnData = {
    message: "Xảy ra lỗi ở controller",
    data: false,
    code: -1
}

const dataError: ReturnData = {
    message: "Không có dữ liệu người dùng",
    data: false,
    code: 1
}

export const getUuid = (req: Request): string[] => {
    const authHeader = req.headers["authorization"];
    const key = authHeader?.split(" ")[1]?.split("=");
    return key ?? [""];
}

export const reloadPageController = async (req: Request, res: Response): Promise<any> => {
    try {
        const authHeader = req.headers["authorization"];
        const key = authHeader?.split(" ")[1]?.split("=")?.[0];
        const admin = authHeader?.split(" ")[1]?.split("=")?.[1];

        if (!key) {
            const uuid = uuidv1();
            return res.status(200).json({
                message: "Chưa có key",
                data: uuid,
                code: 2,
            });
        }

        const value = await redis.get(admin ?? "");
        if (!value) {
            return res.status(200).json({
                message: "Không phải admin",
                data: false,
                code: 1
            })
        }

        return res.status(200).json({
            message: "Admin",
            data: false,
            code: 0
        })
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}

export const getAllTicketController = async (req: Request, res: Response): Promise<any> => {
    try {
        const uuid: string = getUuid(req)[0];
        if (!uuid || uuid == "") {
            return res.status(200).json(dataError);
        }
        const result = await service.getAllTicketService(uuid);
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}

export const getPlateNumberController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await service.getPlateNumberService();
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}

export const createTicketController = async (req: Request, res: Response): Promise<any> => {
    try {
        const uuid: string = getUuid(req)[0];
        if (!uuid || uuid == "") {
            return res.status(200).json(dataError);
        }
        const {plateNumber, imageIn} = req.body;
        if (!plateNumber || !imageIn) {
            return res.status(200).json(dataError);
        }
        const result = await service.createTicketService(uuid, plateNumber, imageIn);
        if (result.code == 0) {
            const io = getSocketIO();
            io.emit("ticket:create", result.data);
        }
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}


export const sendOtpController = async (req: Request, res: Response): Promise<any> => {
    try {
        const result = await service.sendOtpService();
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}

export const checkOtpController = async (req: Request, res: Response): Promise<any> => {
    try {
        const {valueConfirm} = req.body;
        if (!valueConfirm) {
            return res.status(200).json(dataError);
        }
        const result = await service.checkOtpService(valueConfirm);
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}

export const getEmptyPositionController = async (req: Request, res: Response): Promise<any> => {
    try {
        const admin: string = getUuid(req)[1];
        if (!admin || admin == "") {
            return res.status(200).json(dataError);
        }
        const adminAuth = await redis.get("admin")
        if (admin != adminAuth) {
            return res.status(200).json(dataError);
        }
        const result = await service.getSensorPositionService();
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}

export const getHistoryController = async (req: Request, res: Response): Promise<any> => {
    try {
        const admin: string = getUuid(req)[1];
        if (!admin || admin == "") {
            return res.status(200).json(dataError);
        }
        const adminAuth = await redis.get("admin")
        if (admin != adminAuth) {
            return res.status(200).json(dataError);
        }
        const result = await service.getHistoryService();
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}

export const checkoutController = async (req: Request, res: Response): Promise<any> => {
    try {
        const uuid: string = getUuid(req)[0];
        if (!uuid || uuid == "") {
            return res.status(200).json(dataError);
        }
        const result = await service.checkoutService();
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}


export const createTicketTestController = async (req: Request, res: Response): Promise<any> => {
    try {
        const uuid: string = getUuid(req)[0];
        if (!uuid || uuid == "") {
            return res.status(200).json(dataError);
        }
        const result = await service.createTicketTestService(uuid);

        if (result.code == 0) {
            const io = getSocketIO();
            io.emit("ticket:create", result.data);
        }
        
        return res.status(200).json(result);
    } catch(e) {
        console.log(e);
        return res.status(500).json(controllerError);
    }
}
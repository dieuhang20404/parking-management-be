import { Request, Response } from "express";
import { ReturnData } from "../configs/interface";
import * as service from "../services/app.service";

const controllerError: ReturnData = {
    message: "Xảy ra lỗi ở controller",
    data: false,
    code: -1
}

export const testApiController = (req: Request, res: Response) => {
    const returnValue = service.testApiService();
    return res.status(200).json({
        message: returnValue
    })
}
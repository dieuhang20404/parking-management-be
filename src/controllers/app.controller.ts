import { Request, Response } from "express";
import { ReturnData } from "../configs/interface";
import * as service from "../services/app.service";
import { findPath } from "../services/pathfinding.service";


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

export const getPathController = (req: Request, res: Response) => {
    try {
        const { grid, start, goals } = req.body;

        if (!grid || !start || !goals) {
            return res.status(400).json({
                message: "Thiếu tham số grid / start / goals",
                code: -2,
                data: false
            });
        }

        const path = findPath(grid, start, goals);

        return res.status(200).json({
            message: "Tìm đường thành công",
            path
        });

    } catch (err) {
        console.error("Lỗi tìm đường:", err);
        return res.status(500).json(controllerError);
    }
};
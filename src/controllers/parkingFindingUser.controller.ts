import { Request, Response } from "express";
import { getParkingInstructionBySensor } from "../services/parkingFindingUser.service";

export const getParkingInstruction = async (
    req: Request,
    res: Response
) => {
    const { sensorId } = req.body;

    if (typeof sensorId !== "number") {
        return res.status(400).json({ message: "sensorId không hợp lệ" });
    }

    const result = await getParkingInstructionBySensor(sensorId);

    return res.json(result);
};

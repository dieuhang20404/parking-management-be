import { Request, Response } from "express";
import findPathService, { getMatrix, getRandomSensorPosition } from "../services/parkingFinding.service";
import { Node } from "../util/type";
import { ReturnData } from "../configs/interface";
// ===== Constants =====
const DEFAULT_ENTRY: Node = [1, 1];

const CONTROLLER_ERROR: ReturnData = {
    message: "Xảy ra lỗi ở controller",
    data: false,
    code: -1
};

// ===== State =====
let cachedSensors: { x: number; y: number }[] | null = null;

// ===== Helper Functions =====
function calculateManhattanDistance(point: { x: number; y: number }, entry: Node): number {
    return Math.abs(point.x - entry[0]) + Math.abs(point.y - entry[1]);
}

function findNearestTarget(targets: { x: number; y: number }[], entry: Node): { x: number; y: number } {
    return targets.reduce((nearest, current) => {
        const distNearest = calculateManhattanDistance(nearest, entry);
        const distCurrent = calculateManhattanDistance(current, entry);
        return distCurrent < distNearest ? current : nearest;
    });
}

function isValidTarget(target: any): target is { x: number; y: number } {
    return typeof target?.x === "number" && typeof target?.y === "number";
}

function validateTargets(targets: any): targets is { x: number; y: number }[] {
    if (!Array.isArray(targets) || targets.length === 0) return false;
    return targets.every(isValidTarget);
}

// ===== Controllers =====

/**
 * Tìm đường đi đến target gần nhất
 */
export const getPathController = (req: Request, res: Response) => {
    try {
        const { targets } = req.body;

        if (!validateTargets(targets)) {
            return res.status(400).json({
                message: "Targets không hợp lệ hoặc rỗng",
                code: -2,
                data: false,
            });
        }

        const nearestTarget = findNearestTarget(targets, DEFAULT_ENTRY);

        console.log("Start:", DEFAULT_ENTRY);
        console.log("Nearest target:", nearestTarget);

        const path = findPathService(DEFAULT_ENTRY, nearestTarget);

        if (!path || path.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy đường đi",
                code: -3,
                data: false,
            });
        }

        return res.status(200).json({
            message: "Tìm đường thành công",
            data: { path, target: nearestTarget },
            code: 0,
        });
    } catch (err) {
        console.error("Lỗi getPathController:", err);
        return res.status(500).json(CONTROLLER_ERROR);
    }
};

/**
 * Lấy ma trận và sensors (random lần đầu, sau đó dùng cache)
 */
export const getRandomSensorController = (req: Request, res: Response) => {
    try {
        const matrix = getMatrix();

        // Sử dụng cache hoặc tạo mới
        if (!cachedSensors) {
            cachedSensors = getRandomSensorPosition();
            console.log("Generated new sensors:", cachedSensors);
        } else {
            console.log("Using cached sensors");
        }

        return res.status(200).json({
            code: 0,
            message: "OK",
            data: {
                matrix,
                sensors: cachedSensors,
            },
        });
    } catch (err: any) {
        console.error("Lỗi getRandomSensorController:", err);
        return res.status(500).json({
            code: -1,
            message: err?.message || "Lỗi không xác định",
            data: false,
        });
    }
};

/**
 * Reset cached sensors (để test hoặc làm mới)
 */
export const resetSensorsController = (req: Request, res: Response) => {
    const hadCache = cachedSensors !== null;
    cachedSensors = null;

    return res.status(200).json({
        code: 0,
        message: hadCache ? "Đã reset sensors cache" : "Cache đã trống",
        data: true,
    });
};

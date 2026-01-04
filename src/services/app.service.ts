import { sendEmail } from "../configs/email";
import { prisma, ReturnData } from "../configs/interface";
import { redis } from "../configs/redis";
import { v1 as uuidv1 } from "uuid";
import { spawn } from 'child_process';
import path from 'path';


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
export const getFindPathService = async (startPosition?: [number, number]): Promise<ReturnData> => {
    try {
        const parkingStatus = await getParkingStatusFromDB();

        const emptySlots = parkingStatus.filter(slot =>
            slot.status === 0 && slot.sensorId != null
        );

        if (emptySlots.length === 0) {
            return {
                code: 1,
                message: "Không có vị trí trống có sensor",
                data: []
            };
        }

        const start = startPosition || [0, 0];

        const nearestSlot = emptySlots.reduce((nearest, slot) => {
            const distanceCurrent = manhattanDistance(start, slot.position);
            const distanceNearest = manhattanDistance(start, nearest.position);

            return distanceCurrent < distanceNearest ? slot : nearest;
        });

        console.log(`Vị trí trống gần nhất: Slot ${nearestSlot.id} (Sensor ${nearestSlot.sensorId}) tại ${nearestSlot.position}`);

        const pathResult = await runPythonAstar(
            start,                    // Vị trí bắt đầu
            nearestSlot.position,     // Vị trí đích (slot gần nhất)
            parkingStatus            // Map trạng thái bãi xe
        );

        if (!pathResult || pathResult.length === 0) {
            return {
                code: 1,
                message: "Không tìm thấy đường đi",
                data: []
            };
        }

        return {
            code: 0,
            message: `Tìm thấy đường đi đến slot ${nearestSlot.id}`,
            data: {
                path: pathResult,           // Đường đi
                targetSlot: nearestSlot.id, // Slot đích
                sensorId: nearestSlot.sensorId, // Sensor ID
                distance: pathResult.length // Độ dài đường đi
            }
        };

    } catch (error) {
        console.error("Error in getFindPathService:", error);
        return {
            code: 1,
            message: "Lỗi khi tìm đường",
            data: []
        };
    }
};

const manhattanDistance = (pos1: [number, number], pos2: [number, number]): number => {
    return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
};
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

const getParkingStatusFromDB = async () => {
    try {
        const parkingLots = await prisma.parkingLot.findMany({
            select: {
                id: true,
                status: true,
                sensorId: true,
            }
        });

        // Map sang format có position [row, col]
        return parkingLots.map(lot => ({
            id: lot.id,
            status: lot.status,
            sensorId: lot.sensorId,
            position: calculatePosition(lot.id) as [number, number]
        }));
    } catch (error) {
        console.error("Error getting parking status:", error);
        return [];
    }
};


const calculatePosition = (slotId: number): [number, number] => {
    // TODO: Điều chỉnh logic map ID sang position theo layout thực tế
    // Ví dụ: Grid 10 cột
    const cols = 10;
    const row = Math.floor((slotId - 1) / cols);
    const col = (slotId - 1) % cols;
    return [row, col];

    // HOẶC nếu có layout phức tạp hơn, dùng mapping table:
    // const positionMap: Record<number, [number, number]> = {
    //     1: [0, 0], 2: [0, 1], 3: [0, 2], ...
    // };
    // return positionMap[slotId] || [0, 0];
};


const runPythonAstar = (
    start: [number, number],
    goal: [number, number],
    parkingMap: any[]
): Promise<number[]> => {
    return new Promise((resolve, reject) => {
        // Đường dẫn tới file Python (điều chỉnh theo cấu trúc project)
        const pythonScript = path.resolve(process.cwd(), 'python/astar.py');
        console.log('Python script path:', pythonScript);

        // Spawn Python process
        const python = spawn('python3', [ // hoặc 'python'
            pythonScript,
            JSON.stringify(start),
            JSON.stringify(goal),
            JSON.stringify(parkingMap)
        ]);

        let result = '';
        let errorOutput = '';

        python.stdout.on('data', (data) => {
            result += data.toString();
        });

        python.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        python.on('close', (code) => {
            if (code !== 0) {
                console.error('Python error:', errorOutput);
                reject(new Error(`Python script exited with code ${code}`));
                return;
            }

            try {
                const path = JSON.parse(result);
                resolve(path);
            } catch (error) {
                console.error('Failed to parse Python output:', result);
                reject(error);
            }
        });
    });
};

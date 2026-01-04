import { prisma } from "../configs/interface";
import { findPathAStar } from "../util/aStar";
import {
    PARKING_LAYOUT,
    SLOT_INDEX,
    SENSOR_INDEX,
} from "../util/board";

export type ParkingInstructionResult = {
    targetSlot: {
        id: number;
        sensorId: number | null;
    } | null;
    statusMap: Record<number, number>;
    path: { r: number; c: number }[];
};

export const getParkingInstructionBySensor = async (
    sensorId: number
): Promise<ParkingInstructionResult> => {


    const parkingLots = await prisma.parkingLot.findMany({
        select: { id: true, status: true, sensorId: true },
    });


    const statusMap: Record<number, number> = {};
    parkingLots.forEach(p => {
        statusMap[p.id] = p.status;
    });

    const availableSlots = parkingLots.filter(p => p.status === 0);

    if (!availableSlots.length) {
        return { targetSlot: null, statusMap, path: [] };
    }

    const sameSensorSlots = availableSlots.filter(
        s => s.sensorId === sensorId
    );

    const targetSlot =
        sameSensorSlots[0] ?? availableSlots[0];

    const targetCoord = SLOT_INDEX.find(
        s => s.id === targetSlot.id
    );
    if (!targetCoord) {
        return { targetSlot: null, statusMap, path: [] };
    }

    const sensorCoord = SENSOR_INDEX.find(
        s => s.sensorId === sensorId
    );

    if (!sensorCoord) {
        return { targetSlot: null, statusMap, path: [] };
    }


    const walkableGrid = PARKING_LAYOUT.map(row => [...row]);

    SLOT_INDEX.forEach(slot => {
        const status = statusMap[slot.id];
        if (status === 1 || status === 2) {
            walkableGrid[slot.r][slot.c] = 9; // chặn
        }
    });

    const path = findPathAStar(
        walkableGrid,
        { r: sensorCoord.r, c: sensorCoord.c },
        { r: targetCoord.r, c: targetCoord.c }
    );

    await prisma.parkingLot.update({
        where: { id: targetSlot.id },
        data: { status: 2 }, // locked
    });
    statusMap[targetSlot.id] = 2;

    return {
        targetSlot: {
            id: targetSlot.id,
            sensorId: targetSlot.sensorId,
        },
        statusMap,
        path,
    };
};

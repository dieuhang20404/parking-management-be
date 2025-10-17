import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export interface ReturnData {
    message: string,
    data: any,
    code: number
}
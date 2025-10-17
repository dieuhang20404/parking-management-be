import { PrismaClient } from '@prisma/client';
//import { ioInstance } from '../config/socket.js'; // nếu muốn broadcast
const prisma = new PrismaClient();

export const getSlots = async (req, res) => {
  try {
    const slots = await prisma.parkingSlot.findMany({ orderBy: { slotNumber: 'asc' } });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateSlot = async (req, res) => {
  try {
    const { slotNumber, status } = req.body;
    await prisma.parkingSlot.upsert({
      where: { slotNumber },
      update: { status },
      create: { slotNumber, status },
    });

    const slots = await prisma.parkingSlot.findMany();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

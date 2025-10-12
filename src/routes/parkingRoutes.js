import express from 'express';
import { getSlots, updateSlot } from '../controllers/parkingController.js';

const router = express.Router();

router.get('/', getSlots);
router.post('/update', updateSlot);

export default router;

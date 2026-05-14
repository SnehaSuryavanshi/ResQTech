import express from 'express';
import { getAmbulances, updateLocation, updateStatus } from '../controllers/ambulanceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAmbulances);
router.put('/:id/location', protect, updateLocation);
router.put('/:id/status', protect, updateStatus);

export default router;

import express from 'express';
import { getAnalytics, getAllEmergencies } from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/analytics', protect, authorize('super_admin', 'hospital_admin'), getAnalytics);
router.get('/emergencies', protect, authorize('super_admin', 'hospital_admin'), getAllEmergencies);

export default router;

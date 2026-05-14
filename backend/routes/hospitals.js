import express from 'express';
import { getHospitals, getHospital, updateBeds, createHospital } from '../controllers/hospitalController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getHospitals);
router.get('/:id', getHospital);
router.put('/:id/beds', protect, authorize('hospital_admin', 'super_admin'), updateBeds);
router.post('/', protect, authorize('super_admin'), createHospital);

export default router;

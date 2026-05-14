import express from 'express';
import { createEmergency, getEmergencies, getEmergency, triggerSOS, analyzeSymptoms } from '../controllers/emergencyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', analyzeSymptoms); // Public — no auth needed for symptom analysis
router.post('/', protect, createEmergency);
router.get('/', protect, getEmergencies);
router.get('/:id', protect, getEmergency);
router.post('/:id/sos', protect, triggerSOS);

export default router;

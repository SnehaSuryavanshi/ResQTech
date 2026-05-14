import express from 'express';
import { aiChat, getFirstAid } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', protect, aiChat);
router.post('/first-aid', getFirstAid); // public access for first aid

export default router;

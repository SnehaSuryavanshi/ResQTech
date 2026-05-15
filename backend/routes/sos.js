import express from 'express';
import {
  triggerSOSEmergency,
  getSOSStatus,
  handleCallStatusWebhook,
  cancelSOS,
  updatePatientLocation
} from '../controllers/sosController.js';

const router = express.Router();

// POST /api/sos — Trigger SOS emergency (public — no auth needed for emergencies)
router.post('/', triggerSOSEmergency);

// GET /api/sos/:trackingSessionId — Get SOS tracking status
router.get('/:trackingSessionId', getSOSStatus);

// POST /api/sos/call-status — Twilio webhook for call status updates
router.post('/call-status', handleCallStatusWebhook);

// POST /api/sos/:trackingSessionId/cancel — Cancel SOS
router.post('/:trackingSessionId/cancel', cancelSOS);

// POST /api/sos/:trackingSessionId/location — Update patient live location
router.post('/:trackingSessionId/location', updatePatientLocation);

export default router;

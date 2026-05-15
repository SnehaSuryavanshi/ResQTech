import SOSRequest from '../models/SOSRequest.js';
import { makeEmergencyCall, getCallStatus } from '../services/twilioService.js';
import { getConnectionStatus } from '../config/db.js';
import crypto from 'crypto';

const generateTrackingId = () => {
  return `SOS-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// In-memory store for demo mode (no MongoDB)
const inMemorySOS = new Map();

/**
 * @desc    Trigger SOS Emergency — calls phone + sends GPS tracking link
 * @route   POST /api/sos
 * @access  Public (emergency - no auth required)
 */
export const triggerSOSEmergency = async (req, res, next) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates (latitude, longitude) are required'
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    const trackingSessionId = generateTrackingId();

    // Build the driver tracking URL — the person who receives the call/SMS opens this
    // Use FRONTEND_URL for production, fallback to CLIENT_URL
    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
    const driverTrackingUrl = `${frontendUrl}/driver-track/${trackingSessionId}`;

    // SOS data
    const sosData = {
      _id: `sos_${Date.now()}`,
      userId: req.user?._id || null,
      location: { latitude, longitude, accuracy: req.body.accuracy || 0 },
      trackingSessionId,
      status: 'triggered',
      driverTrackingUrl,
      callDetails: {},
      timeline: [{
        event: 'sos_triggered',
        message: 'Emergency SOS activated',
        timestamp: new Date()
      }]
    };

    // Save to MongoDB if connected, otherwise in-memory
    const dbConnected = getConnectionStatus();
    if (dbConnected) {
      try {
        const doc = await SOSRequest.create({
          userId: sosData.userId,
          location: sosData.location,
          trackingSessionId,
          status: 'triggered',
          timeline: sosData.timeline
        });
        sosData._id = doc._id;
      } catch (e) {
        console.warn('⚠️  DB save failed, using in-memory:', e.message);
      }
    }
    inMemorySOS.set(trackingSessionId, sosData);
    console.log(`📋 SOS created: ${trackingSessionId}`);

    // ── Make REAL Twilio call + send SMS with tracking link ──
    const callResult = await makeEmergencyCall({
      latitude,
      longitude,
      trackingSessionId,
      driverTrackingUrl
    });

    // Update call details
    sosData.callDetails = {
      callSid: callResult.callSid || '',
      callStatus: callResult.callStatus || 'failed',
      calledNumber: callResult.calledNumber || '',
      smsSent: callResult.smsSent || false,
      simulated: callResult.simulated || false,
      callStartedAt: new Date()
    };
    sosData.status = callResult.success ? 'call_initiated' : 'tracking_active';

    // Emit Socket.IO event
    const io = req.app.get('io');
    if (io) {
      io.emit('sos:triggered', {
        trackingSessionId,
        patientLocation: { latitude, longitude },
        status: sosData.status
      });
    }

    // Respond
    res.status(201).json({
      success: true,
      message: 'SOS Emergency triggered successfully',
      data: {
        sosId: sosData._id,
        trackingSessionId,
        status: sosData.status,
        driverTrackingUrl,
        callDetails: {
          callSid: callResult.callSid,
          callStatus: callResult.callStatus,
          simulated: callResult.simulated || false,
          calledNumber: callResult.calledNumber,
          smsSent: callResult.smsSent || false
        },
        patientLocation: { latitude, longitude }
      }
    });
  } catch (error) {
    console.error('❌ SOS trigger error:', error);
    next(error);
  }
};

/**
 * @desc    Get SOS tracking status
 * @route   GET /api/sos/:trackingSessionId
 */
export const getSOSStatus = async (req, res, next) => {
  try {
    const { trackingSessionId } = req.params;
    let sosRequest = null;
    const dbConnected = getConnectionStatus();

    if (dbConnected) {
      try { sosRequest = await SOSRequest.findOne({ trackingSessionId }); } catch (e) {}
    }
    if (!sosRequest) sosRequest = inMemorySOS.get(trackingSessionId);
    if (!sosRequest) {
      return res.status(404).json({ success: false, message: 'SOS session not found' });
    }

    res.json({ success: true, data: sosRequest });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Twilio call status webhook
 * @route   POST /api/sos/call-status
 */
export const handleCallStatusWebhook = async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;
    console.log(`📞 Call status: ${CallSid} → ${CallStatus}`);

    // Update in-memory store
    for (const [key, sos] of inMemorySOS) {
      if (sos.callDetails?.callSid === CallSid) {
        sos.callDetails.callStatus = CallStatus;
        const io = req.app.get('io');
        if (io) {
          io.emit(`sos:callStatus:${key}`, { callStatus: CallStatus, callDuration: CallDuration });
        }
        break;
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Call webhook error:', error);
    res.status(200).send('OK');
  }
};

/**
 * @desc    Cancel SOS
 * @route   POST /api/sos/:trackingSessionId/cancel
 */
export const cancelSOS = async (req, res, next) => {
  try {
    const { trackingSessionId } = req.params;

    if (inMemorySOS.has(trackingSessionId)) {
      inMemorySOS.get(trackingSessionId).status = 'cancelled';
      inMemorySOS.delete(trackingSessionId);
    }

    const io = req.app.get('io');
    if (io) {
      io.emit(`sos:cancelled:${trackingSessionId}`, { trackingSessionId, status: 'cancelled' });
    }

    res.json({ success: true, message: 'SOS cancelled successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update patient location during tracking
 * @route   POST /api/sos/:trackingSessionId/location
 */
export const updatePatientLocation = async (req, res, next) => {
  try {
    const { trackingSessionId } = req.params;
    const { latitude, longitude } = req.body;

    if (inMemorySOS.has(trackingSessionId)) {
      const sos = inMemorySOS.get(trackingSessionId);
      sos.location.latitude = latitude;
      sos.location.longitude = longitude;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

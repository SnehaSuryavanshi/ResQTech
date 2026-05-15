import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Twilio Voice + SMS Service
 * 
 * Makes a REAL phone call to the emergency number and sends an SMS
 * with a tracking link so the called person can share their GPS location.
 * 
 * FREE TIER: Twilio trial gives $15.50 credit.
 *   - Call to India: ~$0.0975/min → ~150 minutes
 *   - SMS to India: ~$0.04/msg → ~350 messages
 *   - Enough for 50+ hackathon demos
 * 
 * REQUIREMENT: On trial accounts, the target number MUST be verified
 *   in Twilio Console → Phone Numbers → Verified Caller IDs
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
const emergencyNumber = process.env.EMERGENCY_CONTACT_NUMBER || '+919322372556';

let client = null;

// Initialize Twilio client only if credentials exist
if (accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    client = twilio(accountSid, authToken);
    console.log('✅ Twilio client initialized');
  } catch (err) {
    console.warn('⚠️  Twilio initialization failed:', err.message);
  }
} else {
  console.warn('⚠️  Twilio credentials not set — calls will be simulated');
}

/**
 * Make a REAL emergency call + send SMS with tracking link
 * 
 * @param {object} options
 * @param {number} options.latitude - Patient latitude
 * @param {number} options.longitude - Patient longitude
 * @param {string} options.trackingSessionId - Unique tracking session
 * @param {string} options.driverTrackingUrl - URL for driver to open and share GPS
 * @returns {object} Call + SMS details
 */
export const makeEmergencyCall = async ({ latitude, longitude, trackingSessionId, driverTrackingUrl }) => {
  // ── SIMULATION MODE (no Twilio credentials) ──────────────
  if (!client || !twilioPhone) {
    console.log('📞 [SIMULATED] Emergency call to', emergencyNumber);
    console.log('📱 [SIMULATED] SMS with tracking link:', driverTrackingUrl);
    return {
      success: true,
      simulated: true,
      callSid: `SIM_${Date.now()}`,
      callStatus: 'initiated',
      calledNumber: emergencyNumber,
      smsSent: false,
      driverTrackingUrl,
      message: 'Call simulated (Twilio not configured). Share this link manually: ' + driverTrackingUrl
    };
  }

  // ── REAL TWILIO CALL + SMS ────────────────────────────────
  let callResult = {};
  let smsResult = {};

  // 1. Make the voice call
  try {
    const twimlMessage = `
      <Response>
        <Say voice="alice" language="en-IN">
          Emergency alert from Res Q AI.
          A patient needs immediate help near latitude ${latitude.toFixed(4)}, longitude ${longitude.toFixed(4)}.
          An SMS has been sent to your phone with a tracking link.
          Please open the link to share your live location and navigate to the patient.
          Thank you for responding.
        </Say>
        <Pause length="1"/>
        <Say voice="alice" language="en-IN">
          Repeating. Emergency from Res Q AI. Check your SMS for the tracking link. Open it now.
        </Say>
      </Response>
    `.trim();

    const call = await client.calls.create({
      twiml: twimlMessage,
      to: emergencyNumber,
      from: twilioPhone,
      statusCallback: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/sos/call-status`,
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
      timeout: 30
    });

    console.log(`📞 Twilio call initiated: ${call.sid} → ${emergencyNumber}`);
    callResult = {
      success: true,
      callSid: call.sid,
      callStatus: call.status
    };
  } catch (error) {
    console.error('❌ Twilio call failed:', error.message);
    callResult = {
      success: false,
      callSid: '',
      callStatus: 'failed',
      error: error.message
    };
  }

  // 2. Send SMS with tracking link
  try {
    const smsBody = `🚨 ResQAI EMERGENCY!\n\nA patient needs help!\n📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n\n👉 Open this link to share your location & navigate:\n${driverTrackingUrl}\n\nTracking ID: ${trackingSessionId}`;

    const message = await client.messages.create({
      body: smsBody,
      to: emergencyNumber,
      from: twilioPhone
    });

    console.log(`📱 SMS sent: ${message.sid} → ${emergencyNumber}`);
    smsResult = { smsSent: true, smsSid: message.sid };
  } catch (error) {
    console.error('⚠️  SMS failed (call still went through):', error.message);
    smsResult = { smsSent: false, smsError: error.message };
  }

  return {
    success: callResult.success || smsResult.smsSent,
    simulated: false,
    callSid: callResult.callSid || '',
    callStatus: callResult.callStatus || 'failed',
    calledNumber: emergencyNumber,
    smsSent: smsResult.smsSent || false,
    driverTrackingUrl,
    message: callResult.success
      ? 'Emergency call initiated + SMS sent via Twilio'
      : 'Call failed but SMS tracking link was sent'
  };
};

/**
 * Get call status from Twilio
 */
export const getCallStatus = async (callSid) => {
  if (!client || callSid.startsWith('SIM_')) {
    return { status: 'completed', duration: 15 };
  }

  try {
    const call = await client.calls(callSid).fetch();
    return {
      status: call.status,
      duration: call.duration,
      startTime: call.startTime,
      endTime: call.endTime
    };
  } catch (error) {
    console.error('❌ Failed to fetch call status:', error.message);
    return { status: 'unknown', error: error.message };
  }
};

export default { makeEmergencyCall, getCallStatus };

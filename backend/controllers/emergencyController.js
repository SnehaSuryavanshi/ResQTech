import Emergency from '../models/Emergency.js';
import Hospital from '../models/Hospital.js';
import Ambulance from '../models/Ambulance.js';
import aiService from '../services/aiService.js';
import { getConnectionStatus } from '../config/db.js';

/**
 * @desc    Create emergency + AI analysis
 * @route   POST /api/emergencies
 */
export const createEmergency = async (req, res, next) => {
  try {
    const { symptoms, description, location } = req.body;
    const dbConnected = getConnectionStatus();

    // AI analysis
    const aiAnalysis = await aiService.analyzeSymptoms(symptoms || description);

    if (!dbConnected) {
      // Demo mode — return simulated emergency
      return res.status(201).json({
        success: true,
        emergency: {
          _id: `demo_e_${Date.now()}`,
          userId: req.user?._id || 'demo_user',
          symptoms, description, aiAnalysis, location,
          status: 'analyzing',
          timeline: [
            { status: 'pending', message: 'Emergency created', timestamp: new Date() },
            { status: 'analyzing', message: 'AI analysis complete', timestamp: new Date() }
          ]
        },
        recommendedHospitals: []
      });
    }

    const emergency = await Emergency.create({
      userId: req.user._id,
      symptoms, description, aiAnalysis, location,
      status: 'analyzing',
      timeline: [
        { status: 'pending', message: 'Emergency created', timestamp: new Date() },
        { status: 'analyzing', message: 'AI analysis complete', timestamp: new Date() }
      ]
    });

    const hospitals = await Hospital.find({ isActive: true });
    const ranked = aiService.rankHospitals(hospitals, emergency);

    const io = req.app.get('io');
    if (io) {
      io.emit('newEmergency', {
        emergencyId: emergency._id,
        severity: aiAnalysis.severity,
        location
      });
    }

    res.status(201).json({
      success: true,
      emergency,
      recommendedHospitals: ranked.slice(0, 5)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's emergencies
 * @route   GET /api/emergencies
 */
export const getEmergencies = async (req, res, next) => {
  try {
    const dbConnected = getConnectionStatus();

    if (!dbConnected) {
      return res.json({ success: true, emergencies: [] });
    }

    const emergencies = await Emergency.find({ userId: req.user._id })
      .populate('hospitalId', 'name address phone')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, emergencies });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single emergency
 * @route   GET /api/emergencies/:id
 */
export const getEmergency = async (req, res, next) => {
  try {
    const dbConnected = getConnectionStatus();

    if (!dbConnected) {
      return res.status(404).json({ success: false, message: 'Database offline' });
    }

    const emergency = await Emergency.findById(req.params.id)
      .populate('hospitalId')
      .populate('ambulanceId');

    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }
    res.json({ success: true, emergency });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Trigger SOS
 * @route   POST /api/emergencies/:id/sos
 */
export const triggerSOS = async (req, res, next) => {
  try {
    const dbConnected = getConnectionStatus();

    if (!dbConnected) {
      return res.json({
        success: true,
        emergency: { _id: req.params.id, sosTriggered: true, status: 'dispatched' }
      });
    }

    const emergency = await Emergency.findById(req.params.id);
    if (!emergency) {
      return res.status(404).json({ success: false, message: 'Emergency not found' });
    }

    emergency.sosTriggered = true;
    emergency.status = 'dispatched';
    emergency.timeline.push({
      status: 'dispatched',
      message: 'SOS triggered — dispatching ambulance',
      timestamp: new Date()
    });

    // Auto-assign hospital (top ranked)
    if (!emergency.hospitalId) {
      const hospitals = await Hospital.find({ isActive: true });
      const ranked = aiService.rankHospitals(hospitals, emergency);
      if (ranked.length > 0) {
        emergency.hospitalId = ranked[0]._id;
      }
    }

    // Auto-assign ambulance
    const ambulance = await Ambulance.findOne({ status: 'available' });
    if (ambulance) {
      ambulance.status = 'dispatched';
      ambulance.currentEmergencyId = emergency._id;
      await ambulance.save();
      emergency.ambulanceId = ambulance._id;
    }

    await emergency.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('sosAlert', {
        emergencyId: emergency._id,
        userId: emergency.userId,
        location: emergency.location,
        severity: emergency.aiAnalysis.severity
      });
    }

    res.json({ success: true, emergency });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Analyze symptoms only (no emergency created)
 * @route   POST /api/emergencies/analyze
 */
export const analyzeSymptoms = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Symptoms are required' });
    }
    const analysis = await aiService.analyzeSymptoms(symptoms);
    res.json({ success: true, analysis });
  } catch (error) {
    next(error);
  }
};

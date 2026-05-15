import Emergency from '../models/Emergency.js';
import Hospital from '../models/Hospital.js';
import Ambulance from '../models/Ambulance.js';
import User from '../models/User.js';
import { getConnectionStatus } from '../config/db.js';

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/admin/analytics
 */
export const getAnalytics = async (req, res, next) => {
  try {
    if (!getConnectionStatus()) {
      // Demo analytics
      return res.json({
        success: true,
        analytics: {
          totalEmergencies: 127,
          activeEmergencies: 3,
          totalHospitals: 5,
          totalAmbulances: 8,
          availableAmbulances: 5,
          totalUsers: 342,
          severityCounts: [
            { _id: 'low', count: 45 },
            { _id: 'medium', count: 52 },
            { _id: 'high', count: 22 },
            { _id: 'critical', count: 8 }
          ],
          totalBeds: 450,
          availableBeds: 120,
          occupancyRate: 73,
          recentEmergencies: []
        }
      });
    }

    const totalEmergencies = await Emergency.countDocuments();
    const activeEmergencies = await Emergency.countDocuments({
      status: { $in: ['pending', 'analyzing', 'dispatched', 'en_route'] }
    });
    const totalHospitals = await Hospital.countDocuments({ isActive: true });
    const totalAmbulances = await Ambulance.countDocuments({ isActive: true });
    const availableAmbulances = await Ambulance.countDocuments({ status: 'available', isActive: true });
    const totalUsers = await User.countDocuments();

    // Severity breakdown
    const severityCounts = await Emergency.aggregate([
      { $group: { _id: '$aiAnalysis.severity', count: { $sum: 1 } } }
    ]);

    // Recent emergencies
    const recentEmergencies = await Emergency.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'name email')
      .populate('hospitalId', 'name');

    // Hospital capacity
    const hospitals = await Hospital.find({ isActive: true });
    const totalBeds = hospitals.reduce((sum, h) => {
      return sum + (h.beds?.general?.total || 0) + (h.beds?.icu?.total || 0) + (h.beds?.oxygen?.total || 0);
    }, 0);
    const availableBeds = hospitals.reduce((sum, h) => {
      return sum + (h.beds?.general?.available || 0) + (h.beds?.icu?.available || 0) + (h.beds?.oxygen?.available || 0);
    }, 0);

    res.json({
      success: true,
      analytics: {
        totalEmergencies,
        activeEmergencies,
        totalHospitals,
        totalAmbulances,
        availableAmbulances,
        totalUsers,
        severityCounts,
        totalBeds,
        availableBeds,
        occupancyRate: totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0,
        recentEmergencies
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all emergencies (admin)
 * @route   GET /api/admin/emergencies
 */
export const getAllEmergencies = async (req, res, next) => {
  try {
    if (!getConnectionStatus()) {
      return res.json({ success: true, emergencies: [] });
    }

    const emergencies = await Emergency.find()
      .populate('userId', 'name email phone')
      .populate('hospitalId', 'name address')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, emergencies });
  } catch (error) {
    next(error);
  }
};

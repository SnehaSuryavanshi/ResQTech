import Ambulance from '../models/Ambulance.js';
import { getConnectionStatus } from '../config/db.js';

// Demo ambulances for offline mode
const DEMO_AMBULANCES = [
  { _id: 'demo_a1', vehicleNumber: 'MH-19-AQ-7742', type: 'ALS', status: 'available', driver: { name: 'Rajesh Kumar', phone: '+919876543210' }, currentLocation: { lat: 21.0124, lng: 75.5626 }, hospitalId: { name: 'Civil Hospital Jalgaon' }, isActive: true },
  { _id: 'demo_a2', vehicleNumber: 'MH-19-BT-3351', type: 'BLS', status: 'dispatched', driver: { name: 'Suresh Patil', phone: '+919876543211' }, currentLocation: { lat: 21.0090, lng: 75.5680 }, hospitalId: { name: 'Tapadia Hospital' }, isActive: true },
  { _id: 'demo_a3', vehicleNumber: 'MH-19-CK-1102', type: 'ALS', status: 'available', driver: { name: 'Amit Deshmukh', phone: '+919876543212' }, currentLocation: { lat: 21.0200, lng: 75.5750 }, hospitalId: { name: 'Krishna Trauma Centre' }, isActive: true }
];

/**
 * @desc    Get all ambulances
 * @route   GET /api/ambulances
 */
export const getAmbulances = async (req, res, next) => {
  try {
    if (!getConnectionStatus()) {
      return res.json({ success: true, ambulances: DEMO_AMBULANCES });
    }

    const ambulances = await Ambulance.find({ isActive: true })
      .populate('hospitalId', 'name')
      .populate('currentEmergencyId', 'status');
    res.json({ success: true, ambulances });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ambulance location (for realtime tracking)
 * @route   PUT /api/ambulances/:id/location
 */
export const updateLocation = async (req, res, next) => {
  try {
    if (!getConnectionStatus()) {
      return res.json({ success: true, message: 'Demo mode — location update simulated' });
    }

    const { lat, lng } = req.body;
    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { lat, lng } },
      { new: true }
    );
    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('ambulanceLocation', {
        ambulanceId: ambulance._id,
        location: ambulance.currentLocation,
        status: ambulance.status
      });
    }

    res.json({ success: true, ambulance });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update ambulance status
 * @route   PUT /api/ambulances/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    if (!getConnectionStatus()) {
      return res.json({ success: true, message: 'Demo mode — status update simulated' });
    }

    const ambulance = await Ambulance.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!ambulance) {
      return res.status(404).json({ success: false, message: 'Ambulance not found' });
    }
    res.json({ success: true, ambulance });
  } catch (error) {
    next(error);
  }
};

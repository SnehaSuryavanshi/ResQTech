import Ambulance from '../models/Ambulance.js';

/**
 * @desc    Get all ambulances
 * @route   GET /api/ambulances
 */
export const getAmbulances = async (req, res, next) => {
  try {
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

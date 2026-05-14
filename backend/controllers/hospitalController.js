import Hospital from '../models/Hospital.js';

/**
 * @desc    Get all hospitals (with optional filters)
 * @route   GET /api/hospitals
 */
export const getHospitals = async (req, res, next) => {
  try {
    const { specialty, lat, lng, radius, hasICU, traumaSupport } = req.query;
    const query = { isActive: true };

    if (specialty) {
      query.specialties = { $in: [new RegExp(specialty, 'i')] };
    }
    if (hasICU === 'true') {
      query['beds.icu.available'] = { $gt: 0 };
    }
    if (traumaSupport === 'true') {
      query.traumaSupport = true;
    }

    let hospitals = await Hospital.find(query).sort({ rating: -1 });

    // Calculate distance if user location provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      hospitals = hospitals.map(h => {
        const dist = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
        return { ...h.toObject(), distance: Math.round(dist * 10) / 10 };
      }).sort((a, b) => a.distance - b.distance);

      // Filter by radius if provided
      if (radius) {
        hospitals = hospitals.filter(h => h.distance <= parseFloat(radius));
      }
    }

    res.json({ success: true, count: hospitals.length, hospitals });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single hospital
 * @route   GET /api/hospitals/:id
 */
export const getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }
    res.json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hospital bed availability (admin)
 * @route   PUT /api/hospitals/:id/beds
 */
export const updateBeds = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { beds: req.body.beds },
      { new: true, runValidators: true }
    );
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Emit realtime update via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('bedUpdate', { hospitalId: hospital._id, beds: hospital.beds });
    }

    res.json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a hospital (super_admin)
 * @route   POST /api/hospitals
 */
export const createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({ success: true, hospital });
  } catch (error) {
    next(error);
  }
};

// Haversine formula for distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

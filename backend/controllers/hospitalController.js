import Hospital from '../models/Hospital.js';
import { getConnectionStatus } from '../config/db.js';

// ── Demo data for offline/hackathon mode ────────────────
const DEMO_HOSPITALS = [
  {
    _id: 'demo_h1',
    name: 'Civil Hospital Jalgaon',
    address: 'Jilha Peth, Jalgaon, Maharashtra 425001',
    phone: '+91 257 222 0350',
    location: { lat: 21.0124, lng: 75.5626 },
    specialties: ['Emergency', 'General Medicine', 'Orthopedics', 'Pediatrics'],
    beds: { total: { available: 45, occupied: 155, total: 200 }, icu: { available: 4, occupied: 16, total: 20 } },
    rating: 4.2, isActive: true, traumaSupport: true,
    operatingHours: '24/7', ambulanceCount: 5
  },
  {
    _id: 'demo_h2',
    name: 'Tapadia Hospital',
    address: 'Akashwani Road, Jalgaon, Maharashtra 425001',
    phone: '+91 257 223 0100',
    location: { lat: 21.0090, lng: 75.5680 },
    specialties: ['Cardiology', 'Neurology', 'Emergency', 'General Surgery'],
    beds: { total: { available: 30, occupied: 70, total: 100 }, icu: { available: 3, occupied: 7, total: 10 } },
    rating: 4.5, isActive: true, traumaSupport: true,
    operatingHours: '24/7', ambulanceCount: 3
  },
  {
    _id: 'demo_h3',
    name: 'Shree Markandey Hospital',
    address: 'Ring Road, Jalgaon, Maharashtra 425001',
    phone: '+91 257 226 4200',
    location: { lat: 21.0200, lng: 75.5750 },
    specialties: ['Orthopedics', 'General Medicine', 'Emergency', 'ENT'],
    beds: { total: { available: 20, occupied: 30, total: 50 }, icu: { available: 2, occupied: 3, total: 5 } },
    rating: 4.0, isActive: true, traumaSupport: false,
    operatingHours: '24/7', ambulanceCount: 2
  },
  {
    _id: 'demo_h4',
    name: 'Vivekanand Hospital',
    address: 'Nehru Chowk, Jalgaon, Maharashtra 425001',
    phone: '+91 257 222 5566',
    location: { lat: 21.0050, lng: 75.5550 },
    specialties: ['Gynecology', 'Pediatrics', 'General Medicine'],
    beds: { total: { available: 15, occupied: 35, total: 50 }, icu: { available: 1, occupied: 4, total: 5 } },
    rating: 3.8, isActive: true, traumaSupport: false,
    operatingHours: '8 AM - 10 PM', ambulanceCount: 1
  },
  {
    _id: 'demo_h5',
    name: 'Krishna Trauma Centre',
    address: 'MJ College Road, Jalgaon, Maharashtra 425002',
    phone: '+91 257 223 8800',
    location: { lat: 21.0180, lng: 75.5500 },
    specialties: ['Trauma', 'Emergency', 'Orthopedics', 'Neurosurgery'],
    beds: { total: { available: 10, occupied: 40, total: 50 }, icu: { available: 2, occupied: 8, total: 10 } },
    rating: 4.3, isActive: true, traumaSupport: true,
    operatingHours: '24/7', ambulanceCount: 4
  }
];

/**
 * @desc    Get all hospitals (with optional filters)
 * @route   GET /api/hospitals
 */
export const getHospitals = async (req, res, next) => {
  try {
    const { specialty, lat, lng, radius, hasICU, traumaSupport } = req.query;
    const dbConnected = getConnectionStatus();

    let hospitals;

    if (dbConnected) {
      const query = { isActive: true };
      if (specialty) query.specialties = { $in: [new RegExp(specialty, 'i')] };
      if (hasICU === 'true') query['beds.icu.available'] = { $gt: 0 };
      if (traumaSupport === 'true') query.traumaSupport = true;
      hospitals = await Hospital.find(query).sort({ rating: -1 });
      hospitals = hospitals.map(h => h.toObject());
    } else {
      // Demo mode — return hardcoded hospitals
      hospitals = [...DEMO_HOSPITALS];
      if (specialty) {
        hospitals = hospitals.filter(h =>
          h.specialties.some(s => s.toLowerCase().includes(specialty.toLowerCase()))
        );
      }
      if (hasICU === 'true') {
        hospitals = hospitals.filter(h => h.beds.icu.available > 0);
      }
      if (traumaSupport === 'true') {
        hospitals = hospitals.filter(h => h.traumaSupport);
      }
    }

    // Calculate distance if user location provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      hospitals = hospitals.map(h => {
        const dist = calculateDistance(userLat, userLng, h.location.lat, h.location.lng);
        return { ...h, distance: Math.round(dist * 10) / 10 };
      }).sort((a, b) => a.distance - b.distance);

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
    const dbConnected = getConnectionStatus();

    if (dbConnected) {
      const hospital = await Hospital.findById(req.params.id);
      if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
      }
      return res.json({ success: true, hospital });
    }

    // Demo mode
    const hospital = DEMO_HOSPITALS.find(h => h._id === req.params.id);
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
    const dbConnected = getConnectionStatus();
    if (!dbConnected) {
      return res.json({ success: true, message: 'Demo mode — bed update simulated' });
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.params.id,
      { beds: req.body.beds },
      { new: true, runValidators: true }
    );
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

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
    const dbConnected = getConnectionStatus();
    if (!dbConnected) {
      return res.status(503).json({ success: false, message: 'Database offline — cannot create hospital' });
    }

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

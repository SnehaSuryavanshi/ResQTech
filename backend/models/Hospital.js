import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  image: { type: String, default: '' },

  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  specialties: [{ type: String }],

  // Bed availability (realtime updated)
  beds: {
    general: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    icu: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    oxygen: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } },
    ventilator: { total: { type: Number, default: 0 }, available: { type: Number, default: 0 } }
  },

  traumaSupport: { type: Boolean, default: false },
  emergencySupport: { type: Boolean, default: true },
  ambulanceCount: { type: Number, default: 0 },
  waitTime: { type: Number, default: 15 }, // minutes
  rating: { type: Number, default: 4.0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  openHours: { type: String, default: '24/7' },
  isActive: { type: Boolean, default: true },

  doctors: [{
    name: String,
    specialty: String,
    available: { type: Boolean, default: true }
  }]
}, {
  timestamps: true
});

// Index for geolocation queries
hospitalSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export default mongoose.model('Hospital', hospitalSchema);

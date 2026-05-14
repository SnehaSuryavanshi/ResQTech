import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    unique: true
  },
  driver: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    license: { type: String, default: '' }
  },
  type: {
    type: String,
    enum: ['basic', 'advanced', 'icu_mobile'],
    default: 'basic'
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  currentLocation: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['available', 'dispatched', 'en_route', 'at_scene', 'returning', 'maintenance'],
    default: 'available'
  },
  currentEmergencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency'
  },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

export default mongoose.model('Ambulance', ambulanceSchema);

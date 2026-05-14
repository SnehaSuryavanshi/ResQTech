import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: { type: String, default: '' },
  description: { type: String, default: '' },

  // AI analysis results
  aiAnalysis: {
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    predictedCondition: { type: String, default: '' },
    riskLevel: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: String, default: '' },
    recommendedSpecialist: { type: String, default: '' },
    firstAidInstructions: [{ type: String }],
    confidence: { type: Number, default: 0 }
  },

  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: '' }
  },

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },

  ambulanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ambulance'
  },

  status: {
    type: String,
    enum: ['pending', 'analyzing', 'dispatched', 'en_route', 'arrived', 'resolved', 'cancelled'],
    default: 'pending'
  },

  sosTriggered: { type: Boolean, default: false },
  notifiedContacts: [{ name: String, phone: String, notifiedAt: Date }],

  timeline: [{
    status: String,
    message: String,
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export default mongoose.model('Emergency', emergencySchema);

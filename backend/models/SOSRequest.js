import mongoose from 'mongoose';

const sosRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Patient location
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, default: '' },
    accuracy: { type: Number, default: 0 }
  },

  // Twilio call details
  callDetails: {
    callSid: { type: String, default: '' },
    callStatus: {
      type: String,
      enum: ['initiated', 'ringing', 'in-progress', 'completed', 'failed', 'busy', 'no-answer', 'canceled', ''],
      default: ''
    },
    calledNumber: { type: String, default: '' },
    callDuration: { type: Number, default: 0 },
    callStartedAt: { type: Date },
    callEndedAt: { type: Date }
  },

  // Tracking session
  trackingSessionId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Ambulance simulation data
  ambulance: {
    id: { type: String, default: '' },
    driverName: { type: String, default: '' },
    vehicleNumber: { type: String, default: '' },
    phone: { type: String, default: '' },
    currentLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 }
    },
    eta: { type: Number, default: 0 }, // in seconds
    distanceRemaining: { type: Number, default: 0 } // in meters
  },

  // SOS status
  status: {
    type: String,
    enum: ['triggered', 'call_initiated', 'call_connected', 'tracking_active', 'ambulance_dispatched', 'ambulance_arriving', 'arrived', 'resolved', 'cancelled', 'failed'],
    default: 'triggered'
  },

  // Timeline events
  timeline: [{
    event: { type: String, required: true },
    message: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  }],

  // Meta
  resolvedAt: { type: Date },
  cancelledAt: { type: Date }
}, {
  timestamps: true
});

// Index for geospatial queries
sosRequestSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
sosRequestSchema.index({ status: 1 });

export default mongoose.model('SOSRequest', sosRequestSchema);

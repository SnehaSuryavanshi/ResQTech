/**
 * Socket.IO Realtime Event Handler
 * 
 * Manages REAL GPS tracking for SOS:
 * - Patient joins tracking room
 * - Driver (ambulance person) opens tracking link on phone → shares REAL GPS
 * - Server relays driver's GPS to patient in real-time
 * - Like Zomato delivery tracking but for ambulance
 */
export default function setupSocket(io) {
  // Store active SOS tracking sessions
  const activeSOSSessions = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room for user-specific events
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`📡 ${socket.id} joined room: ${room}`);
    });

    // ══════════════════════════════════════════════════════════
    // SOS TRACKING — REAL GPS FROM DRIVER'S PHONE
    // ══════════════════════════════════════════════════════════

    /**
     * Patient joins SOS tracking room to receive driver GPS updates
     */
    socket.on('sos:joinTracking', (data) => {
      const { trackingSessionId } = data;
      socket.join(`sos_${trackingSessionId}`);
      console.log(`🆘 Patient ${socket.id} joined tracking: ${trackingSessionId}`);

      // If session exists, send current state
      if (activeSOSSessions.has(trackingSessionId)) {
        const session = activeSOSSessions.get(trackingSessionId);
        socket.emit('sos:ambulanceUpdate', {
          trackingSessionId,
          ambulanceLocation: session.driverLocation,
          eta: session.eta,
          distanceRemaining: session.distanceRemaining,
          progress: session.progress,
          driverConnected: session.driverConnected
        });
      }
    });

    /**
     * Driver (ambulance/called person) joins tracking room
     * This happens when they open the tracking link on their phone
     */
    socket.on('driver:join', (data) => {
      const { trackingSessionId } = data;
      socket.join(`sos_${trackingSessionId}`);

      // Initialize or update session
      if (!activeSOSSessions.has(trackingSessionId)) {
        activeSOSSessions.set(trackingSessionId, {
          trackingSessionId,
          driverSocketId: socket.id,
          driverConnected: true,
          driverLocation: null,
          patientLocation: null,
          eta: 0,
          distanceRemaining: 0,
          progress: 0,
          startTime: Date.now(),
          locationHistory: [],
          initialDistance: null
        });
      } else {
        const session = activeSOSSessions.get(trackingSessionId);
        session.driverSocketId = socket.id;
        session.driverConnected = true;
      }

      console.log(`🚑 DRIVER ${socket.id} connected for tracking: ${trackingSessionId}`);

      // Notify patient that driver is now sharing location
      io.to(`sos_${trackingSessionId}`).emit('sos:driverConnected', {
        trackingSessionId,
        message: 'Ambulance driver is now sharing live location!'
      });
    });

    /**
     * Driver sends their REAL GPS location from phone
     * This is the core of the live tracking — called every 2-3 seconds
     */
    socket.on('driver:locationUpdate', (data) => {
      const { trackingSessionId, latitude, longitude, accuracy, speed, heading } = data;

      if (!activeSOSSessions.has(trackingSessionId)) {
        // Create session if it doesn't exist yet
        activeSOSSessions.set(trackingSessionId, {
          trackingSessionId,
          driverSocketId: socket.id,
          driverConnected: true,
          driverLocation: { latitude, longitude },
          patientLocation: null,
          eta: 0,
          distanceRemaining: 0,
          progress: 0,
          startTime: Date.now(),
          locationHistory: [],
          initialDistance: null
        });
      }

      const session = activeSOSSessions.get(trackingSessionId);
      session.driverLocation = { latitude, longitude, accuracy, speed, heading };

      // Store location history for route trail
      session.locationHistory.push({
        latitude, longitude,
        timestamp: Date.now()
      });

      // Keep only last 500 points to prevent memory issues
      if (session.locationHistory.length > 500) {
        session.locationHistory = session.locationHistory.slice(-500);
      }

      // Calculate distance to patient if patient location is known
      let eta = 0;
      let distanceRemaining = 0;
      let progress = 0;

      if (session.patientLocation) {
        distanceRemaining = haversineDistance(
          latitude, longitude,
          session.patientLocation.latitude, session.patientLocation.longitude
        );

        // Set initial distance on first calculation
        if (session.initialDistance === null) {
          session.initialDistance = distanceRemaining;
        }

        // Calculate progress (0-100%)
        if (session.initialDistance > 0) {
          progress = Math.min(100, Math.max(0,
            ((session.initialDistance - distanceRemaining) / session.initialDistance) * 100
          ));
        }

        // Calculate ETA based on speed or assume 30 km/h city driving
        const speedMs = (speed && speed > 0) ? speed : 8.3; // 30 km/h default
        eta = Math.round(distanceRemaining / speedMs);

        // Mark as arrived if within 50 meters
        if (distanceRemaining < 50) {
          progress = 100;
          eta = 0;
          io.to(`sos_${trackingSessionId}`).emit('sos:ambulanceArrived', {
            trackingSessionId,
            ambulanceLocation: { latitude, longitude },
            message: 'Ambulance has arrived at your location!'
          });
          console.log(`🏁 DRIVER ARRIVED for ${trackingSessionId}`);
        }
      }

      session.eta = eta;
      session.distanceRemaining = distanceRemaining;
      session.progress = progress;

      // ── Broadcast to patient ──────────────────────────────
      io.to(`sos_${trackingSessionId}`).emit('sos:ambulanceUpdate', {
        trackingSessionId,
        ambulanceLocation: { latitude, longitude },
        accuracy,
        speed: speed || 0,
        heading: heading || 0,
        eta,
        distanceRemaining: Math.round(distanceRemaining),
        progress: Math.round(progress),
        driverConnected: true,
        locationHistory: session.locationHistory.map(l => [l.latitude, l.longitude])
      });
    });

    /**
     * Driver stops sharing location
     */
    socket.on('driver:stopSharing', (data) => {
      const { trackingSessionId } = data;
      if (activeSOSSessions.has(trackingSessionId)) {
        const session = activeSOSSessions.get(trackingSessionId);
        session.driverConnected = false;
        io.to(`sos_${trackingSessionId}`).emit('sos:driverDisconnected', {
          trackingSessionId,
          message: 'Driver stopped sharing location'
        });
        console.log(`⏹️ Driver stopped sharing for ${trackingSessionId}`);
      }
    });

    /**
     * Patient sends their live location
     */
    socket.on('sos:patientLocation', (data) => {
      const { trackingSessionId, latitude, longitude } = data;

      if (activeSOSSessions.has(trackingSessionId)) {
        const session = activeSOSSessions.get(trackingSessionId);
        session.patientLocation = { latitude, longitude };
      }

      // Broadcast to driver so they can see where patient is
      io.to(`sos_${trackingSessionId}`).emit('sos:patientLocationUpdate', {
        trackingSessionId,
        latitude,
        longitude,
        timestamp: Date.now()
      });
    });

    /**
     * Cancel/Stop SOS tracking
     */
    socket.on('sos:stopTracking', (data) => {
      const { trackingSessionId } = data;
      if (activeSOSSessions.has(trackingSessionId)) {
        activeSOSSessions.delete(trackingSessionId);
        io.to(`sos_${trackingSessionId}`).emit('sos:trackingStopped', {
          trackingSessionId,
          message: 'Tracking session ended'
        });
        console.log(`⏹️ Tracking stopped for ${trackingSessionId}`);
      }
    });

    // ── Legacy compat: old simulation events just no-op ───────
    socket.on('sos:startAmbulanceSimulation', () => {});
    socket.on('sos:stopSimulation', () => {});

    // ══════════════════════════════════════════════════════════
    // EXISTING EVENTS
    // ══════════════════════════════════════════════════════════

    socket.on('updateAmbulanceLocation', (data) => io.emit('ambulanceLocation', data));
    socket.on('updateBedAvailability', (data) => io.emit('bedUpdate', data));
    socket.on('emergencyBroadcast', (data) => io.emit('newEmergency', data));
    socket.on('sosAlert', (data) => io.emit('sosAlert', data));
    socket.on('emergencyStatusUpdate', (data) => {
      io.to(`emergency_${data.emergencyId}`).emit('statusUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      // If a driver disconnects, notify patients
      for (const [sessionId, session] of activeSOSSessions) {
        if (session.driverSocketId === socket.id) {
          session.driverConnected = false;
          io.to(`sos_${sessionId}`).emit('sos:driverDisconnected', {
            trackingSessionId: sessionId,
            message: 'Driver connection lost — waiting for reconnection'
          });
          console.log(`⚠️ Driver disconnected from tracking ${sessionId}`);
        }
      }
    });
  });
}

/**
 * Haversine formula — distance in meters between two GPS points
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Socket.IO realtime event handler
 * Manages live ambulance tracking, bed updates, emergency broadcasts
 */
export default function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join room for user-specific events
    socket.on('joinRoom', (room) => {
      socket.join(room);
      console.log(`📡 ${socket.id} joined room: ${room}`);
    });

    // Ambulance location update (from ambulance driver app)
    socket.on('updateAmbulanceLocation', (data) => {
      io.emit('ambulanceLocation', data);
    });

    // Bed availability update (from hospital admin)
    socket.on('updateBedAvailability', (data) => {
      io.emit('bedUpdate', data);
    });

    // Emergency broadcast
    socket.on('emergencyBroadcast', (data) => {
      io.emit('newEmergency', data);
    });

    // SOS Alert
    socket.on('sosAlert', (data) => {
      io.emit('sosAlert', data);
    });

    // Emergency status change
    socket.on('emergencyStatusUpdate', (data) => {
      io.to(`emergency_${data.emergencyId}`).emit('statusUpdate', data);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });
}

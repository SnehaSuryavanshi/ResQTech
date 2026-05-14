import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB, { getConnectionStatus } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import setupSocket from './sockets/socketHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import hospitalRoutes from './routes/hospitals.js';
import emergencyRoutes from './routes/emergencies.js';
import ambulanceRoutes from './routes/ambulances.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store io instance on app for use in controllers
app.set('io', io);

// Initialize socket events
setupSocket(io);

// ── Middleware ──────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// ── API Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/emergencies', emergencyRoutes);
app.use('/api/ambulances', ambulanceRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Health check — includes DB status
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ResQAI Server is running 🚑',
    dbConnected: getConnectionStatus(),
    timestamp: new Date()
  });
});

// Error handler
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────
const startServer = async () => {
  // Connect to DB (non-blocking — server starts even if DB is down)
  const dbConnected = await connectDB();

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`\n🚑 ResQAI Server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💾 Database: ${dbConnected ? 'Connected ✅' : 'Offline (demo mode) ⚠️'}`);
    console.log(`🔗 Frontend: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
  });
};

startServer();

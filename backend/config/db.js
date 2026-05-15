import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas / local MongoDB
 * Gracefully handles connection failures without crashing the server.
 */
let isConnected = false;

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.warn('⚠️  MONGODB_URI not set — running in offline/demo mode');
      return false;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,  // fail fast if DB unreachable
      socketTimeoutMS: 10000,
      bufferCommands: false,           // don't queue queries when disconnected
    });

    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️  MongoDB Connection Failed: ${error.message}`);
    console.warn('⚠️  Server will continue in offline/demo mode');
    isConnected = false;
    return false;
  }
};

export const getConnectionStatus = () => isConnected;

export default connectDB;

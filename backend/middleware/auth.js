import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getConnectionStatus } from '../config/db.js';

/**
 * Demo user object for offline mode
 */
const DEMO_USER = {
  _id: 'demo_user_001',
  name: 'Demo User',
  email: 'demo@resqai.com',
  role: 'user',
  phone: '+919322372556',
  bloodGroup: 'O+',
  isVerified: true
};

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    // Handle demo tokens when DB is offline
    if (token.startsWith('demo_') && !getConnectionStatus()) {
      req.user = DEMO_USER;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!getConnectionStatus()) {
      // DB offline but got a real JWT — use demo user
      req.user = DEMO_USER;
      return next();
    }

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    // If JWT verification fails but we're in demo mode, allow through
    if (!getConnectionStatus()) {
      req.user = DEMO_USER;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

/**
 * Role-based access control
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Generate JWT Token
 */
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

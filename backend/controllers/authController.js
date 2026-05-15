import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { getConnectionStatus } from '../config/db.js';
import crypto from 'crypto';

/**
 * Generate a 6-digit OTP and store it on the user
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Demo user for offline/hackathon mode
 */
const DEMO_USER = {
  _id: 'demo_user_001',
  name: 'Demo User',
  email: 'demo@resqai.com',
  role: 'user',
  phone: '+919322372556',
  bloodGroup: 'O+',
  isVerified: true,
  allergies: ['Penicillin'],
  medicalConditions: [],
  medications: [],
  emergencyContacts: [{ name: 'Emergency Contact', phone: '+919876543210', relation: 'Family' }],
  insurance: { provider: 'Star Health', policyNumber: 'SH-2024-001234' },
  language: 'en',
  organDonor: false
};

const DEMO_ADMIN = {
  _id: 'demo_admin_001',
  name: 'Admin User',
  email: 'admin@resqai.com',
  role: 'admin',
  phone: '+919876543210',
  bloodGroup: 'A+',
  isVerified: true
};

/**
 * @desc    Register a new user (step 1 — creates account and sends OTP)
 * @route   POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, bloodGroup } = req.body;
    const dbConnected = getConnectionStatus();

    if (!dbConnected) {
      // Demo mode — return a fake successful registration
      const demoOTP = '123456';
      console.log(`\n📧 [DEMO] OTP for ${email}: ${demoOTP}\n`);
      return res.status(201).json({
        success: true,
        token: 'demo_token_' + Date.now(),
        requiresOTP: true,
        otpSentTo: email,
        demoOTP,
        user: {
          _id: 'demo_' + Date.now(),
          name: name || 'Demo User',
          email,
          role: 'user',
          phone,
          bloodGroup,
          isVerified: false
        }
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name, email, password, phone, bloodGroup,
      isVerified: false,
      otp: { code: otpCode, expiresAt: otpExpiry, attempts: 0 }
    });

    const token = generateToken(user._id);

    // Log OTP to console for demo (in production, send via email/SMS)
    console.log(`\n📧 OTP for ${email}: ${otpCode}\n`);

    res.status(201).json({
      success: true,
      token,
      requiresOTP: true,
      otpSentTo: email,
      // Include OTP in development for demo purposes
      ...(process.env.NODE_ENV !== 'production' && { demoOTP: otpCode }),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        isVerified: false
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify OTP after registration
 * @route   POST /api/auth/verify-otp
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const dbConnected = getConnectionStatus();

    if (!dbConnected) {
      // Demo mode — accept any OTP
      return res.json({
        success: true,
        message: 'Email verified successfully (demo)',
        token: 'demo_verified_token_' + Date.now(),
        user: { ...DEMO_USER, email, isVerified: true }
      });
    }

    const user = await User.findOne({ email }).select('+otp.code +otp.expiresAt +otp.attempts');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check attempts
    if (user.otp.attempts >= 5) {
      return res.status(429).json({ success: false, message: 'Too many attempts. Please request a new OTP.' });
    }

    // Check expiry
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Check OTP match
    if (user.otp.code !== otp) {
      user.otp.attempts = (user.otp.attempts || 0) + 1;
      await user.save({ validateModifiedOnly: true });
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP valid — mark verified
    user.isVerified = true;
    user.otp = undefined;
    await user.save({ validateModifiedOnly: true });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        isVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    const dbConnected = getConnectionStatus();

    if (!dbConnected) {
      const demoOTP = '123456';
      console.log(`\n📧 [DEMO] Resent OTP for ${email}: ${demoOTP}\n`);
      return res.json({ success: true, message: 'OTP resent (demo)', otpSentTo: email, demoOTP });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const otpCode = generateOTP();
    user.otp = { code: otpCode, expiresAt: new Date(Date.now() + 10 * 60 * 1000), attempts: 0 };
    await user.save({ validateModifiedOnly: true });

    console.log(`\n📧 Resent OTP for ${email}: ${otpCode}\n`);

    res.json({
      success: true,
      message: 'OTP resent successfully',
      otpSentTo: email,
      ...(process.env.NODE_ENV !== 'production' && { demoOTP: otpCode })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const dbConnected = getConnectionStatus();

    if (!dbConnected) {
      // Demo mode — accept specific demo credentials
      if (email === 'admin@resqai.com' && password === 'admin123') {
        return res.json({
          success: true,
          token: 'demo_admin_token_' + Date.now(),
          user: DEMO_ADMIN
        });
      }
      // Accept any email/password combo in demo mode
      return res.json({
        success: true,
        token: 'demo_token_' + Date.now(),
        user: { ...DEMO_USER, email, name: email.split('@')[0] }
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        isVerified: user.isVerified,
        allergies: user.allergies,
        medicalConditions: user.medicalConditions,
        medications: user.medications,
        emergencyContacts: user.emergencyContacts,
        insurance: user.insurance,
        preferredHospitals: user.preferredHospitals,
        language: user.language,
        organDonor: user.organDonor,
        chronicConditions: user.chronicConditions,
        familyTracking: user.familyTracking,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res, next) => {
  try {
    if (!getConnectionStatus()) {
      return res.json({ success: true, user: DEMO_USER });
    }
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (Medical Passport)
 * @route   PUT /api/auth/profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    if (!getConnectionStatus()) {
      return res.json({ success: true, user: { ...DEMO_USER, ...req.body } });
    }

    const fields = ['name', 'phone', 'bloodGroup', 'allergies', 'medicalConditions',
      'medications', 'emergencyContacts', 'dateOfBirth', 'gender',
      'insurance', 'preferredHospitals', 'language', 'organDonor',
      'chronicConditions', 'familyTracking'];

    const updates = {};
    fields.forEach(f => {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true, runValidators: true
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

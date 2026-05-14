import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaHeartbeat, FaPhone, FaEye, FaEyeSlash, FaShieldAlt, FaRedo } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import styles from '../Login/Auth.module.scss';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', bloodGroup: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = register, 2 = OTP verify
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [demoOTP, setDemoOTP] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [resending, setResending] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      const data = res.data;
      if (data.requiresOTP) {
        setOtpEmail(data.otpSentTo || form.email);
        setDemoOTP(data.demoOTP || '');
        setStep(2);
        toast.success('Account created! Please verify your email with OTP.');
      } else {
        // Direct registration (no OTP required)
        localStorage.setItem('resqai_token', data.token);
        localStorage.setItem('resqai_user', JSON.stringify(data.user));
        toast.success('Account created successfully!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter the complete 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.verifyOTP({ email: otpEmail, otp: otpCode });
      const data = res.data;
      localStorage.setItem('resqai_token', data.token);
      localStorage.setItem('resqai_user', JSON.stringify(data.user));
      toast.success('Email verified! Welcome to ResQAI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      const res = await authAPI.resendOTP({ email: otpEmail });
      setDemoOTP(res.data.demoOTP || '');
      setOtp(['', '', '', '', '', '']);
      toast.success('New OTP sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg}><div className={styles.orb}></div></div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="register"
            className={styles.authCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={styles.header}>
              <FaHeartbeat className={styles.icon} />
              <h1>Create Account</h1>
              <p>Join ResQAI for intelligent emergency support</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <FaUser className={styles.fieldIcon} />
                <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <FaEnvelope className={styles.fieldIcon} />
                <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              </div>
              <div className={styles.field}>
                <FaPhone className={styles.fieldIcon} />
                <input name="phone" type="tel" placeholder="Phone (e.g. +91 98765 43210)" value={form.phone} onChange={handleChange} />
              </div>
              <div className={styles.field}>
                <FaLock className={styles.fieldIcon} />
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} required minLength={6} />
                <button type="button" className={styles.toggle} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner}></span> : 'Create Account'}
              </button>
            </form>

            <p className={styles.redirect}>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            className={styles.authCard}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className={styles.header}>
              <FaShieldAlt className={styles.icon} style={{ color: '#22c55e' }} />
              <h1>Verify Email</h1>
              <p>Enter the 6-digit OTP sent to <strong>{otpEmail}</strong></p>
            </div>

            {demoOTP && (
              <div className={styles.demoOtpBanner}>
                🔑 Demo OTP: <strong>{demoOTP}</strong>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <div className={styles.otpContainer}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className={styles.otpInput}
                    value={digit}
                    onChange={e => handleOTPChange(i, e.target.value.replace(/\D/g, ''))}
                    onKeyDown={e => handleOTPKeyDown(i, e)}
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner}></span> : 'Verify OTP'}
              </button>
            </form>

            <div className={styles.otpActions}>
              <button onClick={handleResendOTP} disabled={resending} className={styles.resendBtn}>
                <FaRedo /> {resending ? 'Sending...' : 'Resend OTP'}
              </button>
              <button onClick={() => setStep(1)} className={styles.backBtn}>
                ← Back to Register
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;

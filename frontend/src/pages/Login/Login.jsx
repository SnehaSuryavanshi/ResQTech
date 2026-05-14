import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaHeartbeat, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.scss';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg}>
        <div className={styles.orb}></div>
      </div>

      <motion.div
        className={styles.authCard}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={styles.header}>
          <FaHeartbeat className={styles.icon} />
          <h1>Welcome Back</h1>
          <p>Sign in to access your ResQAI dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <FaEnvelope className={styles.fieldIcon} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <FaLock className={styles.fieldIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="button" className={styles.toggle} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className={styles.options}>
            <label className={styles.check}>
              <input type="checkbox" /> <span>Remember me</span>
            </label>
            <a href="#" className={styles.forgot}>Forgot password?</a>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner}></span> : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}><span>Demo Accounts</span></div>

        <div className={styles.demoAccounts}>
          <button onClick={() => { setEmail('user@resqai.com'); setPassword('user123'); }} className={styles.demoBtn}>
            User Demo
          </button>
          <button onClick={() => { setEmail('admin@resqai.com'); setPassword('admin123'); }} className={styles.demoBtn}>
            Admin Demo
          </button>
        </div>

        <p className={styles.redirect}>
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;

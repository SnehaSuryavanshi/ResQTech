import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaPhoneAlt, FaMapMarkerAlt, FaAmbulance, FaExclamationTriangle, FaShieldAlt, FaSatelliteDish, FaTimes } from 'react-icons/fa';
import { sosAPI } from '../../services/api';
import './SOS.css';

const SOS = () => {
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────
  const [phase, setPhase] = useState('idle'); // idle | countdown | loading | success | error
  const [countdown, setCountdown] = useState(5);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [sosResponse, setSosResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [ripples, setRipples] = useState([]);
  const countdownRef = useRef(null);
  const rippleIdRef = useRef(0);

  // ── Get GPS Location ──────────────────────────────────
  const getLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          };
          setLocation(loc);
          setLocationError('');
          resolve(loc);
        },
        (err) => {
          setLocationError(err.message);
          // Fallback to Jalgaon coordinates for demo
          const fallback = { latitude: 21.0077, longitude: 75.5626, accuracy: 100 };
          setLocation(fallback);
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  // ── Try to get location on mount ──────────────────────
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // ── Countdown Logic ───────────────────────────────────
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdown <= 0) {
      handleSOSTrigger();
      return;
    }

    countdownRef.current = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(countdownRef.current);
  }, [countdown, phase]);

  // ── Add ripple on button click ────────────────────────
  const addRipple = (e) => {
    const btn = e.currentTarget.getBoundingClientRect();
    const ripple = {
      id: rippleIdRef.current++,
      x: e.clientX - btn.left,
      y: e.clientY - btn.top
    };
    setRipples(prev => [...prev, ripple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 1000);
  };

  // ── Start Countdown ───────────────────────────────────
  const startSOS = (e) => {
    addRipple(e);
    setCountdown(5);
    setPhase('countdown');
  };

  // ── Cancel Countdown ──────────────────────────────────
  const cancelSOS = () => {
    clearTimeout(countdownRef.current);
    setPhase('idle');
    setCountdown(5);
  };

  // ── Trigger SOS API ───────────────────────────────────
  const handleSOSTrigger = async () => {
    setPhase('loading');

    try {
      // Get fresh location
      const loc = await getLocation();

      // Call backend SOS API
      const response = await sosAPI.trigger({
        latitude: loc.latitude,
        longitude: loc.longitude,
        accuracy: loc.accuracy
      });

      setSosResponse(response.data.data);
      setPhase('success');

      // Navigate to live tracking after 3 seconds
      setTimeout(() => {
        navigate(`/sos/tracking/${response.data.data.trackingSessionId}`, {
          state: {
            sosData: response.data.data,
            patientLocation: loc,
            driverTrackingUrl: response.data.data.driverTrackingUrl || ''
          }
        });
      }, 3000);
    } catch (error) {
      console.error('SOS trigger failed:', error);
      setErrorMessage(
        error.response?.data?.message || 'Failed to send SOS. Please call 108 directly.'
      );
      setPhase('error');
    }
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="sos-page">
      {/* Ambient background effects */}
      <div className="sos-ambient">
        <div className="sos-ambient-orb sos-ambient-orb-1" />
        <div className="sos-ambient-orb sos-ambient-orb-2" />
        <div className="sos-ambient-orb sos-ambient-orb-3" />
      </div>

      <AnimatePresence mode="wait">
        {/* ── IDLE: Show SOS Button ────────────────────── */}
        {phase === 'idle' && (
          <motion.div
            key="idle"
            className="sos-idle-view"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          >
            <div className="sos-header">
              <FaExclamationTriangle className="sos-header-icon" />
              <h1 className="sos-title">EMERGENCY SOS</h1>
              <p className="sos-subtitle">
                Press the button to send an emergency alert.<br />
                A real phone call will be initiated and live tracking will begin.
              </p>
            </div>

            {/* Main SOS Button */}
            <div className="sos-button-container">
              <div className="sos-pulse-ring sos-pulse-ring-1" />
              <div className="sos-pulse-ring sos-pulse-ring-2" />
              <div className="sos-pulse-ring sos-pulse-ring-3" />

              <button
                className="sos-main-button"
                onClick={startSOS}
                aria-label="Trigger Emergency SOS"
              >
                <span className="sos-main-button-text">SOS</span>
                <span className="sos-main-button-sub">PRESS & HOLD</span>
                {ripples.map(ripple => (
                  <span
                    key={ripple.id}
                    className="sos-click-ripple"
                    style={{ left: ripple.x, top: ripple.y }}
                  />
                ))}
              </button>
            </div>

            {/* Location status */}
            <div className={`sos-location-badge ${location ? 'sos-location-active' : ''}`}>
              <FaSatelliteDish className="sos-location-icon" />
              {location ? (
                <span>GPS Active — {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E</span>
              ) : (
                <span>Acquiring GPS signal...</span>
              )}
            </div>

            {locationError && (
              <p className="sos-location-error">⚠️ {locationError} — Using approximate location</p>
            )}

            {/* Info cards */}
            <div className="sos-info-grid">
              <div className="sos-info-card">
                <FaPhoneAlt className="sos-info-icon sos-info-icon-red" />
                <div>
                  <h3>Emergency Call</h3>
                  <p>Automatic call to emergency response</p>
                </div>
              </div>
              <div className="sos-info-card">
                <FaMapMarkerAlt className="sos-info-icon sos-info-icon-blue" />
                <div>
                  <h3>Live Tracking</h3>
                  <p>Real-time GPS tracking begins</p>
                </div>
              </div>
              <div className="sos-info-card">
                <FaAmbulance className="sos-info-icon sos-info-icon-green" />
                <div>
                  <h3>Ambulance Dispatch</h3>
                  <p>Nearest ambulance dispatched</p>
                </div>
              </div>
              <div className="sos-info-card">
                <FaShieldAlt className="sos-info-icon sos-info-icon-purple" />
                <div>
                  <h3>Protected</h3>
                  <p>Your data is encrypted & secure</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── COUNTDOWN ───────────────────────────────── */}
        {phase === 'countdown' && (
          <motion.div
            key="countdown"
            className="sos-countdown-view"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="sos-countdown-content">
              <h2 className="sos-countdown-label">TRIGGERING SOS IN</h2>

              <motion.div
                className="sos-countdown-circle"
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    '0 0 40px rgba(255,0,50,0.3), 0 0 80px rgba(255,0,50,0.15)',
                    '0 0 60px rgba(255,0,50,0.5), 0 0 120px rgba(255,0,50,0.25)',
                    '0 0 40px rgba(255,0,50,0.3), 0 0 80px rgba(255,0,50,0.15)'
                  ]
                }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <span className="sos-countdown-number">{countdown}</span>
              </motion.div>

              <p className="sos-countdown-msg">
                Emergency alert, phone call, and live tracking will activate
              </p>

              <button className="sos-cancel-btn" onClick={cancelSOS}>
                <FaTimes /> CANCEL
              </button>
            </div>
          </motion.div>
        )}

        {/* ── LOADING ─────────────────────────────────── */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            className="sos-loading-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="sos-loading-content">
              <div className="sos-loading-spinner">
                <div className="sos-spinner-ring sos-spinner-ring-1" />
                <div className="sos-spinner-ring sos-spinner-ring-2" />
                <div className="sos-spinner-ring sos-spinner-ring-3" />
                <FaAmbulance className="sos-spinner-icon" />
              </div>
              <h2 className="sos-loading-title">SENDING EMERGENCY ALERT</h2>
              <div className="sos-loading-steps">
                <div className="sos-loading-step sos-step-active">
                  <div className="sos-step-dot" />
                  <span>Capturing GPS coordinates</span>
                </div>
                <div className="sos-loading-step sos-step-active sos-step-delay-1">
                  <div className="sos-step-dot" />
                  <span>Sending SOS to server</span>
                </div>
                <div className="sos-loading-step sos-step-active sos-step-delay-2">
                  <div className="sos-step-dot" />
                  <span>Initiating emergency call</span>
                </div>
                <div className="sos-loading-step sos-step-delay-3">
                  <div className="sos-step-dot" />
                  <span>Starting live tracking</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SUCCESS ─────────────────────────────────── */}
        {phase === 'success' && sosResponse && (
          <motion.div
            key="success"
            className="sos-success-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="sos-success-content">
              <motion.div
                className="sos-success-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <svg viewBox="0 0 24 24" width="48" height="48">
                  <motion.path
                    d="M5 13l4 4L19 7"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />
                </svg>
              </motion.div>

              <h2 className="sos-success-title">EMERGENCY ALERT SENT</h2>
              <p className="sos-success-subtitle">
                {sosResponse.callDetails?.simulated
                  ? 'Call simulated — Twilio not configured'
                  : 'Calling Emergency Response...'}
              </p>

              <div className="sos-success-details">
                <div className="sos-success-row">
                  <FaPhoneAlt />
                  <span>Call Status: <strong>{sosResponse.callDetails?.callStatus || 'initiated'}</strong></span>
                </div>
                <div className="sos-success-row">
                  <FaAmbulance />
                  <span>Ambulance: <strong>{sosResponse.ambulance?.vehicleNumber}</strong></span>
                </div>
                <div className="sos-success-row">
                  <FaMapMarkerAlt />
                  <span>ETA: <strong>{Math.round((sosResponse.ambulance?.eta || 0) / 60)} min</strong></span>
                </div>
              </div>

              <p className="sos-redirect-msg">
                Redirecting to live tracking...
              </p>

              <div className="sos-redirect-bar">
                <motion.div
                  className="sos-redirect-progress"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ERROR ───────────────────────────────────── */}
        {phase === 'error' && (
          <motion.div
            key="error"
            className="sos-error-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="sos-error-content">
              <div className="sos-error-icon">✕</div>
              <h2 className="sos-error-title">SOS FAILED</h2>
              <p className="sos-error-msg">{errorMessage}</p>

              <div className="sos-error-actions">
                <button className="sos-retry-btn" onClick={() => { setPhase('idle'); setCountdown(5); }}>
                  Try Again
                </button>
                <a className="sos-call-direct-btn" href="tel:108">
                  <FaPhoneAlt /> Call 108 Directly
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOS;

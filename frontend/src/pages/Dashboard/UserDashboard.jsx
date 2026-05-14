import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaHeartbeat, FaAmbulance, FaHospital, FaNotesMedical, FaBell,
  FaExclamationTriangle, FaRobot, FaBed, FaMicrophone, FaMicrophoneSlash,
  FaPhoneAlt, FaMapMarkerAlt, FaBolt, FaShareAlt, FaWifi, FaExclamationCircle, FaMedkit
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { hospitalAPI, emergencyAPI } from '../../services/api';
import { MAHARASHTRA_HOSPITALS, recommendHospitals } from '../../data/hospitalDatabase';
import styles from './UserDashboard.module.scss';

const UserDashboard = () => {
  const { user } = useAuth();
  const { simulateEmergencyNotifications, addNotification } = useNotifications();
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const [showQuickEmergency, setShowQuickEmergency] = useState(false);
  const [nearestHospital, setNearestHospital] = useState(null);

  useEffect(() => {
    // Load hospitals with recommendation engine
    const jalgaonHospitals = recommendHospitals(MAHARASHTRA_HOSPITALS.jalgaon || []);
    setHospitals(jalgaonHospitals.slice(0, 3));
    setNearestHospital(jalgaonHospitals[0]);

    // Try API
    hospitalAPI.getAll({ lat: 21.0077, lng: 75.5626 })
      .then(r => setHospitals(r.data.hospitals?.slice(0, 3) || jalgaonHospitals.slice(0, 3)))
      .catch(() => {});
    emergencyAPI.getAll()
      .then(r => setEmergencies(r.data.emergencies?.slice(0, 5) || []))
      .catch(() => {});

    // Online/offline listener
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Voice input
  const toggleVoice = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addNotification({ type: 'info', icon: '🎙️', title: 'Voice Unavailable', message: 'Speech recognition not supported in this browser' });
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
      setVoiceText(transcript);
      if (event.results[0].isFinal) {
        handleVoiceCommand(transcript);
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.start();
    setIsListening(true);
  }, [isListening, addNotification]);

  const handleVoiceCommand = (text) => {
    const lower = text.toLowerCase();
    if (lower.includes('sos') || lower.includes('emergency') || lower.includes('help')) {
      navigate('/sos');
    } else if (lower.includes('hospital') || lower.includes('find')) {
      navigate('/hospitals');
    } else if (lower.includes('ambulance')) {
      navigate('/ambulance');
    } else if (lower.includes('first aid')) {
      navigate('/first-aid');
    } else {
      navigate('/chat');
    }
  };

  const handleEmergencySOS = () => {
    simulateEmergencyNotifications();
    setShowQuickEmergency(true);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        addNotification({ type: 'location', icon: '📍', title: 'Location Shared', message: `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}` });
      });
    }
  };

  const handleOfflineSMS = () => {
    addNotification({ type: 'offline', icon: '📱', title: 'SMS Fallback', message: 'SMS emergency request sent to 108. Awaiting confirmation.' });
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p className={styles.subtitle}>Your emergency command center</p>
        </div>
        <div className={styles.headerRight}>
          {offlineMode && (
            <span className={styles.offlineBadge}>
              <FaExclamationCircle /> Offline Mode
            </span>
          )}
          <button className={`${styles.voiceBtn} ${isListening ? styles.listening : ''}`} onClick={toggleVoice} title="Voice command">
            {isListening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
          <div className={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
        </div>
      </header>

      {/* Voice Feedback */}
      {isListening && (
        <motion.div className={styles.voiceFeedback} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.voiceWave}>
            <span /><span /><span /><span /><span />
          </div>
          <p>{voiceText || 'Listening... Say "SOS", "Find Hospital", "Call Ambulance", or "First Aid"'}</p>
        </motion.div>
      )}

      {/* Emergency Quick Actions - TOP PRIORITY */}
      <div className={styles.emergencyActions}>
        <button className={`${styles.emergBtn} ${styles.sos}`} onClick={handleEmergencySOS}>
          <FaBolt /> Emergency SOS
        </button>
        <Link to="/hospitals" className={`${styles.emergBtn} ${styles.hospital}`}>
          <FaHospital /> Find Nearest Hospital
        </Link>
        <button className={`${styles.emergBtn} ${styles.ambulance}`} onClick={() => { addNotification({ type: 'demo', icon: '📞', title: 'Demo: Call Ambulance', message: 'In a real emergency, this would call 108. This is a demonstration.' }); }}>
          <FaPhoneAlt /> Call Ambulance (Demo)
        </button>
        <button className={`${styles.emergBtn} ${styles.location}`} onClick={handleShareLocation}>
          <FaMapMarkerAlt /> Share Live Location
        </button>
      </div>

      {/* Quick Emergency Result */}
      {showQuickEmergency && nearestHospital && (
        <motion.div className={styles.quickEmergencyPanel} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div className={styles.qeHeader}>
            <span className={styles.qeLive}></span>
            <h3>🚨 Emergency Mode Active</h3>
            <button onClick={() => setShowQuickEmergency(false)}>✕</button>
          </div>
          <div className={styles.qeBody}>
            <div className={styles.qeHospital}>
              <h4>🏥 Best Available Hospital</h4>
              <strong>{nearestHospital.name}</strong>
              <p>{nearestHospital.address}</p>
              <div className={styles.qeStats}>
                <span>📏 {nearestHospital.distance} km</span>
                <span>⭐ {nearestHospital.rating}</span>
                <span>🛏 {nearestHospital.beds?.icu?.available || 0} ICU beds</span>
                <span>⏱ {nearestHospital.waitTime}m wait</span>
              </div>
              <div className={styles.qeActions}>
                <a href={`tel:${nearestHospital.phone}`} className={styles.qeCall}><FaPhoneAlt /> Call Now</a>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(nearestHospital.name + ' Jalgaon')}`} target="_blank" rel="noopener noreferrer" className={styles.qeDirections}><FaMapMarkerAlt /> Directions</a>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Offline Emergency */}
      {offlineMode && (
        <motion.div className={styles.offlinePanel} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <FaWifi className={styles.offlineIcon} />
          <div>
            <h3>You're Offline</h3>
            <p>Internet unavailable. Use SMS emergency fallback.</p>
          </div>
          <button className={styles.smsBtn} onClick={handleOfflineSMS}>📱 Send Emergency SMS to 108</button>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <Link to="/sos" className={`${styles.action} ${styles.actionSOS}`}>
          <div className={styles.actionIcon}><FaExclamationTriangle /></div>
          <div><h3>SOS</h3><p>Emergency Alert</p></div>
        </Link>
        <Link to="/chat" className={`${styles.action} ${styles.actionAI}`}>
          <div className={styles.actionIcon}><FaRobot /></div>
          <div><h3>AI Triage</h3><p>Symptom Analysis</p></div>
        </Link>
        <Link to="/hospitals" className={`${styles.action} ${styles.actionHosp}`}>
          <div className={styles.actionIcon}><FaHospital /></div>
          <div><h3>Hospitals</h3><p>Find Nearby</p></div>
        </Link>
        <Link to="/first-aid" className={`${styles.action} ${styles.actionAmb}`}>
          <div className={styles.actionIcon}><FaMedkit /></div>
          <div><h3>First Aid</h3><p>Step-by-step guides</p></div>
        </Link>
      </div>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Hospitals Panel */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2><FaHospital /> Recommended Hospitals</h2>
            <Link to="/hospitals" className={styles.viewAll}>View All</Link>
          </div>
          <div className={styles.hospitalList}>
            {hospitals.length > 0 ? hospitals.map((h, i) => (
              <motion.div key={h._id || i} className={styles.hospCard} whileHover={{ x: 4 }}>
                <div className={styles.hospLeft}>
                  <h4>{h.name}</h4>
                  <p>{h.distance ? `${h.distance} km` : h.address?.substring(0, 40)}</p>
                </div>
                <div className={styles.hospRight}>
                  {h.score && <span className={styles.scoreBadge}>Score: {h.score}</span>}
                  <span className={`${styles.bedBadge} ${h.beds?.icu?.available > 0 ? styles.green : styles.red}`}>
                    <FaBed /> {h.beds?.icu?.available || 0} ICU
                  </span>
                </div>
              </motion.div>
            )) : (
              <p className={styles.emptyText}>Connect to backend to see hospitals</p>
            )}
          </div>
        </div>

        {/* Health Stats */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2><FaHeartbeat /> Health Profile</h2>
          </div>
          <div className={styles.healthGrid}>
            <div className={styles.healthItem}>
              <span className={styles.label}>Blood Group</span>
              <span className={styles.bloodValue}>{user?.bloodGroup || 'Not set'}</span>
            </div>
            <div className={styles.healthItem}>
              <span className={styles.label}>Allergies</span>
              <span className={styles.value}>{user?.allergies?.length ? user.allergies.join(', ') : 'None recorded'}</span>
            </div>
            <div className={styles.healthItem}>
              <span className={styles.label}>Conditions</span>
              <span className={styles.value}>{user?.medicalConditions?.length ? user.medicalConditions.join(', ') : 'None recorded'}</span>
            </div>
          </div>
          <Link to="/profile" className={styles.profileLink}>Update Profile →</Link>
        </div>

        {/* Recent Activity */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2><FaNotesMedical /> Recent Emergencies</h2>
          </div>
          {emergencies.length > 0 ? emergencies.map((em, i) => (
            <div key={em._id || i} className={styles.activityItem}>
              <div className={`${styles.actDot} ${em.aiAnalysis?.severity === 'critical' ? styles.red : em.aiAnalysis?.severity === 'high' ? styles.orange : styles.blue}`}></div>
              <div>
                <p className={styles.actTitle}>{em.aiAnalysis?.predictedCondition || em.symptoms}</p>
                <small>{new Date(em.createdAt).toLocaleDateString()}</small>
              </div>
              <span className={styles.actBadge}>{em.aiAnalysis?.severity || em.status}</span>
            </div>
          )) : (
            <p className={styles.emptyText}>No recent emergencies</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

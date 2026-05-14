import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaMapMarkerAlt, FaAmbulance, FaHospital, FaUserMd, FaUsers, FaSms, FaWifi, FaInfoCircle } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNotifications } from '../../context/NotificationContext';
import { MAHARASHTRA_HOSPITALS, recommendHospitals } from '../../data/hospitalDatabase';
import styles from './SOS.module.scss';

const userIcon = new L.DivIcon({
  className: 'sos-user-icon',
  html: `<div style="background:linear-gradient(135deg,#ef4444,#dc2626);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(239,68,68,0.6);border:3px solid #fff;animation:pulse 1.5s infinite"><svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div>`,
  iconSize: [36, 36], iconAnchor: [18, 18],
});

const SOS = () => {
  const [active, setActive] = useState(false);
  const [location, setLocation] = useState({ lat: 21.0077, lng: 75.5626 });
  const [nearestHospital, setNearestHospital] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [isCounting, setIsCounting] = useState(false);
  const { simulateEmergencyNotifications, addNotification } = useNotifications();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    const recommended = recommendHospitals(MAHARASHTRA_HOSPITALS.jalgaon || []);
    setNearestHospital(recommended[0]);
  }, []);

  useEffect(() => {
    if (!isCounting) return;
    if (countdown <= 0) {
      triggerSOS();
      setIsCounting(false);
      return;
    }
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, isCounting]);

  const startCountdown = () => {
    setCountdown(5);
    setIsCounting(true);
  };

  const cancelCountdown = () => {
    setIsCounting(false);
    setCountdown(5);
  };

  const triggerSOS = () => {
    setActive(true);
    simulateEmergencyNotifications();
    addNotification({ type: 'demo', icon: '🧪', title: 'Demo Mode', message: 'This is a simulated SOS — no real emergency services were contacted.' });
  };

  const handleDemoCall = (number, label) => {
    addNotification({
      type: 'demo',
      icon: '📞',
      title: `Demo: Call ${label}`,
      message: `In a real emergency, this would call ${number}. This is a demonstration only.`
    });
  };

  const handleOfflineSMS = () => {
    addNotification({ type: 'offline', icon: '📱', title: 'Demo: SMS Sent', message: 'In production, an emergency SMS would be sent to 108 with your location.' });
  };

  return (
    <div className={styles.sosContainer}>
      {/* Demo Banner — always visible */}
      <div className={styles.demoBanner}>
        <FaInfoCircle /> <strong>DEMO MODE</strong> — This SOS page is for demonstration only. No real emergency services are contacted.
      </div>

      {!active ? (
        <motion.div className={styles.triggerView} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className={styles.warningText}>
            <h1>EMERGENCY</h1>
            <p>Press the button to simulate an SOS broadcast. In production, this would alert emergency services, nearby hospitals, and family contacts.</p>
          </div>

          {isCounting ? (
            <div className={styles.countdownWrap}>
              <motion.div className={styles.countdownCircle} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                <span className={styles.countdownNum}>{countdown}</span>
              </motion.div>
              <p>Triggering Demo SOS in {countdown}s...</p>
              <button className={styles.cancelCountdown} onClick={cancelCountdown}>Cancel</button>
            </div>
          ) : (
            <button className={styles.sosButton} onClick={startCountdown}>
              <div className={styles.ripple1}></div>
              <div className={styles.ripple2}></div>
              <div className={styles.btnContent}>
                <span>SOS</span>
              </div>
            </button>
          )}

          <div className={styles.offlineOption}>
            <FaWifi style={{ opacity: 0.5 }} />
            <span>No internet?</span>
            <button onClick={handleOfflineSMS}><FaSms /> Demo: Send Emergency SMS</button>
          </div>
        </motion.div>
      ) : (
        <motion.div className={styles.activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.alertBanner}>
            <div className={styles.blinker}></div>
            DEMO SOS ALERT — SIMULATION ACTIVE
          </div>

          <div className={styles.statusCards}>
            <div className={styles.card}>
              <FaMapMarkerAlt className={styles.cardIconAccent} />
              <div>
                <h3>Location Shared</h3>
                <p>Accuracy: {Math.round(Math.random() * 5 + 3)} meters</p>
                <small>{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</small>
              </div>
            </div>
            <div className={styles.card}>
              <FaAmbulance className={styles.cardIconDanger} />
              <div>
                <h3>Ambulance Dispatched (Demo)</h3>
                <p>ALS Unit #101 — ETA: 4 minutes</p>
              </div>
            </div>
            <div className={styles.card}>
              <FaHospital className={styles.cardIconSuccess} />
              <div>
                <h3>Hospital Notified (Demo)</h3>
                <p>{nearestHospital?.name || 'Nearest Hospital'}</p>
                <small>ER team preparing</small>
              </div>
            </div>
            <div className={styles.card}>
              <FaUserMd className={styles.cardIconSecondary} />
              <div>
                <h3>Responder Assigned (Demo)</h3>
                <p>Paramedic Rahul S.</p>
                <small>8 years experience</small>
              </div>
            </div>
            <div className={styles.card}>
              <FaUsers className={styles.cardIconWarning} />
              <div>
                <h3>Family Notified (Demo)</h3>
                <p>2 emergency contacts alerted via SMS</p>
              </div>
            </div>
          </div>

          <div className={styles.mapPreview}>
            <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ width: '100%', height: '300px', borderRadius: '12px' }} zoomControl={false}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
              <Marker position={[location.lat, location.lng]} icon={userIcon}>
                <Popup><strong>📍 Your Location (Demo)</strong></Popup>
              </Marker>
            </MapContainer>
          </div>

          <div className={styles.actions}>
            <button className={styles.callBtn} onClick={() => handleDemoCall('108', 'Ambulance (108)')}>
              <FaPhoneAlt /> Demo: Call 108
            </button>
            <button className={styles.callBtn112} onClick={() => handleDemoCall('112', 'Emergency (112)')}>
              <FaPhoneAlt /> Demo: Call 112
            </button>
            <button className={styles.cancelBtn} onClick={() => setActive(false)}>
              End Demo
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SOS;

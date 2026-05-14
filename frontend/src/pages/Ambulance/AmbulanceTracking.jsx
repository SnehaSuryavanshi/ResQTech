import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaUserNurse, FaMapMarkerAlt, FaAmbulance, FaHospital, FaRoute } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './Ambulance.module.scss';

// ── Jalgaon ambulance route simulation ──────────────────────
// Real route: From Mehrun area → through Ring Road → to Tapadia Hospital
const ROUTE_POINTS = [
  [20.9980, 75.5480],  // Start: Near Mehrun Lake
  [20.9995, 75.5510],
  [21.0010, 75.5535],
  [21.0025, 75.5555],
  [21.0038, 75.5570],
  [21.0050, 75.5585],
  [21.0058, 75.5598],
  [21.0065, 75.5610],
  [21.0072, 75.5618],
  [21.0077, 75.5626],  // End: Tapadia Hospital
];

const DESTINATION_HOSPITAL = {
  name: 'Tapadia Diagnostic Centre & Hospital',
  address: 'Ring Road, Jalgaon, Maharashtra 425001',
  lat: 21.0077,
  lng: 75.5626,
  phone: '+91 257 222 3344',
};

// ── Custom Icons ────────────────────────────────────────────
const ambulanceIcon = new L.DivIcon({
  className: 'amb-tracking-icon',
  html: `<div style="background:linear-gradient(135deg,#ef4444,#dc2626);width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(239,68,68,0.6);border:3px solid #fff;animation:ambPulse 1.5s infinite">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
  </div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -25],
});

const hospitalIcon = new L.DivIcon({
  className: 'dest-hospital-icon',
  html: `<div style="background:linear-gradient(135deg,#22c55e,#16a34a);width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(34,197,94,0.5);border:3px solid #fff">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>
  </div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 19],
  popupAnchor: [0, -22],
});

const pickupIcon = new L.DivIcon({
  className: 'pickup-icon',
  html: `<div style="background:linear-gradient(135deg,#6366f1,#4f46e5);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(99,102,241,0.5);border:2px solid #fff">
    <svg viewBox="0 0 24 24" width="14" height="14" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

// ── Animated ambulance marker ───────────────────────────────
const AnimatedAmbulance = ({ routePoints }) => {
  const map = useMap();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState(routePoints[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = (prev + 1) % routePoints.length;
        setPosition(routePoints[next]);
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [routePoints]);

  return (
    <Marker position={position} icon={ambulanceIcon}>
      <Popup>
        <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
          <strong style={{ color: '#ef4444', fontSize: '0.9rem' }}>🚑 ALS Unit #402</strong>
          <p style={{ margin: '4px 0', fontSize: '0.75rem', color: '#ccc' }}>Paramedic: Rajesh Kumar</p>
          <p style={{ margin: 0, fontSize: '0.72rem', color: '#999' }}>Speed: 45 km/h</p>
        </div>
      </Popup>
    </Marker>
  );
};

const AmbulanceTracking = () => {
  const [eta, setEta] = useState({ minutes: 4, seconds: 25 });
  const [distance, setDistance] = useState(1.2);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setEta(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { minutes: prev.minutes - 1, seconds: 59 };
        return { minutes: 4, seconds: 25 }; // Reset
      });
      setDistance(prev => {
        const next = prev - 0.005;
        return next > 0 ? parseFloat(next.toFixed(3)) : 1.2;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>🚑 Live Ambulance Tracking</h1>
        <div className={styles.statusBadge}>
          <span className={styles.pulse}></span>
          En Route — Jalgaon
        </div>
      </header>

      <div className={styles.layout}>
        <div className={styles.mapSection}>
          <MapContainer
            center={[21.0030, 75.5555]}
            zoom={15}
            style={{ width: '100%', height: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {/* Route polyline */}
            <Polyline
              positions={ROUTE_POINTS}
              pathOptions={{
                color: '#6366f1',
                weight: 4,
                opacity: 0.8,
                dashArray: '10, 10',
              }}
            />

            {/* Animated Ambulance */}
            <AnimatedAmbulance routePoints={ROUTE_POINTS} />

            {/* Pickup point */}
            <Marker position={ROUTE_POINTS[0]} icon={pickupIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                  <strong style={{ color: '#6366f1' }}>📍 Patient Pickup</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#999' }}>Near Mehrun Lake, Jalgaon</p>
                </div>
              </Popup>
            </Marker>

            {/* Destination Hospital */}
            <Marker position={[DESTINATION_HOSPITAL.lat, DESTINATION_HOSPITAL.lng]} icon={hospitalIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#22c55e' }}>🏥 {DESTINATION_HOSPITAL.name}</h3>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#999' }}>{DESTINATION_HOSPITAL.address}</p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Route info overlay */}
          <div className={styles.routeOverlay}>
            <div className={styles.routeInfo}>
              <FaRoute /> <span>Mehrun Lake → Ring Road → Tapadia Hospital</span>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <motion.div
            className={styles.etaCard}
            animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.1)', '0 0 30px rgba(99,102,241,0.25)', '0 0 20px rgba(99,102,241,0.1)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h3>Estimated Time of Arrival</h3>
            <div className={styles.time}>
              {String(eta.minutes).padStart(2, '0')}:{String(eta.seconds).padStart(2, '0')}
            </div>
            <p>Distance: {distance.toFixed(1)} km</p>
          </motion.div>

          <div className={styles.destinationCard}>
            <FaHospital className={styles.destIcon} />
            <div>
              <h4>Destination</h4>
              <p>{DESTINATION_HOSPITAL.name}</p>
              <span>{DESTINATION_HOSPITAL.address}</span>
            </div>
          </div>

          <div className={styles.driverCard}>
            <div className={styles.driverInfo}>
              <div className={styles.avatar}><FaUserNurse /></div>
              <div>
                <h4>Paramedic Rajesh Kumar</h4>
                <p>Unit #402 • Advanced Life Support</p>
              </div>
            </div>
            <a href={`tel:${DESTINATION_HOSPITAL.phone}`} className={styles.callBtn}>
              <FaPhoneAlt /> Contact
            </a>
          </div>

          <div className={styles.timeline}>
            <div className={`${styles.point} ${styles.completed}`}>
              <div className={styles.dot}></div>
              <div>
                <p className={styles.timelineTitle}>Dispatched</p>
                <p className={styles.timelineTime}>10:42 AM • Jalgaon Station</p>
              </div>
            </div>
            <div className={`${styles.point} ${styles.completed}`}>
              <div className={styles.dot}></div>
              <div>
                <p className={styles.timelineTitle}>Patient Located</p>
                <p className={styles.timelineTime}>10:45 AM • Near Mehrun Lake</p>
              </div>
            </div>
            <div className={`${styles.point} ${styles.active}`}>
              <div className={styles.dot}></div>
              <div>
                <p className={styles.timelineTitle}>En Route to Hospital</p>
                <p className={styles.timelineTime}>Ring Road → Tapadia Hospital</p>
              </div>
            </div>
            <div className={styles.point}>
              <div className={styles.dot}></div>
              <div>
                <p className={styles.timelineTitle}>Arrived at Hospital</p>
                <p className={styles.timelineTime}>Pending</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceTracking;

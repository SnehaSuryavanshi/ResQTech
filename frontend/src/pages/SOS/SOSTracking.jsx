import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPhoneAlt, FaClock, FaRoute, FaTimes, FaCheckCircle, FaExclamationTriangle, FaShareAlt, FaCopy } from 'react-icons/fa';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import './SOSTracking.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ── Custom Leaflet Markers ──────────────────────────────
const ambulanceIcon = new L.DivIcon({
  className: 'tracking-leaflet-marker',
  html: `<div class="tracking-amb-pulse"></div><div class="tracking-amb-dot">🚑</div>`,
  iconSize: [52, 52],
  iconAnchor: [26, 26]
});

const patientIcon = new L.DivIcon({
  className: 'tracking-leaflet-marker',
  html: `<div class="tracking-patient-pulse"></div><div class="tracking-patient-dot">📍</div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22]
});

// ── Auto-fit bounds component ───────────────────────────
function FitBounds({ positions }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (positions.length >= 2 && !fitted.current) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      fitted.current = true;
    }
  }, [positions, map]);
  return null;
}

// ── Smooth pan to center ────────────────────────────────
function PanToCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.panTo(position, { animate: true, duration: 1 });
    }
  }, [position, map]);
  return null;
}

const SOSTracking = () => {
  const { trackingSessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Data from SOS trigger page
  const sosData = location.state?.sosData || null;
  const driverTrackingUrl = location.state?.driverTrackingUrl || '';

  // ── State ─────────────────────────────────────────────
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [driverConnected, setDriverConnected] = useState(false);
  const [patientLocation, setPatientLocation] = useState(
    location.state?.patientLocation
      ? [location.state.patientLocation.latitude, location.state.patientLocation.longitude]
      : [21.0077, 75.5626]
  );
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [routeTrail, setRouteTrail] = useState([]);
  const [eta, setEta] = useState(0);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [progress, setProgress] = useState(0);
  const [arrived, setArrived] = useState(false);
  const [callStatus, setCallStatus] = useState(sosData?.callDetails?.callStatus || 'initiated');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // ── Connect Socket.IO ─────────────────────────────────
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 2000
    });

    newSocket.on('connect', () => {
      console.log('🔌 Patient socket connected:', newSocket.id);
      setConnected(true);
      newSocket.emit('sos:joinTracking', { trackingSessionId });
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // ── REAL GPS from driver's phone ────────────────────
    newSocket.on('sos:ambulanceUpdate', (data) => {
      if (data.ambulanceLocation) {
        const pos = [data.ambulanceLocation.latitude, data.ambulanceLocation.longitude];
        setAmbulanceLocation(pos);
        setEta(data.eta || 0);
        setDistanceRemaining(data.distanceRemaining || 0);
        setProgress(data.progress || 0);
        setDriverConnected(data.driverConnected !== false);

        // Build route trail from location history
        if (data.locationHistory && data.locationHistory.length > 0) {
          setRouteTrail(data.locationHistory);
        }
      }
    });

    newSocket.on('sos:driverConnected', () => {
      setDriverConnected(true);
    });

    newSocket.on('sos:driverDisconnected', () => {
      setDriverConnected(false);
    });

    newSocket.on('sos:ambulanceArrived', () => {
      setArrived(true);
      setEta(0);
      setDistanceRemaining(0);
      setProgress(100);
    });

    newSocket.on(`sos:callStatus:${trackingSessionId}`, (data) => {
      setCallStatus(data.callStatus);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('sos:stopTracking', { trackingSessionId });
      newSocket.disconnect();
    };
  }, [trackingSessionId]);

  // ── Live patient GPS ──────────────────────────────────
  useEffect(() => {
    if (!socket || !connected) return;
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = [pos.coords.latitude, pos.coords.longitude];
        setPatientLocation(loc);
        socket.emit('sos:patientLocation', {
          trackingSessionId,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 3000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [socket, connected, trackingSessionId]);

  // ── Cancel SOS ────────────────────────────────────────
  const handleCancel = () => {
    if (socket) {
      socket.emit('sos:stopTracking', { trackingSessionId });
    }
    navigate('/dashboard');
  };

  // ── Copy driver link ──────────────────────────────────
  const copyDriverLink = () => {
    const url = driverTrackingUrl || `${window.location.origin}/driver-track/${trackingSessionId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Format helpers ────────────────────────────────────
  const formatETA = (seconds) => {
    if (seconds <= 0) return 'Arrived';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
  };

  const formatDistance = (meters) => {
    if (meters <= 0) return 'Here';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  // Map positions for bounds
  const allPositions = [patientLocation];
  if (ambulanceLocation) allPositions.push(ambulanceLocation);

  return (
    <div className="tracking-page">
      {/* Status bar */}
      <div className={`tracking-status-bar ${arrived ? 'tracking-status-arrived' : ''}`}>
        <div className="tracking-status-left">
          <div className={`tracking-status-dot ${connected ? 'tracking-dot-connected' : 'tracking-dot-disconnected'}`} />
          <span>{connected ? 'LIVE TRACKING' : 'RECONNECTING...'}</span>
        </div>
        <div className="tracking-status-right">
          <span className="tracking-session-id">#{trackingSessionId?.slice(4, 16)}</span>
        </div>
      </div>

      {/* Leaflet Map — takes up most of the screen */}
      <div className="tracking-map-container">
        <MapContainer
          center={patientLocation}
          zoom={14}
          className="tracking-leaflet-map"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Patient marker */}
          <Marker position={patientLocation} icon={patientIcon}>
            <Popup>📍 Your Location</Popup>
          </Marker>

          {/* Ambulance/Driver marker (REAL GPS) */}
          {ambulanceLocation && (
            <Marker position={ambulanceLocation} icon={ambulanceIcon}>
              <Popup>🚑 Ambulance — LIVE</Popup>
            </Marker>
          )}

          {/* Route trail from driver */}
          {routeTrail.length >= 2 && (
            <Polyline
              positions={routeTrail}
              color="#00c2ff"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Direct line from ambulance to patient */}
          {ambulanceLocation && (
            <Polyline
              positions={[ambulanceLocation, patientLocation]}
              color="#ff3b5c"
              weight={3}
              dashArray="8, 6"
              opacity={0.6}
            />
          )}

          <FitBounds positions={allPositions} />
          {ambulanceLocation && <PanToCenter position={ambulanceLocation} />}
        </MapContainer>

        {/* Waiting for driver overlay */}
        {!driverConnected && !arrived && (
          <div className="tracking-waiting-overlay">
            <div className="tracking-waiting-spinner" />
            <h3>Waiting for ambulance to connect...</h3>
            <p>The driver will open the tracking link from SMS</p>

            {/* Share link button */}
            <div className="tracking-share-section">
              <p className="tracking-share-hint">Share this link with the ambulance driver:</p>
              <div className="tracking-share-url-box">
                <span className="tracking-share-url">
                  {(driverTrackingUrl || `${window.location.origin}/driver-track/${trackingSessionId}`).slice(0, 45)}...
                </span>
                <button className="tracking-copy-btn" onClick={copyDriverLink}>
                  {copied ? '✅' : <FaCopy />}
                </button>
              </div>
              <a
                className="tracking-whatsapp-btn"
                href={`https://wa.me/919322372556?text=${encodeURIComponent(
                  `🚨 EMERGENCY from ResQAI!\n\nPlease open this link to share your location:\n${driverTrackingUrl || `${window.location.origin}/driver-track/${trackingSessionId}`}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                📱 Send via WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel — Zomato style */}
      <div className="tracking-bottom-panel">
        {/* Arrived banner */}
        <AnimatePresence>
          {arrived && (
            <motion.div
              className="tracking-arrived-banner"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaCheckCircle /> AMBULANCE HAS ARRIVED!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="tracking-progress-container">
          <div className="tracking-progress-bar">
            <motion.div
              className="tracking-progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="tracking-progress-labels">
            <span>Called</span>
            <span>Connected</span>
            <span>En Route</span>
            <span>Arrived</span>
          </div>
        </div>

        {/* Metrics */}
        <div className="tracking-metrics">
          <div className="tracking-metric-card tracking-metric-eta">
            <FaClock className="tracking-metric-icon" />
            <div>
              <span className="tracking-metric-value">{formatETA(eta)}</span>
              <span className="tracking-metric-label">ETA</span>
            </div>
          </div>
          <div className="tracking-metric-card tracking-metric-distance">
            <FaRoute className="tracking-metric-icon" />
            <div>
              <span className="tracking-metric-value">{formatDistance(distanceRemaining)}</span>
              <span className="tracking-metric-label">Distance</span>
            </div>
          </div>
          <div className={`tracking-metric-card ${driverConnected ? 'tracking-metric-live' : 'tracking-metric-waiting'}`}>
            <span className={`tracking-live-dot ${driverConnected ? 'tracking-live-active' : ''}`} />
            <div>
              <span className="tracking-metric-value">{driverConnected ? 'LIVE' : 'Waiting'}</span>
              <span className="tracking-metric-label">Driver GPS</span>
            </div>
          </div>
        </div>

        {/* Call status */}
        <div className="tracking-call-status">
          <FaPhoneAlt className="tracking-call-icon" />
          <span>Emergency Call: <strong className={`tracking-call-${callStatus}`}>{callStatus?.toUpperCase()}</strong></span>
        </div>

        {/* Cancel button */}
        <button className="tracking-cancel-btn" onClick={() => setShowCancelModal(true)}>
          <FaTimes /> Cancel Emergency
        </button>
      </div>

      {/* Cancel modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div className="tracking-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="tracking-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
              <FaExclamationTriangle className="tracking-modal-icon" />
              <h3>Cancel Emergency?</h3>
              <p>This will stop live tracking. Only cancel if resolved.</p>
              <div className="tracking-modal-actions">
                <button className="tracking-modal-cancel" onClick={() => setShowCancelModal(false)}>Go Back</button>
                <button className="tracking-modal-confirm" onClick={handleCancel}>Yes, Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SOSTracking;

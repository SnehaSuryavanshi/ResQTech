import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import io from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import './DriverTrack.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// ── Custom markers ──────────────────────────────────────
const driverIcon = new L.DivIcon({
  className: 'driver-marker-icon',
  html: `<div class="driver-marker-pulse"></div><div class="driver-marker-dot">🚑</div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

const patientIcon = new L.DivIcon({
  className: 'patient-marker-icon',
  html: `<div class="patient-marker-pulse"></div><div class="patient-marker-dot">🆘</div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 24]
});

// ── Auto-center map component ───────────────────────────
function MapAutoCenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);
  return null;
}

// ── Fit both markers in view ────────────────────────────
function FitBounds({ driverPos, patientPos }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (driverPos && patientPos && !fitted.current) {
      const bounds = L.latLngBounds([driverPos, patientPos]);
      map.fitBounds(bounds, { padding: [60, 60] });
      fitted.current = true;
    }
  }, [driverPos, patientPos, map]);
  return null;
}

const DriverTrack = () => {
  const { trackingSessionId } = useParams();

  const [status, setStatus] = useState('connecting'); // connecting | sharing | error | stopped
  const [socket, setSocket] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);
  const [locationCount, setLocationCount] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [distance, setDistance] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const watchIdRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef(null);

  // ── Connect Socket.IO ─────────────────────────────────
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      console.log('🔌 Driver socket connected:', newSocket.id);
      // Join tracking room as DRIVER
      newSocket.emit('driver:join', { trackingSessionId });
    });

    // Listen for patient location
    newSocket.on('sos:patientLocationUpdate', (data) => {
      setPatientLocation([data.latitude, data.longitude]);
    });

    newSocket.on('sos:trackingStopped', () => {
      setStatus('stopped');
      stopSharing(newSocket);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Driver socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('driver:stopSharing', { trackingSessionId });
      newSocket.disconnect();
    };
  }, [trackingSessionId]);

  // ── Start GPS tracking ────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy: acc, speed: spd, heading } = pos.coords;
        setMyLocation([latitude, longitude]);
        setAccuracy(Math.round(acc));
        setSpeed(spd ? Math.round(spd * 3.6) : 0); // m/s → km/h
        setLocationCount(prev => prev + 1);
        setStatus('sharing');

        // Send to server via Socket.IO
        socket.emit('driver:locationUpdate', {
          trackingSessionId,
          latitude,
          longitude,
          accuracy: acc,
          speed: spd || 0,
          heading: heading || 0
        });

        // Calculate distance to patient if known
        if (patientLocation) {
          const d = haversineKm(latitude, longitude, patientLocation[0], patientLocation[1]);
          setDistance(d);
        }
      },
      (err) => {
        console.error('GPS error:', err);
        if (err.code === 1) {
          setStatus('error');
          setErrorMsg('Location permission denied. Please allow GPS access.');
        } else if (err.code === 2) {
          setErrorMsg('GPS position unavailable. Try moving to an open area.');
        } else {
          setErrorMsg('GPS timed out. Retrying...');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000
      }
    );

    // Elapsed timer
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // Auto-stop after 15 minutes
    const autoStop = setTimeout(() => {
      stopSharing(socket);
      setStatus('stopped');
    }, 15 * 60 * 1000);

    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(autoStop);
    };
  }, [socket, trackingSessionId]);

  // ── Stop sharing ──────────────────────────────────────
  const stopSharing = (sock) => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (sock) {
      sock.emit('driver:stopSharing', { trackingSessionId });
    }
    setStatus('stopped');
  };

  // ── Navigate to patient via Google Maps ───────────────
  const navigateToPatient = () => {
    if (!patientLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${patientLocation[0]},${patientLocation[1]}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // ── Format time ───────────────────────────────────────
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div className="driver-page">
      {/* Header */}
      <div className="driver-header">
        <div className="driver-header-left">
          <span className="driver-logo">🚑 ResQAI</span>
          <span className="driver-session">#{trackingSessionId?.slice(4, 16)}</span>
        </div>
        <div className={`driver-status-badge driver-status-${status}`}>
          <span className="driver-status-dot" />
          {status === 'connecting' && 'Connecting...'}
          {status === 'sharing' && 'LIVE'}
          {status === 'error' && 'Error'}
          {status === 'stopped' && 'Stopped'}
        </div>
      </div>

      {/* Map */}
      <div className="driver-map-container">
        {myLocation ? (
          <MapContainer
            center={myLocation}
            zoom={15}
            className="driver-leaflet-map"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Driver (you) marker */}
            <Marker position={myLocation} icon={driverIcon}>
              <Popup>📍 Your Location (Live)</Popup>
            </Marker>

            {/* Patient marker */}
            {patientLocation && (
              <Marker position={patientLocation} icon={patientIcon}>
                <Popup>🆘 Patient Location</Popup>
              </Marker>
            )}

            {/* Route line */}
            {patientLocation && (
              <Polyline
                positions={[myLocation, patientLocation]}
                color="#00c2ff"
                weight={4}
                dashArray="10, 8"
                opacity={0.8}
              />
            )}

            <MapAutoCenter position={myLocation} />
            {patientLocation && <FitBounds driverPos={myLocation} patientPos={patientLocation} />}
          </MapContainer>
        ) : (
          <div className="driver-map-loading">
            <div className="driver-loading-spinner" />
            <p>{status === 'error' ? errorMsg : 'Getting your GPS location...'}</p>
            {status === 'error' && (
              <button className="driver-retry-btn" onClick={() => window.location.reload()}>
                Retry
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="driver-bottom-panel">
        {status === 'sharing' && (
          <>
            {/* Metrics row */}
            <div className="driver-metrics">
              <div className="driver-metric">
                <span className="driver-metric-value">{formatTime(elapsed)}</span>
                <span className="driver-metric-label">Sharing</span>
              </div>
              <div className="driver-metric">
                <span className="driver-metric-value">{locationCount}</span>
                <span className="driver-metric-label">Updates</span>
              </div>
              <div className="driver-metric">
                <span className="driver-metric-value">{accuracy || '—'}m</span>
                <span className="driver-metric-label">Accuracy</span>
              </div>
              <div className="driver-metric">
                <span className="driver-metric-value">{speed || 0} km/h</span>
                <span className="driver-metric-label">Speed</span>
              </div>
            </div>

            {/* Distance to patient */}
            {distance !== null && (
              <div className="driver-distance-card">
                <span className="driver-distance-icon">📍</span>
                <div>
                  <span className="driver-distance-value">
                    {distance >= 1 ? `${distance.toFixed(1)} km` : `${Math.round(distance * 1000)} m`}
                  </span>
                  <span className="driver-distance-label">to patient</span>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="driver-actions">
              {patientLocation && (
                <button className="driver-navigate-btn" onClick={navigateToPatient}>
                  🧭 Navigate to Patient
                </button>
              )}
              <button className="driver-stop-btn" onClick={() => stopSharing(socket)}>
                ⏹ Stop Sharing
              </button>
            </div>

            {/* 15 min timer */}
            <div className="driver-timer-bar">
              <div
                className="driver-timer-fill"
                style={{ width: `${Math.min(100, (elapsed / 900) * 100)}%` }}
              />
              <span className="driver-timer-text">
                Auto-stops in {formatTime(Math.max(0, 900 - elapsed))}
              </span>
            </div>
          </>
        )}

        {status === 'stopped' && (
          <div className="driver-stopped-msg">
            <span className="driver-stopped-icon">✅</span>
            <h3>Location Sharing Stopped</h3>
            <p>Thank you for responding to the emergency!</p>
          </div>
        )}

        {status === 'connecting' && (
          <div className="driver-connecting-msg">
            <div className="driver-loading-spinner" />
            <p>Connecting to emergency tracking server...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Haversine in km
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default DriverTrack;

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaAmbulance, FaHospital, FaMapMarkerAlt, FaLayerGroup, FaUser, FaBed, FaPhone, FaDirections } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapPage.module.scss';

// ── Real Hospitals in Jalgaon, Maharashtra ──────────────────
const JALGAON_HOSPITALS = [
  {
    id: 1,
    name: 'Tapadia Diagnostic Centre & Hospital',
    lat: 21.0077,
    lng: 75.5626,
    address: 'Ring Road, Jalgaon, Maharashtra 425001',
    phone: '+91 257 222 3344',
    specialties: ['Diagnostics', 'General Medicine', 'Cardiology'],
    beds: { general: 45, icu: 10 },
    rating: 4.5,
    open24x7: true,
  },
  {
    id: 2,
    name: 'Lifeline Hospital',
    lat: 21.0130,
    lng: 75.5650,
    address: 'Akashwani Rd, Jalgaon, Maharashtra 425001',
    phone: '+91 257 223 5566',
    specialties: ['Emergency', 'Orthopedics', 'Neurology'],
    beds: { general: 60, icu: 12 },
    rating: 4.3,
    open24x7: true,
  },
  {
    id: 3,
    name: 'Shree Markandey Solapur Sahakari Rugnalaya (Civil Hospital)',
    lat: 21.0048,
    lng: 75.5560,
    address: 'Near Mehrun Lake, Jalgaon, Maharashtra 425001',
    phone: '+91 257 222 0112',
    specialties: ['General Medicine', 'Surgery', 'Pediatrics'],
    beds: { general: 120, icu: 15 },
    rating: 3.8,
    open24x7: true,
  },
  {
    id: 4,
    name: 'Dr. Ulhas Patil Medical College & Hospital',
    lat: 20.9898,
    lng: 75.5425,
    address: 'Jalgaon-Bhusawal Road, Jalgaon, Maharashtra 425309',
    phone: '+91 257 226 4455',
    specialties: ['Trauma', 'Cardiac Surgery', 'Neurosurgery', 'Oncology'],
    beds: { general: 200, icu: 30 },
    rating: 4.6,
    open24x7: true,
  },
  {
    id: 5,
    name: 'Platinum Hospital',
    lat: 21.0105,
    lng: 75.5710,
    address: 'Shirsoli Road, Jalgaon, Maharashtra 425001',
    phone: '+91 257 225 1122',
    specialties: ['Cardiology', 'Orthopedics', 'Gynecology'],
    beds: { general: 50, icu: 8 },
    rating: 4.4,
    open24x7: true,
  },
  {
    id: 6,
    name: 'Balaji Superspeciality Hospital',
    lat: 21.0155,
    lng: 75.5580,
    address: 'MJ College Road, Jalgaon, Maharashtra 425001',
    phone: '+91 257 224 7890',
    specialties: ['Cardiac', 'Neuro', 'Gastroenterology'],
    beds: { general: 80, icu: 14 },
    rating: 4.2,
    open24x7: true,
  },
  {
    id: 7,
    name: 'Choithram Netralaya & Eye Hospital',
    lat: 21.0062,
    lng: 75.5688,
    address: 'Navi Peth, Jalgaon, Maharashtra 425001',
    phone: '+91 257 223 9900',
    specialties: ['Ophthalmology', 'Laser Eye Surgery'],
    beds: { general: 30, icu: 2 },
    rating: 4.7,
    open24x7: false,
  },
  {
    id: 8,
    name: 'Suyash Hospital',
    lat: 21.0020,
    lng: 75.5745,
    address: 'Ajantha Road, Jalgaon, Maharashtra 425001',
    phone: '+91 257 225 5577',
    specialties: ['General Surgery', 'ENT', 'Urology'],
    beds: { general: 40, icu: 6 },
    rating: 4.1,
    open24x7: true,
  },
];

// ── Simulated Ambulances ────────────────────────────────────
const JALGAON_AMBULANCES = [
  { id: 'AMB-101', lat: 21.0090, lng: 75.5590, unit: 'ALS Unit #101', status: 'En Route', destination: 'Tapadia Hospital' },
  { id: 'AMB-202', lat: 21.0140, lng: 75.5700, unit: 'BLS Unit #202', status: 'Available', destination: null },
  { id: 'AMB-303', lat: 20.9950, lng: 75.5500, unit: 'ALS Unit #303', status: 'Transporting', destination: 'Dr. Ulhas Patil Hospital' },
];

// ── Custom Icons ────────────────────────────────────────────
const hospitalIcon = new L.DivIcon({
  className: 'custom-hospital-icon',
  html: `<div style="background:linear-gradient(135deg,#22c55e,#16a34a);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(34,197,94,0.5);border:2px solid #fff">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

const ambulanceIcon = new L.DivIcon({
  className: 'custom-ambulance-icon',
  html: `<div style="background:linear-gradient(135deg,#f59e0b,#d97706);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(245,158,11,0.5);border:2px solid #fff;animation:pulse 2s infinite">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
  </div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -20],
});

const userIcon = new L.DivIcon({
  className: 'custom-user-icon',
  html: `<div style="background:linear-gradient(135deg,#6366f1,#4f46e5);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(99,102,241,0.6);border:3px solid #fff">
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -22],
});

// ── Map recenter component ──────────────────────────────────
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 14);
  }, [lat, lng, map]);
  return null;
};

const MapPage = () => {
  const [layers, setLayers] = useState({ hospitals: true, ambulances: true, heatmap: false, traffic: false });
  const [userLocation, setUserLocation] = useState({ lat: 21.0077, lng: 75.5626 }); // Default: Jalgaon center
  const [selectedHospital, setSelectedHospital] = useState(null);

  const toggleLayer = (key) => setLayers(prev => ({ ...prev, [key]: !prev[key] }));

  // Try to get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Use default Jalgaon location
        }
      );
    }
  }, []);

  return (
    <div className={styles.mapLayout}>
      <aside className={styles.sidebar}>
        <div className={styles.sideHeader}>
          <h2>🗺️ Live Emergency Map</h2>
          <p>Real-time hospitals & ambulances — Jalgaon, Maharashtra</p>
        </div>

        <div className={styles.section}>
          <h3><FaLayerGroup /> Map Layers</h3>
          {Object.entries({
            hospitals: 'Hospitals',
            ambulances: 'Active Ambulances',
            heatmap: 'Emergency Heatmap',
            traffic: 'Traffic Overlay'
          }).map(([key, label]) => (
            <label key={key} className={styles.toggle}>
              <input type="checkbox" checked={layers[key]} onChange={() => toggleLayer(key)} />
              <span className={styles.slider}></span>
              {label}
            </label>
          ))}
        </div>

        <div className={styles.section}>
          <h3><FaHospital /> Nearby Hospitals</h3>
          <div className={styles.hospitalList}>
            {JALGAON_HOSPITALS.map(h => (
              <motion.div
                key={h.id}
                className={`${styles.alertCard} ${selectedHospital?.id === h.id ? styles.alertCardActive : ''}`}
                onClick={() => setSelectedHospital(h)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <FaHospital className={styles.alertIcon} style={{ color: '#22c55e' }} />
                <div>
                  <strong>{h.name}</strong>
                  <p><FaBed style={{ marginRight: 4 }} />{h.beds.icu} ICU • {h.beds.general} General</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h3><FaAmbulance /> Active Ambulances</h3>
          {JALGAON_AMBULANCES.map(a => (
            <div key={a.id} className={styles.alertCard}>
              <FaAmbulance className={styles.alertIcon} style={{ color: a.status === 'Available' ? '#22c55e' : '#f59e0b' }} />
              <div>
                <strong>{a.unit}</strong>
                <p>{a.status}{a.destination ? ` → ${a.destination}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className={styles.mapArea}>
        <MapContainer
          center={[21.0077, 75.5626]}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {selectedHospital && (
            <RecenterMap lat={selectedHospital.lat} lng={selectedHospital.lng} />
          )}

          {/* Hospital Markers */}
          {layers.hospitals && JALGAON_HOSPITALS.map(h => (
            <Marker key={h.id} position={[h.lat, h.lng]} icon={hospitalIcon}>
              <Popup className="custom-popup">
                <div style={{ minWidth: 220, fontFamily: 'Inter, sans-serif' }}>
                  <h3 style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#22c55e' }}>{h.name}</h3>
                  <p style={{ margin: '0 0 4px', fontSize: '0.78rem', color: '#ccc' }}>{h.address}</p>
                  <div style={{ display: 'flex', gap: 12, margin: '8px 0', fontSize: '0.78rem' }}>
                    <span style={{ color: '#6366f1' }}>🛏 ICU: {h.beds.icu}</span>
                    <span style={{ color: '#f59e0b' }}>🏥 General: {h.beds.general}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {h.specialties.map((s, i) => (
                      <span key={i} style={{ padding: '2px 8px', borderRadius: 12, background: 'rgba(99,102,241,0.15)', color: '#818cf8', fontSize: '0.68rem' }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`tel:${h.phone}`} style={{ flex: 1, padding: '6px 0', textAlign: 'center', background: '#22c55e', color: '#fff', borderRadius: 6, fontSize: '0.75rem', textDecoration: 'none' }}>📞 Call</a>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lng}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '6px 0', textAlign: 'center', background: '#6366f1', color: '#fff', borderRadius: 6, fontSize: '0.75rem', textDecoration: 'none' }}>🧭 Directions</a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Ambulance Markers */}
          {layers.ambulances && JALGAON_AMBULANCES.map(a => (
            <Marker key={a.id} position={[a.lat, a.lng]} icon={ambulanceIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif' }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '0.9rem', color: '#f59e0b' }}>{a.unit}</h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#ccc' }}>
                    Status: <strong style={{ color: a.status === 'Available' ? '#22c55e' : '#f59e0b' }}>{a.status}</strong>
                  </p>
                  {a.destination && <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#999' }}>→ {a.destination}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* User Location Marker */}
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                <strong style={{ color: '#6366f1' }}>📍 Your Location</strong>
                <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: '#999' }}>
                  {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Emergency Heatmap zones */}
          {layers.heatmap && (
            <>
              <Circle center={[21.0077, 75.5626]} radius={500} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1 }} />
              <Circle center={[21.0140, 75.5700]} radius={350} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.12, weight: 1 }} />
              <Circle center={[20.9950, 75.5500]} radius={400} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1 }} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPage;

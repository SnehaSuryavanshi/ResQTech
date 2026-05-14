import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaBed, FaRoute, FaSearch, FaHeartbeat, FaMapMarkerAlt, FaPhone, FaClock, FaTrophy, FaCity } from 'react-icons/fa';
import { hospitalAPI } from '../../services/api';
import { MAHARASHTRA_HOSPITALS, CITY_CENTERS, recommendHospitals, searchHospitalsByCity } from '../../data/hospitalDatabase';
import styles from './Hospitals.module.scss';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('jalgaon');
  const [emergencyType, setEmergencyType] = useState('');

  useEffect(() => {
    loadHospitals(selectedCity);
  }, [selectedCity]);

  const loadHospitals = async (city) => {
    setLoading(true);
    try {
      const center = CITY_CENTERS[city];
      const res = await hospitalAPI.getAll({ lat: center?.lat, lng: center?.lng });
      const apiHospitals = res.data.hospitals || [];
      if (apiHospitals.length > 0) {
        setHospitals(recommendHospitals(apiHospitals, { emergency: emergencyType }));
      } else {
        throw new Error('No API data');
      }
    } catch {
      const cityHospitals = MAHARASHTRA_HOSPITALS[city] || [];
      setHospitals(recommendHospitals(cityHospitals, { emergency: emergencyType }));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearch(query);
    if (query.length >= 2) {
      const result = searchHospitalsByCity(query);
      if (result.city) {
        setSelectedCity(result.city);
      } else if (result.hospitals.length > 0) {
        setHospitals(recommendHospitals(result.hospitals, { emergency: emergencyType }));
      }
    }
  };

  const filtered = hospitals.filter(h => {
    if (search && !h.name.toLowerCase().includes(search.toLowerCase()) && !h.address?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'ICU Available') return h.beds?.icu?.available > 0;
    if (filter === 'Trauma Center') return h.traumaSupport;
    if (filter === 'Top Rated') return h.rating >= 4.5;
    return true;
  });

  const cityLabel = CITY_CENTERS[selectedCity]?.label || selectedCity;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>🏥 Hospital Directory — {cityLabel}</h1>
          <p>AI-recommended hospitals with live bed availability across Maharashtra</p>
        </div>
        <div className={styles.searchBar}>
          <FaSearch className={styles.searchIcon} />
          <input placeholder="Search hospitals or city (e.g. Pune, Mumbai, Nashik)..." value={search} onChange={handleSearch} />
        </div>
      </header>

      {/* City Selector */}
      <div className={styles.citySelector}>
        <FaCity className={styles.cityIcon} />
        {Object.entries(CITY_CENTERS).map(([key, city]) => (
          <button key={key} className={`${styles.cityBtn} ${selectedCity === key ? styles.cityActive : ''}`} onClick={() => { setSelectedCity(key); setSearch(''); }}>
            {city.label}
          </button>
        ))}
      </div>

      <div className={styles.tabs}>
        {['All', 'ICU Available', 'Trauma Center', 'Top Rated'].map(tab => (
          <button key={tab} className={`${styles.tab} ${filter === tab ? styles.active : ''}`} onClick={() => setFilter(tab)}>
            {tab === 'All' ? `All (${hospitals.length})` : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          {[1,2,3].map(i => <div key={i} className={styles.skeleton}></div>)}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((h, i) => (
            <motion.div key={h._id} className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -6 }}>
              {/* Recommendation badge */}
              {i === 0 && <div className={styles.recBadge}><FaTrophy /> Best Recommended</div>}
              {h.score && <div className={styles.scoreChip}>Score: {h.score}</div>}

              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <h3>{h.name}</h3>
                  <div className={styles.rating}><FaStar /> {h.rating}</div>
                </div>
                <p className={styles.address}><FaMapMarkerAlt /> {h.distance ? `${h.distance} km` : ''} • {h.address}</p>
                {h.phone && <p className={styles.phone}><FaPhone /> {h.phone}</p>}
                <div className={styles.tags}>
                  {h.specialties?.slice(0, 4).map((s, j) => <span key={j} className={styles.tag}>{s}</span>)}
                  {h.specialties?.length > 4 && <span className={styles.tag}>+{h.specialties.length - 4}</span>}
                </div>
                <div className={styles.statsRow}>
                  <div className={styles.stat}><FaBed /> <span>{h.beds?.general?.available || 0} General</span></div>
                  <div className={styles.stat}><FaHeartbeat /> <span>{h.beds?.icu?.available || 0} ICU</span></div>
                  <div className={styles.stat}><FaClock /> <span>{h.waitTime || 0}m wait</span></div>
                </div>
                <div className={styles.badges}>
                  {h.open24x7 && <span className={styles.openBadge}>24/7</span>}
                  {h.traumaSupport && <span className={styles.traumaBadge}>Trauma</span>}
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.routeBtn} onClick={() => { import('react-hot-toast').then(m => m.default.success(`📞 Hospital Phone: ${h.phone}`)); }}>
                    <FaPhone /> Call Now
                  </button>
                  <a href={`https://www.google.com/maps/search/${encodeURIComponent(h.name + ' ' + cityLabel + ' Maharashtra')}`} target="_blank" rel="noopener noreferrer" className={styles.bookBtn}>
                    <FaRoute /> Get Directions
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hospitals;

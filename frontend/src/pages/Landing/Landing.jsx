import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeartbeat, FaRobot, FaMapMarkedAlt, FaAmbulance, FaShieldAlt, FaBrain, FaClock, FaArrowRight, FaCheckCircle, FaLock, FaMapMarkerAlt, FaHospital, FaPhoneAlt, FaMedkit, FaBolt } from 'react-icons/fa';
import styles from './Landing.module.scss';

const fadeUp = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const Landing = () => {
  const [emergencyTime, setEmergencyTime] = useState(0);

  // Live emergency counter
  useEffect(() => {
    const interval = setInterval(() => setEmergencyTime(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const stats = [
    { value: '4.2s', label: 'Avg AI Response' },
    { value: '500+', label: 'Hospitals Connected' },
    { value: '99.8%', label: 'Uptime Reliability' },
    { value: '24/7', label: 'Emergency Support' },
  ];

  const features = [
    { icon: <FaBrain />, title: 'AI Triage Engine', desc: 'Instant symptom analysis powered by advanced LLMs. Determines severity, predicts conditions, and recommends specialists in seconds.', color: '#6c63ff' },
    { icon: <FaMapMarkedAlt />, title: 'Smart Routing', desc: 'Real-time traffic-aware routing to the optimal hospital based on specialty match, bed availability, and ETA.', color: '#00c2ff' },
    { icon: <FaAmbulance />, title: 'Live Tracking', desc: 'Uber-style ambulance tracking with live ETA, paramedic details, and route visualization on the map.', color: '#ff3b5c' },
    { icon: <FaShieldAlt />, title: 'SOS Broadcast', desc: 'One-tap emergency alerts that notify hospitals, family members, and dispatch ambulances simultaneously.', color: '#22c55e' },
    { icon: <FaHeartbeat />, title: 'Bed Monitoring', desc: 'Real-time ICU, oxygen, and ventilator availability tracking across all connected hospitals.', color: '#f59e0b' },
    { icon: <FaClock />, title: 'First Aid AI', desc: 'Step-by-step AI-guided first aid instructions with voice assistance while waiting for emergency responders.', color: '#ef4444' },
  ];

  const trustIndicators = [
    { icon: <FaCheckCircle />, text: 'Verified hospitals' },
    { icon: <FaCheckCircle />, text: 'AI triage assistance' },
    { icon: <FaCheckCircle />, text: 'Secure medical profiles' },
    { icon: <FaCheckCircle />, text: 'Live ambulance routing' },
  ];

  const privacyItems = [
    { icon: '🔒', text: 'Medical profile securely protected' },
    { icon: '📍', text: 'Location used only during emergency events' },
    { icon: '🚑', text: 'Emergency info shared only when triggered' },
  ];

  const quickActions = [
    { icon: <FaBolt />, label: 'Emergency SOS', to: '/sos', color: '#ef4444', pulse: true },
    { icon: <FaHospital />, label: 'Find Hospital', to: '/hospitals', color: '#22c55e' },
    { icon: <FaPhoneAlt />, label: 'Call Ambulance', to: '/ambulance', color: '#f59e0b' },
    { icon: <FaMedkit />, label: 'First Aid', to: '/first-aid', color: '#6c63ff' },
  ];

  return (
    <div className={styles.landing}>
      {/* ── Hero Section — Emergency Decision Cockpit ─── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
          <div className={styles.grid}></div>
          <div className={styles.scanline}></div>
        </div>

        <div className={`container ${styles.heroInner}`}>
          <motion.div className={styles.heroContent} initial="hidden" animate="show" variants={stagger}>
            <motion.div className={styles.badge} variants={fadeUp}>
              <FaRobot /> AI-Powered Emergency Response
            </motion.div>

            <motion.div className={styles.liveIndicator} variants={fadeUp}>
              <span className={styles.liveDot}></span>
              <span>LIVE — Emergency Time: {formatTime(emergencyTime)}</span>
            </motion.div>

            <motion.h1 variants={fadeUp}>
              Find the Right Emergency Care<br />
              <span className={styles.gradientText}>Before Time Runs Out</span>
            </motion.h1>

            <motion.p className={styles.heroDesc} variants={fadeUp}>
              Instantly locate hospitals, dispatch emergency support, share your medical profile, and get AI-powered triage assistance.
            </motion.p>

            {/* Trust Indicators */}
            <motion.div className={styles.trustRow} variants={fadeUp}>
              {trustIndicators.map((t, i) => (
                <span key={i} className={styles.trustItem}>
                  {t.icon} {t.text}
                </span>
              ))}
            </motion.div>

            <motion.div className={styles.heroCta} variants={fadeUp}>
              <Link to="/sos" className={styles.ctaPrimary}>
                <span className={styles.ctaPulse}></span>
                Emergency SOS
              </Link>
              <Link to="/register" className={styles.ctaSecondary}>
                Get Started <FaArrowRight />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {/* Quick Emergency Actions Cockpit */}
            <div className={styles.cockpitPanel}>
              <div className={styles.cockpitHeader}>
                <span className={styles.liveDotSmall}></span>
                <span>Emergency Command Center</span>
              </div>
              <div className={styles.cockpitGrid}>
                {quickActions.map((a, i) => (
                  <Link key={i} to={a.to} className={styles.cockpitAction} style={{ '--action-color': a.color }}>
                    {a.pulse && <span className={styles.actionPulse}></span>}
                    <div className={styles.cockpitIcon}>{a.icon}</div>
                    <span>{a.label}</span>
                  </Link>
                ))}
              </div>
              <div className={styles.cockpitStats}>
                <div className={styles.miniStat}>
                  <div className={styles.miniIcon} style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}><FaHeartbeat /></div>
                  <div><small>Status</small><strong>Active</strong></div>
                </div>
                <div className={styles.miniStat}>
                  <div className={styles.miniIcon} style={{ background: 'rgba(0,194,255,0.15)', color: '#00c2ff' }}><FaAmbulance /></div>
                  <div><small>Ambulances</small><strong>24 Active</strong></div>
                </div>
                <div className={styles.miniStat}>
                  <div className={styles.miniIcon} style={{ background: 'rgba(255,59,92,0.15)', color: '#ff3b5c' }}><FaClock /></div>
                  <div><small>Avg Response</small><strong>4.2 min</strong></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────── */}
      <section className={styles.statsBar}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <motion.div key={i} className={styles.statItem} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className={styles.features}>
        <div className="container">
          <motion.div className={styles.sectionHeader} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className={styles.sectionBadge}>Core Capabilities</span>
            <h2>Life-Saving Technology</h2>
            <p>Six intelligent systems working together to minimize emergency response time</p>
          </motion.div>

          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <motion.div key={i} className={styles.featureCard} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} whileHover={{ y: -8, transition: { duration: 0.25 } }}>
                <div className={styles.featureIcon} style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy & Security ─────────────────────────── */}
      <section className={styles.privacySection}>
        <div className="container">
          <motion.div className={styles.privacyCard} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div className={styles.privacyHeader}>
              <FaLock className={styles.lockIcon} />
              <h2>Your Privacy, Our Priority</h2>
              <p>We take data security seriously. Your medical information is encrypted and protected.</p>
            </div>
            <div className={styles.privacyGrid}>
              {privacyItems.map((p, i) => (
                <motion.div key={i} className={styles.privacyItem} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} viewport={{ once: true }}>
                  <span className={styles.privacyEmoji}>{p.icon}</span>
                  <span>{p.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className="container">
          <motion.div className={styles.ctaCard} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <h2>Ready to Save Lives?</h2>
            <p>Join thousands of users who trust ResQAI for emergency healthcare support.</p>
            <div className={styles.ctaActions}>
              <Link to="/register" className={styles.ctaPrimary}>Create Free Account</Link>
              <Link to="/hospitals" className={styles.ctaSecondary}>Explore Hospitals</Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Landing;

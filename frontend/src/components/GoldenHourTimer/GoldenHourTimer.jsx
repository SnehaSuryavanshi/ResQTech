import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar, FaClock, FaExclamationTriangle, FaCheckCircle, FaRoad } from 'react-icons/fa';
import { getHospitalETAReport, formatETA } from '../../services/trafficService';
import styles from './GoldenHourTimer.module.scss';

/**
 * GoldenHourTimer — Visual "Time to Reach" widget for hospital cards
 * Shows ETA, traffic status, and golden-hour countdown with animated ring
 *
 * @param {{ distanceKm: number, compact?: boolean }} props
 */
const GoldenHourTimer = ({ distanceKm, compact = false }) => {
  const [report, setReport] = useState(() => getHospitalETAReport(distanceKm || 0));
  const [tick, setTick] = useState(0);

  // Refresh ETA every 30 seconds to simulate live traffic changes
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Recalculate when distance or tick changes
  useEffect(() => {
    setReport(getHospitalETAReport(distanceKm || 0));
  }, [distanceKm, tick]);

  const { etaMinutes, etaFormatted, trafficLevel, trafficDisplay, goldenRemaining, urgency, urgencyDisplay, goldenHourPercent } = report;

  // SVG ring parameters
  const ringSize = compact ? 52 : 64;
  const strokeWidth = compact ? 3.5 : 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goldenHourPercent / 100) * circumference;

  // Urgency icon
  const UrgencyIcon = useMemo(() => {
    switch (urgency) {
      case 'safe': return FaCheckCircle;
      case 'warning': return FaClock;
      case 'critical':
      case 'expired': return FaExclamationTriangle;
      default: return FaClock;
    }
  }, [urgency]);

  if (!distanceKm || distanceKm <= 0) return null;

  return (
    <motion.div
      className={`${styles.container} ${styles[urgency]} ${compact ? styles.compact : ''}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Circular Progress Ring */}
      <div className={styles.ringWrapper}>
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className={styles.ringSvg}
        >
          {/* Background track */}
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <motion.circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={urgencyDisplay.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              filter: urgency === 'critical' || urgency === 'expired'
                ? `drop-shadow(0 0 6px ${urgencyDisplay.color})`
                : 'none',
            }}
          />
        </svg>

        {/* Center content */}
        <div className={styles.ringCenter}>
          <AnimatePresence mode="wait">
            <motion.span
              key={etaMinutes}
              className={styles.etaNumber}
              style={{ color: urgencyDisplay.color }}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {etaMinutes < 60 ? etaMinutes : `${Math.floor(etaMinutes / 60)}h`}
            </motion.span>
          </AnimatePresence>
          <span className={styles.etaUnit}>min</span>
        </div>

        {/* Pulse ring for critical states */}
        {(urgency === 'critical' || urgency === 'expired') && (
          <motion.div
            className={styles.pulseRing}
            style={{ borderColor: urgencyDisplay.color }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
      </div>

      {/* Info Section */}
      <div className={styles.infoSection}>
        {/* ETA Line */}
        <div className={styles.etaLine}>
          <FaRoad className={styles.etaIcon} />
          <span className={styles.etaText}>
            <strong>{etaFormatted}</strong> to reach
          </span>
        </div>

        {/* Traffic indicator */}
        <div className={styles.trafficLine}>
          <span
            className={styles.trafficDot}
            style={{ backgroundColor: trafficDisplay.color }}
          />
          <span className={styles.trafficLabel}>{trafficDisplay.label}</span>
        </div>

        {/* Golden Hour Status */}
        <div className={styles.goldenLine} style={{ color: urgencyDisplay.color }}>
          <UrgencyIcon className={styles.goldenIcon} />
          <span className={styles.goldenLabel}>
            {urgency === 'expired'
              ? 'Golden Hour Exceeded'
              : `${goldenRemaining} min left`
            }
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GoldenHourTimer;

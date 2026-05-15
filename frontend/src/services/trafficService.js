// ═══════════════════════════════════════════════════════
//  ResQAI — Traffic & Golden Hour Estimation Service
//  Client-side ETA calculation with realistic traffic sim
// ═══════════════════════════════════════════════════════

/**
 * Average urban speeds (km/h) by traffic level
 */
const SPEED_PROFILES = {
  freeFlow: 45,    // Late night / empty roads
  normal: 30,      // Regular traffic
  moderate: 22,    // Moderate congestion
  heavy: 14,       // Rush hour / heavy traffic
  severe: 8,       // Gridlock / accident
};

/**
 * The Golden Hour — 60 minutes from injury to definitive care
 */
const GOLDEN_HOUR_MINUTES = 60;

/**
 * Get a traffic multiplier based on current time-of-day and day-of-week.
 * Returns a value between 1.0 (free flow) and 2.8 (severe congestion).
 * Includes a small random jitter for realism.
 */
export function getTrafficMultiplier() {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay(); // 0 = Sunday
  const isWeekend = day === 0 || day === 6;

  let baseMultiplier = 1.0;

  if (isWeekend) {
    // Weekends: lighter traffic overall
    if (hour >= 10 && hour <= 13) baseMultiplier = 1.3;       // Late morning
    else if (hour >= 17 && hour <= 20) baseMultiplier = 1.4;   // Evening out
    else if (hour >= 7 && hour <= 9) baseMultiplier = 1.1;     // Morning
    else baseMultiplier = 1.0;
  } else {
    // Weekdays: classic rush-hour pattern
    if (hour >= 8 && hour <= 10) baseMultiplier = 2.0;         // Morning rush
    else if (hour >= 17 && hour <= 20) baseMultiplier = 2.2;   // Evening rush
    else if (hour >= 12 && hour <= 14) baseMultiplier = 1.5;   // Lunch hour
    else if (hour >= 6 && hour <= 7) baseMultiplier = 1.3;     // Early morning
    else if (hour >= 21 && hour <= 23) baseMultiplier = 1.2;   // Late evening
    else baseMultiplier = 1.0;                                  // Night / off-peak
  }

  // Add realistic jitter (±15%)
  const jitter = 0.85 + Math.random() * 0.30;
  return Math.round(baseMultiplier * jitter * 100) / 100;
}

/**
 * Classify the traffic multiplier into a human-readable level.
 * @param {number} multiplier
 * @returns {'low'|'moderate'|'heavy'|'severe'}
 */
export function getTrafficLevel(multiplier) {
  if (multiplier <= 1.2) return 'low';
  if (multiplier <= 1.6) return 'moderate';
  if (multiplier <= 2.2) return 'heavy';
  return 'severe';
}

/**
 * Traffic level display config (label, color)
 */
export const TRAFFIC_DISPLAY = {
  low:      { label: 'Low Traffic',      color: '#22c55e', icon: '🟢' },
  moderate: { label: 'Moderate Traffic',  color: '#f59e0b', icon: '🟡' },
  heavy:    { label: 'Heavy Traffic',     color: '#ef4444', icon: '🔴' },
  severe:   { label: 'Severe Traffic',    color: '#dc2626', icon: '⛔' },
};

/**
 * Estimate travel time in minutes given a distance (km) and traffic multiplier.
 * Uses average urban speed adjusted by traffic.
 * @param {number} distanceKm — Distance to hospital in km
 * @param {number} [trafficMultiplier] — Optional traffic factor (auto-calculated if omitted)
 * @returns {{ etaMinutes: number, trafficMultiplier: number, trafficLevel: string }}
 */
export function estimateETA(distanceKm, trafficMultiplier) {
  if (!distanceKm || distanceKm <= 0) {
    return { etaMinutes: 0, trafficMultiplier: 1, trafficLevel: 'low' };
  }

  const multiplier = trafficMultiplier ?? getTrafficMultiplier();
  const level = getTrafficLevel(multiplier);

  // Select base speed based on traffic level
  let baseSpeed;
  switch (level) {
    case 'low':      baseSpeed = SPEED_PROFILES.normal; break;
    case 'moderate': baseSpeed = SPEED_PROFILES.moderate; break;
    case 'heavy':    baseSpeed = SPEED_PROFILES.heavy; break;
    case 'severe':   baseSpeed = SPEED_PROFILES.severe; break;
    default:         baseSpeed = SPEED_PROFILES.normal;
  }

  // Time = Distance / Speed (in hours → convert to minutes)
  const etaHours = distanceKm / baseSpeed;
  const etaMinutes = Math.max(1, Math.round(etaHours * 60));

  return { etaMinutes, trafficMultiplier: multiplier, trafficLevel: level };
}

/**
 * Calculate how many minutes of the Golden Hour remain after travel time.
 * @param {number} etaMinutes — Travel time in minutes
 * @returns {number} — Minutes remaining (can be negative)
 */
export function getGoldenHourRemaining(etaMinutes) {
  return GOLDEN_HOUR_MINUTES - etaMinutes;
}

/**
 * Classify urgency based on remaining golden-hour minutes.
 * @param {number} remainingMinutes
 * @returns {'safe'|'warning'|'critical'|'expired'}
 */
export function getUrgencyLevel(remainingMinutes) {
  if (remainingMinutes > 30) return 'safe';
  if (remainingMinutes > 15) return 'warning';
  if (remainingMinutes > 0) return 'critical';
  return 'expired';
}

/**
 * Urgency display config
 */
export const URGENCY_DISPLAY = {
  safe:     { label: 'Within Golden Hour', color: '#22c55e', bgAlpha: 0.12 },
  warning:  { label: 'Golden Hour Warning', color: '#f59e0b', bgAlpha: 0.12 },
  critical: { label: 'Critical — Hurry!',  color: '#ef4444', bgAlpha: 0.15 },
  expired:  { label: 'Golden Hour Exceeded', color: '#dc2626', bgAlpha: 0.18 },
};

/**
 * Format minutes into a human-readable string.
 * @param {number} minutes
 * @returns {string} e.g. "12 min", "1 hr 5 min"
 */
export function formatETA(minutes) {
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}

/**
 * Get a complete ETA report for a hospital.
 * @param {number} distanceKm
 * @returns {object} Full report with ETA, traffic, golden hour, urgency
 */
export function getHospitalETAReport(distanceKm) {
  const trafficMultiplier = getTrafficMultiplier();
  const { etaMinutes, trafficLevel } = estimateETA(distanceKm, trafficMultiplier);
  const goldenRemaining = getGoldenHourRemaining(etaMinutes);
  const urgency = getUrgencyLevel(goldenRemaining);

  return {
    distanceKm,
    etaMinutes,
    etaFormatted: formatETA(etaMinutes),
    trafficMultiplier,
    trafficLevel,
    trafficDisplay: TRAFFIC_DISPLAY[trafficLevel],
    goldenRemaining: Math.max(0, goldenRemaining),
    goldenRemainingRaw: goldenRemaining,
    urgency,
    urgencyDisplay: URGENCY_DISPLAY[urgency],
    goldenHourPercent: Math.max(0, Math.min(100, (goldenRemaining / GOLDEN_HOUR_MINUTES) * 100)),
  };
}

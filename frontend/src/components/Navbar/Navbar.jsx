import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeartbeat, FaBars, FaTimes, FaSun, FaMoon, FaBell } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import styles from './Navbar.module.scss';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount, setShowPanel, showPanel } = useNotifications();
  const location = useLocation();

  return (
    <motion.nav
      className={styles.navbar}
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.8, 0.25, 1] }}
    >
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <FaHeartbeat className={styles.logoIcon} />
          <span className={styles.logoText}>ResQ<span>AI</span></span>
        </Link>

        <ul className={`${styles.navLinks} ${menuOpen ? styles.open : ''}`}>
          <li><Link to="/hospitals" className={location.pathname === '/hospitals' ? styles.active : ''}>Hospitals</Link></li>
          <li><Link to="/map" className={location.pathname === '/map' ? styles.active : ''}>Live Map</Link></li>
          <li><Link to="/first-aid" className={location.pathname === '/first-aid' ? styles.active : ''}>First Aid</Link></li>
          {isAuthenticated && (
            <li><Link to="/dashboard" className={location.pathname === '/dashboard' ? styles.active : ''}>Dashboard</Link></li>
          )}
        </ul>

        <div className={styles.actions}>
          <button className={styles.themeToggle} onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>

          {isAuthenticated && (
            <button className={styles.notifBtn} onClick={() => setShowPanel(!showPanel)}>
              <FaBell />
              {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
            </button>
          )}

          <Link to="/sos" className={styles.sosBtn}>
            <span className={styles.sosPulse}></span>
            SOS
          </Link>

          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <Link to="/dashboard" className={styles.avatar}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className={styles.loginBtn}>Sign In</Link>
              <Link to="/register" className={styles.registerBtn}>Get Started</Link>
            </>
          )}

          <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

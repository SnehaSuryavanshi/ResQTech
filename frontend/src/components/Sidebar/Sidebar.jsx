import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaRobot, FaMapMarkedAlt, FaHospital, FaAmbulance, FaUser, FaChartBar, FaSignOutAlt, FaHeartbeat, FaExclamationTriangle, FaFirstAid, FaSun, FaMoon } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Sidebar.module.scss';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { to: '/chat', icon: <FaRobot />, label: 'AI Assistant' },
    { to: '/map', icon: <FaMapMarkedAlt />, label: 'Live Map' },
    { to: '/hospitals', icon: <FaHospital />, label: 'Hospitals' },
    { to: '/ambulance', icon: <FaAmbulance />, label: 'Ambulance' },
    { to: '/first-aid', icon: <FaFirstAid />, label: 'First Aid' },
    { to: '/profile', icon: <FaUser />, label: 'Profile' },
  ];

  if (user?.role === 'super_admin' || user?.role === 'hospital_admin') {
    links.push({ to: '/admin', icon: <FaChartBar />, label: 'Admin' });
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <FaHeartbeat className={styles.brandIcon} />
        <span>ResQ<span className={styles.ai}>AI</span></span>
      </div>

      <nav className={styles.nav}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.themeBtn} onClick={toggleTheme}>
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <NavLink to="/sos" className={styles.sosBtn}>
          <FaExclamationTriangle /> SOS Emergency
        </NavLink>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

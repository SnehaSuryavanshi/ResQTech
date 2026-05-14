import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheckDouble } from 'react-icons/fa';
import { useNotifications } from '../../context/NotificationContext';
import styles from './NotificationPanel.module.scss';

const NotificationPanel = () => {
  const { notifications, showPanel, setShowPanel, markRead, markAllRead, unreadCount } = useNotifications();

  return (
    <AnimatePresence>
      {showPanel && (
        <>
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPanel(false)} />
          <motion.div className={styles.panel} initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }} transition={{ type: 'spring', damping: 25 }}>
            <div className={styles.header}>
              <h3>Notifications {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}</h3>
              <div className={styles.headerActions}>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className={styles.markAllBtn}>
                    <FaCheckDouble /> Mark all read
                  </button>
                )}
                <button onClick={() => setShowPanel(false)} className={styles.closeBtn}><FaTimes /></button>
              </div>
            </div>
            <div className={styles.list}>
              {notifications.length === 0 ? (
                <p className={styles.empty}>No notifications yet</p>
              ) : (
                notifications.map(n => (
                  <motion.div
                    key={n.id}
                    className={`${styles.item} ${!n.read ? styles.unread : ''}`}
                    onClick={() => markRead(n.id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ x: 4 }}
                  >
                    <span className={styles.icon}>{n.icon}</span>
                    <div className={styles.content}>
                      <strong>{n.title}</strong>
                      <p>{n.message}</p>
                      <small>{n.time}</small>
                    </div>
                    {!n.read && <span className={styles.dot} />}
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;

import React from 'react';
import { FaChartBar, FaAmbulance, FaHospitalAlt, FaUsers } from 'react-icons/fa';
import styles from './AdminDashboard.module.scss';

const AdminDashboard = () => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>System Overview</h1>
        <div className={styles.liveIndicator}>
          <span className={styles.pulse}></span> System Live
        </div>
      </header>

      <div className={styles.statGrid}>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper} style={{color: '#ff3b5c', background: 'rgba(255, 59, 92, 0.1)'}}><FaHeartbeat /></div>
          <div className={styles.statInfo}>
            <p>Active Emergencies</p>
            <h2>24</h2>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper} style={{color: '#00c2ff', background: 'rgba(0, 194, 255, 0.1)'}}><FaAmbulance /></div>
          <div className={styles.statInfo}>
            <p>Ambulances Deployed</p>
            <h2>18/45</h2>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper} style={{color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)'}}><FaHospitalAlt /></div>
          <div className={styles.statInfo}>
            <p>Hospital Capacity</p>
            <h2>78%</h2>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.iconWrapper} style={{color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)'}}><FaUsers /></div>
          <div className={styles.statInfo}>
            <p>Active Users</p>
            <h2>1,240</h2>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.chartSection}>
          <h3>Emergency Trends (Live)</h3>
          <div className={styles.mockChart}>
            {/* Mock bars for chart */}
            <div className={styles.bar} style={{height: '40%'}}></div>
            <div className={styles.bar} style={{height: '60%'}}></div>
            <div className={styles.bar} style={{height: '30%'}}></div>
            <div className={styles.bar} style={{height: '80%'}}></div>
            <div className={styles.bar} style={{height: '50%'}}></div>
            <div className={styles.bar} style={{height: '90%'}}></div>
            <div className={styles.bar} style={{height: '70%'}}></div>
          </div>
        </div>
        
        <div className={styles.feedSection}>
          <h3>Recent Alerts</h3>
          <div className={styles.feedList}>
            <div className={styles.feedItem}>
              <span className={styles.tag + ' ' + styles.danger}>Critical</span>
              <div className={styles.feedContent}>
                <p>Cardiac arrest reported at Downtown.</p>
                <span>2 mins ago</span>
              </div>
            </div>
            <div className={styles.feedItem}>
              <span className={styles.tag + ' ' + styles.warning}>High</span>
              <div className={styles.feedContent}>
                <p>Traffic collision on Highway 4.</p>
                <span>5 mins ago</span>
              </div>
            </div>
            <div className={styles.feedItem}>
              <span className={styles.tag + ' ' + styles.info}>Info</span>
              <div className={styles.feedContent}>
                <p>Unit #42 arrived at destination.</p>
                <span>12 mins ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// added import
import { FaHeartbeat } from 'react-icons/fa';

export default AdminDashboard;

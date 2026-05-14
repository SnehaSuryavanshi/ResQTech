import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import NotificationPanel from '../components/NotificationPanel/NotificationPanel';
import { Toaster } from 'react-hot-toast';
import styles from './DashboardLayout.module.scss';

const DashboardLayout = () => {
  return (
    <div className={styles.dashboardLayout}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <NotificationPanel />
      <Toaster position="top-right" />
    </div>
  );
};

export default DashboardLayout;

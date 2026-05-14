import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import NotificationPanel from '../components/NotificationPanel/NotificationPanel';
import { Toaster } from 'react-hot-toast';

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 80px)', paddingTop: '80px' }}>
        <Outlet />
      </main>
      <Footer />
      <NotificationPanel />
      <Toaster position="top-right" />
    </>
  );
};

export default MainLayout;

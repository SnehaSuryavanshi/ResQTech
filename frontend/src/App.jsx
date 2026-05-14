import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Landing from './pages/Landing/Landing';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import UserDashboard from './pages/Dashboard/UserDashboard';
import Chat from './pages/Chat/Chat';
import MapPage from './pages/Map/MapPage';
import Hospitals from './pages/Hospitals/Hospitals';
import SOS from './pages/SOS/SOS';
import FirstAid from './pages/FirstAid/FirstAid';
import AmbulanceTracking from './pages/Ambulance/AmbulanceTracking';
import Profile from './pages/Profile/Profile';
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (with Navbar + Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Authenticated Routes (with Sidebar) */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/sos" element={<SOS />} />
          <Route path="/first-aid" element={<FirstAid />} />
          <Route path="/ambulance" element={<AmbulanceTracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

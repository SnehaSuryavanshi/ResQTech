import React, { createContext, useState, useContext, useCallback, useRef } from 'react';

const NotificationContext = createContext();

const DEMO_NOTIFICATIONS = [
  { id: 1, type: 'ambulance', icon: '🚑', title: 'Ambulance Dispatched', message: 'Unit #402 en route. ETA: 4 min', time: '2 min ago', read: false },
  { id: 2, type: 'hospital', icon: '🏥', title: 'Hospital Notified', message: 'Tapadia Hospital alerted about your emergency', time: '3 min ago', read: false },
  { id: 3, type: 'responder', icon: '👨‍⚕️', title: 'Responder Assigned', message: 'Dr. Patel (Trauma) assigned to your case', time: '5 min ago', read: true },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [showPanel, setShowPanel] = useState(false);
  const nextId = useRef(100);

  const addNotification = useCallback((notif) => {
    setNotifications(prev => [{ id: nextId.current++, time: 'Just now', read: false, ...notif }, ...prev]);
  }, []);

  const markRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const simulateEmergencyNotifications = useCallback(() => {
    const seq = [
      { delay: 0, type: 'ambulance', icon: '🚑', title: 'Ambulance Dispatched', message: 'ALS Unit #101 dispatched. ETA: 6 min' },
      { delay: 3000, type: 'hospital', icon: '🏥', title: 'Hospital Notified', message: 'Lifeline Hospital ER preparing for arrival' },
      { delay: 6000, type: 'responder', icon: '👨‍⚕️', title: 'Responder Assigned', message: 'Paramedic Rahul Sharma assigned' },
      { delay: 9000, type: 'family', icon: '👨‍👩‍👧', title: 'Family Alerted', message: 'Emergency contacts notified via SMS' },
    ];
    seq.forEach(({ delay, ...notif }) => setTimeout(() => addNotification(notif), delay));
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, showPanel, setShowPanel, addNotification, markRead, markAllRead, unreadCount, simulateEmergencyNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

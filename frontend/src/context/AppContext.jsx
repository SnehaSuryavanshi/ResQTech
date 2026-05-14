import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [emergencyActive, setEmergencyActive] = useState(false);

  return (
    <AppContext.Provider value={{ user, setUser, theme, setTheme, emergencyActive, setEmergencyActive }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('resqai_token') || null);
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('resqai_token');
      const storedUser = localStorage.getItem('resqai_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // Corrupt stored data
          localStorage.removeItem('resqai_user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('resqai_token', t);
    localStorage.setItem('resqai_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token: t, user: u } = res.data;
    localStorage.setItem('resqai_token', t);
    localStorage.setItem('resqai_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return res.data; // Return full response for OTP handling
  };

  const verifyOTP = async (email, otp) => {
    const res = await authAPI.verifyOTP({ email, otp });
    const { token: t, user: u } = res.data;
    localStorage.setItem('resqai_token', t);
    localStorage.setItem('resqai_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('resqai_token');
    localStorage.removeItem('resqai_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, register, logout,
      isAuthenticated, setUser, verifyOTP
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

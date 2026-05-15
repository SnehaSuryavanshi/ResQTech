import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('resqai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('resqai_token');
      localStorage.removeItem('resqai_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// ── Hospitals ───────────────────────────────────────────
export const hospitalAPI = {
  getAll: (params) => api.get('/hospitals', { params }),
  getOne: (id) => api.get(`/hospitals/${id}`),
  updateBeds: (id, beds) => api.put(`/hospitals/${id}/beds`, { beds }),
};

// ── Emergencies ─────────────────────────────────────────
export const emergencyAPI = {
  create: (data) => api.post('/emergencies', data),
  getAll: () => api.get('/emergencies'),
  getOne: (id) => api.get(`/emergencies/${id}`),
  triggerSOS: (id) => api.post(`/emergencies/${id}/sos`),
  analyze: (symptoms) => api.post('/emergencies/analyze', { symptoms }),
};

// ── AI ──────────────────────────────────────────────────
export const aiAPI = {
  chat: (message, history) => api.post('/ai/chat', { message, history }),
  firstAid: (type) => api.post('/ai/first-aid', { emergency_type: type }),
};

// ── Ambulances ──────────────────────────────────────────
export const ambulanceAPI = {
  getAll: () => api.get('/ambulances'),
  updateLocation: (id, lat, lng) => api.put(`/ambulances/${id}/location`, { lat, lng }),
};

// ── Admin ───────────────────────────────────────────────
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getAllEmergencies: () => api.get('/admin/emergencies'),
};

// ── SOS ─────────────────────────────────────────────────
export const sosAPI = {
  trigger: (data) => api.post('/sos', data),
  getStatus: (trackingSessionId) => api.get(`/sos/${trackingSessionId}`),
  cancel: (trackingSessionId) => api.post(`/sos/${trackingSessionId}/cancel`),
  updateLocation: (trackingSessionId, data) => api.post(`/sos/${trackingSessionId}/location`, data),
};

// ── Health ──────────────────────────────────────────────
export const healthCheck = () => api.get('/health');

export default api;

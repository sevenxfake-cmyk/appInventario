import axios from 'axios';
import demoApi from './demoApi.js';
import { obtenerSesion, avisarSesionExpirada } from './auth.js';

// En Vercel sin API HTTPS se conserva la demostración sin autenticación real.
// En localhost se usa siempre el backend MySQL de la PC.
const backendUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');
const esLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
export const demoMode = !esLocal && !/^https:\/\//i.test(backendUrl);
const base = backendUrl || 'http://localhost:3006';
const api = demoMode ? demoApi : axios.create({
  baseURL: base.endsWith('/api') ? base : base + '/api',
  headers: { 'Content-Type': 'application/json' }
});

if (!demoMode) {
  api.interceptors.request.use(config => {
    const token = obtenerSesion()?.token;
    if (token) config.headers.Authorization = 'Bearer ' + token;
    return config;
  });
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401 && obtenerSesion()?.token) {
        avisarSesionExpirada();
      }
      return Promise.reject(error);
    }
  );
}
export default api;

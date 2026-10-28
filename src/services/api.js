import axios from 'axios';
import demoApi from './demoApi.js';

// En Vercel sin un backend HTTPS publicado, habilitar una demo local al navegador.
// En la PC de SENATI (localhost) conservar la API real Node.js / MySQL.
const backendUrl = (import.meta.env.VITE_API_URL || '').trim();
const esLocal = ['localhost','127.0.0.1'].includes(window.location.hostname);
export const demoMode = !esLocal && !/^https:\/\//i.test(backendUrl);

const api = demoMode ? demoApi : axios.create({
  baseURL: backendUrl || 'http://localhost:3006',
  headers: { 'Content-Type': 'application/json' }
});

export default api;

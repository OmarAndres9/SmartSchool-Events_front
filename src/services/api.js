/**
 * services/api.js
 * Instancia centralizada de Axios.
 *
 * Variables de entorno requeridas en .env:
 *   VITE_API_BASE_URL=http://localhost:8080/api
 */

import axios from 'axios';

// ─── Instancia base ────────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
  // Necesario cuando el backend usa supports_credentials: true en CORS
  withCredentials: false,
  timeout: 15000,
});

// ─── Interceptor de petición: adjunta el token JWT ─────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de respuesta: manejo global de errores ───────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (status === 403) {
      console.error('Acceso denegado: no tienes permisos para esta acción.');
    }

    if (status >= 500) {
      console.error('Error del servidor. Intenta de nuevo más tarde.');
    }

    return Promise.reject(error);
  }
);

export default api;

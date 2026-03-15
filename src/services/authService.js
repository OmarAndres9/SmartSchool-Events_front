/**
 * services/authService.js
 * Llamadas de autenticación: login, registro, logout, perfil.
 */

import api from './api';

const authService = {
  login: (credentials) => api.post('/login', credentials),

  register: (data) => api.post('/register', data),

  logout: () => api.post('/logout'),

  /**
   * Obtiene el perfil del usuario autenticado.
   */
  me: () => api.get('/me'),
};

export default authService;

/**
 * services/notificacionesService.js
 */
import api from './api';
import { invalidateCache } from './requestCache';

const notificacionesService = {
  getAll:  (params = {}) => api.get('/notificaciones', { params }),
  getById: (id)          => api.get(`/notificaciones/${id}`),

  create: async (data) => {
    const res = await api.post('/notificaciones', data);
    invalidateCache('notificaciones');
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/notificaciones/${id}`, data);
    invalidateCache('notificaciones');
    return res;
  },

  remove: async (id) => {
    const res = await api.delete(`/notificaciones/${id}`);
    invalidateCache('notificaciones');
    return res;
  },
};

export default notificacionesService;

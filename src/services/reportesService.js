/**
 * services/reportesService.js
 */
import api from './api';
import { invalidateCache } from './requestCache';

const reportesService = {
  getAll:  (filtros = {}) => api.get('/reportes', { params: filtros }),
  getById: (id)           => api.get(`/reportes/${id}`),

  create: async (data) => {
    const res = await api.post('/reportes', data);
    invalidateCache('reportes:');
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/reportes/${id}`, data);
    invalidateCache('reportes:');
    return res;
  },

  remove: async (id) => {
    const res = await api.delete(`/reportes/${id}`);
    invalidateCache('reportes:');
    return res;
  },
};

export default reportesService;

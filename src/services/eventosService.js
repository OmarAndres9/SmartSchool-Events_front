/**
 * services/eventosService.js
 * Llamadas al backend de Eventos.
 * En mutaciones (create/update/delete) invalida la caché local
 * para que el siguiente useFetch fuerce un refetch real.
 */

import api from './api';
import { invalidateCache } from './requestCache';

const eventosService = {
  getAll: (params = {}) => api.get('/eventos', { params }),

  getMisEventos: () =>
    api.get('/eventos/mis-eventos').catch(() => api.get('/eventos')),

  getById: (id) => api.get(`/eventos/${id}`),

  create: async (data) => {
    const res = await api.post('/eventos', data);
    invalidateCache('eventos:');
    invalidateCache('mis-eventos');
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/eventos/${id}`, data);
    invalidateCache('eventos:');
    invalidateCache('mis-eventos');
    return res;
  },

  remove: async (id) => {
    const res = await api.delete(`/eventos/${id}`);
    invalidateCache('eventos:');
    invalidateCache('mis-eventos');
    return res;
  },
};

export default eventosService;

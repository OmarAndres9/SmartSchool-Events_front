/**
 * services/recursosService.js
 */
import api from './api';
import { invalidateCache } from './requestCache';

const recursosService = {
  getAll:  (params = {}) => api.get('/recursos', { params }),
  getById: (id)          => api.get(`/recursos/${id}`),

  create: async (data) => {
    const res = await api.post('/recursos', data);
    invalidateCache('recursos');
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/recursos/${id}`, data);
    invalidateCache('recursos');
    return res;
  },

  remove: async (id) => {
    const res = await api.delete(`/recursos/${id}`);
    invalidateCache('recursos');
    return res;
  },

  agregarAEvento: async (eventoId, recursoId, cantidad = 1) => {
    const res = await api.post(`/eventos/${eventoId}/recursos`, { recurso_id: recursoId, cantidad });
    invalidateCache('recursos');
    return res;
  },
};

export default recursosService;

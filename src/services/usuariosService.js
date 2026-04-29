/**
 * services/usuariosService.js
 */
import api from './api';
import { invalidateCache } from './requestCache';

const usuariosService = {
  getAll:  (params = {}) => api.get('/usuarios', { params }),
  getById: (id)          => api.get(`/usuarios/${id}`),

  create: async (data) => {
    const res = await api.post('/usuarios', data);
    invalidateCache('usuarios:');
    return res;
  },

  update: async (id, data) => {
    const res = await api.put(`/usuarios/${id}`, data);
    invalidateCache('usuarios:');
    return res;
  },

  remove: async (id) => {
    const res = await api.delete(`/usuarios/${id}`);
    invalidateCache('usuarios:');
    return res;
  },
};

export default usuariosService;

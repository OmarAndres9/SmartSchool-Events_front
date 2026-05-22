import api from './api';
import { invalidateCache } from './requestCache';

const citasService = {
  getAll: () => api.get('/citas'),

  getPendientes: () => api.get('/citas/pendientes'),

  create: async (data) => {
    const res = await api.post('/citas', data);
    invalidateCache('citas');
    return res;
  },

  aprobar: async (id) => {
    const res = await api.patch(`/citas/${id}/aprobar`);
    invalidateCache('citas');
    return res;
  },

  rechazar: async (id) => {
    const res = await api.patch(`/citas/${id}/rechazar`);
    invalidateCache('citas');
    return res;
  },
};

export default citasService;

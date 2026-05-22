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

  inscribir: async (id) => {
    const res = await api.post(`/eventos/${id}/inscribir`);
    invalidateCache('mis-inscripciones');
    return res;
  },

  desinscribir: async (id) => {
    const res = await api.delete(`/eventos/${id}/desinscribir`);
    invalidateCache('mis-inscripciones');
    return res;
  },

  marcarFavorito: async (id) => {
    const res = await api.post(`/eventos/${id}/favorito`);
    invalidateCache('eventos/favoritos');
    return res;
  },

  desmarcarFavorito: async (id) => {
    const res = await api.delete(`/eventos/${id}/favorito`);
    invalidateCache('eventos/favoritos');
    return res;
  },

  misInscripciones: () => api.get('/mis-inscripciones'),

  favoritos: () => api.get('/eventos/favoritos'),
};

export default eventosService;

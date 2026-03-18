/**
 * services/recursosService.js
 * Llamadas al backend para Recursos (logística).
 */

import api from './api';

const recursosService = {
  /** GET /api/v1/recursos */
  getAll: (params = {}) => api.get('/recursos', { params }),

  /** GET /api/v1/recursos/:id */
  getById: (id) => api.get(`/recursos/${id}`),

  /** POST /api/v1/recursos */
  create: (data) => api.post('/recursos', data),

  /** PUT /api/v1/recursos/:id */
  update: (id, data) => api.put(`/recursos/${id}`, data),

  /** DELETE /api/v1/recursos/:id */
  remove: (id) => api.delete(`/recursos/${id}`),

  /** POST /api/v1/eventos/:idEvento/recursos */
  agregarAEvento: (idEvento, idRecurso, cantidad = 1) =>
    api.post(`/eventos/${idEvento}/recursos`, {
      id_recurso: idRecurso,
      cantidad,
    }),
};

export default recursosService;

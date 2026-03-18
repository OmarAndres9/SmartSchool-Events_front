/**
 * services/recursosService.js
 * Llamadas al backend para Recursos (logística).
 * Endpoints Laravel: GET|POST|PUT|DELETE /api/recursos
 *
 * Forma de la respuesta (RecursosResource):
 *   { id, nombre, ubicacion, estado, created_at, updated_at }
 */

import api from './api';

const recursosService = {
  /** GET /api/recursos */
  getAll: (params = {}) => api.get('/recursos', { params }),

  /** GET /api/recursos/:id */
  getById: (id) => api.get(`/recursos/${id}`),

  /** POST /api/recursos */
  create: (data) => api.post('/recursos', data),

  /** PUT /api/recursos/:id */
  update: (id, data) => api.put(`/recursos/${id}`, data),

  /** DELETE /api/recursos/:id */
  remove: (id) => api.delete(`/recursos/${id}`),

  /** POST /api/eventos/:idEvento/recursos — asigna recurso a un evento */
  agregarAEvento: (idEvento, idRecurso) =>
    api.post(`/eventos/${idEvento}/recursos`, { id_recurso: idRecurso }),
};

export default recursosService;
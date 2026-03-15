/**
 * services/notificacionesService.js
 * Llamadas al backend para Notificaciones.
 * Endpoints Laravel: GET|POST|PUT|DELETE /api/notificaciones
 *
 * Forma de la respuesta (NotificacionesResource):
 *   { id, titulo, mensaje, tipo, canal,
 *     fecha_creacion, id_usuario, id_evento }
 */

import api from './api';

const notificacionesService = {
  /** GET /api/notificaciones */
  getAll: (params = {}) => api.get('/notificaciones', { params }),

  /** GET /api/notificaciones/:id */
  getById: (id) => api.get(`/notificaciones/${id}`),

  /** POST /api/notificaciones */
  create: (data) => api.post('/notificaciones', data),

  /** PUT /api/notificaciones/:id */
  update: (id, data) => api.put(`/notificaciones/${id}`, data),

  /** DELETE /api/notificaciones/:id */
  remove: (id) => api.delete(`/notificaciones/${id}`),
};

export default notificacionesService;

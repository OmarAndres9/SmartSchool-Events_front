/**
 * services/reportesService.js
 * Todas las llamadas al backend relacionadas con Reportes.
 * Endpoints Laravel: GET|POST|PUT|DELETE /api/reportes
 *
 * Forma de la respuesta (ReporteResource):
 *   { id, tipo, descripcion, fecha, estado, id_usuario, id_evento }
 */

import api from './api';

const reportesService = {
  /**
   * GET /api/reportes
   * Acepta filtros opcionales: fecha_inicio, fecha_fin, tipo, estado
   * @param {object} filtros
   */
  getAll: (filtros = {}) => {
    // Eliminar valores vacíos antes de enviar como query params
    const params = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== '' && v != null)
    );
    return api.get('/reportes', { params });
  },

  /** GET /api/reportes/:id */
  getById: (id) => api.get(`/reportes/${id}`),

  /** POST /api/reportes */
  create: (data) => api.post('/reportes', data),

  /** PUT /api/reportes/:id */
  update: (id, data) => api.put(`/reportes/${id}`, data),

  /** DELETE /api/reportes/:id */
  remove: (id) => api.delete(`/reportes/${id}`),
};

export default reportesService;

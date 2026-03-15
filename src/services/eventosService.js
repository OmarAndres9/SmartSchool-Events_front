/**
 * services/eventosService.js
 * Todas las llamadas al backend relacionadas con Eventos.
 * Endpoints Laravel: GET|POST|PUT|DELETE /api/eventos
 *
 * Forma de la respuesta del backend (EventosResource):
 *   { id, nombre, descripcion, fecha_inicio, fecha_fin,
 *     lugar, tipo_evento, modalidad, grupo_destinado, creado_por }
 */

import api from './api';

/**
 * Extrae el array de datos de cualquier formato de respuesta Laravel:
 *   - Paginación:  response.data.data  (array dentro de objeto)
 *   - Colección:   response.data       (array directo)
 * @param {object} response - Respuesta axios
 * @returns {Array}
 */
export const extractList = (response) => {
  const payload = response.data;
  if (Array.isArray(payload))       return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const eventosService = {
  /** GET /api/eventos  — todos los eventos */
  getAll: (params = {}) => api.get('/eventos', { params }),

  /**
   * GET /api/eventos  — eventos del usuario autenticado.
   * El backend filtra por auth()->id() internamente cuando usamos
   * el endpoint /mis-eventos. Si aún no existe, cae al listado general.
   */
  getMisEventos: () =>
    api.get('/eventos/mis-eventos').catch(() => api.get('/eventos')),

  /** GET /api/eventos/:id */
  getById: (id) => api.get(`/eventos/${id}`),

  /** POST /api/eventos */
  create: (data) => api.post('/eventos', data),

  /** PUT /api/eventos/:id */
  update: (id, data) => api.put(`/eventos/${id}`, data),

  /** DELETE /api/eventos/:id */
  remove: (id) => api.delete(`/eventos/${id}`),

  /** GET /api/eventos/tipo/:tipo */
  getByTipo: (tipo) => api.get(`/eventos/tipo/${tipo}`),
};

export default eventosService;

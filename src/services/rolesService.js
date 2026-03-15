/**
 * services/rolesService.js
 * Llamadas al backend para roles (Spatie Permission).
 * Endpoints Laravel: GET|POST|PUT|DELETE /api/roles
 *
 * Forma de la respuesta (RoleController → Spatie):
 *   { id, name, guard_name, permissions: [...] }
 */

import api from './api';

const rolesService = {
  /** GET /api/roles — lista todos los roles */
  getAll: () => api.get('/roles'),

  /** GET /api/roles/:id */
  getById: (id) => api.get(`/roles/${id}`),

  /** POST /api/roles */
  create: (data) => api.post('/roles', data),

  /** PUT /api/roles/:id */
  update: (id, data) => api.put(`/roles/${id}`, data),

  /** DELETE /api/roles/:id */
  remove: (id) => api.delete(`/roles/${id}`),
};

export default rolesService;

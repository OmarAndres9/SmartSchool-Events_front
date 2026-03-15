/**
 * services/usuariosService.js
 * Llamadas al backend para Usuarios.
 * Endpoints Laravel: GET|POST|PUT|DELETE /api/usuarios
 *
 * Forma de la respuesta (UsuariosResource):
 *   { id, name, email, documento, tipo_documento,
 *     email_verified_at, created_at, updated_at }
 *
 * Nota: el campo de rol viene de la relación Spatie (roles[0].name).
 */

import api from './api';

const usuariosService = {
  /** GET /api/usuarios — lista todos los usuarios */
  getAll: (params = {}) => api.get('/usuarios', { params }),

  /** GET /api/usuarios/:id */
  getById: (id) => api.get(`/usuarios/${id}`),

  /** POST /api/usuarios */
  create: (data) => api.post('/usuarios', data),

  /** PUT /api/usuarios/:id */
  update: (id, data) => api.put(`/usuarios/${id}`, data),

  /** DELETE /api/usuarios/:id */
  remove: (id) => api.delete(`/usuarios/${id}`),

  /**
   * POST /api/users/:id/roles
   * Asigna roles a un usuario (endpoint personalizado en routes/api.php)
   */
  asignarRoles: (userId, roles) =>
    api.post(`/users/${userId}/roles`, { roles }),
};

export default usuariosService;

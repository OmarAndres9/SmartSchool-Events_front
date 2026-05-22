import api from './api';

const representanteService = {
  getEstudiantes: () => api.get('/representante/estudiantes'),

  getNotas: (id, periodo_id) =>
    api.get(`/representante/estudiantes/${id}/notas`, { params: { periodo_id } }),

  getPromedios: (id, periodo_id) =>
    api.get(`/representante/estudiantes/${id}/promedios`, { params: { periodo_id } }),

  getEventos: (id) => api.get(`/representante/estudiantes/${id}/eventos`),
};

export default representanteService;

import api from './api';

const estudianteService = {
  getNotas: (periodo_id) => api.get('/estudiante/notas', { params: { periodo_id } }),

  getPromedios: (periodo_id) => api.get('/estudiante/promedios', { params: { periodo_id } }),

  getEventos: () => api.get('/estudiante/eventos'),

  getPeriodos: () => api.get('/estudiante/periodos'),
};

export default estudianteService;

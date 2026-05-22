import api from './api';

const docenteService = {
  getMaterias: () => api.get('/docente/materias'),

  getEstudiantes: (materiaId, periodoId) =>
    api.get('/docente/estudiantes', { params: { materia_id: materiaId, periodo_id: periodoId } }),

  guardarNota: (data) => api.post('/docente/notas', data),
};

export default docenteService;

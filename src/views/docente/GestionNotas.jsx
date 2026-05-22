import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, RefreshCw, BookOpen, Users, GraduationCap, AlertTriangle, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import docenteService from '../../services/docenteService';
import estudianteService from '../../services/estudianteService';

const GestionNotas = () => {
  const [materias, setMaterias] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [materiaId, setMateriaId] = useState('');
  const [periodoId, setPeriodoId] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState({ inicial: true, estudiantes: false });
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [notasTemp, setNotasTemp] = useState({});
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [matRes, perRes] = await Promise.all([
          docenteService.getMaterias(),
          estudianteService.getPeriodos(),
        ]);
        if (!mounted.current) return;
        const mats = Array.isArray(matRes.data?.materias) ? matRes.data.materias : [];
        const pers = Array.isArray(perRes.data?.periodos) ? perRes.data.periodos : Array.isArray(perRes.data) ? perRes.data : Array.isArray(perRes.data?.data) ? perRes.data.data : [];
        setMaterias(mats);
        setPeriodos(pers);
        if (mats.length > 0) setMateriaId(String(mats[0].id));
        if (pers.length > 0) setPeriodoId(String(pers[0].id));
      } catch (err) {
        if (mounted.current) setError(err.response?.data?.message || 'Error al cargar datos iniciales.');
      } finally {
        if (mounted.current) setLoading(p => ({ ...p, inicial: false }));
      }
    };
    init();
  }, []);

  const fetchEstudiantes = useCallback(async () => {
    if (!materiaId || !periodoId) return;
    setLoading(p => ({ ...p, estudiantes: true }));
    setError(null);
    try {
      const res = await docenteService.getEstudiantes(materiaId, periodoId);
      const data = Array.isArray(res.data?.estudiantes) ? res.data.estudiantes : [];
      if (mounted.current) {
        setEstudiantes(data);
        const temp = {};
        data.forEach(e => { if (e.calificacion != null) temp[e.id] = String(e.calificacion); });
        setNotasTemp(temp);
      }
    } catch (err) {
      if (mounted.current) setError(err.response?.data?.message || 'Error al cargar estudiantes.');
    } finally {
      if (mounted.current) setLoading(p => ({ ...p, estudiantes: false }));
    }
  }, [materiaId, periodoId]);

  useEffect(() => { if (materiaId && periodoId) fetchEstudiantes(); }, [fetchEstudiantes, materiaId, periodoId]);

  const handleNotaChange = (estId, value) => {
    if (value === '' || (Number(value) >= 0 && Number(value) <= 5)) {
      setNotasTemp(prev => ({ ...prev, [estId]: value }));
    }
  };

  const handleGuardar = async (estudianteId) => {
    const calificacion = notasTemp[estudianteId];
    if (calificacion === '' || calificacion == null) return;
    const num = Number(calificacion);
    if (num < 0 || num > 5) return;
    setSaving(estudianteId);
    setSuccessMsg('');
    try {
      await docenteService.guardarNota({
        estudiante_id: estudianteId,
        materia_id: materiaId,
        periodo_id: periodoId,
        calificacion: num,
      });
      setSuccessMsg('Nota guardada');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error al guardar la nota.');
    } finally {
      setSaving(null);
    }
  };

  const nombreMateria = materias.find(m => String(m.id) === materiaId)?.nombre || '';

  return (
    <DashboardLayout
      title="Gestión de Notas"
      subtitle="Ingresa las calificaciones de los estudiantes."
    >
      {loading.inicial && <LoadingSpinner message="Cargando..." />}

      {!loading.inicial && error && !loading.estudiantes && <ErrorMessage message={error} />}

      {!loading.inicial && (
        <>
          <div className="toolbar" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '20px' }}>
            <div className="field" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Materia</label>
              <div className="select is-fullwidth">
                <select value={materiaId} onChange={e => setMateriaId(e.target.value)}>
                  {materias.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '4px' }}>Periodo</label>
              <div className="select is-fullwidth">
                <select value={periodoId} onChange={e => setPeriodoId(e.target.value)}>
                  {periodos.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre || `Periodo ${p.id}`}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="button is-light" onClick={fetchEstudiantes} title="Actualizar">
              <RefreshCw size={14} />
            </button>
          </div>

          {successMsg && (
            <div className="notification is-success is-light" style={{ padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          {loading.estudiantes && <LoadingSpinner message="Cargando estudiantes..." />}

          {!loading.estudiantes && estudiantes.length === 0 && (
            <EmptyState
              title="Sin estudiantes"
              description={`No hay estudiantes registrados para ${nombreMateria || 'esta materia'}.`}
            />
          )}

          {!loading.estudiantes && estudiantes.length > 0 && (
            <div className="card-box" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#fff', background: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#fff', background: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estudiante</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, color: '#fff', background: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Documento</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', background: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.05em', minWidth: '120px' }}>Calificación (0-5)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 700, color: '#fff', background: '#2e7d32', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estudiantes.map((est, i) => {
                      const notaVal = notasTemp[est.id] ?? '';
                      const color = notaVal !== '' ? (Number(notaVal) >= 3 ? '#2e7d32' : '#c62828') : undefined;
                      const rowBg = i % 2 === 0 ? '#fff' : '#f9fafb';
                      return (
                        <tr key={est.id} style={{ background: rowBg }}>
                          <td style={{ padding: '10px 16px', color: '#666', fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: '10px 16px', fontWeight: 600, color: '#333' }}>
                            <GraduationCap size={14} style={{ marginRight: '6px', color: '#2e7d32' }} />
                            {est.name}
                          </td>
                          <td style={{ padding: '10px 16px', color: '#666' }}>{est.documento || '—'}</td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="5"
                              value={notaVal}
                              onChange={e => handleNotaChange(est.id, e.target.value)}
                              style={{
                                width: '100px',
                                padding: '6px 10px',
                                border: `2px solid ${color || '#ddd'}`,
                                borderRadius: '8px',
                                textAlign: 'center',
                                fontWeight: 700,
                                fontSize: '1rem',
                                color: color || '#333',
                                outline: 'none',
                              }}
                              placeholder="—"
                            />
                          </td>
                          <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                            <button
                              className="button is-small is-primary"
                              onClick={() => handleGuardar(est.id)}
                              disabled={saving === est.id || notaVal === '' || Number(notaVal) < 0 || Number(notaVal) > 5}
                            >
                              {saving === est.id ? <span className="spinner" /> : <Save size={14} />}
                              <span style={{ marginLeft: '4px' }}>Guardar</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default GestionNotas;

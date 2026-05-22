import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { RefreshCw, BookOpen } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import estudianteService from '../../services/estudianteService';

const useNotasData = () => {
  const [periodos, setPeriodos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState('');
  const [notas, setNotas] = useState([]);
  const [promedios, setPromedios] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchPeriodos = useCallback(async () => {
    try {
      const res = await estudianteService.getPeriodos();
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data?.periodos) ? res.data.periodos : [];
      if (mounted.current) {
        setPeriodos(data);
        if (data.length > 0) {
          setPeriodoActivo(String(data[0].id));
        }
      }
    } catch { if (mounted.current) setPeriodos([]); }
  }, []);

  const fetchData = useCallback(async (pid) => {
    if (!pid) return;
    if (!mounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const [notasRes, promRes] = await Promise.all([
        estudianteService.getNotas(pid),
        estudianteService.getPromedios(pid),
      ]);
      if (mounted.current) {
        const d = Array.isArray(notasRes.data) ? notasRes.data : Array.isArray(notasRes.data?.data) ? notasRes.data.data : [];
        setNotas(d);
        setPromedios(promRes.data || null);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err.response?.data?.message || err.message || 'Error al cargar notas.');
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPeriodos(); }, [fetchPeriodos]);
  useEffect(() => { if (periodoActivo) fetchData(periodoActivo); }, [periodoActivo, fetchData]);

  const refetch = useCallback(() => {
    if (periodoActivo) fetchData(periodoActivo);
  }, [periodoActivo, fetchData]);

  return { periodos, periodoActivo, setPeriodoActivo, notas, promedios, loading, error, refetch };
};

const NotasEstudiante = () => {
  const { periodos, periodoActivo, setPeriodoActivo, notas, promedios, loading, error, refetch } = useNotasData();

  const promedioGeneral = promedios?.promedio_general
    ? Number(promedios.promedio_general).toFixed(2)
    : null;

  const notasPorMateria = useMemo(() => {
    const map = {};
    notas.forEach(n => {
      const materiaNombre = typeof n.materia === 'object' && n.materia?.nombre ? n.materia.nombre : n.materia;
      const key = materiaNombre || n.materia_nombre || n.asignatura || 'General';
      if (!map[key]) map[key] = { notas: [], docente: n.docente };
      map[key].notas.push(n);
    });
    return map;
  }, [notas]);

  const materias = useMemo(() => {
    const materiaPromedios = {};
    if (promedios?.materias) {
      promedios.materias.forEach(m => {
        materiaPromedios[m.materia || m.materia_nombre] = Number(m.promedio || 0);
      });
    }
    return Object.entries(notasPorMateria).map(([nombre, data]) => {
      const cortes = data.notas.map(n => Number(n.calificacion || n.nota || 0));
      const definitiva = materiaPromedios[nombre] ?? (cortes.length > 0 ? cortes.reduce((a, b) => a + b, 0) / cortes.length : 0);
      return {
        nombre,
        cortes,
        examen: null,
        definitiva: Number(definitiva.toFixed(1)),
        docente: data.docente,
      };
    });
  }, [notasPorMateria, promedios]);

  const periodoNombre = periodos.find(p => String(p.id) === periodoActivo)?.nombre || '';

  return (
    <DashboardLayout
      title="Sistema de Notas"
      subtitle="Consulta tus calificaciones por periodo academico."
    >
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <label htmlFor="periodo-select" style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Periodo:</label>
          <div className="select" style={{ minWidth: '180px' }}>
            <select
              id="periodo-select"
              value={periodoActivo}
              onChange={(e) => setPeriodoActivo(e.target.value)}
              disabled={loading && periodos.length === 0}
            >
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre || `Periodo ${p.id}`}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="button is-small is-light" onClick={refetch} title="Actualizar">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading && <LoadingSpinner message="Cargando notas..." />}

      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && materias.length === 0 && (
        <EmptyState title="Sin notas registradas" description="No hay calificaciones disponibles para el periodo seleccionado." />
      )}

      {!loading && !error && materias.length > 0 && (
        <>
          <div className="card-box" style={{ padding: '16px 20px', marginBottom: '20px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={18} style={{ color: '#2e7d32' }} />
                <span style={{ fontWeight: 600 }}>Estudiante:</span>
                <span style={{ color: '#555' }}>--</span>
              </div>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Periodo:</span>{' '}
                  <span style={{ fontWeight: 700, color: '#2e7d32' }}>{periodoNombre || `Periodo ${periodoActivo}`}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card-box" style={{ padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
            {materias.map((m, i) => {
              const estado = m.definitiva >= 3 ? 'Aprobado' : 'Reprobado';
              const estadoColor = m.definitiva >= 3 ? '#2e7d32' : '#c62828';
              const estadoBg = m.definitiva >= 3 ? '#e8f5e9' : '#ffebee';
              const defColor = m.definitiva >= 4 ? '#2e7d32' : m.definitiva >= 3 ? '#e65100' : '#c62828';
              const rowBg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
              return (
                <div key={m.nombre} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', background: rowBg, borderRadius: '10px',
                  margin: '4px', gap: '12px', flexWrap: 'wrap',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px', minWidth: '160px' }}>
                    <BookOpen size={18} style={{ color: '#2e7d32', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: '0.95rem' }}>{m.nombre}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {m.cortes.map((c, j) => {
                      const cColor = c >= 4 ? '#2e7d32' : c >= 3 ? '#e65100' : '#c62828';
                      return (
                        <div key={j} style={{ textAlign: 'center', minWidth: '52px' }}>
                          <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>C{j + 1}</div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: cColor }}>{c.toFixed(1)}</div>
                        </div>
                      );
                    })}
                    {m.examen != null && (
                      <div style={{ textAlign: 'center', minWidth: '52px' }}>
                        <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Ex</div>
                        <div style={{ fontWeight: 700, fontSize: '1.05rem', color: defColor }}>{Number(m.examen).toFixed(1)}</div>
                      </div>
                    )}
                    <div style={{ width: '1px', height: '28px', background: '#e0e0e0' }} />
                    <div style={{ textAlign: 'center', minWidth: '60px' }}>
                      <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Def</div>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: defColor }}>{m.definitiva.toFixed(1)}</div>
                    </div>
                    <span style={{
                      padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem',
                      fontWeight: 700, background: estadoBg, color: estadoColor,
                    }}>
                      {estado}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card-box" style={{
            padding: '20px 24px', borderRadius: '12px', textAlign: 'center',
            background: 'linear-gradient(135deg, #2e7d32, #43a047)', color: '#fff',
          }}>
            <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '4px' }}>Promedio General</p>
            <p style={{ fontSize: '2.8rem', fontWeight: 800, lineHeight: 1, margin: '0' }}>
              {promedioGeneral || '--'}
            </p>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '4px' }}>
              {materias.length} materia(s) evaluada(s)
            </p>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default NotasEstudiante;

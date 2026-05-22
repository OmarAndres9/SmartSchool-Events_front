import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { RefreshCw, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
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

const NotaCell = ({ value }) => {
  if (value == null) return <td style={cellStyle}>--</td>;
  const num = Number(value);
  const color = num >= 4 ? '#2e7d32' : num >= 3 ? '#e65100' : '#c62828';
  return <td style={{ ...cellStyle, color, fontWeight: num >= 3 ? 700 : 600 }}>{num.toFixed(1)}</td>;
};

const cellStyle = {
  padding: '10px 14px',
  textAlign: 'center',
  fontSize: '0.9rem',
  borderBottom: '1px solid #e0e0e0',
  whiteSpace: 'nowrap',
};

const headerCellStyle = {
  padding: '12px 14px',
  textAlign: 'center',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#fff',
  background: '#2e7d32',
  borderBottom: '2px solid #1b5e20',
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const NotasEstudiante = () => {
  const { periodos, periodoActivo, setPeriodoActivo, notas, promedios, loading, error, refetch } = useNotasData();

  const promedioGeneral = promedios?.promedio_general
    ? Number(promedios.promedio_general).toFixed(2)
    : null;

  const promedioNum = promedioGeneral ? Number(promedioGeneral) : 0;
  const promColor = promedioNum >= 4 ? '#2e7d32' : promedioNum >= 3 ? '#e65100' : '#c62828';

  const notasPorMateria = useMemo(() => {
    const map = {};
    notas.forEach(n => {
      const key = n.materia || n.materia_nombre || n.asignatura || 'General';
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

          <div className="card-box" style={{ padding: 0, overflow: 'hidden', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th style={{ ...headerCellStyle, textAlign: 'left', position: 'sticky', left: 0, zIndex: 2 }}>Materia</th>
                    {notas.length > 0 && notas[0].corte_1 !== undefined && (
                      <>
                        <th style={headerCellStyle}>Corte 1</th>
                        <th style={headerCellStyle}>Corte 2</th>
                        <th style={headerCellStyle}>Corte 3</th>
                      </>
                    )}
                    {notas[0]?.examen !== undefined && (
                      <th style={headerCellStyle}>Examen</th>
                    )}
                    {materias.some(m => m.cortes.length > 0) && <th style={headerCellStyle}>Cortes</th>}
                    <th style={{ ...headerCellStyle, background: '#1b5e20' }}>Definitiva</th>
                    <th style={{ ...headerCellStyle, background: '#1b5e20' }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {materias.map((m, i) => {
                    const estado = m.definitiva >= 3 ? 'Aprobado' : 'Reprobado';
                    const estadoColor = m.definitiva >= 3 ? '#2e7d32' : '#c62828';
                    const estadoBg = m.definitiva >= 3 ? '#e8f5e9' : '#ffebee';
                    const rowBg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
                    const defColor = m.definitiva >= 4 ? '#2e7d32' : m.definitiva >= 3 ? '#e65100' : '#c62828';
                    return (
                      <tr key={m.nombre} style={{ background: rowBg, transition: 'background 0.15s' }}>
                        <td style={{
                          ...cellStyle, textAlign: 'left', fontWeight: 600, color: '#333',
                          position: 'sticky', left: 0, background: rowBg, zIndex: 1,
                          borderRight: '1px solid #e8e8e8',
                        }}>
                          {m.nombre}
                        </td>
                        {m.cortes.map((c, j) => (
                          <NotaCell key={j} value={c} />
                        ))}
                        {m.cortes.length > 0 && m.cortes.length < 3 && Array.from({ length: 3 - m.cortes.length }).map((_, j) => (
                          <NotaCell key={`empty-${j}`} value={null} />
                        ))}
                        {m.examen !== undefined && <NotaCell value={m.examen} />}
                        {m.cortes.length === 0 && (
                          <>
                            <td style={cellStyle}>--</td>
                            <td style={cellStyle}>--</td>
                            <td style={cellStyle}>--</td>
                          </>
                        )}
                        <td style={{ ...cellStyle, fontWeight: 800, color: defColor, fontSize: '1rem' }}>
                          {m.definitiva.toFixed(1)}
                        </td>
                        <td style={cellStyle}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem',
                            fontWeight: 700, background: estadoBg, color: estadoColor,
                            display: 'inline-block',
                          }}>
                            {estado}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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

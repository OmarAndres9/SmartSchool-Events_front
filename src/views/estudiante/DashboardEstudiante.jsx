import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BookOpen, GraduationCap, CalendarDays, TrendingUp, X, Clock, MapPin, Monitor, Star, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import CalendarioEventos from '../../components/ui/CalendarioEventos';
import estudianteService from '../../services/estudianteService';

const useEstudianteData = () => {
  const [periodos, setPeriodos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState('');
  const [notas, setNotas] = useState([]);
  const [promedios, setPromedios] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState({ periodos: true, notas: false, promedios: false, eventos: true });
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchPeriodos = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(p => ({ ...p, periodos: true }));
    try {
      const res = await estudianteService.getPeriodos();
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      if (mounted.current) {
        setPeriodos(data);
        if (data.length > 0 && !periodoActivo) {
          setPeriodoActivo(String(data[0].id));
        }
      }
    } catch (err) {
      if (mounted.current) {
        setError(err.response?.data?.message || err.message || 'Error al cargar periodos.');
      }
    } finally {
      if (mounted.current) setLoading(p => ({ ...p, periodos: false }));
    }
  }, []);

  const fetchNotas = useCallback(async (periodo_id) => {
    if (!periodo_id) return;
    if (!mounted.current) return;
    setLoading(p => ({ ...p, notas: true }));
    try {
      const res = await estudianteService.getNotas(periodo_id);
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      if (mounted.current) setNotas(data);
    } catch (err) {
      if (mounted.current) setNotas([]);
    } finally {
      if (mounted.current) setLoading(p => ({ ...p, notas: false }));
    }
  }, []);

  const fetchPromedios = useCallback(async (periodo_id) => {
    if (!periodo_id) return;
    if (!mounted.current) return;
    setLoading(p => ({ ...p, promedios: true }));
    try {
      const res = await estudianteService.getPromedios(periodo_id);
      if (mounted.current) setPromedios(res.data || null);
    } catch (err) {
      if (mounted.current) setPromedios(null);
    } finally {
      if (mounted.current) setLoading(p => ({ ...p, promedios: false }));
    }
  }, []);

  const fetchEventos = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(p => ({ ...p, eventos: true }));
    try {
      const res = await estudianteService.getEventos();
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      if (mounted.current) setEventos(data);
    } catch (err) {
      if (mounted.current) setEventos([]);
    } finally {
      if (mounted.current) setLoading(p => ({ ...p, eventos: false }));
    }
  }, []);

  useEffect(() => { fetchPeriodos(); }, [fetchPeriodos]);
  useEffect(() => { fetchEventos(); }, [fetchEventos]);
  useEffect(() => {
    if (periodoActivo) {
      fetchNotas(periodoActivo);
      fetchPromedios(periodoActivo);
    }
  }, [periodoActivo, fetchNotas, fetchPromedios]);

  const handlePeriodoChange = (id) => {
    setPeriodoActivo(id);
  };

  const refetchAll = useCallback(() => {
    fetchPeriodos();
    fetchEventos();
  }, [fetchPeriodos, fetchEventos]);

  return {
    periodos, periodoActivo, notas, promedios, eventos, loading, error, handlePeriodoChange, refetchAll,
  };
};

const TooltipNota = ({ nota, calificacion }) => {
  const color = calificacion >= 4 ? '#2e7d32' : calificacion >= 3 ? '#e65100' : '#c62828';
  return (
    <span title={`${nota}: ${calificacion}`} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: '28px', height: '28px', borderRadius: '50%', fontSize: '0.75rem',
      fontWeight: 700, color: '#fff', background: color, cursor: 'default',
    }}>
      {calificacion}
    </span>
  );
};

const DrawerNotasMateria = ({ materia, notas, promedios, onClose }) => {
  const promedio = promedios?.materias?.find(m => m.materia === materia || m.materia_id === materia?.id);

  return (
    <div className="modal is-active" style={{ zIndex: 1000 }}>
      <div className="modal-background" onClick={onClose} />
      <div className="modal-card" style={{ maxWidth: '600px', width: '95%', borderRadius: '12px', maxHeight: '85vh', overflow: 'hidden' }}>
        <header className="modal-card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="modal-card-title" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {typeof materia === 'string' ? materia : materia?.nombre || materia?.materia || 'Materia'}
            </p>
            {promedio && (
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                Promedio: <strong style={{ color: promedio.promedio >= 4 ? '#2e7d32' : promedio.promedio >= 3 ? '#e65100' : '#c62828' }}>
                  {Number(promedio.promedio).toFixed(2)}
                </strong>
              </p>
            )}
          </div>
          <button className="delete" onClick={onClose} aria-label="Cerrar" />
        </header>
        <section className="modal-card-body" style={{ padding: '20px', overflowY: 'auto' }}>
          {notas.length === 0 ? (
            <EmptyState title="Sin notas registradas" description="No hay calificaciones para esta materia en el periodo seleccionado." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notas.map((n, i) => (
                <div key={n.id || i} style={{
                  padding: '14px', borderRadius: '10px', background: '#f8f9fa',
                  border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0 0 4px' }}>{n.nombre || n.titulo || `Nota #${i + 1}`}</p>
                    {n.descripcion && <p style={{ fontSize: '0.8rem', color: '#666', margin: '0 0 4px' }}>{n.descripcion}</p>}
                    {n.docente && (
                      <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>
                        Docente: {typeof n.docente === 'object' ? (n.docente.nombre || n.docente.name) : n.docente}
                      </p>
                    )}
                  </div>
                  <div style={{ textAlign: 'center', marginLeft: '12px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1rem', fontWeight: 800, color: '#fff',
                      background: n.calificacion >= 4 ? '#2e7d32' : n.calificacion >= 3 ? '#e65100' : '#c62828',
                    }}>
                      {Number(n.calificacion || n.nota || 0).toFixed(1)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const TipoBadge = ({ tipo }) => {
  const colorMap = {
    academico: { bg: '#e3f2fd', color: '#1565c0' },
    cultural: { bg: '#f3e5f5', color: '#6a1b9a' },
    deportivo: { bg: '#e8f5e9', color: '#2e7d32' },
    recreativo: { bg: '#fff3e0', color: '#e65100' },
    institucional: { bg: '#fce4ec', color: '#c62828' },
    publico: { bg: '#e0f2f1', color: '#00695c' },
  };
  const key = tipo?.toLowerCase() || '';
  const style = colorMap[key] || { bg: '#f5f5f5', color: '#555' };
  return (
    <span className="tag-category" style={{ background: style.bg, color: style.color }}>
      {tipo || 'Sin tipo'}
    </span>
  );
};

const DashboardEstudiante = () => {
  const {
    periodos, periodoActivo, notas, promedios, eventos, loading, error, handlePeriodoChange, refetchAll,
  } = useEstudianteData();

  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);

  const notasPorMateria = useMemo(() => {
    const map = {};
    notas.forEach(n => {
      const key = n.materia || n.materia_nombre || n.asignatura || 'General';
      if (!map[key]) map[key] = [];
      map[key].push(n);
    });
    return map;
  }, [notas]);

  const materiasConPromedio = useMemo(() => {
    if (!promedios?.materias) return [];
    return promedios.materias.map(m => ({
      ...m,
      promedio: Number(m.promedio || 0),
    }));
  }, [promedios]);

  const promedioGeneral = promedios?.promedio_general
    ? Number(promedios.promedio_general).toFixed(2)
    : null;

  const ahora = new Date();
  const proximosEventos = useMemo(() =>
    [...eventos]
      .filter((e) => e.fecha_inicio && new Date(e.fecha_inicio) >= ahora)
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
      .slice(0, 5),
    [eventos, ahora]
  );

  const isDataLoading = loading.periodos || loading.notas || loading.promedios || loading.eventos;

  return (
    <DashboardLayout
      title="Dashboard Estudiante"
      subtitle="Consulta tus notas, promedios y eventos academicos."
    >
      {error && <ErrorMessage message={error} onRetry={refetchAll} />}

      {materiaSeleccionada && (
        <DrawerNotasMateria
          materia={materiaSeleccionada}
          notas={notasPorMateria[materiaSeleccionada] || []}
          promedios={promedios}
          onClose={() => setMateriaSeleccionada(null)}
        />
      )}

      {!error && (
        <>
          <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
              <label htmlFor="periodo-select" style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Periodo Academico:</label>
              <div className="select" style={{ minWidth: '200px' }}>
                <select
                  id="periodo-select"
                  value={periodoActivo}
                  onChange={(e) => handlePeriodoChange(e.target.value)}
                  disabled={loading.periodos}
                >
                  {periodos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre || `Periodo ${p.id}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="button is-small is-light" onClick={refetchAll} title="Actualizar">
              <RefreshCw size={14} />
            </button>
          </div>

          {isDataLoading && <LoadingSpinner message="Cargando datos academicos..." />}

          {!isDataLoading && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <div className="card-box" style={{
                  textAlign: 'center', padding: '32px 24px',
                  background: 'linear-gradient(135deg, #2e7d32, #43a047)',
                  color: '#fff', borderRadius: '16px',
                }}>
                  <p style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '8px' }}>Promedio General</p>
                  <p style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, margin: '0 0 4px' }}>
                    {promedioGeneral || '--'}
                  </p>
                  <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>
                    {promedios?.materias?.length || 0} materia(s) evaluada(s)
                  </p>
                </div>
              </div>

              <div className="card-box" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                  <h3 className="card-title">Materias</h3>
                </div>
                {materiasConPromedio.length === 0 ? (
                  <EmptyState title="Sin materias" description="No hay materias registradas en este periodo." />
                ) : (
                  <div className="resource-list">
                    {materiasConPromedio.map((m, i) => {
                      const notaColor = m.promedio >= 4 ? '#2e7d32' : m.promedio >= 3 ? '#e65100' : '#c62828';
                      return (
                        <div
                          key={m.materia_id || m.materia || i}
                          className="resource-card"
                          style={{ cursor: 'pointer' }}
                          onClick={() => setMateriaSeleccionada(m.materia || m.materia_nombre)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter') setMateriaSeleccionada(m.materia || m.materia_nombre); }}
                        >
                          <div className="resource-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <p className="resource-name">
                                <BookOpen size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                {m.materia || m.materia_nombre || `Materia ${i + 1}`}
                              </p>
                              {m.docente && (
                                <p className="resource-detail" style={{ margin: 0 }}>
                                  {typeof m.docente === 'object' ? (m.docente.nombre || m.docente.name) : m.docente}
                                </p>
                              )}
                            </div>
                            <div style={{
                              width: '52px', height: '52px', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.1rem', fontWeight: 800, color: '#fff',
                              background: notaColor, flexShrink: 0,
                            }}>
                              {m.promedio.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="content-split">
                <div className="card-box">
                  <div className="card-header">
                    <h3 className="card-title">Calendario Academico</h3>
                    <button className="button is-small is-primary is-light" onClick={refetchAll} title="Actualizar">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  {loading.eventos && <LoadingSpinner message="Cargando calendario..." />}
                  {!loading.eventos && <CalendarioEventos eventos={eventos} />}
                </div>

                <div className="card-box">
                  <div className="card-header">
                    <h3 className="card-title">Proximos Eventos</h3>
                  </div>
                  {loading.eventos && <LoadingSpinner message="Cargando eventos..." />}
                  {!loading.eventos && (
                    <div className="events-list">
                      {proximosEventos.length === 0 ? (
                        <EmptyState title="Sin eventos proximos" description="No hay eventos programados para los proximos dias." />
                      ) : (
                        proximosEventos.map((ev) => {
                          const fecha = new Date(ev.fecha_inicio);
                          return (
                            <div className="event-item" key={ev.id}>
                              <div className="event-date-badge">
                                <span className="event-day">{String(fecha.getDate()).padStart(2, '0')}</span>
                                <span className="event-month">
                                  {fecha.toLocaleString('es-CO', { month: 'short' }).toUpperCase()}
                                </span>
                              </div>
                              <div className="event-details">
                                <h4>{ev.nombre}</h4>
                                <p>{ev.lugar || 'Sin ubicacion'}</p>
                              </div>
                              <TipoBadge tipo={ev.tipo_evento} />
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default DashboardEstudiante;

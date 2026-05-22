import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Calendar, ArrowLeft, RefreshCw, Clock, MapPin } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import representanteService from '../../services/representanteService';
import estudianteService from '../../services/estudianteService';
import { formatDate, formatDateShort } from '../../utils/dateUtils';

const DrawerNotasMateria = ({ materia, notas, onClose }) => {
  return (
    <div className="modal is-active" style={{ zIndex: 1000 }}>
      <div className="modal-background" onClick={onClose} />
      <div className="modal-card" style={{ maxWidth: '600px', width: '95%', borderRadius: '12px', maxHeight: '85vh', overflow: 'hidden' }}>
        <header className="modal-card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="modal-card-title" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            {typeof materia === 'string' ? materia : materia?.nombre || materia?.materia || 'Materia'}
          </p>
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

const DetalleEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const hasFetched = useRef(false);
  const [estudiante, setEstudiante] = useState(null);
  const [periodos, setPeriodos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState('');
  const [notas, setNotas] = useState([]);
  const [promedios, setPromedios] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchAll = async () => {
      if (!mounted.current) return;
      setLoading(true);
      setError(null);
      try {
        const [estRes, perRes] = await Promise.all([
          representanteService.getEstudiantes(),
          estudianteService.getPeriodos(),
        ]);

        const ests = Array.isArray(estRes.data) ? estRes.data : Array.isArray(estRes.data?.data) ? estRes.data.data : [];
        const est = ests.find(e => String(e.id) === String(id));
        if (mounted.current) setEstudiante(est || null);

        const pers = Array.isArray(perRes.data) ? perRes.data : Array.isArray(perRes.data?.data) ? perRes.data.data : Array.isArray(perRes.data?.periodos) ? perRes.data.periodos : [];
        if (mounted.current) {
          setPeriodos(pers);
          if (pers.length > 0) {
            setPeriodoActivo(String(pers[0].id));
          }
        }
      } catch (err) {
        if (mounted.current) {
          setError(err.response?.data?.message || err.message || 'Error al cargar datos del estudiante.');
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  useEffect(() => {
    if (!periodoActivo || !estudiante) return;
    const fetchDetalle = async () => {
      try {
        const [notasRes, promRes, evRes] = await Promise.all([
          representanteService.getNotas(estudiante.id, periodoActivo),
          representanteService.getPromedios(estudiante.id, periodoActivo),
          representanteService.getEventos(estudiante.id),
        ]);

        if (mounted.current) {
          setNotas(Array.isArray(notasRes.data) ? notasRes.data : Array.isArray(notasRes.data?.data) ? notasRes.data.data : []);
          setPromedios(promRes.data || null);
          setEventos(Array.isArray(evRes.data) ? evRes.data : Array.isArray(evRes.data?.data) ? evRes.data.data : []);
        }
      } catch (err) {
        if (mounted.current) {
          setNotas([]);
          setPromedios(null);
          setEventos([]);
        }
      }
    };
    fetchDetalle();
  }, [periodoActivo, estudiante]);

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

  return (
    <DashboardLayout
      title={estudiante ? estudiante.nombre || estudiante.name || 'Estudiante' : 'Detalle Estudiante'}
      subtitle="Informacion academica completa del estudiante."
    >
      <button
        className="button is-small is-light"
        onClick={() => navigate('/representante/dashboard')}
        style={{ marginBottom: '16px' }}
      >
        <ArrowLeft size={14} style={{ marginRight: '6px' }} /> Volver al dashboard
      </button>

      {materiaSeleccionada && (
        <DrawerNotasMateria
          materia={materiaSeleccionada}
          notas={notasPorMateria[materiaSeleccionada] || []}
          onClose={() => setMateriaSeleccionada(null)}
        />
      )}

      {loading && <LoadingSpinner message="Cargando datos del estudiante..." />}

      {!loading && error && <ErrorMessage message={error} />}

      {!loading && !error && !estudiante && (
        <EmptyState title="Estudiante no encontrado" description="No se pudo encontrar el estudiante solicitado." />
      )}

      {!loading && !error && estudiante && (
        <>
          <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label htmlFor="periodo-select" style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Periodo Academico:</label>
              <div className="select" style={{ minWidth: '200px' }}>
                <select
                  id="periodo-select"
                  value={periodoActivo}
                  onChange={(e) => setPeriodoActivo(e.target.value)}
                >
                  {periodos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre || `Periodo ${p.id}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="dashboard-grid" style={{ marginTop: '16px' }}>
            <div className="card-box" style={{
              textAlign: 'center', padding: '24px 20px',
              background: 'linear-gradient(135deg, #2e7d32, #43a047)', color: '#fff', borderRadius: '12px',
              marginBottom: '0',
            }}>
              <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '4px' }}>Promedio General</p>
              <p style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, margin: '0' }}>
                {promedioGeneral || '--'}
              </p>
            </div>
          </div>

          <div className="content-split">
            <div className="card-box">
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

            <div className="card-box">
              <div className="card-header">
                <h3 className="card-title">Eventos Asistidos</h3>
              </div>
              {eventos.length === 0 ? (
                <EmptyState title="Sin eventos" description="Este estudiante no ha asistido a eventos en este periodo." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {eventos.sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio)).map((ev) => (
                    <div key={ev.id} style={{
                      padding: '12px', borderRadius: '8px', background: '#f8f9fa',
                      border: '1px solid #e8e8e8', borderLeft: '4px solid var(--color-primary)',
                    }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 4px' }}>{ev.nombre}</p>
                      <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {formatDateShort(ev.fecha_inicio)}
                        {ev.lugar && <><span style={{ margin: '0 4px' }}>|</span><MapPin size={12} /> {ev.lugar}</>}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default DetalleEstudiante;

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, BookOpen, TrendingUp, Calendar, RefreshCw, GraduationCap, Star } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import representanteService from '../../services/representanteService';
import estudianteService from '../../services/estudianteService';
import { formatDateShort } from '../../utils/dateUtils';

const useRepresentanteData = () => {
  const [periodos, setPeriodos] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState('');
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState({ estudiantes: true, periodos: true });
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
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data?.periodos) ? res.data.periodos : [];
      if (mounted.current) {
        setPeriodos(data);
        if (data.length > 0 && !periodoActivo) {
          setPeriodoActivo(String(data[0].id));
        }
      }
    } catch (err) {
      if (mounted.current) setPeriodos([]);
    } finally {
      if (mounted.current) setLoading(p => ({ ...p, periodos: false }));
    }
  }, []);

  const fetchEstudiantes = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(p => ({ ...p, estudiantes: true }));
    setError(null);
    try {
      const res = await representanteService.getEstudiantes();
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      if (mounted.current) setEstudiantes(data);
    } catch (err) {
      if (mounted.current) {
        setError(err.response?.data?.message || err.message || 'Error al cargar estudiantes.');
      }
    } finally {
      if (mounted.current) setLoading(p => ({ ...p, estudiantes: false }));
    }
  }, []);

  useEffect(() => { fetchPeriodos(); }, [fetchPeriodos]);
  useEffect(() => { fetchEstudiantes(); }, [fetchEstudiantes]);

  const refetchAll = useCallback(() => {
    fetchPeriodos();
    fetchEstudiantes();
  }, [fetchPeriodos, fetchEstudiantes]);

  return {
    periodos, periodoActivo, setPeriodoActivo, estudiantes, loading, error, refetchAll,
  };
};

const EstudianteCardExpandible = ({ estudiante, periodoActivo }) => {
  const [expanded, setExpanded] = useState(false);
  const [promedios, setPromedios] = useState(null);
  const [eventos, setEventos] = useState([]);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const mounted = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (expanded && periodoActivo) {
      const cargarDetalle = async () => {
        setLoadingDetalle(true);
        try {
          const [promRes, evRes] = await Promise.all([
            representanteService.getPromedios(estudiante.id, periodoActivo),
            representanteService.getEventos(estudiante.id),
          ]);
          if (mounted.current) {
            setPromedios(promRes.data || null);
            setEventos(Array.isArray(evRes.data) ? evRes.data : Array.isArray(evRes.data?.data) ? evRes.data.data : []);
          }
        } catch (err) {
          if (mounted.current) {
            setPromedios(null);
            setEventos([]);
          }
        } finally {
          if (mounted.current) setLoadingDetalle(false);
        }
      };
      cargarDetalle();
    }
  }, [expanded, periodoActivo, estudiante.id]);

  const promedioGeneral = promedios?.promedio_general
    ? Number(promedios.promedio_general).toFixed(2)
    : null;

  const top3Materias = useMemo(() => {
    if (!promedios?.materias) return [];
    return [...promedios.materias]
      .map(m => ({ ...m, promedio: Number(m.promedio || 0) }))
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 3);
  }, [promedios]);

  const eventosRecientes = useMemo(() =>
    [...eventos].sort((a, b) => new Date(b.fecha_inicio) - new Date(a.fecha_inicio)).slice(0, 3),
    [eventos]
  );

  return (
    <div className="resource-card" style={{ cursor: 'default' }}>
      <div className="resource-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p className="resource-name">
              <GraduationCap size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              {estudiante.nombre || estudiante.name || 'Estudiante'}
            </p>
            {estudiante.email && (
              <p className="resource-detail" style={{ margin: '2px 0 0' }}>{estudiante.email}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              className="button is-small is-primary is-light"
              onClick={() => navigate(`/representante/estudiantes/${estudiante.id}`)}
            >
              Ver detalle
            </button>
            <button
              className="button is-small is-light"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Colapsar' : 'Expandir'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {expanded && (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border-light)' }}>
            {loadingDetalle && <LoadingSpinner message="Cargando detalle..." />}

            {!loadingDetalle && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#666' }}>Promedio General:</span>
                  {promedioGeneral ? (
                    <span style={{
                      fontSize: '1.5rem', fontWeight: 800,
                      color: Number(promedioGeneral) >= 4 ? '#2e7d32' : Number(promedioGeneral) >= 3 ? '#e65100' : '#c62828',
                    }}>
                      {promedioGeneral}
                    </span>
                  ) : (
                    <span style={{ color: '#999' }}>--</span>
                  )}
                </div>

                {top3Materias.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Star size={14} /> Top 3 Materias
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {top3Materias.map((m, i) => (
                        <div key={i} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '8px 12px', borderRadius: '8px', background: '#f8f9fa',
                          border: '1px solid #e8e8e8',
                        }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {i + 1}. {m.materia || m.materia_nombre}
                          </span>
                          <span style={{
                            fontWeight: 700, fontSize: '0.9rem',
                            color: m.promedio >= 4 ? '#2e7d32' : m.promedio >= 3 ? '#e65100' : '#c62828',
                          }}>
                            {m.promedio.toFixed(1)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {eventosRecientes.length > 0 && (
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#666', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> Eventos Recientes
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {eventosRecientes.map((ev) => (
                        <div key={ev.id} style={{
                          fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px',
                          background: '#f0fdf4', border: '1px solid #dcfce7',
                          display: 'flex', justifyContent: 'space-between',
                        }}>
                          <span>{ev.nombre}</span>
                          <span style={{ color: '#666' }}>{formatDateShort(ev.fecha_inicio)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!promedioGeneral && eventosRecientes.length === 0 && (
                  <p style={{ color: '#999', fontSize: '0.85rem', textAlign: 'center' }}>
                    No hay datos disponibles para este estudiante en el periodo seleccionado.
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardRepresentante = () => {
  const {
    periodos, periodoActivo, setPeriodoActivo, estudiantes, loading, error, refetchAll,
  } = useRepresentanteData();

  return (
    <DashboardLayout
      title="Dashboard Representante"
      subtitle="Gestiona la informacion academica de tus representados."
    >
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
          <label htmlFor="periodo-select" style={{ fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Periodo Academico:</label>
          <div className="select" style={{ minWidth: '200px' }}>
            <select
              id="periodo-select"
              value={periodoActivo}
              onChange={(e) => setPeriodoActivo(e.target.value)}
              disabled={loading.periodos}
            >
              {periodos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre || `Periodo ${p.id}`}</option>
              ))}
            </select>
          </div>
        </div>
        <button className="button is-small is-light" onClick={refetchAll} title="Actualizar">
          <RefreshCw size={14} />
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={refetchAll} />}

      {loading.estudiantes && <LoadingSpinner message="Cargando estudiantes..." />}

      {!loading.estudiantes && !error && estudiantes.length === 0 && (
        <EmptyState
          title="Sin estudiantes asociados"
          description="No tienes estudiantes asociados a tu cuenta."
        />
      )}

      {!loading.estudiantes && !error && estudiantes.length > 0 && (
        <div className="resource-list">
          {estudiantes.map((est) => (
            <EstudianteCardExpandible
              key={est.id}
              estudiante={est}
              periodoActivo={periodoActivo}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default DashboardRepresentante;

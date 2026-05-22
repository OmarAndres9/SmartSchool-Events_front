import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapPin, Clock, Calendar, Heart, UserPlus, UserMinus, Search, Filter, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import estudianteService from '../../services/estudianteService';
import eventosService from '../../services/eventosService';
import { formatDate, formatTime } from '../../utils/dateUtils';

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

const EventosEstudiante = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [inscritos, setInscritos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eventos_inscritos') || '[]'); } catch { return []; }
  });
  const [favoritos, setFavoritos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eventos_favoritos') || '[]'); } catch { return []; }
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchEventos = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const res = await estudianteService.getEventos();
      const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
      if (mounted.current) setEventos(data);
    } catch (err) {
      if (mounted.current) {
        setError(err.response?.data?.message || err.message || 'Error al cargar eventos.');
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEventos(); }, [fetchEventos]);

  const toggleInscripcion = (eventoId) => {
    setInscritos(prev => {
      const next = prev.includes(eventoId) ? prev.filter(id => id !== eventoId) : [...prev, eventoId];
      localStorage.setItem('eventos_inscritos', JSON.stringify(next));
      return next;
    });
  };

  const toggleFavorito = (eventoId) => {
    setFavoritos(prev => {
      const next = prev.includes(eventoId) ? prev.filter(id => id !== eventoId) : [...prev, eventoId];
      localStorage.setItem('eventos_favoritos', JSON.stringify(next));
      return next;
    });
  };

  const tipos = useMemo(() => {
    const set = new Set(eventos.map(e => e.tipo_evento).filter(Boolean));
    return [...set];
  }, [eventos]);

  const filtrados = useMemo(() => {
    return eventos.filter(e => {
      if (search && !e.nombre?.toLowerCase().includes(search.toLowerCase())) return false;
      if (filtroTipo && e.tipo_evento !== filtroTipo) return false;
      return true;
    });
  }, [eventos, search, filtroTipo]);

  return (
    <DashboardLayout
      title="Eventos"
      subtitle="Explora los eventos academicos, culturales e institucionales."
    >
      <div className="toolbar">
        <div className="field" style={{ flex: 1, marginBottom: 0 }}>
          <div className="control has-icons-left">
            <input
              className="input"
              type="text"
              placeholder="Buscar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="icon is-left is-small"><Search size={16} /></span>
          </div>
        </div>
        <div className="field" style={{ minWidth: '180px', marginBottom: 0 }}>
          <div className="control has-icons-left">
            <div className="select is-fullwidth">
              <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                <option value="">Todos los tipos</option>
                {tipos.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <span className="icon is-left is-small"><Filter size={16} /></span>
          </div>
        </div>
        <button className="button is-light" onClick={fetchEventos} title="Actualizar">
          <RefreshCw size={14} />
        </button>
      </div>

      {loading && <LoadingSpinner message="Cargando eventos..." />}

      {!loading && error && <ErrorMessage message={error} onRetry={fetchEventos} />}

      {!loading && !error && filtrados.length === 0 && (
        <EmptyState
          title="Sin resultados"
          description={search || filtroTipo ? 'No se encontraron eventos con los filtros aplicados.' : 'No hay eventos disponibles.'}
        />
      )}

      {!loading && !error && filtrados.length > 0 && (
        <div className="resource-list">
          {filtrados.map((ev) => {
            const estaInscrito = inscritos.includes(ev.id);
            const esFavorito = favoritos.includes(ev.id);
            return (
              <div key={ev.id} className="resource-card">
                <div className="resource-status-bar" style={{
                  background: esFavorito ? 'linear-gradient(90deg, #e91e63, #ff5722)' : 'var(--color-primary)',
                }} />
                <div className="resource-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <p className="resource-name">{ev.nombre}</p>
                    </div>
                    <TipoBadge tipo={ev.tipo_evento} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    {ev.fecha_inicio && (
                      <p className="resource-detail" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> {formatDate(ev.fecha_inicio)}
                      </p>
                    )}
                    {ev.lugar && (
                      <p className="resource-detail" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} /> {ev.lugar}
                      </p>
                    )}
                    {ev.hora && (
                      <p className="resource-detail" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> {ev.hora}
                      </p>
                    )}
                  </div>

                  {ev.descripcion && (
                    <p className="resource-detail" style={{ marginBottom: '12px', lineHeight: 1.5 }}>
                      {ev.descripcion}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      className={`button is-small ${estaInscrito ? 'is-danger' : 'is-primary is-light'}`}
                      onClick={() => toggleInscripcion(ev.id)}
                    >
                      {estaInscrito ? <UserMinus size={14} /> : <UserPlus size={14} />}
                      <span style={{ marginLeft: '4px' }}>{estaInscrito ? 'Desinscribirse' : 'Inscribirse'}</span>
                    </button>
                    <button
                      className={`button is-small ${esFavorito ? 'is-danger' : 'is-light'}`}
                      onClick={() => toggleFavorito(ev.id)}
                      title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    >
                      <Heart size={14} fill={esFavorito ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default EventosEstudiante;

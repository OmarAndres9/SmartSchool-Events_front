/**
 * views/dashboard/Dashboard.jsx
 * OPTIMIZACIÓN: Las 3 peticiones (eventos, notificaciones, usuarios) se lanzan
 * en paralelo con Promise.all desde un único hook useDashboard, eliminando la
 * latencia acumulada de ~3 s que generaban al dispararse de forma independiente.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Hand, CalendarDays, Users, CalendarClock, BellRing, RefreshCw, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import CalendarioEventos from '../../components/ui/CalendarioEventos';
import eventosService from '../../services/eventosService';
import notificacionesService from '../../services/notificacionesService';
import usuariosService from '../../services/usuariosService';

/**
 * Hook centralizado: dispara las 3 peticiones en paralelo (Promise.all).
 * Antes: 3 hooks independientes → 3 rondas de red seriales (~3 s).
 * Ahora: 1 sola ronda de red → tiempo ≈ la petición más lenta (~0.8–1 s).
 */
const useDashboardData = () => {
  const [state, setState] = useState({
    eventos: [],
    notificaciones: [],
    usuarios: [],
    loading: true,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [evRes, notifRes, usrRes] = await Promise.all([
        eventosService.getAll(),
        notificacionesService.getAll(),
        usuariosService.getAll(),
      ]);

      const normalize = (res) => {
        const d = res?.data;
        if (Array.isArray(d)) return d;
        if (Array.isArray(d?.data)) return d.data;
        return [];
      };

      setState({
        eventos:        normalize(evRes),
        notificaciones: normalize(notifRes),
        usuarios:       normalize(usrRes),
        loading: false,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.response?.data?.message || err.message || 'Error al cargar el dashboard.',
      }));
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
};

/** Etiqueta de tipo de evento */
const TipoBadge = ({ tipo }) => {
  const colorMap = {
    academico:  { bg: '#e3f2fd', color: '#1565c0' },
    cultural:   { bg: '#f3e5f5', color: '#6a1b9a' },
    deportivo:  { bg: '#e8f5e9', color: '#2e7d32' },
    recreativo: { bg: '#fff3e0', color: '#e65100' },
  };
  const key   = tipo?.toLowerCase() || '';
  const style = colorMap[key] || { bg: '#f5f5f5', color: '#555' };
  return (
    <span className="tag-category" style={{ background: style.bg, color: style.color }}>
      {tipo || 'Sin tipo'}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { eventos, notificaciones, usuarios, loading, error, refetch } = useDashboardData();

  const stats = useMemo(() => {
    const ahora   = new Date();
    const en7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
    const activos  = eventos.filter((e) => e.estado === 'activo' || !e.estado).length;
    const proximos = eventos.filter((e) => {
      const f = new Date(e.fecha_inicio);
      return f >= ahora && f <= en7Dias;
    }).length;
    return {
      eventosActivos: activos || eventos.length,
      estudiantes:    usuarios.length,
      proximos,
      notificaciones: notificaciones.length,
    };
  }, [eventos, usuarios, notificaciones]);

  const proximosEventos = useMemo(() =>
    [...eventos]
      .filter((e) => new Date(e.fecha_inicio) >= new Date())
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
      .slice(0, 4),
    [eventos]
  );

  return (
    <DashboardLayout
      title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>Hola <Hand size={24} /></span>}
      subtitle="Aquí tienes el resumen de tus actividades escolares."
    >
      {/* ── Widgets estadísticas ── */}
      <div className="dashboard-grid">
        <StatCard icon={CalendarDays}  color="icon-blue"   value={loading ? '...' : stats.eventosActivos}  label="Eventos Activos" />
        <StatCard icon={Users}         color="icon-green"  value={loading ? '...' : stats.estudiantes}     label="Usuarios" />
        <StatCard icon={CalendarClock} color="icon-orange" value={loading ? '...' : stats.proximos}        label="Próximos (7 días)" />
        <StatCard icon={BellRing}      color="icon-purple" value={loading ? '...' : stats.notificaciones}  label="Notificaciones" />
      </div>

      {/* ── Contenido principal ── */}
      <div className="content-split">
        {/* Calendario */}
        <div className="card-box">
          <div className="card-header">
            <h3 className="card-title">Calendario Académico</h3>
            <button className="button is-small is-primary is-light" onClick={refetch} title="Actualizar">
              <RefreshCw size={14} />
            </button>
          </div>
          {loading && <LoadingSpinner message="Cargando calendario..." />}
          {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}
          {!loading && !error && <CalendarioEventos eventos={eventos} />}
        </div>

        {/* Próximos eventos */}
        <div className="card-box">
          <div className="card-header">
            <h3 className="card-title">Próximos Eventos</h3>
            <button className="button is-small is-primary is-light" onClick={() => navigate('/events')} title="Crear evento">
              <Plus size={14} />
            </button>
          </div>
          {loading && <LoadingSpinner message="Cargando eventos..." />}
          {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}
          {!loading && !error && (
            <div className="events-list">
              {proximosEventos.length === 0 ? (
                <p style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                  No hay eventos próximos.
                </p>
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
                        <p>{ev.lugar || 'Sin ubicación'}</p>
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
    </DashboardLayout>
  );
};

const StatCard = ({ icon: Icon, color, value, label }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>
      <Icon size={28} strokeWidth={1.5} />
    </div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

export default Dashboard;

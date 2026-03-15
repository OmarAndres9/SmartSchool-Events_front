/**
 * views/dashboard/Dashboard.jsx
 * Estadísticas y próximos eventos — 100% dinámico desde la API.
 * Stats: cuenta eventos activos, proximos 7 días, notificaciones, usuarios.
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import useEventos from '../../hooks/useEventos';
import useNotificaciones from '../../hooks/useNotificaciones';
import useUsuarios from '../../hooks/useUsuarios';
import { formatDateShort } from '../../utils/dateUtils';

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

  const { eventos,        loading: evLoading,   error: evError,   refetch: refetchEv }   = useEventos();
  const { notificaciones, loading: notifLoading                                         } = useNotificaciones();
  const { usuarios,       loading: usrLoading                                           } = useUsuarios();

  // ── Estadísticas calculadas desde los datos reales ──────────────────────
  const stats = useMemo(() => {
    const ahora    = new Date();
    const en7Dias  = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
    const activos  = eventos.filter((e) => e.estado === 'activo' || !e.estado).length;
    const proximos = eventos.filter((e) => {
      const f = new Date(e.fecha_inicio);
      return f >= ahora && f <= en7Dias;
    }).length;
    return {
      eventosActivos:  activos  || eventos.length,
      estudiantes:     usuarios.length,
      proximos,
      notificaciones:  notificaciones.length,
    };
  }, [eventos, usuarios, notificaciones]);

  // ── Próximos 4 eventos ordenados por fecha ───────────────────────────────
  const proximosEventos = useMemo(() =>
    [...eventos]
      .filter((e) => new Date(e.fecha_inicio) >= new Date())
      .sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio))
      .slice(0, 4),
    [eventos]
  );

  const globalLoading = evLoading || notifLoading || usrLoading;

  return (
    <DashboardLayout
      title="Hola 👋"
      subtitle="Aquí tienes el resumen de tus actividades escolares."
    >
      {/* ── Widgets estadísticas ── */}
      <div className="dashboard-grid">
        <StatCard icon="fa-calendar-check" color="icon-blue"   value={evLoading  ? '...' : stats.eventosActivos} label="Eventos Activos" />
        <StatCard icon="fa-user-graduate"  color="icon-green"  value={usrLoading ? '...' : stats.estudiantes}    label="Usuarios" />
        <StatCard icon="fa-clock"          color="icon-orange" value={evLoading  ? '...' : stats.proximos}       label="Próximos (7 días)" />
        <StatCard icon="fa-bell"           color="icon-purple" value={notifLoading ? '...' : stats.notificaciones} label="Notificaciones" />
      </div>

      {/* ── Contenido principal ── */}
      <div className="content-split">
        {/* Calendario Google */}
        <div className="card-box">
          <div className="card-header">
            <h3 className="card-title">Calendario Académico</h3>
            <button className="button is-small is-light">Ver Completo</button>
          </div>
          <div className="calendar-container">
            <iframe
              title="Google Calendar"
              src="https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FBogota"
              scrolling="no"
              frameBorder="0"
            />
          </div>
        </div>

        {/* Lista de próximos eventos dinámica */}
        <div className="card-box">
          <div className="card-header">
            <h3 className="card-title">Próximos Eventos</h3>
            <button
              className="button is-small is-primary is-light"
              onClick={() => navigate('/events')}
              title="Crear evento"
            >
              <i className="fas fa-plus" />
            </button>
          </div>

          {evLoading && <LoadingSpinner message="Cargando eventos..." />}
          {evError   && <ErrorMessage message={evError} onRetry={refetchEv} />}

          {!evLoading && !evError && (
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
                        <span className="event-day">
                          {String(fecha.getDate()).padStart(2, '0')}
                        </span>
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

/** Tarjeta de estadística reutilizable */
const StatCard = ({ icon, color, value, label }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>
      <i className={`fas ${icon}`} />
    </div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </div>
);

export default Dashboard;

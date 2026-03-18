/**
 * views/notifications/Notifications.jsx
 * Centro de notificaciones + panel de recursos asignados a eventos.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useNotificaciones from '../../hooks/useNotificaciones';
import useRecursos from '../../hooks/useRecursos';
import styles from './Notifications.module.css';

const TIPO_CONFIG = {
  success: { icon: 'fa-check-circle',       css: 'success', border: '#4CAF50' },
  warning: { icon: 'fa-exclamation-triangle',css: 'warning', border: '#FFC107' },
  danger:  { icon: 'fa-times-circle',        css: 'danger',  border: '#F44336' },
  info:    { icon: 'fa-info-circle',         css: 'info',    border: '#2196F3' },
};

const getTipoConfig = (tipo) =>
  TIPO_CONFIG[tipo?.toLowerCase()] || TIPO_CONFIG.info;

const ESTADO_COLOR = {
  disponible:    { bg: '#e8f5e9', color: '#2e7d32' },
  ocupado:       { bg: '#ffebee', color: '#c62828' },
  mantenimiento: { bg: '#e3f2fd', color: '#1565c0' },
};

const getEstadoColor = (e) =>
  ESTADO_COLOR[e?.toLowerCase()] || { bg: '#f5f5f5', color: '#555' };

const Notifications = () => {
  const { notificaciones, loading, error, refetch } = useNotificaciones();
  const { recursos, loading: resLoading } = useRecursos();

  // Recursos que tienen eventos asignados
  const recursosAsignados = recursos.filter(r =>
    r.estado?.toLowerCase() === 'ocupado' || r.eventos?.length > 0
  );

  return (
    <DashboardLayout
      title="Centro de Avisos"
      subtitle="Notificaciones del sistema y recursos asignados a eventos."
    >
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <p className={styles.counter}>
          {!loading && !error
            ? `${notificaciones.length} notificación${notificaciones.length !== 1 ? 'es' : ''}`
            : ''}
        </p>
        <div className={styles.toolbarActions}>
          <button className="button is-light is-small" onClick={refetch}>
            <span className="icon"><i className="fas fa-sync-alt" /></span>
            <span>Actualizar</span>
          </button>
          <Link to="/notifications/crear" className="button is-primary is-small">
            <span className="icon"><i className="fas fa-plus" /></span>
            <span>Nueva notificación</span>
          </Link>
        </div>
      </div>

      <div className={styles.layout}>

        {/* ══ Panel izquierdo: Notificaciones ══ */}
        <div className={styles.mainPanel}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-bell" /> Notificaciones
          </h3>

          {loading && <LoadingSpinner message="Cargando notificaciones..." />}
          {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

          {!loading && !error && notificaciones.length === 0 && (
            <EmptyState
              icon="🔔"
              title="Sin notificaciones"
              description="No tienes nuevas notificaciones en este momento."
            />
          )}

          {!loading && !error && notificaciones.length > 0 && (
            <div className="notification-list">
              {notificaciones.map((notif) => {
                const config = getTipoConfig(notif.tipo);
                return (
                  <div
                    className={`notification-item type-${notif.tipo || 'info'}`}
                    key={notif.id}
                    style={{ borderLeftColor: config.border }}
                  >
                    <div className={`notif-icon ${config.css}`}>
                      <i className={`fas ${config.icon}`} />
                    </div>
                    <div className="notif-content">
                      <h4 className="notif-title">{notif.titulo || 'Sin título'}</h4>
                      <p className="notif-message">{notif.mensaje || '—'}</p>
                      {notif.canal && (
                        <span style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '4px', display: 'block' }}>
                          <i className="fas fa-broadcast-tower" /> {notif.canal}
                        </span>
                      )}
                    </div>
                    <div className="notif-date">
                      {notif.fecha_creacion
                        ? new Date(notif.fecha_creacion).toLocaleDateString('es-CO', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ══ Panel derecho: Recursos asignados ══ */}
        <aside className={styles.sidePanel}>
          <h3 className={styles.sectionTitle}>
            <i className="fas fa-boxes" /> Recursos asignados
          </h3>

          {resLoading && <LoadingSpinner message="Cargando recursos..." />}

          {!resLoading && recursosAsignados.length === 0 && (
            <div className={styles.emptyAside}>
              <i className="fas fa-box-open" style={{ fontSize: '1.5rem', color: '#cbd5e1', marginBottom: '8px' }} />
              <p>No hay recursos asignados a eventos actualmente.</p>
            </div>
          )}

          {!resLoading && recursosAsignados.map(r => {
            const ec = getEstadoColor(r.estado);
            return (
              <div key={r.id} className={styles.recursoCard}>
                <div className={styles.recursoTop}>
                  <span className={styles.recursoNombre}>{r.nombre}</span>
                  <span className={styles.recursoBadge} style={{ background: ec.bg, color: ec.color }}>
                    {r.estado || 'Sin estado'}
                  </span>
                </div>
                {r.ubicacion && (
                  <p className={styles.recursoUbicacion}>
                    <i className="fas fa-map-marker-alt" /> {r.ubicacion}
                  </p>
                )}
                {r.eventos?.length > 0 && (
                  <div className={styles.recursoEventos}>
                    {r.eventos.map(ev => (
                      <div key={ev.id} className={styles.recursoEvento}>
                        <i className="fas fa-calendar-check" style={{ color: '#2e7d32', fontSize: '11px' }} />
                        <span>{ev.nombre}</span>
                        {ev.pivot?.cantidad && (
                          <span className={styles.cantidad}>×{ev.pivot.cantidad}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <Link to={`/logistics/${r.id}`} className={styles.recursoLink}>
                  Ver detalle →
                </Link>
              </div>
            );
          })}
        </aside>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;

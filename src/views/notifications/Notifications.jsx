/**
 * views/notifications/Notifications.jsx
 * Notificaciones consumidas dinámicamente desde GET /api/notificaciones.
 * Respuesta backend (NotificacionesResource):
 *   { id, titulo, mensaje, tipo, canal, fecha_creacion, id_usuario, id_evento }
 */

import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useNotificaciones from '../../hooks/useNotificaciones';

/** Mapeo tipo → ícono FA y clase CSS */
const TIPO_CONFIG = {
  success: { icon: 'fa-check',                css: 'success', border: '#4CAF50' },
  warning: { icon: 'fa-exclamation-triangle', css: 'warning', border: '#FFC107' },
  danger:  { icon: 'fa-times',                css: 'danger',  border: '#F44336' },
  info:    { icon: 'fa-info',                 css: 'info',    border: '#2196F3' },
};

const getTipoConfig = (tipo) =>
  TIPO_CONFIG[tipo?.toLowerCase()] || TIPO_CONFIG.info;

const Notifications = () => {
  const { notificaciones, loading, error, refetch } = useNotificaciones();

  return (
    <DashboardLayout
      title="Centro de Notificaciones"
      subtitle="Revisa alertas importantes, respuestas a tus solicitudes y avisos del sistema."
    >
      {/* ── Cabecera con botón actualizar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>
          {!loading && !error ? `${notificaciones.length} notificación${notificaciones.length !== 1 ? 'es' : ''}` : ''}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
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
        <div className="notification-list mt-4" style={{ maxWidth: '800px' }}>
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
                      Canal: {notif.canal}
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
    </DashboardLayout>
  );
};

export default Notifications;

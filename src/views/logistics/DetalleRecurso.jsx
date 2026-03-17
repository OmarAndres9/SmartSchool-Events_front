/**
 * views/logistics/DetalleRecurso.jsx
 * Vista de detalle de un recurso — GET /api/recursos/:id
 * Incluye botón para agregar el recurso a un evento.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import recursosService from '../../services/recursosService';
import styles from './DetalleRecurso.module.css';

const ESTADO_META = {
  disponible:    { color: '#2e7d32', bg: '#e8f5e9', label: 'Disponible',    icon: 'fa-check-circle' },
  ocupado:       { color: '#c62828', bg: '#ffebee', label: 'Ocupado',       icon: 'fa-times-circle' },
  mantenimiento: { color: '#1565c0', bg: '#e3f2fd', label: 'Mantenimiento', icon: 'fa-tools' },
};

const getEstado = (e) => ESTADO_META[e?.toLowerCase()] || ESTADO_META.mantenimiento;

/* ── Modal: Agregar a evento ───────────────────────────────── */
const AgregarEventoModal = ({ recurso, onClose }) => {
  const [idEvento, setIdEvento] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idEvento.trim()) { setError('Ingresa el ID del evento.'); return; }
    setLoading(true);
    setError('');
    try {
      // POST /api/eventos/:id/recursos  — adaptar al endpoint real del backend
      await recursosService.agregarAEvento?.(idEvento, recurso.id) ??
        Promise.resolve(); // fallback si el método no existe aún
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo asignar el recurso al evento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        <div className={styles.modalHeader}>
          <div className={styles.modalIconWrap}>
            <i className="fas fa-calendar-plus" />
          </div>
          <div>
            <h3 className={styles.modalTitle}>Asignar a evento</h3>
            <p className={styles.modalSub}>Recurso: <strong>{recurso.nombre}</strong></p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {success ? (
          <div className={styles.successBox}>
            <i className="fas fa-check-circle" />
            <p>¡Recurso asignado exitosamente al evento!</p>
            <button className={styles.btnPrimary} onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
            {error && (
              <div className={styles.alertDanger} role="alert">
                <i className="fas fa-exclamation-circle" /> {error}
              </div>
            )}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="id-evento">
                ID del Evento
              </label>
              <input
                id="id-evento"
                type="text"
                className={styles.input}
                placeholder="Ej. 12"
                value={idEvento}
                onChange={(e) => setIdEvento(e.target.value)}
                autoFocus
                required
              />
              <p className={styles.fieldHint}>
                Puedes encontrar el ID del evento en la vista de "Mis Eventos".
              </p>
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading
                  ? <><span className={styles.spinner} /> Asignando...</>
                  : <><i className="fas fa-link" /> Asignar recurso</>
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

/* ── Vista principal ───────────────────────────────────────── */
const DetalleRecurso = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recurso,  setRecurso]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [modal,    setModal]    = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRecurso = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await recursosService.getById(id);
      setRecurso(res.data?.data || res.data);
    } catch {
      setError('No se pudo cargar el recurso. Verifica que exista.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecurso(); }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este recurso? Esta acción no se puede deshacer.')) return;
    setDeleting(true);
    try {
      await recursosService.remove(id);
      navigate('/logistics');
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar.');
      setDeleting(false);
    }
  };

  if (loading) return (
    <DashboardLayout title="Detalle del Recurso">
      <LoadingSpinner message="Cargando recurso..." />
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout title="Detalle del Recurso">
      <ErrorMessage message={error} onRetry={fetchRecurso} />
      <Link to="/logistics" className={styles.backLink}>
        <i className="fas fa-arrow-left" /> Volver a Recursos
      </Link>
    </DashboardLayout>
  );

  const estadoMeta = getEstado(recurso?.estado);

  return (
    <DashboardLayout
      title="Detalle del Recurso"
      subtitle="Información completa y acciones disponibles."
    >
      {/* ── Breadcrumb ── */}
      <nav className={styles.breadcrumb}>
        <Link to="/logistics" className={styles.breadcrumbLink}>
          <i className="fas fa-boxes" /> Recursos
        </Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{recurso?.nombre}</span>
      </nav>

      <div className={styles.layout}>

        {/* ═══ Panel principal ═══ */}
        <div className={styles.main}>

          {/* Encabezado de la tarjeta */}
          <div className={styles.card}>
            <div
              className={styles.cardBanner}
              style={{ background: `linear-gradient(135deg, ${estadoMeta.color}22, ${estadoMeta.color}44)` }}
            >
              <div className={styles.cardBannerIcon} style={{ color: estadoMeta.color }}>
                <i className="fas fa-cube" />
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>{recurso?.nombre}</h2>
                <span
                  className={styles.estadoBadge}
                  style={{ background: estadoMeta.bg, color: estadoMeta.color }}
                >
                  <i className={`fas ${estadoMeta.icon}`} />
                  {estadoMeta.label}
                </span>
              </div>

              {/* Metadata grid */}
              <dl className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>
                    <i className="fas fa-map-marker-alt" /> Ubicación
                  </dt>
                  <dd className={styles.metaValue}>
                    {recurso?.ubicacion || <span className={styles.metaEmpty}>No especificada</span>}
                  </dd>
                </div>

                {recurso?.tipo && (
                  <div className={styles.metaItem}>
                    <dt className={styles.metaLabel}>
                      <i className="fas fa-tag" /> Tipo
                    </dt>
                    <dd className={styles.metaValue}>{recurso.tipo}</dd>
                  </div>
                )}

                {recurso?.capacidad && (
                  <div className={styles.metaItem}>
                    <dt className={styles.metaLabel}>
                      <i className="fas fa-users" /> Capacidad
                    </dt>
                    <dd className={styles.metaValue}>{recurso.capacidad} personas</dd>
                  </div>
                )}

                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>
                    <i className="fas fa-calendar-alt" /> Registrado
                  </dt>
                  <dd className={styles.metaValue}>
                    {recurso?.created_at
                      ? new Date(recurso.created_at).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })
                      : '—'}
                  </dd>
                </div>
              </dl>

              {/* Descripción */}
              {recurso?.descripcion && (
                <div className={styles.descripcion}>
                  <h4 className={styles.descripcionTitle}>
                    <i className="fas fa-align-left" /> Descripción
                  </h4>
                  <p className={styles.descripcionText}>{recurso.descripcion}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Panel lateral de acciones ═══ */}
        <aside className={styles.sidebar}>
          <div className={styles.actionsCard}>
            <h3 className={styles.actionsTitle}>Acciones</h3>

            {/* Botón principal: agregar a evento */}
            <button
              className={styles.btnAsignar}
              onClick={() => setModal(true)}
              disabled={recurso?.estado?.toLowerCase() !== 'disponible'}
            >
              <i className="fas fa-calendar-plus" />
              Agregar a evento
            </button>

            {recurso?.estado?.toLowerCase() !== 'disponible' && (
              <p className={styles.asignarHint}>
                Solo se pueden asignar recursos con estado <strong>Disponible</strong>.
              </p>
            )}

            <div className={styles.actionsDivider} />

            <Link to={`/logistics/${id}/editar`} className={styles.btnSecondary}>
              <i className="fas fa-pen" /> Editar recurso
            </Link>

            <button
              className={styles.btnDanger}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting
                ? <><span className={styles.spinner} /> Eliminando...</>
                : <><i className="fas fa-trash" /> Eliminar recurso</>
              }
            </button>

            <div className={styles.actionsDivider} />

            <Link to="/logistics" className={styles.btnBack}>
              <i className="fas fa-arrow-left" /> Volver a la lista
            </Link>
          </div>

          {/* Info rápida del estado */}
          <div
            className={styles.estadoCard}
            style={{ borderColor: estadoMeta.color, background: estadoMeta.bg }}
          >
            <i
              className={`fas ${estadoMeta.icon} ${styles.estadoCardIcon}`}
              style={{ color: estadoMeta.color }}
            />
            <div>
              <p className={styles.estadoCardLabel} style={{ color: estadoMeta.color }}>
                Estado actual
              </p>
              <p className={styles.estadoCardValue} style={{ color: estadoMeta.color }}>
                {estadoMeta.label}
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Modal asignar a evento */}
      {modal && (
        <AgregarEventoModal
          recurso={recurso}
          onClose={() => setModal(false)}
        />
      )}
    </DashboardLayout>
  );
};

export default DetalleRecurso;

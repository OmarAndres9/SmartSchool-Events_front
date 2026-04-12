/**
 * views/logistics/DetalleRecurso.jsx
 * Detalle de recurso con modal para asignar a evento (incluye cantidad).
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Wrench, CalendarPlus, AlertTriangle, Link as LinkIcon, ArrowLeft, Package, MapPin, Tag, Users, CalendarDays, CalendarCheck, AlignLeft, Pen, Trash2, Box } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import recursosService from '../../services/recursosService';
import styles from './DetalleRecurso.module.css';

const ESTADO_META = {
  disponible:    { color: '#2e7d32', bg: '#e8f5e9', label: 'Disponible',    icon: CheckCircle },
  ocupado:       { color: '#c62828', bg: '#ffebee', label: 'Ocupado',       icon: XCircle },
  mantenimiento: { color: '#1565c0', bg: '#e3f2fd', label: 'Mantenimiento', icon: Wrench },
};

const getEstado = (e) => ESTADO_META[e?.toLowerCase()] || ESTADO_META.mantenimiento;

/* ── Modal: Agregar a evento ───────────────────────────────── */
const AgregarEventoModal = ({ recurso, onClose }) => {
  const [idEvento,  setIdEvento]  = useState('');
  const [cantidad,  setCantidad]  = useState(1);
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idEvento.trim()) { setError('Ingresa el ID del evento.'); return; }
    if (cantidad < 1)     { setError('La cantidad debe ser al menos 1.'); return; }
    setLoading(true);
    setError('');
    try {
      await recursosService.agregarAEvento(idEvento.trim(), recurso.id, parseInt(cantidad));
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
            <CalendarPlus size={24} />
          </div>
          <div>
            <h3 className={styles.modalTitle}>Asignar a evento</h3>
            <p className={styles.modalSub}>Recurso: <strong>{recurso.nombre}</strong></p>
          </div>
          <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        {success ? (
          <div className={styles.successBox}>
            <CheckCircle size={24} color="#2e7d32" />
            <p>¡Recurso asignado exitosamente al evento!</p>
            <button className={styles.btnPrimary} onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
            {error && (
              <div className={styles.alertDanger} role="alert">
                <AlertTriangle size={16} /> {error}
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="id-evento">ID del Evento *</label>
              <input
                id="id-evento" type="text"
                className={styles.input}
                placeholder="Ej. 12"
                value={idEvento}
                onChange={(e) => setIdEvento(e.target.value)}
                autoFocus required
              />
              <p className={styles.fieldHint}>
                Encontrá el ID en la sección "Mis Eventos".
              </p>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="cantidad">Cantidad *</label>
              <input
                id="cantidad" type="number"
                className={styles.input}
                min="1" max="100"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
              />
            </div>

            <div className={styles.modalActions}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
              <button type="submit" className={styles.btnPrimary} disabled={loading}>
                {loading
                  ? <><span className={styles.spinner} /> Asignando...</>
                  : <><LinkIcon size={16} style={{marginRight: '6px'}} /> Asignar recurso</>
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
    setLoading(true); setError('');
    try {
      const res = await recursosService.getById(id);
      setRecurso(res.data?.data || res.data);
    } catch {
      setError('No se pudo cargar el recurso. Verifica que exista.');
    } finally { setLoading(false); }
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

  if (loading) return <DashboardLayout title="Detalle del Recurso"><LoadingSpinner message="Cargando recurso..." /></DashboardLayout>;
  if (error)   return <DashboardLayout title="Detalle del Recurso"><ErrorMessage message={error} onRetry={fetchRecurso} /><Link to="/logistics" className={styles.backLink}><ArrowLeft size={14} style={{marginRight: '6px'}} /> Volver</Link></DashboardLayout>;

  const estadoMeta = getEstado(recurso?.estado);

  return (
    <DashboardLayout title="Detalle del Recurso" subtitle="Información completa y acciones disponibles.">

      <nav className={styles.breadcrumb}>
        <Link to="/logistics" className={styles.breadcrumbLink}><Package size={14} style={{marginRight: '6px'}} /> Recursos</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{recurso?.nombre}</span>
      </nav>

      <div className={styles.layout}>
        {/* Panel principal */}
        <div className={styles.main}>
          <div className={styles.card}>
            <div className={styles.cardBanner} style={{ background: `linear-gradient(135deg, ${estadoMeta.color}22, ${estadoMeta.color}44)` }}>
              <div className={styles.cardBannerIcon} style={{ color: estadoMeta.color }}>
                <Box size={32} />
              </div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>{recurso?.nombre}</h2>
                <span className={styles.estadoBadge} style={{ background: estadoMeta.bg, color: estadoMeta.color }}>
                  <estadoMeta.icon size={14} style={{marginRight: '4px'}} /> {estadoMeta.label}
                </span>
              </div>

              <dl className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}><MapPin size={14} style={{marginRight: '6px'}} /> Ubicación</dt>
                  <dd className={styles.metaValue}>{recurso?.ubicacion || <span className={styles.metaEmpty}>No especificada</span>}</dd>
                </div>
                {recurso?.tipo && (
                  <div className={styles.metaItem}>
                    <dt className={styles.metaLabel}><Tag size={14} style={{marginRight: '6px'}} /> Tipo</dt>
                    <dd className={styles.metaValue}>{recurso.tipo}</dd>
                  </div>
                )}
                {recurso?.capacidad && (
                  <div className={styles.metaItem}>
                    <dt className={styles.metaLabel}><Users size={14} style={{marginRight: '6px'}} /> Capacidad</dt>
                    <dd className={styles.metaValue}>{recurso.capacidad} personas</dd>
                  </div>
                )}
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}><CalendarDays size={14} style={{marginRight: '6px'}} /> Registrado</dt>
                  <dd className={styles.metaValue}>
                    {recurso?.created_at ? new Date(recurso.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                  </dd>
                </div>
              </dl>

              {/* Eventos asignados */}
              {recurso?.eventos?.length > 0 && (
                <div className={styles.descripcion}>
                  <h4 className={styles.descripcionTitle}><CalendarCheck size={14} style={{marginRight: '6px'}} /> Eventos asignados</h4>
                  {recurso.eventos.map(ev => (
                    <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                      <span>{ev.nombre}</span>
                      <span style={{ color: '#64748b' }}>Cantidad: {ev.pivot?.cantidad ?? 1}</span>
                    </div>
                  ))}
                </div>
              )}

              {recurso?.descripcion && (
                <div className={styles.descripcion}>
                  <h4 className={styles.descripcionTitle}><AlignLeft size={14} style={{marginRight: '6px'}} /> Descripción</h4>
                  <p className={styles.descripcionText}>{recurso.descripcion}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <aside className={styles.sidebar}>
          <div className={styles.actionsCard}>
            <h3 className={styles.actionsTitle}>Acciones</h3>

            <button
              className={styles.btnAsignar}
              onClick={() => setModal(true)}
              disabled={recurso?.estado?.toLowerCase() !== 'disponible'}
            >
              <CalendarPlus size={16} style={{marginRight: '6px'}} /> Agregar a evento
            </button>

            {recurso?.estado?.toLowerCase() !== 'disponible' && (
              <p className={styles.asignarHint}>
                Solo recursos <strong>Disponibles</strong> pueden asignarse.
              </p>
            )}

            <div className={styles.actionsDivider} />
            <Link to={`/logistics/${id}/editar`} className={styles.btnSecondary}><Pen size={14} style={{marginRight: '6px'}} /> Editar recurso</Link>
            <button className={styles.btnDanger} onClick={handleDelete} disabled={deleting}>
              {deleting ? <><span className={styles.spinner} /> Eliminando...</> : <><Trash2 size={14} style={{marginRight: '6px'}} /> Eliminar recurso</>}
            </button>
            <div className={styles.actionsDivider} />
            <Link to="/logistics" className={styles.btnBack}><ArrowLeft size={14} style={{marginRight: '6px'}} /> Volver a la lista</Link>
          </div>

          <div className={styles.estadoCard} style={{ borderColor: estadoMeta.color, background: estadoMeta.bg }}>
            <estadoMeta.icon className={styles.estadoCardIcon} size={24} color={estadoMeta.color} />
            <div>
              <p className={styles.estadoCardLabel} style={{ color: estadoMeta.color }}>Estado actual</p>
              <p className={styles.estadoCardValue} style={{ color: estadoMeta.color }}>{estadoMeta.label}</p>
            </div>
          </div>
        </aside>
      </div>

      {modal && <AgregarEventoModal recurso={recurso} onClose={() => setModal(false)} />}
    </DashboardLayout>
  );
};

export default DetalleRecurso;

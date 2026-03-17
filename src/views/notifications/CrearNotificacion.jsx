/**
 * views/notifications/CrearNotificacion.jsx
 * Formulario para crear una notificación — POST /api/notificaciones
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import notificacionesService from '../../services/notificacionesService';
import styles from './CrearNotificacion.module.css';

const TIPOS   = ['info', 'success', 'warning', 'danger'];
const CANALES = ['Sistema', 'Email', 'WhatsApp', 'SMS'];

const TIPO_META = {
  info:    { color: '#1565c0', bg: '#e3f2fd', icon: 'fa-info-circle',           label: 'Información' },
  success: { color: '#2e7d32', bg: '#e8f5e9', icon: 'fa-check-circle',          label: 'Éxito' },
  warning: { color: '#e65100', bg: '#fff3e0', icon: 'fa-exclamation-triangle',  label: 'Advertencia' },
  danger:  { color: '#c62828', bg: '#ffebee', icon: 'fa-times-circle',          label: 'Error / Urgente' },
};

const FORM_INICIAL = {
  titulo: '', mensaje: '', tipo: 'info', canal: 'Sistema', id_evento: '',
};

const CrearNotificacion = () => {
  const navigate = useNavigate();
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await notificacionesService.create(formData);
      setSuccessMsg('¡Notificación enviada exitosamente! Redirigiendo...');
      setFormData(FORM_INICIAL);
      setTimeout(() => navigate('/notifications'), 2000);
    } catch (error) {
      const errs = error.response?.data?.errors;
      setErrorMsg(
        errs
          ? Object.values(errs).flat().join(' · ')
          : error.response?.data?.message || 'No se pudo enviar la notificación.'
      );
    } finally {
      setLoading(false);
    }
  };

  const tipoActual = TIPO_META[formData.tipo];

  return (
    <DashboardLayout
      title="Nueva Notificación"
      subtitle="Crea y envía una alerta o aviso a la comunidad educativa."
    >
      {errorMsg   && <div className={styles.alertDanger}  role="alert"><i className="fas fa-exclamation-circle" /> {errorMsg}</div>}
      {successMsg && <div className={styles.alertSuccess} role="status"><i className="fas fa-check-circle" /> {successMsg}</div>}

      <div className={styles.layout}>

        {/* ══ Formulario ══ */}
        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* ── Sección 1: Tipo ── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>1</span>
              Tipo de notificación
            </h3>

            <div className={styles.tipoGrid}>
              {TIPOS.map((tipo) => {
                const meta    = TIPO_META[tipo];
                const checked = formData.tipo === tipo;
                return (
                  <label
                    key={tipo}
                    className={`${styles.tipoCard} ${checked ? styles.tipoCardChecked : ''}`}
                    style={checked ? { borderColor: meta.color, background: meta.bg } : {}}
                  >
                    <input
                      type="radio" name="tipo" value={tipo}
                      checked={checked} onChange={handleChange}
                      className={styles.radioHidden}
                    />
                    <i
                      className={`fas ${meta.icon} ${styles.tipoIcon}`}
                      style={{ color: checked ? meta.color : 'var(--color-text-light)' }}
                    />
                    <span
                      className={styles.tipoLabel}
                      style={checked ? { color: meta.color, fontWeight: 700 } : {}}
                    >
                      {meta.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Sección 2: Contenido ── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>2</span>
              Contenido del mensaje
            </h3>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="titulo">Título *</label>
              <input
                id="titulo" name="titulo" type="text"
                className={styles.input}
                placeholder="Ej. Suspensión de clases, Resultado de inscripción..."
                value={formData.titulo}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="mensaje">
                Mensaje *
              </label>
              <textarea
                id="mensaje" name="mensaje"
                className={`${styles.input} ${styles.textarea}`}
                placeholder="Describe el aviso con todos los detalles necesarios..."
                rows={5}
                value={formData.mensaje}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* ── Sección 3: Destino ── */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <span className={styles.sectionNum}>3</span>
              Destino y canal
            </h3>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="canal">Canal de envío *</label>
                <select
                  id="canal" name="canal"
                  className={styles.input}
                  value={formData.canal}
                  onChange={handleChange}
                >
                  {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="id_evento">
                  Vincular a evento
                  <span className={styles.labelHint}> (opcional)</span>
                </label>
                <input
                  id="id_evento" name="id_evento" type="text"
                  className={styles.input}
                  placeholder="ID del evento relacionado"
                  value={formData.id_evento}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ── Acciones ── */}
          <div className={styles.actions}>
            <Link to="/notifications" className={styles.btnCancel}>
              Cancelar
            </Link>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading
                ? <><span className={styles.spinner} /> Enviando...</>
                : <><i className="fas fa-paper-plane" /> Enviar notificación</>
              }
            </button>
          </div>
        </form>

        {/* ══ Preview ══ */}
        <aside className={styles.preview}>
          <h4 className={styles.previewTitle}>Vista previa</h4>
          <div
            className={styles.previewCard}
            style={{ borderLeftColor: tipoActual.color }}
          >
            <div
              className={styles.previewIcon}
              style={{ background: tipoActual.bg, color: tipoActual.color }}
            >
              <i className={`fas ${tipoActual.icon}`} />
            </div>
            <div className={styles.previewContent}>
              <p className={styles.previewTitulo}>
                {formData.titulo || <span className={styles.previewPlaceholder}>Título de la notificación</span>}
              </p>
              <p className={styles.previewMensaje}>
                {formData.mensaje || <span className={styles.previewPlaceholder}>El mensaje aparecerá aquí...</span>}
              </p>
              {formData.canal && (
                <span className={styles.previewCanal}>
                  <i className="fas fa-broadcast-tower" /> {formData.canal}
                </span>
              )}
            </div>
          </div>

          <div className={styles.previewMeta}>
            <div className={styles.previewMetaItem}>
              <span className={styles.previewMetaLabel}>Tipo</span>
              <span
                className={styles.previewMetaBadge}
                style={{ background: tipoActual.bg, color: tipoActual.color }}
              >
                {tipoActual.label}
              </span>
            </div>
            <div className={styles.previewMetaItem}>
              <span className={styles.previewMetaLabel}>Canal</span>
              <span className={styles.previewMetaValue}>{formData.canal}</span>
            </div>
            {formData.id_evento && (
              <div className={styles.previewMetaItem}>
                <span className={styles.previewMetaLabel}>Evento ID</span>
                <span className={styles.previewMetaValue}>#{formData.id_evento}</span>
              </div>
            )}
          </div>
        </aside>
      </div>
    </DashboardLayout>
  );
};

export default CrearNotificacion;

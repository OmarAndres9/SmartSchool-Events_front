/**
 * views/reports/CrearReporte.jsx
 * Formulario para crear un reporte — POST /api/v1/reportes
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import reportesService from '../../services/reportesService';
import styles from '../logistics/CrearRecurso.module.css'; // reutilizar estilos

const TIPOS   = ['Academico', 'Cultural', 'Deportivo', 'Recreativo', 'Administrativo'];
// CORRECCIÓN: estados alineados con la validación del backend
// Backend acepta: activo, pendiente, finalizado, cancelado
// El frontend tenía 'en_proceso' que no existe en el backend
const ESTADOS = ['activo', 'pendiente', 'finalizado', 'cancelado'];

const ESTADO_META = {
  activo:     { color: '#1565c0', bg: '#e3f2fd', label: 'Activo' },
  pendiente:  { color: '#f57c00', bg: '#fff3e0', label: 'Pendiente' },
  finalizado: { color: '#2e7d32', bg: '#e8f5e9', label: 'Finalizado' },
  cancelado:  { color: '#c62828', bg: '#ffebee', label: 'Cancelado' },
};

const FORM_INICIAL = {
  tipo: '', descripcion: '', fecha: '', estado: 'pendiente', id_evento: '',
};

const CrearReporte = () => {
  const navigate = useNavigate();
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await reportesService.create(formData);
      setSuccessMsg('¡Reporte creado exitosamente! Redirigiendo...');
      setFormData(FORM_INICIAL);
      setTimeout(() => navigate('/reports'), 2000);
    } catch (error) {
      const errs = error.response?.data?.errors;
      setErrorMsg(errs
        ? Object.values(errs).flat().join(' · ')
        : error.response?.data?.message || 'No se pudo crear el reporte.');
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout
      title="Crear Reporte"
      subtitle="Registra un nuevo reporte de evento en el sistema."
    >
      {errorMsg   && <div className={styles.alertDanger}  role="alert"><i className="fas fa-exclamation-circle" /> {errorMsg}</div>}
      {successMsg && <div className={styles.alertSuccess} role="status"><i className="fas fa-check-circle" /> {successMsg}</div>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* Sección 1: Información */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>1</span> Información del reporte
          </h3>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tipo">Tipo de evento *</label>
              <select id="tipo" name="tipo" className={styles.input}
                value={formData.tipo} onChange={handleChange} required>
                <option value="">Seleccionar tipo...</option>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="fecha">Fecha *</label>
              <input id="fecha" name="fecha" type="datetime-local"
                className={styles.input}
                value={formData.fecha} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="id_evento">
              ID del Evento <span className={styles.labelHint}>(opcional)</span>
            </label>
            <input id="id_evento" name="id_evento" type="text"
              className={styles.input}
              placeholder="Ej. 12"
              value={formData.id_evento} onChange={handleChange} />
          </div>
        </div>

        {/* Sección 2: Estado */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>2</span> Estado del reporte
          </h3>

          <div className={styles.estadoGroup}>
            {ESTADOS.map(est => {
              const meta    = ESTADO_META[est];
              const checked = formData.estado === est;
              return (
                <label
                  key={est}
                  className={`${styles.estadoCard} ${checked ? styles.estadoCardChecked : ''}`}
                  style={checked ? { borderColor: meta.color, background: meta.bg } : {}}
                >
                  <input type="radio" name="estado" value={est}
                    checked={checked} onChange={handleChange}
                    className={styles.radioHidden} />
                  <span className={styles.estadoDot} style={{ background: meta.color }} />
                  <span className={styles.estadoLabel}
                    style={checked ? { color: meta.color, fontWeight: 700 } : {}}>
                    {meta.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Sección 3: Descripción */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>3</span> Descripción
          </h3>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="descripcion">Detalle del reporte *</label>
            <textarea id="descripcion" name="descripcion"
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Describe los detalles, observaciones o resultados del evento..."
              rows={5} value={formData.descripcion} onChange={handleChange} required />
          </div>
        </div>

        {/* Acciones */}
        <div className={styles.actions}>
          <Link to="/reports" className={styles.btnCancel}>Cancelar</Link>
          <button type="submit" className={styles.btnSubmit} disabled={loading}>
            {loading
              ? <><span className={styles.spinner} /> Guardando...</>
              : <><i className="fas fa-save" /> Crear reporte</>
            }
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CrearReporte;

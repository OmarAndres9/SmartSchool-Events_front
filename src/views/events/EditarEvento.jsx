/**
 * views/events/EditarEvento.jsx
 * Formulario de edición de evento — PUT /api/v1/eventos/:id
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import eventosService from '../../services/eventosService';
import styles from '../logistics/CrearRecurso.module.css';

const TIPOS_EVENTO = ['Academico', 'Cultural', 'Deportivo', 'Recreativo'];
const MODALIDADES  = ['Presencial', 'Virtual', 'Mixta'];

const EditarEvento = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData,   setFormData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fetchError, setFetchError] = useState('');

  // Cargar datos del evento
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await eventosService.getById(id);
        const ev  = res.data?.data || res.data;
        // Formatear fechas para datetime-local input
        const fmt = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';
        setFormData({
          nombre:          ev.nombre          || '',
          tipo_evento:     ev.tipo_evento     || '',
          fecha_inicio:    fmt(ev.fecha_inicio),
          fecha_fin:       fmt(ev.fecha_fin),
          lugar:           ev.lugar           || '',
          descripcion:     ev.descripcion     || '',
          modalidad:       ev.modalidad       || 'Presencial',
          grupo_destinado: ev.grupo_destinado || '',
        });
      } catch {
        setFetchError('No se pudo cargar el evento. Verifica que exista.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await eventosService.update(id, formData);
      setSuccessMsg('¡Evento actualizado exitosamente! Redirigiendo...');
      setTimeout(() => navigate('/mis-eventos'), 2000);
    } catch (error) {
      const errs = error.response?.data?.errors;
      setErrorMsg(errs
        ? Object.values(errs).flat().join(' · ')
        : error.response?.data?.message || 'No se pudo actualizar el evento.');
    } finally { setSaving(false); }
  };

  if (loading) return <DashboardLayout title="Editar Evento"><LoadingSpinner message="Cargando evento..." /></DashboardLayout>;
  if (fetchError) return <DashboardLayout title="Editar Evento"><ErrorMessage message={fetchError} /><Link to="/mis-eventos" className={styles.btnCancel}>Volver</Link></DashboardLayout>;

  return (
    <DashboardLayout
      title="Editar Evento"
      subtitle="Modifica la información del evento registrado."
    >
      {errorMsg   && <div className={styles.alertDanger}  role="alert"><i className="fas fa-exclamation-circle" /> {errorMsg}</div>}
      {successMsg && <div className={styles.alertSuccess} role="status"><i className="fas fa-check-circle" /> {successMsg}</div>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* ── 1. Datos Generales ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>1</span> Datos Generales
          </h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nombre">Nombre del evento *</label>
              <input id="nombre" name="nombre" type="text" className={styles.input}
                placeholder="Ej. Feria de Ciencias"
                value={formData.nombre} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="tipo_evento">Tipo de evento *</label>
              <select id="tipo_evento" name="tipo_evento" className={styles.input}
                value={formData.tipo_evento} onChange={handleChange} required>
                <option value="">Seleccionar tipo...</option>
                {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── 2. Programación ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>2</span> Programación
          </h3>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fecha_inicio">Fecha y hora de inicio *</label>
              <input id="fecha_inicio" name="fecha_inicio" type="datetime-local"
                className={styles.input} value={formData.fecha_inicio}
                onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="fecha_fin">
                Fecha y hora de fin <span className={styles.labelHint}>(opcional)</span>
              </label>
              <input id="fecha_fin" name="fecha_fin" type="datetime-local"
                className={styles.input} value={formData.fecha_fin}
                onChange={handleChange} />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lugar">Ubicación / Lugar *</label>
              <input id="lugar" name="lugar" type="text" className={styles.input}
                placeholder="Ej. Auditorio Principal"
                value={formData.lugar} onChange={handleChange} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="modalidad">Modalidad</label>
              <select id="modalidad" name="modalidad" className={styles.input}
                value={formData.modalidad} onChange={handleChange}>
                {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ── 3. Descripción ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>3</span> Descripción
          </h3>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="descripcion">Detalles del evento *</label>
            <textarea id="descripcion" name="descripcion"
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Describe brevemente el evento..."
              rows={4} value={formData.descripcion} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="grupo_destinado">
              Grupo Destinado <span className={styles.labelHint}>(opcional)</span>
            </label>
            <input id="grupo_destinado" name="grupo_destinado" type="text"
              className={styles.input}
              placeholder="Ej. Todos, Grado 10, Docentes"
              value={formData.grupo_destinado} onChange={handleChange} />
          </div>
        </div>

        {/* ── Acciones ── */}
        <div className={styles.actions}>
          <Link to="/mis-eventos" className={styles.btnCancel}>Cancelar</Link>
          <button type="submit" className={styles.btnSubmit} disabled={saving}>
            {saving
              ? <><span className={styles.spinner} /> Guardando...</>
              : <><i className="fas fa-save" /> Guardar cambios</>
            }
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default EditarEvento;

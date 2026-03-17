/**
 * views/logistics/CrearRecurso.jsx
 * Formulario para crear un nuevo recurso — POST /api/recursos
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import recursosService from '../../services/recursosService';
import styles from './CrearRecurso.module.css';

const TIPOS_RECURSO = ['Salón', 'Auditorio', 'Laboratorio', 'Cancha', 'Sala de cómputo', 'Biblioteca', 'Otro'];
const ESTADOS       = ['disponible', 'ocupado', 'mantenimiento'];

const ESTADO_META = {
  disponible:    { color: '#2e7d32', bg: '#e8f5e9', label: 'Disponible' },
  ocupado:       { color: '#c62828', bg: '#ffebee', label: 'Ocupado' },
  mantenimiento: { color: '#1565c0', bg: '#e3f2fd', label: 'Mantenimiento' },
};

const FORM_INICIAL = {
  nombre: '', tipo: '', ubicacion: '', capacidad: '',
  descripcion: '', estado: 'disponible',
};

const CrearRecurso = () => {
  const navigate = useNavigate();
  const [formData,   setFormData]   = useState(FORM_INICIAL);
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await recursosService.create(formData);
      setSuccessMsg('¡Recurso creado exitosamente! Redirigiendo...');
      setFormData(FORM_INICIAL);
      setTimeout(() => navigate('/logistics'), 2000);
    } catch (error) {
      const errs = error.response?.data?.errors;
      setErrorMsg(
        errs
          ? Object.values(errs).flat().join(' · ')
          : error.response?.data?.message || 'No se pudo crear el recurso.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Crear Recurso"
      subtitle="Registra un nuevo espacio o equipo disponible para la institución."
    >
      {errorMsg   && <div className={styles.alertDanger}  role="alert"><i className="fas fa-exclamation-circle" /> {errorMsg}</div>}
      {successMsg && <div className={styles.alertSuccess} role="status"><i className="fas fa-check-circle" /> {successMsg}</div>}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* ── 1. Información básica ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>1</span>
            Información básica
          </h3>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="nombre">Nombre del recurso *</label>
              <input
                id="nombre" name="nombre" type="text"
                className={styles.input}
                placeholder="Ej. Salón 301, Laboratorio de Química"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="tipo">Tipo de recurso *</label>
              <select
                id="tipo" name="tipo"
                className={styles.input}
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar tipo...</option>
                {TIPOS_RECURSO.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="ubicacion">Ubicación / Piso *</label>
              <input
                id="ubicacion" name="ubicacion" type="text"
                className={styles.input}
                placeholder="Ej. Bloque A, Piso 3"
                value={formData.ubicacion}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="capacidad">Capacidad (personas)</label>
              <input
                id="capacidad" name="capacidad" type="number"
                className={styles.input}
                placeholder="Ej. 30"
                min="1"
                value={formData.capacidad}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* ── 2. Estado inicial ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>2</span>
            Estado inicial
          </h3>

          <div className={styles.estadoGroup}>
            {ESTADOS.map((est) => {
              const meta = ESTADO_META[est];
              const checked = formData.estado === est;
              return (
                <label
                  key={est}
                  className={`${styles.estadoCard} ${checked ? styles.estadoCardChecked : ''}`}
                  style={checked ? { borderColor: meta.color, background: meta.bg } : {}}
                >
                  <input
                    type="radio"
                    name="estado"
                    value={est}
                    checked={checked}
                    onChange={handleChange}
                    className={styles.radioHidden}
                  />
                  <span
                    className={styles.estadoDot}
                    style={{ background: meta.color }}
                  />
                  <span
                    className={styles.estadoLabel}
                    style={checked ? { color: meta.color, fontWeight: 700 } : {}}
                  >
                    {meta.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ── 3. Descripción ── */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>3</span>
            Descripción
          </h3>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="descripcion">
              Detalles adicionales
              <span className={styles.labelHint}> (opcional)</span>
            </label>
            <textarea
              id="descripcion" name="descripcion"
              className={`${styles.input} ${styles.textarea}`}
              placeholder="Equipamiento disponible, restricciones de uso, condiciones especiales..."
              rows={4}
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ── Acciones ── */}
        <div className={styles.actions}>
          <Link to="/logistics" className={styles.btnCancel}>
            Cancelar
          </Link>
          <button
            type="submit"
            className={styles.btnSubmit}
            disabled={loading}
          >
            {loading
              ? <><span className={styles.spinner} /> Guardando...</>
              : <><i className="fas fa-save" /> Crear recurso</>
            }
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default CrearRecurso;

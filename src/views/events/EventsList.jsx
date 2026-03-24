/**
 * views/events/EventsList.jsx
 * Formulario de creación de eventos — POST /api/eventos.
 * Sin datos hardcodeados: tipos de evento y modalidades son constantes
 * semánticas del dominio escolar (no vienen del backend porque son enums fijos).
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import eventosService from '../../services/eventosService';

const TIPOS_EVENTO  = ['Academico', 'Cultural', 'Deportivo', 'Recreativo'];
const MODALIDADES   = ['Presencial', 'Virtual', 'Mixta'];

const FORM_INICIAL = {
  nombre: '', tipo_evento: '', fecha_inicio: '', fecha_fin: '',
  lugar: '', descripcion: '', modalidad: 'Presencial', grupo_destinado: '',
};

const EventsList = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await eventosService.create(formData);
      setSuccessMsg('¡Evento creado exitosamente! Redirigiendo a Mis Eventos...');
      setFormData(FORM_INICIAL);
      setTimeout(() => navigate('/mis-eventos'), 2000);
    } catch (error) {
      // CORRECCIÓN: el ternario original estaba mal anidado — evaluaba
      // error.response?.data?.errors como condición pero luego usaba
      // error.response.data.errors sin optional chaining (crash si era undefined)
      const errs = error.response?.data?.errors;
      setErrorMsg(
        errs
          ? Object.values(errs).flat().join(' · ')
          : error.response?.data?.message || 'No se pudo crear el evento. Verifica los datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Crear Nuevo Evento"
      subtitle="Completa la información para registrar una actividad en el calendario institucional."
    >
      {errorMsg   && <div className="notification is-danger  is-light mb-4">{errorMsg}</div>}
      {successMsg && <div className="notification is-success is-light mb-4">{successMsg}</div>}

      <form onSubmit={handleSubmit}>
        {/* ── 1. Datos Generales ── */}
        <section className="form-section">
          <h3 className="form-section-title">
            <i className="fas fa-info-circle" /> 1. Datos Generales
          </h3>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Nombre del evento</label>
              <input
                type="text" name="nombre" value={formData.nombre}
                onChange={handleChange} className="custom-input"
                placeholder="Ej. Feria de Ciencias" required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Tipo del evento</label>
              <select
                name="tipo_evento" value={formData.tipo_evento}
                onChange={handleChange} className="custom-input" required
              >
                <option value="">Seleccione un tipo</option>
                {TIPOS_EVENTO.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── 2. Programación ── */}
        <section className="form-section">
          <h3 className="form-section-title">
            <i className="fas fa-clock" /> 2. Programación
          </h3>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Fecha y hora de inicio</label>
              <input
                type="datetime-local" name="fecha_inicio"
                value={formData.fecha_inicio} onChange={handleChange}
                className="custom-input" required
              />
            </div>
            <div className="input-group">
              <label className="input-label">Fecha y hora de fin</label>
              <input
                type="datetime-local" name="fecha_fin"
                value={formData.fecha_fin} onChange={handleChange}
                className="custom-input"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Ubicación / Lugar</label>
              <input
                type="text" name="lugar" value={formData.lugar}
                onChange={handleChange} className="custom-input"
                placeholder="Ej. Auditorio Principal" required
              />
            </div>
          </div>
        </section>

        {/* ── 3. Descripción ── */}
        <section className="form-section">
          <h3 className="form-section-title">
            <i className="fas fa-align-left" /> 3. Descripción
          </h3>
          <div className="input-group">
            <label className="input-label">Detalles del evento</label>
            <textarea
              name="descripcion" value={formData.descripcion}
              onChange={handleChange} className="custom-input"
              rows="4" placeholder="Describe brevemente el evento..." required
            />
          </div>
        </section>

        {/* ── 4. Control y Aforo ── */}
        <section className="form-section">
          <h3 className="form-section-title">
            <i className="fas fa-users-cog" /> 4. Control y Aforo
          </h3>
          <div className="form-grid">
            <div className="input-group">
              <label className="input-label">Modalidad</label>
              <select
                name="modalidad" value={formData.modalidad}
                onChange={handleChange} className="custom-input"
              >
                {MODALIDADES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Grupo Destinado</label>
              <input
                type="text" name="grupo_destinado"
                value={formData.grupo_destinado} onChange={handleChange}
                className="custom-input"
                placeholder="Ej. Todos, Grado 10, Docentes"
              />
            </div>
          </div>
        </section>

        {/* ── Acciones ── */}
        <div className="buttons is-right">
          <button
            type="button"
            className="button is-light"
            onClick={() => navigate('/mis-eventos')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`button is-success ${loading ? 'is-loading' : ''}`}
            disabled={loading}
          >
            Guardar y Publicar
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
};

export default EventsList;

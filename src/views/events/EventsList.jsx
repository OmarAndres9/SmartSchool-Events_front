import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';

const EventsList = () => {
    const [formData, setFormData] = useState({
        nombre: '',
        tipo_evento: '',
        fecha_inicio: '',
        fecha_fin: '', // Opcional o usar fecha_inicio
        lugar: '',
        descripcion: '',
        modalidad: 'Presencial',
        grupo_destinado: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Endpoint asumiendo el esquema ER que compartiste
            const response = await api.post('/eventos', formData);
            alert('Evento creado exitosamente');
            // Reset form
            setFormData({
                nombre: '', tipo_evento: '', fecha_inicio: '', fecha_fin: '', lugar: '', descripcion: '', modalidad: 'Presencial', grupo_destinado: ''
            });
        } catch (error) {
            console.error('Error creando evento', error);
            alert('Error: ' + (error.response?.data?.message || 'No se pudo crear el evento'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="Crear Nuevo Evento"
            subtitle="Completa la información para registrar una actividad en el calendario institucional."
        >
            <form onSubmit={handleSubmit}>
                <section className="form-section">
                    <h3 className="form-section-title"><i className="fas fa-info-circle"></i> 1. Datos Generales</h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">Nombre del evento</label>
                            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="custom-input" placeholder="Ej. Feria de Ciencias" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Tipo del evento</label>
                            <div className="select is-fullwidth">
                                <select name="tipo_evento" value={formData.tipo_evento} onChange={handleChange} className="custom-input p-0 px-3" required>
                                    <option value="">Seleccione un tipo</option>
                                    <option value="Academico">Académico</option>
                                    <option value="Cultural">Cultural</option>
                                    <option value="Deportivo">Deportivo</option>
                                    <option value="Recreativo">Recreativo</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="form-section-title"><i className="fas fa-clock"></i> 2. Programación</h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">Fecha Inicio (u Hora única)</label>
                            {/* En HTML type="datetime-local" mapea perfecto con el datetime del DB */}
                            <input type="datetime-local" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} className="custom-input" required />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Fecha Fin</label>
                            <input type="datetime-local" name="fecha_fin" value={formData.fecha_fin} onChange={handleChange} className="custom-input" />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Ubicación / Lugar</label>
                            <input type="text" name="lugar" value={formData.lugar} onChange={handleChange} className="custom-input" placeholder="Ej. Auditorio Principal" required />
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="form-section-title"><i className="fas fa-align-left"></i> 3. Descripción</h3>
                    <div className="input-group">
                        <label className="input-label">Detalles del evento</label>
                        <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="custom-input" rows="4" placeholder="Describa brevemente el evento" required></textarea>
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="form-section-title"><i className="fas fa-users-cog"></i> 4. Control y Aforo</h3>
                    <div className="form-grid">
                        <div className="input-group">
                            <label className="input-label">Modalidad</label>
                            <div className="select is-fullwidth">
                                <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="custom-input p-0 px-3">
                                    <option value="Presencial">Presencial</option>
                                    <option value="Virtual">Virtual</option>
                                    <option value="Mixta">Mixta</option>
                                </select>
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label">Grupo Destinado</label>
                            <input type="text" name="grupo_destinado" value={formData.grupo_destinado} onChange={handleChange} className="custom-input" placeholder="Ej. Todos, Grado 10, Docentes" />
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3 className="form-section-title"><i className="fas fa-image"></i> 5. Multimedia</h3>
                    <div className="file has-name is-fullwidth">
                        <label className="file-label">
                            <input className="file-input" type="file" name="imagen" />
                            <span className="file-cta">
                                <span className="file-icon"><i className="fas fa-upload"></i></span>
                                <span className="file-label">Seleccionar imagen...</span>
                            </span>
                            <span className="file-name">No se ha seleccionado archivo</span>
                        </label>
                    </div>
                </section>

                <div className="buttons is-right">
                    <button type="button" className="button is-light">Cancelar</button>
                    <button type="submit" className={`button is-success ${loading ? 'is-loading' : ''}`}>Guardar y Publicar</button>
                </div>
            </form>
        </DashboardLayout>
    );
};

export default EventsList;

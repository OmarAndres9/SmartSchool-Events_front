import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';

const Logistics = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            // Ajusta la ruta a los recursos en Laravel (probablemente /recursos basado en el ERD)
            const response = await api.get('/recursos');
            if (Array.isArray(response.data)) {
                setResources(response.data);
            } else if (response.data.data) {
                setResources(response.data.data); // Laravel pagination/resource format
            } else {
                // Fallback dummy data while API is not ready
                setResources([
                    { id: 1, nombre: 'Salón de Actos', ubicacion: 'Bloque A', estado: 'Disponible', tipo: 'Espacio', detalle: 'Capacidad 200 personas' },
                    { id: 2, nombre: 'Proyector Epson', ubicacion: 'Sala Profesores', estado: 'Ocupado', tipo: 'Equipo', detalle: 'Responsable: Ana Pérez' },
                    { id: 3, nombre: 'Bus Escolar #3', ubicacion: 'Parqueadero Sur', estado: 'Mantenimiento', tipo: 'Transporte', detalle: 'Capacidad 40 Estudiantes' }
                ]);
            }
        } catch (error) {
            console.error('Error fetching resources:', error);
            // Fallback
            setResources([
                { id: 1, nombre: 'Salón de Actos', ubicacion: 'Bloque A', estado: 'Disponible', tipo: 'Espacio', detalle: 'Capacidad 200 personas' },
                { id: 2, nombre: 'Proyector Epson', ubicacion: 'Sala Profesores', estado: 'Ocupado', tipo: 'Equipo', detalle: 'Responsable: Ana Pérez' },
                { id: 3, nombre: 'Bus Escolar #3', ubicacion: 'Parqueadero Sur', estado: 'Mantenimiento', tipo: 'Transporte', detalle: 'Capacidad 40 Estudiantes' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusClass = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'disponible': return { bar: 'status-available', badge: 'badge-available' };
            case 'ocupado': return { bar: 'status-occupied', badge: 'badge-occupied' };
            case 'mantenimiento': return { bar: 'status-maintenance', badge: 'badge-maintenance' };
            default: return { bar: 'status-maintenance', badge: 'badge-maintenance' };
        }
    };

    const filteredResources = filter === 'Todos'
        ? resources
        : resources.filter(r => r.estado?.toLowerCase() === filter.toLowerCase());

    return (
        <DashboardLayout
            title="Logística y Recursos"
            subtitle="Gestiona espacios y equipos de la institución."
        >
            {/* Toolbar */}
            <div className="toolbar">
                <div className="control has-icons-left" style={{ flex: 1 }}>
                    <input className="input" type="text" placeholder="Buscar recurso..." />
                    <span className="icon is-small is-left"><i className="fas fa-search"></i></span>
                </div>
                <div className="select">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="Todos">Todos</option>
                        <option value="Disponible">Disponibles</option>
                        <option value="Ocupado">Ocupados</option>
                        <option value="Mantenimiento">En Mantenimiento</option>
                    </select>
                </div>
                <Link to="#" className="button is-primary">
                    <span className="icon"><i className="fas fa-plus"></i></span>
                    <span>Nuevo Recurso</span>
                </Link>
            </div>

            {/* Resources Grid */}
            {loading ? (
                <div className="has-text-centered my-6 py-6">
                    <div className="loader is-loading is-size-1 mx-auto" style={{ height: '3rem', width: '3rem' }}></div>
                    <p className="mt-3">Cargando recursos...</p>
                </div>
            ) : (
                <section className="resource-list">
                    {filteredResources.length === 0 ? (
                        <p className="has-text-centered has-text-grey my-6" style={{ gridColumn: '1 / -1' }}>No hay recursos para mostrar.</p>
                    ) : (
                        filteredResources.map(resource => {
                            const statusStyles = getStatusClass(resource.estado);
                            return (
                                <div className="resource-card" key={resource.id}>
                                    <div className={`resource-status-bar ${statusStyles.bar}`}></div>
                                    <div className="resource-info">
                                        <div className="is-flex is-justify-content-space-between is-align-items-start">
                                            <div>
                                                <h3 className="resource-name">{resource.nombre}</h3>
                                                <p className="resource-detail">{resource.detalle || resource.ubicacion}</p>
                                            </div>
                                            <span className={`status-badge ${statusStyles.badge}`}>{resource.estado}</span>
                                        </div>
                                        <div className="mt-4 is-flex is-justify-content-space-between">
                                            <button className="button is-small is-light"><i className="fas fa-eye"></i></button>
                                            <button className="button is-small is-light"><i className="fas fa-pen"></i></button>
                                            <button className="button is-small is-danger is-light"><i className="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </section>
            )}
        </DashboardLayout>
    );
};

export default Logistics;

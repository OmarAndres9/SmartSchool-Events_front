import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        eventosActivos: 12,
        estudiantes: 450,
        proximos: 3,
        mensajes: 5
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard/stats'); // Cambiar por tu endpoint real
            if (response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error("Error cargando estadísticas del dashboard", error);
            // Usamos datos dummy si falla para que la vista no se rompa (opcional)
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout
            title="Hola 👋"
            subtitle="Aquí tienes el resumen de tus actividades escolares."
        >
            {/* Stats Widgets */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon icon-blue">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{loading ? '...' : stats.eventosActivos}</h3>
                        <p>Eventos Activos</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon icon-green">
                        <i className="fas fa-user-graduate"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{loading ? '...' : stats.estudiantes}</h3>
                        <p>Estudiantes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon icon-orange">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{loading ? '...' : stats.proximos}</h3>
                        <p>Próximos (7 días)</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon icon-purple">
                        <i className="fas fa-comment-dots"></i>
                    </div>
                    <div className="stat-info">
                        <h3>{loading ? '...' : stats.mensajes}</h3>
                        <p>Nuevos Mensajes</p>
                    </div>
                </div>
            </div>

            {/* Content Split: Calendar vs Upcoming List */}
            <div className="content-split">
                {/* Left: Calendar */}
                <div className="card-box">
                    <div className="card-header">
                        <h3 className="card-title">Calendario Académico</h3>
                        <button className="button is-small is-light">Ver Completo</button>
                    </div>
                    <div className="calendar-container">
                        {/* Placeholder for Calendar */}
                        <iframe
                            title="Google Calendar"
                            src="https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York"
                            scrolling="no"
                            frameBorder="0"
                        ></iframe>
                    </div>
                </div>

                {/* Right: Upcoming Events */}
                <div className="card-box">
                    <div className="card-header">
                        <h3 className="card-title">Próximos Eventos</h3>
                        <button className="button is-small is-primary is-light"><i className="fas fa-plus"></i></button>
                    </div>

                    <div className="events-list">
                        <div className="event-item">
                            <div className="event-date-badge">
                                <span className="event-day">01</span>
                                <span className="event-month">SEP</span>
                            </div>
                            <div className="event-details">
                                <h4>Feria de Ciencia</h4>
                                <p>Auditorio Principal</p>
                            </div>
                            <span className="tag-category">Académico</span>
                        </div>

                        <div className="event-item">
                            <div className="event-date-badge">
                                <span className="event-day">05</span>
                                <span className="event-month">SEP</span>
                            </div>
                            <div className="event-details">
                                <h4>Banda Escolar</h4>
                                <p>Patio Central</p>
                            </div>
                            <span className="tag-category">Cultural</span>
                        </div>

                        <div className="event-item">
                            <div className="event-date-badge">
                                <span className="event-day">15</span>
                                <span className="event-month">SEP</span>
                            </div>
                            <div className="event-details">
                                <h4>Simulacro ICFES</h4>
                                <p>Aulas 101-105</p>
                            </div>
                            <span className="tag-category">Examen</span>
                        </div>

                        <div className="event-item">
                            <div className="event-date-badge">
                                <span className="event-day">20</span>
                                <span className="event-month">OCT</span>
                            </div>
                            <div className="event-details">
                                <h4>Torneo Deportivo</h4>
                                <p>Canchas Múltiples</p>
                            </div>
                            <span className="tag-category">Deporte</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;

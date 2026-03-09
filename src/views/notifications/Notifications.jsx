import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notificaciones'); // Basado en ERD
            if (response.data && response.data.length > 0) {
                setNotifications(response.data);
            } else {
                setDummyData();
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setDummyData();
        } finally {
            setLoading(false);
        }
    };

    const setDummyData = () => {
        setNotifications([
            { id: 1, tipo: 'success', titulo: 'Evento Aprobado', mensaje: 'Feria de Ciencias ha sido aprobada por coordinación.', fecha_creacion: 'Hace 2 horas' },
            { id: 2, tipo: 'warning', titulo: 'Recordatorio', mensaje: 'Debes presentar el informe mensual mañana.', fecha_creacion: 'Ayer' },
            { id: 3, tipo: 'info', titulo: 'Nuevo Recurso', mensaje: 'El Salón Múltiple 2 ahora está disponible para reservas.', fecha_creacion: 'Hace 3 días' },
            { id: 4, tipo: 'danger', titulo: 'Rechazo de solicitud', mensaje: 'La solicitud de Bus Escolar #2 no pudo ser tramitada.', fecha_creacion: '1 Semana' }
        ]);
    };

    const getIconClass = (tipo) => {
        switch (tipo?.toLowerCase()) {
            case 'success': return 'fa-check';
            case 'warning': return 'fa-exclamation-triangle';
            case 'danger': return 'fa-times';
            default: return 'fa-info';
        }
    };

    return (
        <DashboardLayout
            title="Centro de Notificaciones"
            subtitle="Revisa alertas importantes, respuestas a tus solicitudes y avisos del sistema."
        >
            {loading ? (
                <div className="has-text-centered my-6 py-6">
                    <div className="loader is-loading is-size-1 mx-auto" style={{ height: '3rem', width: '3rem' }}></div>
                    <p className="mt-3">Cargando notificaciones...</p>
                </div>
            ) : (
                <div className="notification-list mt-4" style={{ maxWidth: '800px' }}>
                    {notifications.map(notif => (
                        <div className={`notification-item type-${notif.tipo || 'info'}`} key={notif.id}>
                            <div className={`notif-icon ${notif.tipo || 'info'}`}>
                                <i className={`fas ${getIconClass(notif.tipo)}`}></i>
                            </div>
                            <div className="notif-content">
                                <h4 className="notif-title">{notif.titulo}</h4>
                                <p className="notif-message">{notif.mensaje}</p>
                            </div>
                            <div className="notif-date">{notif.fecha_creacion}</div>
                        </div>
                    ))}

                    {notifications.length === 0 && (
                        <p className="has-text-centered has-text-grey py-6">No tienes nuevas notificaciones en este momento.</p>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

export default Notifications;

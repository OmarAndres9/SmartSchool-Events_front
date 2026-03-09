import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h1 className="brand-title">
                    <i className="fas fa-graduation-cap"></i> SmartSchool
                </h1>
            </div>

            <div className="sidebar-menu">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
                >
                    <i className="fas fa-calendar-alt"></i> Agenda Escolar
                </NavLink>

                <NavLink
                    to="/events"
                    className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
                >
                    <i className="fas fa-ticket-alt"></i> Mis Eventos
                </NavLink>

                <NavLink
                    to="/users"
                    className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
                >
                    <i className="fas fa-users"></i> Usuarios
                </NavLink>

                <NavLink
                    to="/notifications"
                    className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
                >
                    <i className="fas fa-bell"></i> Notificaciones
                </NavLink>

                <NavLink
                    to="/logistics"
                    className={({ isActive }) => (isActive ? 'menu-link active' : 'menu-link')}
                >
                    <i className="fas fa-boxes"></i> Logística
                </NavLink>

                <div className="sidebar-section-title">ACCIONES RÁPIDAS</div>
                <a href="#" className="menu-link">
                    <i className="fas fa-plus-circle"></i> Nuevo Evento
                </a>
                <a href="#" className="menu-link">
                    <i className="fas fa-file-export"></i> Reportes
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;

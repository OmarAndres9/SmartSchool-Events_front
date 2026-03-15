/**
 * components/layout/Sidebar.jsx
 * Barra lateral con soporte responsivo completo.
 * En móvil: oculta por defecto, se abre con botón hamburguesa en TopNav.
 */

import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: '📅', label: 'Agenda Escolar' },
  { to: '/mis-eventos',  icon: '🎟️', label: 'Mis Eventos' },
  { to: '/events',       icon: '➕', label: 'Crear Evento' },
  { to: '/users',        icon: '👥', label: 'Usuarios' },
  { to: '/notifications',icon: '🔔', label: 'Notificaciones' },
  { to: '/logistics',    icon: '📦', label: 'Logística' },
  { to: '/reports',      icon: '📊', label: 'Reportes' },
  { to: '/settings',     icon: '⚙️', label: 'Configuración' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    onClose?.();
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bloquear scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleLogout = async () => {
    try { await authService.logout(); } catch {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <>
      {/* Overlay oscuro detrás del sidebar en móvil */}
      {isOpen && (
        <div
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* ─── Logo ─── */}
        <div className={styles.header}>
          <span className={styles.logo}>🎓</span>
          <h1 className={styles.brandName}>SmartSchool</h1>
          <p className={styles.brandSub}>Gestión de Eventos</p>
        </div>

        {/* ─── Botón cerrar (visible solo en móvil) ─── */}
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Cerrar menú"
        >
          ✕
        </button>

        {/* ─── Navegación ─── */}
        <nav className={styles.nav} aria-label="Menú principal">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon} aria-hidden="true">{icon}</span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ─── Pie ─── */}
        <div className={styles.footer}>
          {user && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className={styles.userMeta}>
                <p className={styles.userName}>{user.name || 'Usuario'}</p>
                <p className={styles.userRole}>{user.role || 'Rol'}</p>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

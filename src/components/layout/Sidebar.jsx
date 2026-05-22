/**
 * components/layout/Sidebar.jsx
 * Sidebar con íconos SVG ilustrativos estilo iOS/app-icon.
 */

import React, { useEffect } from 'react';
import { GraduationCap, LogOut, X, CalendarDays, CalendarRange, Map, Bell, CalendarCheck, BarChart, Users, UserCircle, CalendarClock, ClipboardList } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import styles from './Sidebar.module.css';

/* ─── Íconos SVG inline ────────────────────────────────────── */

const IconCalendario = () => <CalendarDays size={24} />;
const IconEventos    = () => <CalendarRange size={24} />;
const IconMapa       = () => <Map size={24} />;
const IconAnuncios   = () => <Bell size={24} />;
const IconMisEventos = () => <CalendarCheck size={24} />;
const IconFotos      = () => <BarChart size={24} />;
const IconPerfil     = () => <Users size={24} />;
const IconEntradas   = () => <UserCircle size={24} />;

/* ─── Mapa de ítems de navegación ──────────────────────────── */
const NAV_ITEMS = [
  { to: '/dashboard',                Icon: IconCalendario, label: 'Calendario',       roles: ['admin', 'organizador', 'docente', 'directivo'] },
  { to: '/estudiante/dashboard',     Icon: IconCalendario, label: 'Dashboard',       roles: ['estudiante'] },
  { to: '/estudiante/notas',         Icon: ClipboardList,  label: 'Notas',            roles: ['estudiante'] },
  { to: '/estudiante/eventos',       Icon: IconEventos,    label: 'Eventos',          roles: ['estudiante'] },
  { to: '/representante/dashboard',  Icon: IconCalendario, label: 'Dashboard',       roles: ['representante', 'acudiente'] },
  { to: '/representante/notas',      Icon: ClipboardList,  label: 'Notas',            roles: ['representante', 'acudiente'] },
  { to: '/citas',                    Icon: CalendarClock,  label: 'Citas',            roles: ['representante', 'acudiente', 'docente', 'directivo'] },
  { to: '/events',                   Icon: IconEventos,    label: 'Eventos',          roles: ['admin', 'organizador'] },
  { to: '/logistics',                Icon: IconMapa,       label: 'Logística',        roles: ['admin', 'organizador'] },
  { to: '/notifications',            Icon: IconAnuncios,   label: 'Anuncios',         roles: null },
  { to: '/mis-eventos',              Icon: IconMisEventos, label: 'Mis Eventos',      roles: ['admin', 'organizador', 'docente', 'directivo'] },
  { to: '/reports',                  Icon: IconFotos,      label: 'Reportes',         roles: ['admin', 'organizador'] },
  { to: '/users',                    Icon: IconPerfil,     label: 'Usuarios',         roles: ['admin'] },
  { to: '/settings',                 Icon: IconEntradas,   label: 'Perfil',           roles: null },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { onClose?.(); }, [location.pathname]);

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
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Logo */}
        <div className={styles.header}>
          <GraduationCap className={styles.logo} size={32} />
          <h1 className={styles.brandName}>SmartSchool</h1>
          <p className={styles.brandSub}>Gestión de Eventos</p>
        </div>

        {/* Botón cerrar móvil */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú"><X size={20} /></button>

        {/* Navegación */}
        <nav className={styles.nav} aria-label="Menú principal">
          {NAV_ITEMS.filter(({ roles }) => {
            if (!roles) return true; // visible para todos
            const rolRaw = user?.roles?.[0];
            const rol = (typeof rolRaw === 'string' ? rolRaw : rolRaw?.name || '').toLowerCase();
            return roles.includes(rol);
          }).map(({ to, Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon} aria-hidden="true">
                <Icon />
              </span>
              <span className={styles.navLabel}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          {user && (() => {
            const rolRaw = user?.roles?.[0];
            const rol = typeof rolRaw === 'string' ? rolRaw : rolRaw?.name || '';
            const rolLabel = rol ? rol.charAt(0).toUpperCase() + rol.slice(1) : 'Usuario';
            return (
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={styles.userMeta}>
                  <p className={styles.userName}>{user.name || 'Usuario'}</p>
                  <p className={styles.userRole}>{rolLabel}</p>
                </div>
              </div>
            );
          })()}
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} style={{marginRight: '8px'}} /> Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

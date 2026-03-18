/**
 * components/layout/Sidebar.jsx
 * Sidebar con íconos SVG ilustrativos estilo iOS/app-icon.
 */

import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import styles from './Sidebar.module.css';

/* ─── Íconos SVG inline ────────────────────────────────────── */

const IconCalendario = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="9" fill="#3FA9F5"/>
    <rect x="7" y="13" width="26" height="20" rx="3" fill="white"/>
    <rect x="7" y="13" width="26" height="7" rx="3" fill="#1976D2"/>
    <rect x="7" y="17" width="26" height="3" fill="#1976D2"/>
    <rect x="13" y="6" width="3" height="8" rx="1.5" fill="white"/>
    <rect x="24" y="6" width="3" height="8" rx="1.5" fill="white"/>
    <rect x="10" y="24" width="4" height="4" rx="1" fill="#3FA9F5"/>
    <rect x="18" y="24" width="4" height="4" rx="1" fill="#3FA9F5"/>
    <rect x="26" y="24" width="4" height="4" rx="1" fill="#3FA9F5"/>
    <circle cx="28" cy="28" r="6" fill="#FFB300"/>
    <path d="M25 28l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const IconEventos = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="9" fill="#4CAF50"/>
    <rect x="8" y="9" width="22" height="26" rx="3" fill="white"/>
    <rect x="8" y="9" width="22" height="7" rx="3" fill="#388E3C"/>
    <rect x="8" y="13" width="22" height="3" fill="#388E3C"/>
    <rect x="13" y="5" width="2.5" height="6" rx="1.2" fill="white"/>
    <rect x="24.5" y="5" width="2.5" height="6" rx="1.2" fill="white"/>
    <line x1="11" y1="21" x2="27" y2="21" stroke="#C8E6C9" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="11" y1="24.5" x2="22" y2="24.5" stroke="#C8E6C9" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="11" y1="28" x2="24" y2="28" stroke="#C8E6C9" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="26" cy="27" r="5" fill="#FF6F00"/>
    <rect x="25.2" y="24" width="1.6" height="3.4" rx="0.8" fill="white"/>
    <rect x="24" y="27.4" width="4" height="1.6" rx="0.8" fill="white"/>
  </svg>
);

const IconMapa = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="9" fill="#f0f4f8"/>
    <rect x="4" y="4" width="32" height="32" rx="7" fill="#c8e6c9"/>
    <rect x="4" y="24" width="32" height="12" rx="0" fill="#a5d6a7"/>
    <rect x="4" y="30" width="32" height="6" rx="0" fill="#81c784" style={{borderBottomLeftRadius:7,borderBottomRightRadius:7}}/>
    <path d="M12 32 Q18 26 28 32" stroke="#388E3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <rect x="16" y="20" width="10" height="7" rx="1.5" fill="#5C6BC0"/>
    <rect x="17.5" y="21.5" width="2.5" height="2.5" rx="0.5" fill="#E8EAF6"/>
    <rect x="21" y="21.5" width="2.5" height="2.5" rx="0.5" fill="#E8EAF6"/>
    <rect x="19" y="23.5" width="3.5" height="3.5" rx="0" fill="#5C6BC0"/>
    <path d="M21 20 L21 18 Q21 13 23 13 Q26 13 26 16 Q26 19 21 23 Q16 19 16 16 Q16 13 19 13 Q21 13 21 18Z" fill="#E53935"/>
    <circle cx="21" cy="16" r="1.8" fill="white"/>
    <circle cx="21" cy="16" r="0.9" fill="#E53935"/>
  </svg>
);

const IconAnuncios = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="9" fill="#f5f5f5"/>
    <path d="M8 14 L26 10 L26 28 L8 24 Z" fill="#FF7043"/>
    <path d="M26 12 Q32 16 32 19 Q32 22 26 26 Z" fill="#FF7043"/>
    <rect x="5" y="14" width="6" height="10" rx="2" fill="#FF7043"/>
    <rect x="9" y="24" width="4" height="5" rx="1.5" fill="#BF360C"/>
    <rect x="26" y="17" width="6" height="4" rx="1" fill="#FFA726"/>
    <rect x="30" y="16" width="2" height="6" rx="1" fill="#FFA726"/>
    <rect x="18" y="6" width="7" height="7" rx="3.5" fill="#1565C0"/>
    <text x="21.5" y="12" textAnchor="middle" fontSize="5" fontWeight="bold" fill="white">N</text>
    <path d="M24 9 L27 7 L28 10Z" fill="#1565C0"/>
    <path d="M24 11 L28 12 L26 14Z" fill="#4CAF50"/>
    <path d="M22 12.5 L24 16 L20 15Z" fill="#FFA726"/>
  </svg>
);

const IconAvisos = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="9" fill="#FFFDE7"/>
    <path d="M20 8 C12 8 10 16 10 20 L10 26 L8 28 L32 28 L30 26 L30 20 C30 16 28 8 20 8 Z" fill="#FFB300"/>
    <path d="M20 8 C15 8 13 12 12 16 L12 26 L10 28 L32 28 L30 26 L30 16 C29 12 25 8 20 8 Z" fill="#FFC107"/>
    <ellipse cx="20" cy="28" rx="5" ry="2.5" fill="#FFB300"/>
    <rect x="18.5" y="28" width="3" height="4" rx="1.5" fill="#F57F17"/>
    <circle cx="30" cy="12" r="6" fill="#E53935"/>
    <text x="30" y="15" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">!</text>
    <path d="M12 14 Q9 14 8 16 Q7 18 9 19" stroke="#FFE082" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    <path d="M11 12 Q8 11 7 13 Q6 15 8 16" stroke="#FFE082" strokeWidth="1" fill="none" strokeLinecap="round"/>
  </svg>
);

const IconFotos = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="9" fill="#4CAF50"/>
    <rect x="7" y="13" width="26" height="19" rx="3" fill="white"/>
    <path d="M7 26 L7 29 Q7 32 10 32 L30 32 Q33 32 33 29 L33 26 Z" fill="#E8F5E9"/>
    <circle cx="20" cy="22" r="5.5" fill="none" stroke="#4CAF50" strokeWidth="1.5"/>
    <circle cx="20" cy="22" r="3" fill="#4CAF50"/>
    <rect x="14" y="10" width="5" height="5" rx="2" fill="white"/>
    <path d="M14 12 L12 12 Q10 12 10 14 L10 13 Q10 11 12 11 L14 11 Z" fill="white"/>
    <circle cx="28" cy="17" r="1.5" fill="#B2DFDB"/>
    <rect x="8" y="18" width="7" height="7" rx="2" fill="#FFCCBC" opacity="0.9"/>
    <rect x="12" y="15" width="9" height="8" rx="2" fill="#FFF9C4" opacity="0.85" transform="rotate(-8 16 19)"/>
    <rect x="20" y="16" width="9" height="7" rx="2" fill="#C8E6C9" opacity="0.9" transform="rotate(6 24 19)"/>
  </svg>
);

const IconPerfil = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="9" fill="#f9f9f9"/>
    <circle cx="20" cy="17" r="8" fill="#64B5F6"/>
    <circle cx="20" cy="14" r="4.5" fill="#FFF3E0"/>
    <path d="M12 25 Q14 20 20 20 Q26 20 28 25 Q30 28 30 32 L10 32 Q10 28 12 25Z" fill="#64B5F6"/>
    <rect x="15" y="30" width="10" height="5" rx="0" fill="#64B5F6"/>
    <path d="M12 25 Q14 20 20 20 Q26 20 28 25 Q30 28 30 32 L10 32 Q10 28 12 25Z" fill="#64B5F6"/>
    <circle cx="28" cy="28" r="7" fill="#546E7A"/>
    <circle cx="28" cy="28" r="5.5" fill="#78909C"/>
    <circle cx="28" cy="28" r="3" fill="#546E7A"/>
    <circle cx="28" cy="24.5" r="1.2" fill="#B0BEC5"/>
    <circle cx="28" cy="31.5" r="1.2" fill="#B0BEC5"/>
    <circle cx="24.5" cy="28" r="1.2" fill="#B0BEC5"/>
    <circle cx="31.5" cy="28" r="1.2" fill="#B0BEC5"/>
    <circle cx="25.5" cy="25.5" r="1" fill="#B0BEC5"/>
    <circle cx="30.5" cy="30.5" r="1" fill="#B0BEC5"/>
    <circle cx="30.5" cy="25.5" r="1" fill="#B0BEC5"/>
    <circle cx="25.5" cy="30.5" r="1" fill="#B0BEC5"/>
  </svg>
);

const IconEntradas = () => (
  <svg viewBox="0 0 40 40" width="26" height="26" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="36" height="36" rx="9" fill="#E3F2FD"/>
    <rect x="5" y="13" width="30" height="16" rx="3" fill="#1976D2"/>
    <rect x="5" y="13" width="30" height="16" rx="3" fill="url(#ticketGrad)"/>
    <defs>
      <linearGradient id="ticketGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#1565C0"/>
        <stop offset="100%" stopColor="#1E88E5"/>
      </linearGradient>
    </defs>
    <circle cx="5" cy="21" r="3" fill="#E3F2FD"/>
    <circle cx="35" cy="21" r="3" fill="#E3F2FD"/>
    <line x1="18" y1="14" x2="18" y2="28" stroke="#1565C0" strokeWidth="1.5" strokeDasharray="2 1.5"/>
    <rect x="20" y="15" width="12" height="12" rx="2" fill="#FFF8E1" opacity="0.15"/>
    <line x1="8" y1="18" x2="15" y2="18" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="8" y1="21" x2="15" y2="21" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    <line x1="8" y1="24" x2="13" y2="24" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="29" cy="19" r="4" fill="#FFB300"/>
    <path d="M27.5 19l1.2 1.2 2.5-2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <text x="29" y="26.5" textAnchor="middle" fontSize="4.5" fontWeight="bold" fill="#FFF9C4">TICKET</text>
  </svg>
);

/* ─── Mapa de ítems de navegación ──────────────────────────── */
const NAV_ITEMS = [
  { to: '/dashboard',     Icon: IconCalendario, label: 'Calendario',       roles: null },
  { to: '/events',        Icon: IconEventos,    label: 'Eventos',          roles: ['admin', 'organizador'] },
  { to: '/logistics',     Icon: IconMapa,       label: 'Logística',        roles: ['admin', 'organizador'] },
  { to: '/notifications', Icon: IconAnuncios,   label: 'Anuncios',         roles: null },
  { to: '/mis-eventos',   Icon: IconAvisos,     label: 'Avisos',           roles: null },
  { to: '/reports',       Icon: IconFotos,      label: 'Reportes',         roles: ['admin', 'organizador'] },
  { to: '/users',         Icon: IconPerfil,     label: 'Usuarios',         roles: ['admin'] },
  { to: '/settings',      Icon: IconEntradas,   label: 'Entradas / Config',roles: null },
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
          <span className={styles.logo}>🎓</span>
          <h1 className={styles.brandName}>SmartSchool</h1>
          <p className={styles.brandSub}>Gestión de Eventos</p>
        </div>

        {/* Botón cerrar móvil */}
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar menú">✕</button>

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
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

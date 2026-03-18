/**
 * components/layout/TopNav.jsx
 * Barra superior — nombre arriba, rol abajo en el avatar.
 */

import React from 'react';
import useAuth from '../../hooks/useAuth';
import styles from './TopNav.module.css';

const TopNav = ({ title, subtitle, onMenuToggle }) => {
  const { user } = useAuth();

  // Extraer rol del usuario (Spatie devuelve roles como array de strings o de objetos)
  const rolRaw = user?.roles?.[0];
  const rol = typeof rolRaw === 'string' ? rolRaw : rolRaw?.name || '';
  const rolLabel = rol ? rol.charAt(0).toUpperCase() + rol.slice(1) : 'Usuario';

  return (
    <header className={styles.topNav}>
      <div className={styles.left}>
        <button
          className={styles.menuBtn}
          onClick={onMenuToggle}
          aria-label="Abrir menú"
        >
          <span className={styles.hamburger} />
          <span className={styles.hamburger} />
          <span className={styles.hamburger} />
        </button>

        <div className={styles.titleBlock}>
          <h2 className={styles.pageTitle}>{title}</h2>
          {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
        </div>
      </div>

      <div className={styles.actions}>
        {/* Nombre arriba — Rol abajo */}
        <div className={styles.userBlock}>
          <span className={styles.greeting}>
            <strong>{user?.name?.split(' ')[0] || 'Usuario'}</strong>
          </span>
          <span className={styles.rolLabel}>{rolLabel}</span>
        </div>
        <div className={styles.avatar} aria-hidden="true">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default TopNav;

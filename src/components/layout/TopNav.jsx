/**
 * components/layout/TopNav.jsx
 * Barra superior con botón hamburguesa para móvil.
 */

import React from 'react';
import useAuth from '../../hooks/useAuth';
import styles from './TopNav.module.css';

const TopNav = ({ title, subtitle, onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className={styles.topNav}>
      <div className={styles.left}>
        {/* Botón hamburguesa — solo visible en móvil */}
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
        <span className={styles.greeting}>
          Hola, <strong>{user?.name?.split(' ')[0] || 'Usuario'}</strong>
        </span>
        <div className={styles.avatar} aria-hidden="true">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default TopNav;

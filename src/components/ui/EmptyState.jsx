/**
 * components/ui/EmptyState.jsx
 * Pantalla vacía reutilizable cuando no hay datos.
 */

import React from 'react';
import styles from './EmptyState.module.css';

const EmptyState = ({ icon = '📭', title = 'Sin resultados', description, action }) => (
  <div className={styles.container}>
    <span className={styles.icon}>{icon}</span>
    <h3 className={styles.title}>{title}</h3>
    {description && <p className={styles.description}>{description}</p>}
    {action && (
      <button className={styles.actionBtn} onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;

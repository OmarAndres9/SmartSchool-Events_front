/**
 * components/ui/EmptyState.jsx
 * Pantalla vacía reutilizable cuando no hay datos.
 */

import React from 'react';
import { Inbox } from 'lucide-react';
import styles from './EmptyState.module.css';

const EmptyState = ({ icon = <Inbox size={48} />, title = 'Sin resultados', description, action }) => (
  <div className={styles.container}>
    <div className={styles.icon}>{icon}</div>
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

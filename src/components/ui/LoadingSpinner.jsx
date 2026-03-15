/**
 * components/ui/LoadingSpinner.jsx
 * Indicador de carga reutilizable.
 */

import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Cargando...' }) => (
  <div className={styles.container} role="status" aria-label={message}>
    <div className={styles.spinner} />
    <p className={styles.text}>{message}</p>
  </div>
);

export default LoadingSpinner;

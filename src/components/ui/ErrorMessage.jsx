/**
 * components/ui/ErrorMessage.jsx
 * Mensaje de error reutilizable con opción de reintentar.
 */

import React from 'react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ message, onRetry }) => (
  <div className={styles.container} role="alert">
    <span className={styles.icon}>⚠️</span>
    <p className={styles.text}>{message || 'Ocurrió un error inesperado.'}</p>
    {onRetry && (
      <button className={styles.retryBtn} onClick={onRetry}>
        Reintentar
      </button>
    )}
  </div>
);

export default ErrorMessage;

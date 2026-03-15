/**
 * components/ui/Badge.jsx
 * Componente reutilizable para mostrar estados y tipos de eventos.
 */

import React from 'react';
import styles from './Badge.module.css';

/** Mapeo de valores a clases CSS */
const TIPO_MAP = {
  academico:  'academico',
  cultural:   'cultural',
  deportivo:  'deportivo',
  recreativo: 'recreativo',
  examen:     'examen',
};

const ESTADO_MAP = {
  activo:     'activo',
  pendiente:  'pendiente',
  cancelado:  'cancelado',
  finalizado: 'finalizado',
};

const Badge = ({ label, variant = 'default', tipo, estado }) => {
  let cls = styles.badge;

  if (tipo) {
    const key = tipo.toLowerCase();
    cls += ` ${styles[TIPO_MAP[key] || 'default']}`;
  } else if (estado) {
    const key = estado.toLowerCase();
    cls += ` ${styles[ESTADO_MAP[key] || 'default']}`;
  } else {
    cls += ` ${styles[variant]}`;
  }

  return <span className={cls}>{label || tipo || estado}</span>;
};

export default Badge;

/**
 * utils/dateUtils.js
 * Utilidades para formateo de fechas en español.
 */

/**
 * Formatea una fecha ISO a formato legible largo.
 * Ej: "01 de septiembre de 2025, 10:00"
 * @param {string} isoString
 * @returns {string}
 */
export const formatDate = (isoString) => {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

/**
 * Formatea una fecha ISO a formato corto.
 * Ej: "01 sep 2025"
 * @param {string} isoString
 * @returns {string}
 */
export const formatDateShort = (isoString) => {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

/**
 * Retorna solo la hora en formato HH:mm.
 * @param {string} isoString
 * @returns {string}
 */
export const formatTime = (isoString) => {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
};

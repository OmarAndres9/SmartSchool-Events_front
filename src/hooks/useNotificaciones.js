/**
 * hooks/useNotificaciones.js
 * Carga notificaciones desde el backend.
 *
 * Uso:
 *   const { notificaciones, loading, error, refetch } = useNotificaciones();
 */

import { useMemo } from 'react';
import useFetch from './useFetch';
import notificacionesService from '../services/notificacionesService';

const useNotificaciones = () => {
  const { data, loading, error, refetch } = useFetch(
    () => notificacionesService.getAll()
  );

  const notificaciones = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  return { notificaciones, loading, error, refetch };
};

export default useNotificaciones;

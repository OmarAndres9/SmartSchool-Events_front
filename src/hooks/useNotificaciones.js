import { useMemo } from 'react';
import useFetch from './useFetch';
import notificacionesService from '../services/notificacionesService';

const useNotificaciones = () => {
  const { data, loading, error, refetch } = useFetch(
    () => notificacionesService.getAll(),
    [],
    { cacheKey: 'notificaciones', ttl: 30_000 }
  );

  const notificaciones = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  return { notificaciones, loading, error, refetch };
};

export default useNotificaciones;

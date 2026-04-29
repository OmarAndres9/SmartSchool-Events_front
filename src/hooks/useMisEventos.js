import { useMemo } from 'react';
import useFetch from './useFetch';
import eventosService from '../services/eventosService';

const useMisEventos = () => {
  const { data, loading, error, refetch } = useFetch(
    () => eventosService.getMisEventos(),
    [],
    { cacheKey: 'mis-eventos', ttl: 30_000 }
  );

  const eventos = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  return { eventos, loading, error, refetch };
};

export default useMisEventos;

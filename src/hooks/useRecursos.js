import { useMemo } from 'react';
import useFetch from './useFetch';
import recursosService from '../services/recursosService';

const useRecursos = () => {
  const { data, loading, error, refetch } = useFetch(
    () => recursosService.getAll(),
    [],
    { cacheKey: 'recursos', ttl: 30_000 }
  );

  const recursos = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  return { recursos, loading, error, refetch };
};

export default useRecursos;

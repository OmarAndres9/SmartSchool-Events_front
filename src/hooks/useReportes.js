import { useMemo } from 'react';
import useFetch from './useFetch';
import reportesService from '../services/reportesService';

const useReportes = (filtros = {}) => {
  const filtrosKey = JSON.stringify(filtros);

  const { data, loading, error, refetch } = useFetch(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => reportesService.getAll(filtros),
    [filtrosKey],
    { cacheKey: `reportes:${filtrosKey}`, ttl: 30_000 }
  );

  const reportes = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  return { reportes, loading, error, refetch };
};

export default useReportes;

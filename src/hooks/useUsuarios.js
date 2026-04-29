import { useMemo } from 'react';
import useFetch from './useFetch';
import usuariosService from '../services/usuariosService';

const useUsuarios = (params = {}) => {
  const paramKey = JSON.stringify(params);

  const { data, loading, error, refetch } = useFetch(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => usuariosService.getAll(params),
    [paramKey],
    { cacheKey: `usuarios:${paramKey}`, ttl: 30_000 }
  );

  const usuarios = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  return { usuarios, loading, error, refetch };
};

export default useUsuarios;

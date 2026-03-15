/**
 * hooks/useUsuarios.js
 * Carga usuarios desde el backend.
 *
 * Uso:
 *   const { usuarios, loading, error, refetch } = useUsuarios();
 */

import { useMemo } from 'react';
import useFetch from './useFetch';
import usuariosService from '../services/usuariosService';

const useUsuarios = (params = {}) => {
  const paramKey = JSON.stringify(params);

  const { data, loading, error, refetch } = useFetch(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => usuariosService.getAll(params),
    [paramKey]
  );

  const usuarios = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  return { usuarios, loading, error, refetch };
};

export default useUsuarios;

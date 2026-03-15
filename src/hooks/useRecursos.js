/**
 * hooks/useRecursos.js
 * Carga recursos (logística) desde el backend.
 *
 * Uso:
 *   const { recursos, loading, error, refetch } = useRecursos();
 */

import { useMemo } from 'react';
import useFetch from './useFetch';
import recursosService from '../services/recursosService';

const useRecursos = () => {
  const { data, loading, error, refetch } = useFetch(
    () => recursosService.getAll()
  );

  const recursos = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  return { recursos, loading, error, refetch };
};

export default useRecursos;

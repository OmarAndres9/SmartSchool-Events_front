/**
 * hooks/useReportes.js
 * Carga reportes desde el backend con filtros opcionales.
 *
 * Uso:
 *   const { reportes, loading, error, refetch } = useReportes();
 *   const { reportes } = useReportes({ tipo: 'Academico', estado: 'activo' });
 */

import { useMemo } from 'react';
import useFetch from './useFetch';
import reportesService from '../services/reportesService';

const useReportes = (filtros = {}) => {
  const filtrosKey = JSON.stringify(filtros);

  const { data, loading, error, refetch } = useFetch(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => reportesService.getAll(filtros),
    [filtrosKey]
  );

  const reportes = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  return { reportes, loading, error, refetch };
};

export default useReportes;

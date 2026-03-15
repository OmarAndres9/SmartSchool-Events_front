/**
 * hooks/useEventos.js
 * Carga eventos desde el backend con filtros opcionales reactivos.
 *
 * Uso básico:
 *   const { eventos, loading, error, refetch } = useEventos();
 *
 * Con filtros reactivos:
 *   const { eventos } = useEventos({ tipo: 'Cultural' });
 *   // se recarga automáticamente cuando cambia el filtro
 */

import { useMemo } from 'react';
import useFetch from './useFetch';
import eventosService from '../services/eventosService';

const useEventos = (params = {}) => {
  // Serializar params para usarlos como dependencia estable
  const paramKey = JSON.stringify(params);

  const { data, loading, error, refetch } = useFetch(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => eventosService.getAll(params),
    [paramKey]
  );

  const eventos = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  return { eventos, loading, error, refetch };
};

export default useEventos;

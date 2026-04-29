/**
 * hooks/useFetch.js
 * Hook genérico para llamadas asíncronas con:
 *  - IN-FLIGHT DEDUPLICATION: dos componentes que montan al mismo tiempo
 *    con la misma cacheKey comparten una única petición HTTP.
 *  - RESULT CACHE con TTL: resultado reutilizado en navegaciones repetidas.
 *  - CLEANUP: no actualiza estado si el componente se desmontó.
 *
 * Uso básico (sin caché):
 *   const { data, loading, error, refetch } = useFetch(() => eventosService.getAll());
 *
 * Uso con caché (recomendado para listados):
 *   const { data, loading, error, refetch } = useFetch(
 *     () => eventosService.getAll(),
 *     [],
 *     { cacheKey: 'eventos:{}', ttl: 30_000 }
 *   );
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedFetch, invalidateCache } from '../services/requestCache';

const useFetch = (fetchFn, deps = [], { cacheKey = null, ttl = 30_000 } = {}) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const execute = useCallback(async (forceInvalidate = false) => {
    if (mounted.current) { setLoading(true); setError(null); }

    try {
      let result;

      if (cacheKey) {
        if (forceInvalidate) invalidateCache(cacheKey);
        result = await cachedFetch(cacheKey, fetchFn, ttl);
      } else {
        // Sin cacheKey: petición directa, sin caché ni deduplicación
        const response = await fetchFn();
        const payload  = response.data;
        const normalized =
          Array.isArray(payload)       ? payload :
          Array.isArray(payload?.data) ? payload.data :
          payload;
        result = { data: normalized };
      }

      if (mounted.current) setData(result.data);
    } catch (err) {
      if (mounted.current) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Error inesperado. Intenta de nuevo.'
        );
        setData(null);
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  const refetch = useCallback(() => execute(true), [execute]);

  return { data, loading, error, refetch };
};

export default useFetch;

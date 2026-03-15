/**
 * hooks/useFetch.js
 * Hook genérico para llamadas asíncronas.
 * Maneja: loading · error · data · refetch
 *
 * Uso:
 *   const { data, loading, error, refetch } =
 *     useFetch(() => eventosService.getAll());
 *
 * Para pasar parámetros reactivos usa deps:
 *   const { data } = useFetch(() => eventosService.getAll({ tipo }), [tipo]);
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Normaliza la respuesta de Laravel:
 *   { data: [...] }  →  [...]   (paginación / resource collection)
 *   [...]            →  [...]   (array directo)
 *   objeto            →  objeto  (recurso individual)
 */
const normalize = (payload) => {
  if (payload == null) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return payload;
};

const useFetch = (fetchFn, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      setData(normalize(response.data));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error inesperado. Intenta de nuevo.';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

export default useFetch;

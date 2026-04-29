/**
 * services/requestCache.js
 * Cache singleton con dos capas:
 *
 * 1. IN-FLIGHT DEDUPLICATION: si ya hay una petición en curso para una clave,
 *    todos los callers reciben la misma Promise en vez de lanzar otra.
 *    Esto elimina el doble-fetch que ocurre cuando React 18 StrictMode monta
 *    el componente dos veces, o cuando dos hooks usan el mismo endpoint al mismo tiempo.
 *
 * 2. RESULT CACHE con TTL: una vez resuelta, el resultado se guarda por `ttl` ms.
 *    Navegar hacia atrás o remontar el componente devuelve datos en <1 ms.
 */

// Resultado cacheado: key → { data, ts }
const resultCache = new Map();

// Peticiones en vuelo: key → Promise
const inFlight = new Map();

/**
 * @param {string}   key      - Clave única para esta petición (ej: "eventos:{}")
 * @param {Function} fetcher  - Función que devuelve una Promise con la respuesta axios
 * @param {number}   ttl      - Tiempo de vida del resultado en ms (default: 30 000)
 * @returns {Promise}         - Promesa que resuelve con response.data normalizado
 */
export async function cachedFetch(key, fetcher, ttl = 30_000) {
  // 1. ¿Hay resultado fresco en caché?
  const cached = resultCache.get(key);
  if (cached && Date.now() - cached.ts < ttl) {
    return { data: cached.data, fromCache: true };
  }

  // 2. ¿Hay una petición en vuelo para esta clave? Unirse a ella.
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  // 3. Lanzar nueva petición y registrarla como en vuelo.
  const promise = fetcher()
    .then((response) => {
      const normalized = normalize(response.data);
      resultCache.set(key, { data: normalized, ts: Date.now() });
      inFlight.delete(key);
      return { data: normalized, fromCache: false };
    })
    .catch((err) => {
      inFlight.delete(key);
      throw err;
    });

  inFlight.set(key, promise);
  return promise;
}

/**
 * Invalida una clave específica o todas las que empiecen con un prefijo.
 * Llamar en create/update/delete para forzar refetch.
 */
export function invalidateCache(keyOrPrefix) {
  for (const key of resultCache.keys()) {
    if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
      resultCache.delete(key);
    }
  }
  // También cancelar in-flight si existe (no se puede cancelar axios,
  // pero al borrar la entrada el resultado no se re-cacheará)
  inFlight.delete(keyOrPrefix);
}

/** Normaliza la respuesta de Laravel */
function normalize(payload) {
  if (payload == null) return null;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return payload;
}

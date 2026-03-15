/**
 * hooks/useRoles.js
 * Carga los roles desde el backend.
 * El backend (Spatie) retorna: [{ id, name, guard_name, permissions }]
 *
 * Uso:
 *   const { roles, loading, error } = useRoles();
 */

import useFetch from './useFetch';
import rolesService from '../services/rolesService';

const useRoles = () => {
  const { data, loading, error, refetch } = useFetch(
    () => rolesService.getAll()
  );

  // Garantizar que siempre sea un array
  const roles = Array.isArray(data) ? data : [];

  return { roles, loading, error, refetch };
};

export default useRoles;

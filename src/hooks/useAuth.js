/**
 * hooks/useAuth.js
 * Hook para acceder a los datos del usuario autenticado desde localStorage.
 */

import { useState } from 'react';

const useAuth = () => {
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const token = localStorage.getItem('auth_token');
  const isAuthenticated = !!token;

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return { user, token, isAuthenticated, logout };
};

export default useAuth;

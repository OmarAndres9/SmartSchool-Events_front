/**
 * routes/AppRouter.jsx
 * Enrutador principal con protección por rol.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Landing              from '../views/landing/Landing';
import Login                from '../views/auth/Login';
import Register             from '../views/auth/Register';
import OlvidasteContrasena  from '../views/auth/OlvidasteContrasena';
import ResetContrasena      from '../views/auth/ResetContrasena';
import Dashboard            from '../views/dashboard/Dashboard';
import EventsList           from '../views/events/EventsList';
import EditarEvento         from '../views/events/EditarEvento';
import MisEventos           from '../views/myevents/MisEventos';
import Reportes             from '../views/reports/Reportes';
import CrearReporte         from '../views/reports/CrearReporte';
import Logistics            from '../views/logistics/Logistics';
import CrearRecurso         from '../views/logistics/CrearRecurso';
import EditarRecurso        from '../views/logistics/EditarRecurso';
import DetalleRecurso       from '../views/logistics/DetalleRecurso';
import Notifications        from '../views/notifications/Notifications';
import CrearNotificacion    from '../views/notifications/CrearNotificacion';
import Settings             from '../views/settings/Settings';
import UsersList            from '../views/users/UsersList';

/* ── Helpers ────────────────────────────────────────────────── */
const getUser  = () => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } };
const getToken = () => localStorage.getItem('auth_token');

const getRol = (user) => {
  const r = user?.roles?.[0];
  return (typeof r === 'string' ? r : r?.name || '').toLowerCase();
};

/* ── Guard: solo autenticado ─────────────────────────────────── */
const RequireAuth = ({ children }) =>
  getToken() ? children : <Navigate to="/login" replace />;

/* ── Guard: autenticado + rol permitido ──────────────────────── */
const RequireRole = ({ roles, children }) => {
  if (!getToken()) return <Navigate to="/login" replace />;
  const rol = getRol(getUser());
  if (!roles.includes(rol)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRouter = () => (
  <Router>
    <Routes>
      {/* ── Públicas ── */}
      <Route path="/"                  element={<Landing />} />
      <Route path="/login"             element={<Login />} />
      <Route path="/register"          element={<Register />} />
      <Route path="/olvide-contrasena" element={<OlvidasteContrasena />} />
      <Route path="/reset-password"    element={<ResetContrasena />} />

      {/* ── Para todos los autenticados ── */}
      <Route path="/dashboard"           element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/mis-eventos"         element={<RequireAuth><MisEventos /></RequireAuth>} />
      <Route path="/notifications"       element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/notifications/crear" element={<RequireAuth><CrearNotificacion /></RequireAuth>} />
      <Route path="/settings"            element={<RequireAuth><Settings /></RequireAuth>} />

      {/* ── Solo admin y organizador ── */}
      <Route path="/events" element={
        <RequireRole roles={['admin', 'organizador']}><EventsList /></RequireRole>
      } />
      <Route path="/events/:id/editar" element={
        <RequireRole roles={['admin', 'organizador']}><EditarEvento /></RequireRole>
      } />
      <Route path="/reports" element={
        <RequireRole roles={['admin', 'organizador']}><Reportes /></RequireRole>
      } />
      <Route path="/reports/crear" element={
        <RequireRole roles={['admin', 'organizador']}><CrearReporte /></RequireRole>
      } />
      <Route path="/logistics" element={
        <RequireRole roles={['admin', 'organizador']}><Logistics /></RequireRole>
      } />
      <Route path="/logistics/crear" element={
        <RequireRole roles={['admin', 'organizador']}><CrearRecurso /></RequireRole>
      } />
      <Route path="/logistics/:id/editar" element={
        <RequireRole roles={['admin', 'organizador']}><EditarRecurso /></RequireRole>
      } />
      <Route path="/logistics/:id" element={
        <RequireRole roles={['admin', 'organizador']}><DetalleRecurso /></RequireRole>
      } />

      {/* ── Solo admin ── */}
      <Route path="/users" element={
        <RequireRole roles={['admin']}><UsersList /></RequireRole>
      } />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;

/**
 * routes/AppRouter.jsx
 * Enrutador principal de la aplicación.
 * Incluye las rutas nuevas: /mis-eventos y /reports
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ─── Landing page ────────────────────────────────────────────────────────────
import Landing  from '../views/landing/Landing';

// ─── Vistas de autenticación ──────────────────────────────────────────────────
import Login    from '../views/auth/Login';
import Register from '../views/auth/Register';

// ─── Vistas del dashboard ─────────────────────────────────────────────────────
import Dashboard    from '../views/dashboard/Dashboard';
import EventsList   from '../views/events/EventsList';
import MisEventos   from '../views/myevents/MisEventos';
import Reportes     from '../views/reports/Reportes';
import Logistics        from '../views/logistics/Logistics';
import CrearRecurso     from '../views/logistics/CrearRecurso';
import DetalleRecurso   from '../views/logistics/DetalleRecurso';
import Notifications    from '../views/notifications/Notifications';
import CrearNotificacion from '../views/notifications/CrearNotificacion';
import Settings     from '../views/settings/Settings';
import UsersList    from '../views/users/UsersList';

/**
 * Guard simple: redirige al login si no hay token.
 * En producción usar un componente PrivateRoute más robusto.
 */
const RequireAuth = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  return token ? children : <Navigate to="/login" replace />;
};

const AppRouter = () => (
  <Router>
    <Routes>
      {/* ── Rutas públicas ── */}
      <Route path="/"         element={<Landing />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ── Rutas protegidas ── */}
      <Route path="/dashboard"    element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/events"       element={<RequireAuth><EventsList /></RequireAuth>} />
      <Route path="/mis-eventos"  element={<RequireAuth><MisEventos /></RequireAuth>} />
      <Route path="/reports"      element={<RequireAuth><Reportes /></RequireAuth>} />
      <Route path="/logistics"              element={<RequireAuth><Logistics /></RequireAuth>} />
      <Route path="/logistics/crear"        element={<RequireAuth><CrearRecurso /></RequireAuth>} />
      <Route path="/logistics/:id"          element={<RequireAuth><DetalleRecurso /></RequireAuth>} />
      <Route path="/notifications"          element={<RequireAuth><Notifications /></RequireAuth>} />
      <Route path="/notifications/crear"    element={<RequireAuth><CrearNotificacion /></RequireAuth>} />
      <Route path="/settings"     element={<RequireAuth><Settings /></RequireAuth>} />
      <Route path="/users"        element={<RequireAuth><UsersList /></RequireAuth>} />

      {/* ── Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default AppRouter;

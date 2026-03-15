/**
 * App.jsx
 * Componente raíz: solo monta el router.
 * La lógica de layout está dentro de cada vista vía DashboardLayout.
 */

import React from 'react';
import AppRouter from './routes/AppRouter';

const App = () => <AppRouter />;

export default App;

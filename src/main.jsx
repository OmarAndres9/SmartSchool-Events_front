/**
 * main.jsx
 * Punto de entrada de la aplicación React.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Estilos globales (variables + reset)
import './styles/global.css';

// Estilos heredados del proyecto original (login, dashboard, formularios, etc.)
// Se importan aquí una sola vez para que estén disponibles en todas las vistas.
import './assets/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

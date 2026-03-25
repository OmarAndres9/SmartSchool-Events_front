/**
 * main.jsx
 * Punto de entrada de la aplicación React.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Bulma CSS para clases .button, .notification, .is-success, .is-light, etc.
import 'bulma/css/bulma.min.css';

// Variables CSS + reset global
import './styles/global.css';

// Estilos base para vistas que usan clases Bulma/globales
// (EventsList, Notifications, Logistics, Dashboard)
import './assets/dashboard.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

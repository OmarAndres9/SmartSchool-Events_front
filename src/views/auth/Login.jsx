/**
 * views/auth/Login.jsx
 * Login — diseño responsive mobile-first con módulo CSS propio.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', rol: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/login', {
        email:    formData.email,
        password: formData.password,
      });
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user || { nombre: formData.email, rol: formData.rol }));
        navigate('/dashboard');
      } else {
        setErrorMsg('No se recibió token del servidor.');
      }
    } catch (error) {
      setErrorMsg(
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Verifica tus credenciales e intenta de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Panel de marca ── */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎓</span>
          <h1 className={styles.brandName}>SmartSchool</h1>
          <p className={styles.brandSub}>Gestión escolar inteligente para tu institución.</p>
        </div>

        {/* ── Panel del formulario ── */}
        <div className={styles.formPanel}>
          <h2 className={styles.formTitle}>Bienvenido 👋</h2>
          <p className={styles.formSub}>Inicia sesión para continuar</p>

          {errorMsg && (
            <div className={styles.alert} role="alert">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Correo Electrónico</label>
              <input
                type="email" id="email" name="email"
                className={styles.input}
                placeholder="correo@institución.edu.co"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Contraseña</label>
              <input
                type="password" id="password" name="password"
                className={styles.input}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="rol">Rol</label>
              <select
                id="rol" name="rol"
                className={styles.input}
                value={formData.rol}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Selecciona tu rol</option>
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente / Profesor</option>
                <option value="acudiente">Acudiente</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <><span className={styles.spinner} /> Ingresando...</>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <a href="#" className={styles.footerLink}>¿Olvidaste tu contraseña?</a>
            <p>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className={styles.footerLink}>Regístrate</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

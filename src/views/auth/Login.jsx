/**
 * views/auth/Login.jsx
 * Login con validación de rol contra el token JWT del backend.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './Auth.module.css';

const ROLES_VALIDOS = ['estudiante', 'docente', 'acudiente', 'administrador', 'organizador'];

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

      if (!response.data.token) {
        setErrorMsg('No se recibió token del servidor.');
        return;
      }

      const user = response.data.user;

      // FIX: validar que el rol seleccionado coincida con el rol real del usuario
      const rolReal = user?.roles?.[0]?.name || user?.roles?.[0] || '';
      const rolSeleccionado = formData.rol.toLowerCase();

      if (rolReal && rolSeleccionado && rolReal !== rolSeleccionado) {
        setErrorMsg(`Tu rol es "${rolReal}", no "${rolSeleccionado}". Selecciona el rol correcto.`);
        return;
      }

      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/dashboard');

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
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎓</span>
          <h1 className={styles.brandName}>SmartSchool</h1>
          <p className={styles.brandSub}>Gestión escolar inteligente para tu institución.</p>
        </div>

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
                <option value="organizador">Organizador</option>
              </select>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <><span className={styles.spinner} /> Ingresando...</> : 'Ingresar'}
            </button>
          </form>

          <div className={styles.footer}>
            <Link to="/olvide-contrasena" className={styles.footerLink}>¿Olvidaste tu contraseña?</Link>
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

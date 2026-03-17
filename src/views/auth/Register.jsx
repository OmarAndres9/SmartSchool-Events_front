/**
 * views/auth/Register.jsx
 * Registro — diseño responsive mobile-first.
 * Roles dinámicos desde GET /api/roles.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import useRoles from '../../hooks/useRoles';
import styles from './Auth.module.css';

const TIPO_DOCUMENTO_OPTIONS = ['CC', 'TI', 'CE', 'RC'];

const Register = () => {
  const navigate = useNavigate();
  const { roles, loading: rolesLoading } = useRoles();

  const [formData, setFormData] = useState({
    name: '', documento: '', tipo_documento: 'CC',
    email: '', password: '', password_confirmation: '', rol: '',
  });
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    if (formData.password !== formData.password_confirmation) {
      setErrorMsg('Las contraseñas no coinciden.'); return;
    }
    setLoading(true);
    try {
      await api.post('/register', formData);
      setSuccessMsg('¡Registro exitoso! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Error al registrarse. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>

        {/* ── Panel de marca ── */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎓</span>
          <h1 className={styles.brandName}>SmartSchool</h1>
          <p className={styles.brandSub}>Únete a la comunidad educativa de tu institución.</p>
        </div>

        {/* ── Panel del formulario ── */}
        <div className={styles.formPanel}>
          <h2 className={styles.formTitle}>Crear Cuenta</h2>
          <p className={styles.formSub}>Completa tus datos para registrarte</p>

          {errorMsg   && <div className={styles.alert}  role="alert"><span>⚠️</span> {errorMsg}</div>}
          {successMsg && <div className={styles.success} role="status"><span>✅</span> {successMsg}</div>}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>

            {/* Nombre */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Nombre Completo</label>
              <input
                type="text" id="name" name="name"
                className={styles.input}
                placeholder="Ej. Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>

            {/* Documento — grid de 2 columnas */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldNarrow}>
                <label className={styles.label} htmlFor="tipo_documento">Tipo ID</label>
                <select
                  id="tipo_documento" name="tipo_documento"
                  className={styles.input}
                  value={formData.tipo_documento}
                  onChange={handleChange}
                >
                  {TIPO_DOCUMENTO_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldWide}>
                <label className={styles.label} htmlFor="documento">Número de Documento</label>
                <input
                  type="text" id="documento" name="documento"
                  className={styles.input}
                  placeholder="Ej. 1000123456"
                  value={formData.documento}
                  onChange={handleChange}
                  inputMode="numeric"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Rol */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="rol">
                Rol en la institución
                {rolesLoading && <span className={styles.loadingHint}> (cargando...)</span>}
              </label>
              <select
                id="rol" name="rol"
                className={styles.input}
                value={formData.rol}
                onChange={handleChange}
                required
                disabled={rolesLoading}
              >
                <option value="" disabled>
                  {rolesLoading ? 'Cargando roles...' : 'Seleccionar Rol...'}
                </option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Contraseñas — grid de 2 columnas */}
            <div className={styles.fieldRow}>
              <div className={styles.fieldEqual}>
                <label className={styles.label} htmlFor="password">Contraseña</label>
                <input
                  type="password" id="password" name="password"
                  className={styles.input}
                  placeholder="Mínimo 8 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className={styles.fieldEqual}>
                <label className={styles.label} htmlFor="password_confirmation">Confirmar</label>
                <input
                  type="password" id="password_confirmation" name="password_confirmation"
                  className={styles.input}
                  placeholder="Repite la contraseña"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading || rolesLoading}
            >
              {loading ? (
                <><span className={styles.spinner} /> Registrando...</>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className={styles.footerLink}>Inicia sesión</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;

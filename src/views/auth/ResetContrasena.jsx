/**
 * views/auth/ResetContrasena.jsx
 * Formulario para establecer la nueva contraseña.
 * POST /api/v1/password/reset
 * Recibe token y email como query params: /reset-password?token=XXX&email=YYY
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import styles from './Auth.module.css';

const ResetContrasena = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    token:                 '',
    email:                 '',
    password:              '',
    password_confirmation: '',
  });
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPass,   setShowPass]   = useState(false);

  // Leer token y email de la URL automáticamente
  useEffect(() => {
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';
    setForm(prev => ({ ...prev, token, email }));
  }, [searchParams]);

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setErrorMsg('Las contraseñas no coinciden.'); return;
    }
    if (form.password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.'); return;
    }
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await api.post('/password/reset', form);
      setSuccessMsg(res.data?.message || '¡Contraseña actualizada! Redirigiendo...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.email ||
        'El enlace es inválido o ha expirado. Solicita uno nuevo.'
      );
    } finally { setLoading(false); }
  };

  // Fortaleza de contraseña
  const strength = form.password.length === 0 ? 0
    : form.password.length < 8  ? 1
    : form.password.length < 12 ? 2
    : 3;

  const strengthMeta = [
    null,
    { label: 'Débil',   color: '#c62828', width: '33%' },
    { label: 'Media',   color: '#f57c00', width: '66%' },
    { label: 'Fuerte',  color: '#2e7d32', width: '100%' },
  ];

  // Si no hay token en la URL
  if (!searchParams.get('token')) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>🎓</span>
            <h1 className={styles.brandName}>SmartSchool</h1>
          </div>
          <div className={styles.formPanel}>
            <h2 className={styles.formTitle}>Enlace inválido</h2>
            <p className={styles.formSub}>
              Este enlace no es válido o ha expirado.
            </p>
            <div className={styles.footer}>
              <Link to="/olvide-contrasena" className={styles.footerLink}>
                Solicitar un nuevo enlace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Panel de marca */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎓</span>
          <h1 className={styles.brandName}>SmartSchool</h1>
          <p className={styles.brandSub}>Establece tu nueva contraseña.</p>
        </div>

        {/* Panel formulario */}
        <div className={styles.formPanel}>
          <h2 className={styles.formTitle}>Nueva contraseña</h2>
          <p className={styles.formSub}>
            Elige una contraseña segura de al menos 8 caracteres.
          </p>

          {errorMsg && (
            <div className={styles.alert} role="alert">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className={styles.success} role="status">
              <span>✅</span> {successMsg}
              <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-light)', marginTop: '8px' }}>
                Redirigiendo al inicio de sesión...
              </p>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>

              {/* Email (prellenado, solo lectura) */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">Correo electrónico</label>
                <input
                  id="email" name="email" type="email"
                  className={styles.input}
                  value={form.email}
                  onChange={handleChange}
                  readOnly={!!searchParams.get('email')}
                  style={searchParams.get('email') ? { background: 'var(--color-bg)', color: 'var(--color-text-muted)' } : {}}
                  required
                />
              </div>

              {/* Nueva contraseña */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">Nueva contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password" name="password"
                    type={showPass ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="Mínimo 8 caracteres"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    style={{ paddingRight: '44px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      color: 'var(--color-text-light)', cursor: 'pointer',
                      fontSize: '14px',
                    }}
                    aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    <i className={`fas ${showPass ? 'fa-eye-slash' : 'fa-eye'}`} />
                  </button>
                </div>

                {/* Barra de fortaleza */}
                {form.password && (
                  <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: strengthMeta[strength]?.width || '0%',
                        background: strengthMeta[strength]?.color,
                        borderRadius: '2px',
                        transition: 'width 0.3s ease, background 0.3s ease',
                      }} />
                    </div>
                    <span style={{ fontSize: 'var(--font-xs)', color: strengthMeta[strength]?.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {strengthMeta[strength]?.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password_confirmation">
                  Confirmar contraseña
                </label>
                <input
                  id="password_confirmation" name="password_confirmation"
                  type={showPass ? 'text' : 'password'}
                  className={styles.input}
                  placeholder="Repetir contraseña"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                {/* Check de coincidencia */}
                {form.password_confirmation && (
                  <span style={{
                    fontSize: 'var(--font-xs)',
                    fontWeight: 600,
                    marginTop: '4px',
                    color: form.password === form.password_confirmation ? '#2e7d32' : '#c62828',
                  }}>
                    {form.password === form.password_confirmation
                      ? '✅ Las contraseñas coinciden'
                      : '❌ Las contraseñas no coinciden'}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || form.password !== form.password_confirmation}
              >
                {loading
                  ? <><span className={styles.spinner} /> Actualizando...</>
                  : <><i className="fas fa-key" /> Restablecer contraseña</>
                }
              </button>
            </form>
          )}

          {!successMsg && (
            <div className={styles.footer}>
              <Link to="/login" className={styles.footerLink}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetContrasena;

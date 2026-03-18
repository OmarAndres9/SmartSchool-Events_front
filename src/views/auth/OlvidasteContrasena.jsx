/**
 * views/auth/OlvidasteContrasena.jsx
 * Formulario para solicitar el link de recuperación de contraseña.
 * POST /api/v1/password/email
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import styles from './Auth.module.css';

const OlvidasteContrasena = () => {
  const [email,      setEmail]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [errorMsg,   setErrorMsg]   = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      const res = await api.post('/password/email', { email });
      setSuccessMsg(res.data?.message || 'Te enviamos el enlace a tu correo.');
      setEmail('');
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        err.response?.data?.email ||
        'No se pudo enviar el correo. Verifica la dirección ingresada.'
      );
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Panel de marca */}
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎓</span>
          <h1 className={styles.brandName}>SmartSchool</h1>
          <p className={styles.brandSub}>Recupera el acceso a tu cuenta.</p>
        </div>

        {/* Panel formulario */}
        <div className={styles.formPanel}>
          <h2 className={styles.formTitle}>¿Olvidaste tu contraseña?</h2>
          <p className={styles.formSub}>
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>

          {errorMsg && (
            <div className={styles.alert} role="alert">
              <span>⚠️</span> {errorMsg}
            </div>
          )}

          {successMsg ? (
            <div className={styles.success} role="status">
              <span>✅</span> {successMsg}
              <div className={styles.footer} style={{ marginTop: 'var(--space-5)' }}>
                <Link to="/login" className={styles.footerLink}>
                  ← Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email" type="email"
                  className={styles.input}
                  placeholder="correo@institución.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading
                  ? <><span className={styles.spinner} /> Enviando...</>
                  : <><i className="fas fa-paper-plane" /> Enviar enlace</>
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

export default OlvidasteContrasena;

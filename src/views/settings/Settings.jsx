/**
 * views/settings/Settings.jsx
 * Configuración de cuenta — diseño moderno con módulo CSS propio.
 */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import usuariosService from '../../services/usuariosService';
import styles from './Settings.module.css';

const TIPO_DOC = ['CC', 'TI', 'CE', 'RC'];

const AVATAR_COLORS = [
  '#1565C0','#6A1B9A','#2E7D32','#E65100',
  '#AD1457','#00838F','#4527A0','#558B2F',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const Settings = () => {
  const { user } = useAuth();

  const [perfil, setPerfil] = useState({
    name: '', email: '', documento: '', tipo_documento: 'CC',
  });
  const [passwords, setPasswords] = useState({
    password: '', password_confirmation: '',
  });
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [savingPerfil,  setSavingPerfil]  = useState(false);
  const [savingPass,    setSavingPass]    = useState(false);
  const [msgPerfil,     setMsgPerfil]     = useState({ type: '', text: '' });
  const [msgPass,       setMsgPass]       = useState({ type: '', text: '' });
  const [activeTab,     setActiveTab]     = useState('perfil');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res  = await authService.me();
        const data = res.data?.user || res.data;
        setPerfil({
          name:           data.name           || '',
          email:          data.email          || '',
          documento:      data.documento      || '',
          tipo_documento: data.tipo_documento || 'CC',
        });
      } catch {
        if (user) {
          setPerfil({
            name: user.name || '', email: user.email || '',
            documento: user.documento || '', tipo_documento: user.tipo_documento || 'CC',
          });
        }
      } finally { setLoadingPerfil(false); }
    };
    fetchMe();
  }, []);

  const handlePerfilChange = (e) =>
    setPerfil(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePassChange = (e) =>
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSavePerfil = async (e) => {
    e.preventDefault();
    if (!user?.id) { setMsgPerfil({ type: 'error', text: 'No se pudo identificar el usuario.' }); return; }
    setSavingPerfil(true); setMsgPerfil({ type: '', text: '' });
    try {
      await usuariosService.update(user.id, perfil);
      setMsgPerfil({ type: 'success', text: '✅ Perfil actualizado correctamente.' });
    } catch (err) {
      setMsgPerfil({ type: 'error', text: err.response?.data?.message || 'Error al guardar el perfil.' });
    } finally { setSavingPerfil(false); }
  };

  const handleSavePass = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      setMsgPass({ type: 'error', text: 'Las contraseñas no coinciden.' }); return;
    }
    if (passwords.password.length < 8) {
      setMsgPass({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' }); return;
    }
    if (!user?.id) { setMsgPass({ type: 'error', text: 'No se pudo identificar el usuario.' }); return; }
    setSavingPass(true); setMsgPass({ type: '', text: '' });
    try {
      await usuariosService.update(user.id, passwords);
      setMsgPass({ type: 'success', text: '✅ Contraseña actualizada correctamente.' });
      setPasswords({ password: '', password_confirmation: '' });
    } catch (err) {
      setMsgPass({ type: 'error', text: err.response?.data?.message || 'Error al cambiar la contraseña.' });
    } finally { setSavingPass(false); }
  };

  const rolRaw   = user?.roles?.[0];
  const rol      = typeof rolRaw === 'string' ? rolRaw : rolRaw?.name || 'Usuario';
  const rolLabel = rol.charAt(0).toUpperCase() + rol.slice(1);
  const color    = avatarColor(user?.name);

  if (loadingPerfil) return (
    <DashboardLayout title="Configuración">
      <LoadingSpinner message="Cargando perfil..." />
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      title="Configuración"
      subtitle="Gestiona tu cuenta y preferencias."
    >
      <div className={styles.layout}>

        {/* ══ Panel izquierdo: avatar + info ══ */}
        <aside className={styles.profileCard}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar} style={{ background: color }}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className={styles.avatarBadge} style={{ background: color }}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
          </div>

          <h2 className={styles.profileName}>{user?.name || '—'}</h2>
          <span className={styles.profileRol}>{rolLabel}</span>
          <span className={styles.profileEmail}>{user?.email || '—'}</span>

          <div className={styles.profileMeta}>
            {user?.documento && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  <i className="fas fa-id-card" /> Documento
                </span>
                <span className={styles.metaValue}>
                  {user.tipo_documento} {user.documento}
                </span>
              </div>
            )}
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>
                <i className="fas fa-shield-alt" /> Estado
              </span>
              <span className={styles.metaBadge}>Activo</span>
            </div>
          </div>

          {/* Tabs navegación */}
          <nav className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'perfil' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              <i className="fas fa-user-edit" /> Editar perfil
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'seguridad' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('seguridad')}
            >
              <i className="fas fa-lock" /> Contraseña
            </button>
          </nav>
        </aside>

        {/* ══ Panel derecho: formularios ══ */}
        <div className={styles.formArea}>

          {/* ── Tab: Editar perfil ── */}
          {activeTab === 'perfil' && (
            <div className={styles.formCard}>
              <div className={styles.formCardHeader}>
                <div className={styles.formCardIcon}>
                  <i className="fas fa-user-edit" />
                </div>
                <div>
                  <h3 className={styles.formCardTitle}>Información personal</h3>
                  <p className={styles.formCardSub}>Actualiza tus datos de perfil</p>
                </div>
              </div>

              {msgPerfil.text && (
                <div className={`${styles.alert} ${styles[`alert_${msgPerfil.type}`]}`}>
                  {msgPerfil.text}
                </div>
              )}

              <form onSubmit={handleSavePerfil} className={styles.form} noValidate>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="name">Nombre completo</label>
                  <input id="name" name="name" type="text"
                    className={styles.input}
                    value={perfil.name} onChange={handlePerfilChange} required />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="email">Correo electrónico</label>
                  <input id="email" name="email" type="email"
                    className={styles.input}
                    value={perfil.email} onChange={handlePerfilChange} required />
                </div>

                <div className={styles.fieldRow}>
                  <div className={styles.fieldNarrow}>
                    <label className={styles.label} htmlFor="tipo_documento">Tipo ID</label>
                    <select id="tipo_documento" name="tipo_documento"
                      className={styles.input}
                      value={perfil.tipo_documento} onChange={handlePerfilChange}>
                      {TIPO_DOC.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className={styles.fieldWide}>
                    <label className={styles.label} htmlFor="documento">N° Documento</label>
                    <input id="documento" name="documento" type="text"
                      className={styles.input}
                      value={perfil.documento} onChange={handlePerfilChange} />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.btnSave} disabled={savingPerfil}>
                    {savingPerfil
                      ? <><span className={styles.spinner} /> Guardando...</>
                      : <><i className="fas fa-save" /> Guardar cambios</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Tab: Contraseña ── */}
          {activeTab === 'seguridad' && (
            <div className={styles.formCard}>
              <div className={styles.formCardHeader}>
                <div className={styles.formCardIcon} style={{ background: '#fff3e0', color: '#e65100' }}>
                  <i className="fas fa-lock" />
                </div>
                <div>
                  <h3 className={styles.formCardTitle}>Cambiar contraseña</h3>
                  <p className={styles.formCardSub}>Mínimo 8 caracteres</p>
                </div>
              </div>

              {msgPass.text && (
                <div className={`${styles.alert} ${styles[`alert_${msgPass.type}`]}`}>
                  {msgPass.text}
                </div>
              )}

              <form onSubmit={handleSavePass} className={styles.form} noValidate>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="password">Nueva contraseña</label>
                  <input id="password" name="password" type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    value={passwords.password} onChange={handlePassChange}
                    autoComplete="new-password" required />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="password_confirmation">Confirmar contraseña</label>
                  <input id="password_confirmation" name="password_confirmation" type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    value={passwords.password_confirmation} onChange={handlePassChange}
                    autoComplete="new-password" required />
                </div>

                {/* Indicador de fortaleza */}
                {passwords.password && (
                  <div className={styles.strengthBar}>
                    <div
                      className={styles.strengthFill}
                      style={{
                        width: `${Math.min(passwords.password.length * 10, 100)}%`,
                        background: passwords.password.length < 8 ? '#c62828'
                          : passwords.password.length < 12 ? '#f57c00' : '#2e7d32',
                      }}
                    />
                    <span className={styles.strengthLabel}>
                      {passwords.password.length < 8 ? 'Débil'
                        : passwords.password.length < 12 ? 'Media' : 'Fuerte'}
                    </span>
                  </div>
                )}

                <div className={styles.formActions}>
                  <button type="submit" className={styles.btnSaveWarn} disabled={savingPass}>
                    {savingPass
                      ? <><span className={styles.spinner} /> Actualizando...</>
                      : <><i className="fas fa-key" /> Actualizar contraseña</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;

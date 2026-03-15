/**
 * views/settings/Settings.jsx
 * Configuración de perfil — carga datos del usuario autenticado
 * desde useAuth y permite actualizar vía PUT /api/usuarios/:id.
 */

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import useAuth from '../../hooks/useAuth';
import authService from '../../services/authService';
import usuariosService from '../../services/usuariosService';

const Settings = () => {
  const { user } = useAuth();

  const [perfil, setPerfil] = useState({
    name:  '', email: '', documento: '', tipo_documento: '',
  });
  const [passwords, setPasswords] = useState({
    password: '', password_confirmation: '',
  });
  const [loadingPerfil,  setLoadingPerfil]  = useState(true);
  const [savingPerfil,   setSavingPerfil]   = useState(false);
  const [savingPass,     setSavingPass]     = useState(false);
  const [msgPerfil,      setMsgPerfil]      = useState({ type: '', text: '' });
  const [msgPass,        setMsgPass]        = useState({ type: '', text: '' });

  // ── Carga datos reales del usuario autenticado ────────────────────────
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await authService.me();
        const data = res.data;
        setPerfil({
          name:           data.name           || '',
          email:          data.email          || '',
          documento:      data.documento      || '',
          tipo_documento: data.tipo_documento || '',
        });
      } catch {
        // Si falla, carga desde localStorage como fallback
        if (user) {
          setPerfil({
            name: user.name || '', email: user.email || '',
            documento: user.documento || '', tipo_documento: user.tipo_documento || '',
          });
        }
      } finally {
        setLoadingPerfil(false);
      }
    };
    fetchMe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePerfilChange = (e) =>
    setPerfil((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePassChange = (e) =>
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // ── Guardar perfil ────────────────────────────────────────────────────
  const handleSavePerfil = async (e) => {
    e.preventDefault();
    if (!user?.id) { setMsgPerfil({ type: 'danger', text: 'No se pudo identificar el usuario.' }); return; }
    setSavingPerfil(true);
    setMsgPerfil({ type: '', text: '' });
    try {
      await usuariosService.update(user.id, perfil);
      setMsgPerfil({ type: 'success', text: 'Perfil actualizado correctamente.' });
    } catch (err) {
      setMsgPerfil({ type: 'danger', text: err.response?.data?.message || 'Error al guardar el perfil.' });
    } finally {
      setSavingPerfil(false);
    }
  };

  // ── Cambiar contraseña ────────────────────────────────────────────────
  const handleSavePass = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.password_confirmation) {
      setMsgPass({ type: 'danger', text: 'Las contraseñas no coinciden.' }); return;
    }
    if (!user?.id) { setMsgPass({ type: 'danger', text: 'No se pudo identificar el usuario.' }); return; }
    setSavingPass(true);
    setMsgPass({ type: '', text: '' });
    try {
      await usuariosService.update(user.id, passwords);
      setMsgPass({ type: 'success', text: 'Contraseña actualizada correctamente.' });
      setPasswords({ password: '', password_confirmation: '' });
    } catch (err) {
      setMsgPass({ type: 'danger', text: err.response?.data?.message || 'Error al cambiar la contraseña.' });
    } finally {
      setSavingPass(false);
    }
  };

  if (loadingPerfil) return (
    <DashboardLayout title="Configuración" subtitle="Personaliza tu cuenta.">
      <LoadingSpinner message="Cargando perfil..." />
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Ajustes y Configuración" subtitle="Personaliza la configuración de tu cuenta.">

      {/* ── Perfil ── */}
      <div className="card-box" style={{ maxWidth: '600px', marginBottom: '24px' }}>
        <h3 className="card-title mb-4">Información de Perfil</h3>

        {msgPerfil.text && (
          <div className={`notification is-${msgPerfil.type} is-light mb-4`}>{msgPerfil.text}</div>
        )}

        <form onSubmit={handleSavePerfil}>
          <div className="field">
            <label className="label">Nombre Completo</label>
            <div className="control">
              <input className="input" type="text" name="name"
                value={perfil.name} onChange={handlePerfilChange} required />
            </div>
          </div>

          <div className="field">
            <label className="label">Correo Electrónico</label>
            <div className="control">
              <input className="input" type="email" name="email"
                value={perfil.email} onChange={handlePerfilChange} required />
            </div>
          </div>

          <div className="columns">
            <div className="column is-4 field">
              <label className="label">Tipo Documento</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select name="tipo_documento" value={perfil.tipo_documento} onChange={handlePerfilChange}>
                    {['CC','TI','CE','RC'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="column field">
              <label className="label">Número de Documento</label>
              <div className="control">
                <input className="input" type="text" name="documento"
                  value={perfil.documento} onChange={handlePerfilChange} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={`button is-primary ${savingPerfil ? 'is-loading' : ''}`}
            disabled={savingPerfil}
          >
            Guardar Cambios
          </button>
        </form>
      </div>

      {/* ── Contraseña ── */}
      <div className="card-box" style={{ maxWidth: '600px' }}>
        <h3 className="card-title mb-4">Cambiar Contraseña</h3>

        {msgPass.text && (
          <div className={`notification is-${msgPass.type} is-light mb-4`}>{msgPass.text}</div>
        )}

        <form onSubmit={handleSavePass}>
          <div className="field">
            <label className="label">Nueva Contraseña</label>
            <div className="control">
              <input className="input" type="password" name="password"
                value={passwords.password} onChange={handlePassChange}
                placeholder="Mínimo 8 caracteres" required />
            </div>
          </div>
          <div className="field">
            <label className="label">Confirmar Nueva Contraseña</label>
            <div className="control">
              <input className="input" type="password" name="password_confirmation"
                value={passwords.password_confirmation} onChange={handlePassChange}
                placeholder="Repetir contraseña" required />
            </div>
          </div>
          <button
            type="submit"
            className={`button is-warning ${savingPass ? 'is-loading' : ''}`}
            disabled={savingPass}
          >
            Actualizar Contraseña
          </button>
        </form>
      </div>

    </DashboardLayout>
  );
};

export default Settings;

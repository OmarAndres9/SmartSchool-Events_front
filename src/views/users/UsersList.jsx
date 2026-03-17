/**
 * views/users/UsersList.jsx
 * Gestión completa de usuarios:
 *  - Listar con búsqueda y filtro por rol
 *  - Crear usuario (modal)
 *  - Editar usuario (modal)
 *  - Cambiar rol (modal dedicado rápido)
 *  - Eliminar usuario
 */

import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useUsuarios from '../../hooks/useUsuarios';
import useRoles from '../../hooks/useRoles';
import usuariosService from '../../services/usuariosService';
import styles from './UsersList.module.css';

/* ── Constantes ───────────────────────────────────────────── */
const TIPO_DOC = ['CC', 'TI', 'CE', 'RC'];

const ROLE_META = {
  admin:         { bg: '#ffebee', color: '#c62828', label: 'Admin' },
  administrador: { bg: '#ffebee', color: '#c62828', label: 'Admin' },
  organizador:   { bg: '#f3e5f5', color: '#6a1b9a', label: 'Organizador' },
  docente:       { bg: '#f3e5f5', color: '#6a1b9a', label: 'Docente' },
  profesor:      { bg: '#f3e5f5', color: '#6a1b9a', label: 'Profesor' },
  acudiente:     { bg: '#fff3e0', color: '#e65100', label: 'Acudiente' },
  estudiante:    { bg: '#e3f2fd', color: '#1565c0', label: 'Estudiante' },
};

const getRoleMeta = (rol) => {
  const key = rol?.toLowerCase() || '';
  return (
    Object.entries(ROLE_META).find(([k]) => key.includes(k))?.[1] ||
    { bg: '#f5f5f5', color: '#757575', label: rol || 'Sin rol' }
  );
};

const AVATAR_COLORS = [
  '#1565C0','#6A1B9A','#2E7D32','#E65100',
  '#AD1457','#00838F','#4527A0','#558B2F',
];
const avatarColor = (name = '') =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

/* ── Componente base del modal ────────────────────────────── */
const ModalBase = ({ title, subtitle, avatarLetter, avatarBg, onClose, children }) => (
  <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className={styles.modal} role="dialog" aria-modal="true">
      <div className={styles.modalHeader}>
        <div className={styles.modalAvatar} style={{ background: avatarBg || '#2e7d32' }}>
          {avatarLetter || '👤'}
        </div>
        <div className={styles.modalHeaderText}>
          <h3 className={styles.modalTitle}>{title}</h3>
          {subtitle && <p className={styles.modalSub}>{subtitle}</p>}
        </div>
        <button className={styles.modalClose} onClick={onClose} aria-label="Cerrar">✕</button>
      </div>
      {children}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════
   MODAL: CREAR USUARIO
══════════════════════════════════════════════════════════════ */
const CrearModal = ({ roles, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: '', email: '', documento: '', tipo_documento: 'CC',
    rol: '', password: '', password_confirmation: '',
  });
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirmation) {
      setErrorMsg('Las contraseñas no coinciden.'); return;
    }
    setLoading(true); setErrorMsg('');
    try {
      await usuariosService.create(form);
      onSaved();
      onClose();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setErrorMsg(errs
        ? Object.values(errs).flat().join(' · ')
        : err.response?.data?.message || 'No se pudo crear el usuario.');
    } finally { setLoading(false); }
  };

  return (
    <ModalBase
      title="Nuevo usuario"
      subtitle="Completa los datos para registrar al usuario"
      avatarLetter="+"
      avatarBg="#2e7d32"
      onClose={onClose}
    >
      {errorMsg && <div className={styles.alertDanger} role="alert"><i className="fas fa-exclamation-circle" /> {errorMsg}</div>}

      <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>

        {/* Nombre */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-name">Nombre completo *</label>
          <input id="c-name" name="name" type="text" className={styles.input}
            placeholder="Ej. Juan Pérez" value={form.name} onChange={handleChange} required />
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-email">Correo electrónico *</label>
          <input id="c-email" name="email" type="email" className={styles.input}
            placeholder="correo@institución.edu.co" value={form.email} onChange={handleChange} required />
        </div>

        {/* Documento */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldNarrow}>
            <label className={styles.label} htmlFor="c-tipo">Tipo ID</label>
            <select id="c-tipo" name="tipo_documento" className={styles.input}
              value={form.tipo_documento} onChange={handleChange}>
              {TIPO_DOC.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.fieldWide}>
            <label className={styles.label} htmlFor="c-doc">N° Documento</label>
            <input id="c-doc" name="documento" type="text" className={styles.input}
              placeholder="Ej. 1000123456" value={form.documento} onChange={handleChange} />
          </div>
        </div>

        {/* Rol */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="c-rol">Rol *</label>
          <select id="c-rol" name="rol" className={styles.input}
            value={form.rol} onChange={handleChange} required>
            <option value="" disabled>Seleccionar rol...</option>
            {roles.map(r => (
              <option key={r.id} value={r.name}>
                {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Contraseñas */}
        <div className={styles.divider}><span>Contraseña</span></div>
        <div className={styles.fieldRow2}>
          <div className={styles.fieldEqual}>
            <label className={styles.label} htmlFor="c-pass">Contraseña *</label>
            <input id="c-pass" name="password" type="password" className={styles.input}
              placeholder="Mín. 8 caracteres" value={form.password}
              onChange={handleChange} autoComplete="new-password" required />
          </div>
          <div className={styles.fieldEqual}>
            <label className={styles.label} htmlFor="c-pass2">Confirmar *</label>
            <input id="c-pass2" name="password_confirmation" type="password" className={styles.input}
              placeholder="Repetir contraseña" value={form.password_confirmation}
              onChange={handleChange} autoComplete="new-password" required />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={styles.btnSave} disabled={loading}>
            {loading ? <><span className={styles.spinner} /> Creando...</> : <><i className="fas fa-user-plus" /> Crear usuario</>}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODAL: EDITAR USUARIO
══════════════════════════════════════════════════════════════ */
const EditModal = ({ user, roles, onClose, onSaved }) => {
  const [form, setForm] = useState({
    name:                  user.name || '',
    email:                 user.email || '',
    documento:             user.documento || '',
    tipo_documento:        user.tipo_documento || 'CC',
    rol:                   user.roles?.[0]?.name || user.rol || '',
    password:              '',
    password_confirmation: '',
  });
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.password_confirmation) {
      setErrorMsg('Las contraseñas no coinciden.'); return;
    }
    setLoading(true); setErrorMsg('');
    try {
      const payload = { ...form };
      if (!payload.password) { delete payload.password; delete payload.password_confirmation; }
      await usuariosService.update(user.id, payload);
      onSaved(); onClose();
    } catch (err) {
      const errs = err.response?.data?.errors;
      setErrorMsg(errs
        ? Object.values(errs).flat().join(' · ')
        : err.response?.data?.message || 'No se pudo guardar.');
    } finally { setLoading(false); }
  };

  return (
    <ModalBase
      title="Editar usuario"
      subtitle={user.email}
      avatarLetter={(user.name || 'U').charAt(0).toUpperCase()}
      avatarBg={avatarColor(user.name)}
      onClose={onClose}
    >
      {errorMsg && <div className={styles.alertDanger} role="alert"><i className="fas fa-exclamation-circle" /> {errorMsg}</div>}

      <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="e-name">Nombre completo</label>
          <input id="e-name" name="name" type="text" className={styles.input}
            value={form.name} onChange={handleChange} required />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="e-email">Correo electrónico</label>
          <input id="e-email" name="email" type="email" className={styles.input}
            value={form.email} onChange={handleChange} required />
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.fieldNarrow}>
            <label className={styles.label} htmlFor="e-tipo">Tipo ID</label>
            <select id="e-tipo" name="tipo_documento" className={styles.input}
              value={form.tipo_documento} onChange={handleChange}>
              {TIPO_DOC.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.fieldWide}>
            <label className={styles.label} htmlFor="e-doc">N° Documento</label>
            <input id="e-doc" name="documento" type="text" className={styles.input}
              value={form.documento} onChange={handleChange} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="e-rol">Rol</label>
          <select id="e-rol" name="rol" className={styles.input}
            value={form.rol} onChange={handleChange}>
            <option value="">Sin rol asignado</option>
            {roles.map(r => (
              <option key={r.id} value={r.name}>
                {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.divider}><span>Cambiar contraseña <span className={styles.dividerHint}>(vacío = sin cambio)</span></span></div>

        <div className={styles.fieldRow2}>
          <div className={styles.fieldEqual}>
            <label className={styles.label} htmlFor="e-pass">Nueva contraseña</label>
            <input id="e-pass" name="password" type="password" className={styles.input}
              placeholder="••••••••" value={form.password} onChange={handleChange} autoComplete="new-password" />
          </div>
          <div className={styles.fieldEqual}>
            <label className={styles.label} htmlFor="e-pass2">Confirmar</label>
            <input id="e-pass2" name="password_confirmation" type="password" className={styles.input}
              placeholder="••••••••" value={form.password_confirmation} onChange={handleChange} autoComplete="new-password" />
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={styles.btnSave} disabled={loading}>
            {loading ? <><span className={styles.spinner} /> Guardando...</> : <><i className="fas fa-save" /> Guardar cambios</>}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

/* ══════════════════════════════════════════════════════════════
   MODAL: CAMBIAR ROL
══════════════════════════════════════════════════════════════ */
const RolModal = ({ user, roles, onClose, onSaved }) => {
  const rolActual = user.roles?.[0]?.name || user.rol || '';
  const [rolSel,   setRolSel]   = useState(rolActual);
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrorMsg('');
    try {
      // Intentar endpoint dedicado de roles; fallback a update general
      try {
        await usuariosService.asignarRoles(user.id, [rolSel]);
      } catch {
        await usuariosService.update(user.id, { rol: rolSel });
      }
      onSaved(); onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'No se pudo cambiar el rol.');
    } finally { setLoading(false); }
  };

  return (
    <ModalBase
      title="Cambiar rol"
      subtitle={(user.name || 'Usuario')}
      avatarLetter={(user.name || 'U').charAt(0).toUpperCase()}
      avatarBg={avatarColor(user.name)}
      onClose={onClose}
    >
      {errorMsg && <div className={styles.alertDanger} role="alert"><i className="fas fa-exclamation-circle" /> {errorMsg}</div>}

      <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>

        {/* Rol actual */}
        {rolActual && (
          <div className={styles.rolActualBox}>
            <span className={styles.rolActualLabel}>Rol actual</span>
            <span
              className={styles.rolActualBadge}
              style={{ background: getRoleMeta(rolActual).bg, color: getRoleMeta(rolActual).color }}
            >
              {getRoleMeta(rolActual).label}
            </span>
          </div>
        )}

        {/* Selector de roles como cards */}
        <div className={styles.field}>
          <label className={styles.label}>Seleccionar nuevo rol</label>
          <div className={styles.rolGrid}>
            {roles.map(r => {
              const meta    = getRoleMeta(r.name);
              const checked = rolSel === r.name;
              return (
                <label
                  key={r.id}
                  className={`${styles.rolCard} ${checked ? styles.rolCardChecked : ''}`}
                  style={checked ? { borderColor: meta.color, background: meta.bg } : {}}
                >
                  <input
                    type="radio" name="rol" value={r.name}
                    checked={checked} onChange={() => setRolSel(r.name)}
                    className={styles.radioHidden}
                  />
                  <span
                    className={styles.rolCardDot}
                    style={{ background: meta.color }}
                  />
                  <span
                    className={styles.rolCardLabel}
                    style={checked ? { color: meta.color, fontWeight: 700 } : {}}
                  >
                    {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                  </span>
                  {checked && (
                    <i className="fas fa-check" style={{ marginLeft: 'auto', color: meta.color, fontSize: 12 }} />
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>Cancelar</button>
          <button
            type="submit"
            className={styles.btnSave}
            disabled={loading || rolSel === rolActual}
          >
            {loading
              ? <><span className={styles.spinner} /> Cambiando...</>
              : <><i className="fas fa-exchange-alt" /> Cambiar rol</>
            }
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

/* ══════════════════════════════════════════════════════════════
   TARJETA DE USUARIO
══════════════════════════════════════════════════════════════ */
const UserCard = ({ user, onEdit, onRol, onDelete, deleting }) => {
  const rolNombre = user.roles?.[0]?.name || user.rol || '';
  const meta      = getRoleMeta(rolNombre);
  const inicial   = (user.name || 'U').charAt(0).toUpperCase();
  const color     = avatarColor(user.name || '');

  return (
    <article className={styles.card}>
      <div className={styles.cardBanner} style={{ background: color }} />

      <div className={styles.cardAvatar} style={{ background: color }}>
        {inicial}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.cardName}>{user.name || '—'}</h3>
        <p className={styles.cardEmail} title={user.email}>{user.email || '—'}</p>

        {user.documento && (
          <p className={styles.cardDoc}>
            {user.tipo_documento || 'Doc'}: {user.documento}
          </p>
        )}

        {rolNombre ? (
          <button
            className={styles.roleBadgeBtn}
            style={{ background: meta.bg, color: meta.color }}
            onClick={() => onRol(user)}
            title="Cambiar rol"
          >
            {meta.label}
            <i className="fas fa-pen" style={{ fontSize: 9, marginLeft: 5, opacity: 0.7 }} />
          </button>
        ) : (
          <button
            className={styles.roleBadgeBtnEmpty}
            onClick={() => onRol(user)}
            title="Asignar rol"
          >
            + Asignar rol
          </button>
        )}
      </div>

      <div className={styles.cardActions}>
        <button className={styles.actionBtn} onClick={() => onEdit(user)} title="Editar">
          <i className="fas fa-pen" />
          <span>Editar</span>
        </button>
        <button className={styles.actionBtn} onClick={() => onRol(user)} title="Cambiar rol">
          <i className="fas fa-exchange-alt" />
          <span>Rol</span>
        </button>
        <button
          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
          onClick={() => onDelete(user.id)}
          disabled={deleting}
          title="Eliminar"
        >
          {deleting ? <span className={styles.spinnerSm} /> : <i className="fas fa-trash" />}
        </button>
      </div>
    </article>
  );
};

/* ══════════════════════════════════════════════════════════════
   VISTA PRINCIPAL
══════════════════════════════════════════════════════════════ */
const UsersList = () => {
  const { usuarios, loading, error, refetch } = useUsuarios();
  const { roles } = useRoles();

  const [busqueda,   setBusqueda]   = useState('');
  const [filtroRol,  setFiltroRol]  = useState('todos');
  const [modal,      setModal]      = useState(null); // null | 'crear' | 'editar' | 'rol'
  const [activeUser, setActiveUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const rolesUnicos = useMemo(() => {
    const set = new Set(
      usuarios.map(u => u.roles?.[0]?.name || u.rol || '').filter(Boolean)
    );
    return Array.from(set);
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() =>
    usuarios.filter(u => {
      const rolU = (u.roles?.[0]?.name || u.rol || '').toLowerCase();
      const ok1  = filtroRol === 'todos' || rolU === filtroRol;
      const t    = busqueda.toLowerCase();
      const ok2  = !busqueda ||
        u.name?.toLowerCase().includes(t) ||
        u.email?.toLowerCase().includes(t) ||
        u.documento?.includes(t);
      return ok1 && ok2;
    }),
    [usuarios, filtroRol, busqueda]
  );

  const openEdit = (user) => { setActiveUser(user); setModal('editar'); };
  const openRol  = (user) => { setActiveUser(user); setModal('rol');    };
  const closeModal = () => { setModal(null); setActiveUser(null); };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    try { await usuariosService.remove(id); refetch(); }
    catch (err) { alert(err.response?.data?.message || 'No se pudo eliminar.'); }
    finally { setDeletingId(null); }
  };

  return (
    <DashboardLayout
      title="Gestión de Usuarios"
      subtitle="Administra los usuarios registrados en el sistema."
    >
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <i className={`fas fa-search ${styles.searchIcon}`} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Buscar por nombre, correo o documento..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className={styles.searchClear} onClick={() => setBusqueda('')} aria-label="Limpiar">✕</button>
          )}
        </div>

        <select
          className={styles.filterSelect}
          value={filtroRol}
          onChange={e => setFiltroRol(e.target.value)}
        >
          <option value="todos">Todos los roles</option>
          {rolesUnicos.map(rol => (
            <option key={rol} value={rol.toLowerCase()}>{rol}</option>
          ))}
        </select>

        <button className={styles.refreshBtn} onClick={refetch} title="Actualizar lista">
          <i className="fas fa-sync-alt" />
          <span>Actualizar</span>
        </button>

        {/* ── Botón crear usuario ── */}
        <button
          className={styles.createBtn}
          onClick={() => setModal('crear')}
        >
          <i className="fas fa-user-plus" />
          <span>Nuevo usuario</span>
        </button>
      </div>

      {/* ── Contador ── */}
      {!loading && !error && (
        <p className={styles.counter}>
          {usuariosFiltrados.length} usuario{usuariosFiltrados.length !== 1 ? 's' : ''} encontrado{usuariosFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Estados ── */}
      {loading && <LoadingSpinner message="Cargando usuarios..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && usuariosFiltrados.length === 0 && (
        <EmptyState
          icon="👥"
          title="No hay usuarios"
          description="No se encontraron usuarios con los filtros actuales."
          action={{
            label: 'Limpiar filtros',
            onClick: () => { setBusqueda(''); setFiltroRol('todos'); },
          }}
        />
      )}

      {/* ── Grid ── */}
      {!loading && !error && usuariosFiltrados.length > 0 && (
        <section className={styles.grid}>
          {usuariosFiltrados.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={openEdit}
              onRol={openRol}
              onDelete={handleDelete}
              deleting={deletingId === user.id}
            />
          ))}
        </section>
      )}

      {/* ── Modales ── */}
      {modal === 'crear' && (
        <CrearModal
          roles={roles}
          onClose={closeModal}
          onSaved={refetch}
        />
      )}

      {modal === 'editar' && activeUser && (
        <EditModal
          user={activeUser}
          roles={roles}
          onClose={closeModal}
          onSaved={refetch}
        />
      )}

      {modal === 'rol' && activeUser && (
        <RolModal
          user={activeUser}
          roles={roles}
          onClose={closeModal}
          onSaved={refetch}
        />
      )}
    </DashboardLayout>
  );
};

export default UsersList;

/**
 * views/users/UsersList.jsx
 * Lista de usuarios consumida dinámicamente desde GET /api/usuarios.
 * Respuesta backend (UsuariosResource):
 *   { id, name, email, documento, tipo_documento, created_at }
 * Los roles vienen de la relación Spatie: roles[0]?.name
 */

import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useUsuarios from '../../hooks/useUsuarios';

/** Configuración visual por rol */
const getRoleStyle = (rol) => {
  const r = rol?.toLowerCase() || '';
  if (r.includes('admin'))      return { css: 'tag-admin',   label: 'Admin' };
  if (r.includes('organizador')) return { css: 'tag-teacher', label: 'Organizador' };
  if (r.includes('docente') || r.includes('profesor'))
                                return { css: 'tag-teacher', label: rol };
  if (r.includes('acudiente'))  return { css: 'tag-admin',   label: 'Acudiente' };
  return { css: 'tag-student', label: rol || 'Usuario' };
};

const UsersList = () => {
  const { usuarios, loading, error, refetch } = useUsuarios();

  const [busqueda,     setBusqueda]     = useState('');
  const [filtroRol,    setFiltroRol]    = useState('todos');

  // ── Roles únicos extraídos de los datos reales ──────────────────────────
  const rolesUnicos = useMemo(() => {
    const set = new Set(
      usuarios.map((u) => u.roles?.[0]?.name || u.rol || '').filter(Boolean)
    );
    return Array.from(set);
  }, [usuarios]);

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const rolUsuario = (u.roles?.[0]?.name || u.rol || '').toLowerCase();
      const coincideRol = filtroRol === 'todos' || rolUsuario === filtroRol;
      const termino     = busqueda.toLowerCase();
      const coincideBusq = !busqueda ||
        u.name?.toLowerCase().includes(termino) ||
        u.email?.toLowerCase().includes(termino) ||
        u.documento?.includes(termino);
      return coincideRol && coincideBusq;
    });
  }, [usuarios, filtroRol, busqueda]);

  return (
    <DashboardLayout
      title="Gestión de Usuarios"
      subtitle="Administra los usuarios registrados en el sistema."
    >
      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="control has-icons-left" style={{ flex: 1 }}>
          <input
            className="input"
            type="text"
            placeholder="Buscar por nombre, correo o documento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="icon is-small is-left">
            <i className="fas fa-search" />
          </span>
        </div>

        {/* Select de roles construido con datos reales */}
        <div className="select">
          <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)}>
            <option value="todos">Todos los roles</option>
            {rolesUnicos.map((rol) => (
              <option key={rol} value={rol.toLowerCase()}>{rol}</option>
            ))}
          </select>
        </div>

        <button className="button is-primary" onClick={refetch} title="Actualizar">
          <span className="icon"><i className="fas fa-sync-alt" /></span>
          <span>Actualizar</span>
        </button>
      </div>

      {/* ── Contador ── */}
      {!loading && !error && (
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '16px' }}>
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
          action={{ label: 'Limpiar filtros', onClick: () => { setBusqueda(''); setFiltroRol('todos'); } }}
        />
      )}

      {/* ── Grid de tarjetas ── */}
      {!loading && !error && usuariosFiltrados.length > 0 && (
        <section className="user-list">
          {usuariosFiltrados.map((user) => {
            const rolNombre = user.roles?.[0]?.name || user.rol || '';
            const roleStyle = getRoleStyle(rolNombre);
            const inicial   = (user.name || user.nombre || 'U').charAt(0).toUpperCase();

            return (
              <div className="user-card" key={user.id}>
                <div className="user-card-header" />

                {/* Avatar con inicial */}
                <div className="user-avatar" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#e0e0e0', margin: '-40px auto 0',
                  fontSize: '1.8rem', fontWeight: 'bold', color: '#555',
                }}>
                  {inicial}
                </div>

                <div className="user-info">
                  <h3 className="user-name">{user.name || user.nombre || '—'}</h3>
                  <span className="user-role">{user.email || user.correo || '—'}</span>
                  {user.documento && (
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#999', marginBottom: '6px' }}>
                      {user.tipo_documento || 'Doc'}: {user.documento}
                    </span>
                  )}
                  {rolNombre && (
                    <span className={`tag ${roleStyle.css}`}>{roleStyle.label}</span>
                  )}
                </div>

                <div className="card-actions">
                  <button className="action-btn" title="Ver detalle">
                    <i className="fas fa-eye" />
                  </button>
                  <button className="action-btn" title="Editar">
                    <i className="fas fa-pen" />
                  </button>
                  <button className="action-btn" title="Eliminar" style={{ color: '#e53935' }}>
                    <i className="fas fa-trash" />
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </DashboardLayout>
  );
};

export default UsersList;

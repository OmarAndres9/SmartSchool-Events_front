/**
 * views/logistics/Logistics.jsx
 * Recursos de logística consumidos dinámicamente desde GET /api/recursos.
 * Respuesta backend (RecursosResource):
 *   { id, nombre, ubicacion, estado, created_at, updated_at }
 */

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useRecursos from '../../hooks/useRecursos';
import recursosService from '../../services/recursosService';

const ESTADO_CONFIG = {
  disponible:   { bar: 'status-available',    badge: 'badge-available',    label: 'Disponible' },
  ocupado:      { bar: 'status-occupied',     badge: 'badge-occupied',     label: 'Ocupado' },
  mantenimiento:{ bar: 'status-maintenance',  badge: 'badge-maintenance',  label: 'Mantenimiento' },
};

const getEstadoConfig = (estado) =>
  ESTADO_CONFIG[estado?.toLowerCase()] || ESTADO_CONFIG.mantenimiento;

const Logistics = () => {
  const { recursos, loading, error, refetch } = useRecursos();

  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [busqueda,     setBusqueda]     = useState('');
  const [deletingId,   setDeletingId]   = useState(null);

  // ── Filtrado ─────────────────────────────────────────────────────────────
  const recursosFiltrados = useMemo(() =>
    recursos.filter((r) => {
      const coincideEstado  = filtroEstado === 'Todos' ||
        r.estado?.toLowerCase() === filtroEstado.toLowerCase();
      const coincideBusqueda = !busqueda ||
        r.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.ubicacion?.toLowerCase().includes(busqueda.toLowerCase());
      return coincideEstado && coincideBusqueda;
    }),
    [recursos, filtroEstado, busqueda]
  );

  // ── Eliminar recurso ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este recurso?')) return;
    setDeletingId(id);
    try {
      await recursosService.remove(id);
      refetch();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar el recurso.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout
      title="Logística y Recursos"
      subtitle="Gestiona espacios y equipos de la institución."
    >
      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="control has-icons-left" style={{ flex: 1 }}>
          <input
            className="input"
            type="text"
            placeholder="Buscar por nombre o ubicación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <span className="icon is-small is-left">
            <i className="fas fa-search" />
          </span>
        </div>

        <div className="select">
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="Todos">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Ocupado">Ocupado</option>
            <option value="Mantenimiento">En Mantenimiento</option>
          </select>
        </div>

        <button className="button is-primary" onClick={refetch} title="Actualizar">
          <span className="icon"><i className="fas fa-sync-alt" /></span>
          <span>Actualizar</span>
        </button>

        <Link to="/logistics/crear" className="button is-success">
          <span className="icon"><i className="fas fa-plus" /></span>
          <span>Nuevo recurso</span>
        </Link>
      </div>

      {/* ── Contador ── */}
      {!loading && !error && (
        <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '16px' }}>
          {recursosFiltrados.length} recurso{recursosFiltrados.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Estados ── */}
      {loading && <LoadingSpinner message="Cargando recursos..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && recursosFiltrados.length === 0 && (
        <EmptyState
          icon="📦"
          title="Sin recursos"
          description="No hay recursos que coincidan con los filtros aplicados."
          action={{ label: 'Ver todos', onClick: () => { setFiltroEstado('Todos'); setBusqueda(''); } }}
        />
      )}

      {/* ── Grid de tarjetas ── */}
      {!loading && !error && recursosFiltrados.length > 0 && (
        <section className="resource-list">
          {recursosFiltrados.map((resource) => {
            const cfg = getEstadoConfig(resource.estado);
            return (
              <div className="resource-card" key={resource.id}>
                <div className={`resource-status-bar ${cfg.bar}`} />
                <div className="resource-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 className="resource-name">{resource.nombre}</h3>
                      <p className="resource-detail">
                        {resource.ubicacion || 'Sin ubicación especificada'}
                      </p>
                    </div>
                    <span className={`status-badge ${cfg.badge}`}>{cfg.label}</span>
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <Link
                      to={`/logistics/${resource.id}`}
                      className="button is-small is-primary is-light"
                      title="Ver detalle"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <i className="fas fa-eye" />
                      <span style={{ marginLeft: '6px' }}>Ver detalles →</span>
                    </Link>
                    <Link
                      to={`/logistics/${resource.id}/editar`}
                      className="button is-small is-light"
                      title="Editar"
                    >
                      <i className="fas fa-pen" />
                    </Link>
                    <button
                      className={`button is-small is-danger is-light ${deletingId === resource.id ? 'is-loading' : ''}`}
                      title="Eliminar"
                      onClick={() => handleDelete(resource.id)}
                      disabled={deletingId === resource.id}
                    >
                      <i className="fas fa-trash" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </DashboardLayout>
  );
};

export default Logistics;

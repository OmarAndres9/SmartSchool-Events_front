/**
 * views/myevents/MisEventos.jsx
 * Mis eventos — consume GET /api/eventos/mis-eventos (o /api/eventos como fallback).
 * 100% dinámico: sin datos hardcodeados.
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useFetch from '../../hooks/useFetch';
import eventosService from '../../services/eventosService';
import { formatDate, formatDateShort } from '../../utils/dateUtils';
import styles from './MisEventos.module.css';

const MisEventos = () => {
  const navigate = useNavigate();

  // Hook apuntando al endpoint específico de mis eventos
  const { data, loading, error, refetch } = useFetch(
    () => eventosService.getMisEventos()
  );

  const eventos = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  const [busqueda,     setBusqueda]     = useState('');
  const [filtroTipo,   setFiltroTipo]   = useState('');
  // CORRECCIÓN: filtroEstado eliminado — Eventos model no tiene campo 'estado'

  // ── Tipos únicos extraídos de los datos reales ──────────────────────────
  const tiposUnicos = useMemo(() => {
    const set = new Set(eventos.map((e) => e.tipo_evento).filter(Boolean));
    return Array.from(set);
  }, [eventos]);

  // ── Filtrado en cliente ─────────────────────────────────────────────────
  const eventosFiltrados = useMemo(() =>
    eventos.filter((ev) => {
      const coincideTipo   = !filtroTipo || ev.tipo_evento === filtroTipo;
      // CORRECCIÓN: ev.estado no existe en el modelo Eventos del backend
      // El filtro de estado se elimina para no romper resultados silenciosamente
      const termino        = busqueda.toLowerCase();
      const coincideBusq   = !busqueda ||
        ev.nombre?.toLowerCase().includes(termino) ||
        ev.lugar?.toLowerCase().includes(termino);
      return coincideTipo && coincideBusq;
    }),
    [eventos, filtroTipo, busqueda]
  );

  return (
    <DashboardLayout
      title="Mis Eventos"
      subtitle="Eventos registrados y asociados a tu cuenta."
    >
      {/* ── Barra de filtros ── */}
      <div className={styles.filtersBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por nombre o lugar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {/* Select de tipos construido dinámicamente */}
        <select
          className={styles.filterSelect}
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos los tipos</option>
          {tiposUnicos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {/* CORRECCIÓN: select de estado eliminado — Eventos no tiene campo estado */}

        <button className={styles.refreshBtn} onClick={refetch}>
          🔄 Actualizar
        </button>
      </div>

      {/* ── Contador ── */}
      {!loading && !error && (
        <p className={styles.resultCount}>
          {eventosFiltrados.length === 0
            ? 'Sin resultados'
            : `${eventosFiltrados.length} evento${eventosFiltrados.length !== 1 ? 's' : ''} encontrado${eventosFiltrados.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {loading && <LoadingSpinner message="Cargando tus eventos..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && eventosFiltrados.length === 0 && (
        <EmptyState
          icon="🎟️"
          title="No tienes eventos"
          description="No hay eventos asociados a tu cuenta, o ninguno coincide con los filtros."
          action={{ label: '+ Crear evento', onClick: () => navigate('/events') }}
        />
      )}

      {!loading && !error && eventosFiltrados.length > 0 && (
        <div className={styles.cardsGrid}>
          {eventosFiltrados.map((evento) => (
            <EventoCard
              key={evento.id}
              evento={evento}
              // CORRECCIÓN: /events/:id no existe en el router — se redirige a editar
              onVerDetalles={() => navigate(`/events/${evento.id}/editar`)}
              onEditar={() => navigate(`/events/${evento.id}/editar`)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

/** Tarjeta de evento individual */
const EventoCard = ({ evento, onVerDetalles, onEditar }) => (
  <article className={styles.card}>
    <div className={styles.cardHeader}>
      {evento.tipo_evento && <Badge tipo={evento.tipo_evento} label={evento.tipo_evento} />}
      {/* CORRECCIÓN: Badge de estado eliminado — Eventos model no tiene campo 'estado' */}
    </div>

    <div className={styles.cardTitleRow}>
      <h3 className={styles.cardTitle}>{evento.nombre || 'Sin nombre'}</h3>
      <span className={styles.cardId}>ID: {evento.id}</span>
    </div>

    <ul className={styles.cardMeta}>
      <li className={styles.metaItem}>
        <span className={styles.metaIcon}>📅</span>
        <span>{evento.fecha_inicio ? formatDate(evento.fecha_inicio) : 'Fecha no definida'}</span>
      </li>
      {evento.fecha_fin && (
        <li className={styles.metaItem}>
          <span className={styles.metaIcon}>🏁</span>
          <span>Hasta: {formatDateShort(evento.fecha_fin)}</span>
        </li>
      )}
      {evento.lugar && (
        <li className={styles.metaItem}>
          <span className={styles.metaIcon}>📍</span>
          <span>{evento.lugar}</span>
        </li>
      )}
      {evento.modalidad && (
        <li className={styles.metaItem}>
          <span className={styles.metaIcon}>🖥️</span>
          <span>{evento.modalidad}</span>
        </li>
      )}
      {evento.grupo_destinado && (
        <li className={styles.metaItem}>
          <span className={styles.metaIcon}>👥</span>
          <span>{evento.grupo_destinado}</span>
        </li>
      )}
    </ul>

    {evento.descripcion && (
      <p className={styles.cardDescription}>{evento.descripcion}</p>
    )}

    <div className={styles.cardFooter}>
      <button className={styles.detailBtn} onClick={onVerDetalles}>
        Ver detalles →
      </button>
      <button className={styles.editBtn} onClick={onEditar}>
        <i className="fas fa-pen" /> Editar
      </button>
    </div>
  </article>
);

export default MisEventos;

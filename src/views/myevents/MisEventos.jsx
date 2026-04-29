import React, { useState, useMemo } from 'react';
import { RefreshCw, Ticket, CalendarDays, Flag, MapPin, Monitor, Users, Pen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useMisEventos from '../../hooks/useMisEventos';
import { formatDate, formatDateShort } from '../../utils/dateUtils';
import styles from './MisEventos.module.css';

const MisEventos = () => {
  const navigate = useNavigate();

  // useMisEventos tiene cacheKey 'mis-eventos' → deduplicación automática
  const { eventos, loading, error, refetch } = useMisEventos();

  const [busqueda,   setBusqueda]   = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  const tiposUnicos = useMemo(() => {
    const set = new Set(eventos.map((e) => e.tipo_evento).filter(Boolean));
    return Array.from(set);
  }, [eventos]);

  const eventosFiltrados = useMemo(() =>
    eventos.filter((ev) => {
      const coincideTipo = !filtroTipo || ev.tipo_evento === filtroTipo;
      const termino      = busqueda.toLowerCase();
      const coincideBusq = !busqueda ||
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
      <div className={styles.filtersBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Buscar por nombre o lugar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
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
        <button className={styles.refreshBtn} onClick={refetch}>
          <RefreshCw size={14} style={{ marginRight: '6px' }} /> Actualizar
        </button>
      </div>

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
          icon={<Ticket size={48} />}
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
              onVerDetalles={() => navigate(`/events/${evento.id}/editar`)}
              onEditar={() => navigate(`/events/${evento.id}/editar`)}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

const EventoCard = ({ evento, onVerDetalles, onEditar }) => (
  <article className={styles.card}>
    <div className={styles.cardHeader}>
      {evento.tipo_evento && <Badge tipo={evento.tipo_evento} label={evento.tipo_evento} />}
    </div>
    <div className={styles.cardTitleRow}>
      <h3 className={styles.cardTitle}>{evento.nombre || 'Sin nombre'}</h3>
      <span className={styles.cardId}>ID: {evento.id}</span>
    </div>
    <ul className={styles.cardMeta}>
      <li className={styles.metaItem}>
        <span className={styles.metaIcon}><CalendarDays size={16} /></span>
        <span>{evento.fecha_inicio ? formatDate(evento.fecha_inicio) : 'Fecha no definida'}</span>
      </li>
      {evento.fecha_fin && (
        <li className={styles.metaItem}>
          <span className={styles.metaIcon}><Flag size={16} /></span>
          <span>Hasta: {formatDateShort(evento.fecha_fin)}</span>
        </li>
      )}
      {evento.lugar && (
        <li className={styles.metaItem}>
          <span className={styles.metaIcon}><MapPin size={16} /></span>
          <span>{evento.lugar}</span>
        </li>
      )}
      {evento.modalidad && (
        <li className={styles.metaItem}>
          <span className={styles.metaIcon}><Monitor size={16} /></span>
          <span>{evento.modalidad}</span>
        </li>
      )}
      {evento.grupo_destinado && (
        <li className={styles.metaItem}>
          <span className={styles.metaIcon}><Users size={16} /></span>
          <span>{evento.grupo_destinado}</span>
        </li>
      )}
    </ul>
    {evento.descripcion && (
      <p className={styles.cardDescription}>{evento.descripcion}</p>
    )}
    <div className={styles.cardFooter}>
      <button className={styles.detailBtn} onClick={onVerDetalles}>Ver detalles →</button>
      <button className={styles.editBtn} onClick={onEditar}>
        <Pen size={14} style={{ marginRight: '4px' }} /> Editar
      </button>
    </div>
  </article>
);

export default MisEventos;

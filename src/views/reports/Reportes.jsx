/**
 * views/reports/Reportes.jsx
 * Reportes de eventos — consume GET /api/reportes con filtros dinámicos.
 * Los select de tipo y estado se construyen con los valores únicos
 * encontrados en los propios datos de la API.
 */

import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import useReportes from '../../hooks/useReportes';
import { formatDate } from '../../utils/dateUtils';
import styles from './Reportes.module.css';

const FILTROS_INICIALES = { fecha_inicio: '', fecha_fin: '', tipo: '', estado: '' };

const Reportes = () => {
  const [filtros,  setFiltros]  = useState(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  // filtrosActivos: los que realmente se envían al backend (al hacer click en Buscar)
  const [filtrosActivos, setFiltrosActivos] = useState(FILTROS_INICIALES);

  const { reportes, loading, error, refetch } = useReportes(filtrosActivos);

  // ── Opciones de selects construidas desde los datos reales ──────────────
  const tiposUnicos = useMemo(() => {
    const set = new Set(reportes.map((r) => r.tipo).filter(Boolean));
    return Array.from(set);
  }, [reportes]);

  const estadosUnicos = useMemo(() => {
    const set = new Set(reportes.map((r) => r.estado).filter(Boolean));
    return Array.from(set);
  }, [reportes]);

  // ── Filtrado de texto en cliente (sobre resultados ya cargados) ─────────
  const reportesFiltrados = useMemo(() =>
    reportes.filter((r) => {
      if (!busqueda) return true;
      const t = busqueda.toLowerCase();
      return (
        r.descripcion?.toLowerCase().includes(t) ||
        r.tipo?.toLowerCase().includes(t)
      );
    }),
    [reportes, busqueda]
  );

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    setFiltrosActivos({ ...filtros }); // dispara recarga con nuevos params
  };

  const handleLimpiar = () => {
    setFiltros(FILTROS_INICIALES);
    setFiltrosActivos(FILTROS_INICIALES);
    setBusqueda('');
  };

  return (
    <DashboardLayout
      title="Reportes"
      subtitle="Consulta y filtra los reportes de eventos del sistema."
    >
      {/* ── Panel de filtros ── */}
      <section className={styles.filterPanel}>
        <h3 className={styles.filterTitle}>🔍 Filtros de búsqueda</h3>

        <form className={styles.filterForm} onSubmit={handleBuscar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="fecha_inicio">Fecha desde</label>
            <input id="fecha_inicio" type="date" name="fecha_inicio"
              value={filtros.fecha_inicio} onChange={handleFiltroChange}
              className={styles.filterInput} />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="fecha_fin">Fecha hasta</label>
            <input id="fecha_fin" type="date" name="fecha_fin"
              value={filtros.fecha_fin} onChange={handleFiltroChange}
              className={styles.filterInput} />
          </div>

          {/* Select de tipo — construido con valores reales */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="tipo">Tipo de evento</label>
            <select id="tipo" name="tipo" value={filtros.tipo}
              onChange={handleFiltroChange} className={styles.filterInput}>
              <option value="">Todos los tipos</option>
              {tiposUnicos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Select de estado — construido con valores reales */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="estado">Estado</label>
            <select id="estado" name="estado" value={filtros.estado}
              onChange={handleFiltroChange} className={styles.filterInput}>
              <option value="">Todos los estados</option>
              {estadosUnicos.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterActions}>
            <button type="submit" className={styles.btnBuscar}>Buscar</button>
            <button type="button" className={styles.btnLimpiar} onClick={handleLimpiar}>Limpiar</button>
          </div>
        </form>

        {/* Búsqueda libre sobre resultados ya cargados */}
        <div className={styles.searchRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar en descripción o tipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </section>

      {/* ── Contador ── */}
      {!loading && !error && (
        <p className={styles.resultCount}>
          {reportesFiltrados.length === 0
            ? 'Sin resultados'
            : `${reportesFiltrados.length} reporte${reportesFiltrados.length !== 1 ? 's' : ''} encontrado${reportesFiltrados.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {loading && <LoadingSpinner message="Cargando reportes..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}

      {!loading && !error && reportesFiltrados.length === 0 && (
        <EmptyState
          icon="📋"
          title="No hay reportes"
          description="No se encontraron reportes con los criterios seleccionados."
          action={{ label: 'Limpiar filtros', onClick: handleLimpiar }}
        />
      )}

      {!loading && !error && reportesFiltrados.length > 0 && (
        <ReportesTabla reportes={reportesFiltrados} />
      )}
    </DashboardLayout>
  );
};

/** Tabla de resultados */
const ReportesTabla = ({ reportes }) => (
  <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>#</th>
          <th className={styles.th}>Tipo</th>
          <th className={styles.th}>Descripción</th>
          <th className={styles.th}>Fecha</th>
          <th className={styles.th}>Estado</th>
          <th className={styles.th}>ID Evento</th>
          <th className={styles.th}>Creado</th>
        </tr>
      </thead>
      <tbody>
        {reportes.map((r, i) => (
          <tr key={r.id} className={styles.tr}>
            <td className={styles.tdMuted}>{i + 1}</td>
            <td className={styles.td}>
              <Badge tipo={r.tipo} label={r.tipo || '—'} />
            </td>
            <td className={styles.tdDesc}>
              {r.descripcion
                ? r.descripcion.length > 80
                  ? `${r.descripcion.slice(0, 80)}…`
                  : r.descripcion
                : <span className={styles.empty}>Sin descripción</span>}
            </td>
            <td className={styles.td}>
              {r.fecha ? formatDate(r.fecha) : '—'}
            </td>
            <td className={styles.td}>
              {r.estado ? <Badge estado={r.estado} label={r.estado} /> : '—'}
            </td>
            <td className={styles.tdMuted}>{r.id_evento ?? '—'}</td>
            <td className={styles.tdMuted}>
              {r.created_at ? formatDate(r.created_at) : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Reportes;

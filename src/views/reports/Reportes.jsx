/**
 * views/reports/Reportes.jsx
 * Reportes con filtros + exportar PDF + crear reporte.
 */

import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
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
  const [filtros,        setFiltros]        = useState(FILTROS_INICIALES);
  const [busqueda,       setBusqueda]       = useState('');
  const [filtrosActivos, setFiltrosActivos] = useState(FILTROS_INICIALES);
  const [exporting,      setExporting]      = useState(false);
  const tableRef = useRef(null);

  const { reportes, loading, error, refetch } = useReportes(filtrosActivos);

  const tiposUnicos = useMemo(() => {
    const set = new Set(reportes.map(r => r.tipo).filter(Boolean));
    return Array.from(set);
  }, [reportes]);

  const estadosUnicos = useMemo(() => {
    const set = new Set(reportes.map(r => r.estado).filter(Boolean));
    return Array.from(set);
  }, [reportes]);

  const reportesFiltrados = useMemo(() =>
    reportes.filter(r => {
      if (!busqueda) return true;
      const t = busqueda.toLowerCase();
      return r.descripcion?.toLowerCase().includes(t) || r.tipo?.toLowerCase().includes(t);
    }),
    [reportes, busqueda]
  );

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    setFiltrosActivos({ ...filtros });
  };

  const handleLimpiar = () => {
    setFiltros(FILTROS_INICIALES);
    setFiltrosActivos(FILTROS_INICIALES);
    setBusqueda('');
  };

  // ── Exportar PDF usando window.print con estilos de impresión ──────────
  const handleExportPDF = () => {
    setExporting(true);
    const contenido = tableRef.current?.innerHTML || '';
    const ventana = window.open('', '_blank', 'width=900,height=700');
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8"/>
        <title>Reportes — SmartSchool Events</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', sans-serif; padding: 24px; color: #1a2332; }
          h1 { font-size: 20px; margin-bottom: 4px; color: #2e7d32; }
          p.sub { font-size: 12px; color: #64748b; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #2e7d32; color: white; padding: 8px 12px; text-align: left; font-weight: 700; }
          td { padding: 7px 12px; border-bottom: 1px solid #e2e8f0; }
          tr:nth-child(even) td { background: #f8fafc; }
          .badge { padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 700; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>📊 Reportes — SmartSchool Events</h1>
        <p class="sub">Generado el ${new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        ${contenido}
      </body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => {
      ventana.print();
      ventana.close();
      setExporting(false);
    }, 500);
  };

  return (
    <DashboardLayout
      title="Reportes"
      subtitle="Consulta, filtra y exporta los reportes de eventos del sistema."
    >
      {/* ── Filtros ── */}
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
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="tipo">Tipo</label>
            <select id="tipo" name="tipo" value={filtros.tipo}
              onChange={handleFiltroChange} className={styles.filterInput}>
              <option value="">Todos</option>
              {tiposUnicos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="estado">Estado</label>
            <select id="estado" name="estado" value={filtros.estado}
              onChange={handleFiltroChange} className={styles.filterInput}>
              <option value="">Todos</option>
              {estadosUnicos.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div className={styles.filterActions}>
            <button type="submit" className={styles.btnBuscar}>Buscar</button>
            <button type="button" className={styles.btnLimpiar} onClick={handleLimpiar}>Limpiar</button>
          </div>
        </form>
        <div className={styles.searchRow}>
          <input type="text" className={styles.searchInput}
            placeholder="Buscar en descripción o tipo..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        </div>
      </section>

      {/* ── Acciones ── */}
      <div className={styles.actionsRow}>
        {!loading && !error && (
          <p className={styles.resultCount}>
            {reportesFiltrados.length === 0 ? 'Sin resultados'
              : `${reportesFiltrados.length} reporte${reportesFiltrados.length !== 1 ? 's' : ''}`}
          </p>
        )}
        <div className={styles.actionsRight}>
          <button
            className={styles.btnPDF}
            onClick={handleExportPDF}
            disabled={exporting || reportesFiltrados.length === 0}
          >
            <i className="fas fa-file-pdf" />
            {exporting ? ' Generando...' : ' Exportar PDF'}
          </button>
          <Link to="/reports/crear" className={styles.btnCrear}>
            <i className="fas fa-plus" /> Nuevo reporte
          </Link>
        </div>
      </div>

      {loading && <LoadingSpinner message="Cargando reportes..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={refetch} />}
      {!loading && !error && reportesFiltrados.length === 0 && (
        <EmptyState icon="📋" title="No hay reportes"
          description="No se encontraron reportes con los criterios seleccionados."
          action={{ label: 'Limpiar filtros', onClick: handleLimpiar }} />
      )}

      {!loading && !error && reportesFiltrados.length > 0 && (
        <div ref={tableRef}>
          <ReportesTabla reportes={reportesFiltrados} />
        </div>
      )}
    </DashboardLayout>
  );
};

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
            <td className={styles.td}><Badge tipo={r.tipo} label={r.tipo || '—'} /></td>
            <td className={styles.tdDesc}>
              {r.descripcion
                ? r.descripcion.length > 80 ? `${r.descripcion.slice(0, 80)}…` : r.descripcion
                : <span className={styles.empty}>Sin descripción</span>}
            </td>
            <td className={styles.td}>{r.fecha ? formatDate(r.fecha) : '—'}</td>
            <td className={styles.td}>{r.estado ? <Badge estado={r.estado} label={r.estado} /> : '—'}</td>
            <td className={styles.tdMuted}>{r.id_evento ?? '—'}</td>
            <td className={styles.tdMuted}>{r.created_at ? formatDate(r.created_at) : '—'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Reportes;

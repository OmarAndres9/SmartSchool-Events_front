/**
 * components/ui/CalendarioEventos.jsx
 * Calendario mensual interactivo que muestra los eventos del backend.
 * Sin librerías externas — React puro + CSS Modules.
 */

import React, { useState, useMemo } from 'react';
import styles from './CalendarioEventos.module.css';

/* ── Utilidades de fecha ───────────────────────────────────── */
const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const COLOR_TIPO = {
  academico:  { bg: '#e3f2fd', color: '#1565c0', dot: '#1976D2' },
  cultural:   { bg: '#f3e5f5', color: '#6a1b9a', dot: '#7B1FA2' },
  deportivo:  { bg: '#e8f5e9', color: '#2e7d32', dot: '#388E3C' },
  recreativo: { bg: '#fff3e0', color: '#e65100', dot: '#F57C00' },
  examen:     { bg: '#ffebee', color: '#c62828', dot: '#D32F2F' },
};

const getColor = (tipo) =>
  COLOR_TIPO[tipo?.toLowerCase()] || { bg: '#f5f5f5', color: '#555', dot: '#9E9E9E' };

/* Devuelve la clave YYYY-MM-DD de un objeto Date en hora local */
const toKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/* Devuelve todos los días a mostrar en la cuadrícula del mes */
const buildGrid = (year, month) => {
  const firstDay  = new Date(year, month, 1).getDay();      // 0=Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells = [];

  // días del mes anterior (relleno)
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, current: false, date: new Date(year, month - 1, prevMonthDays - i) });
  }
  // días del mes actual
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, date: new Date(year, month, d) });
  }
  // días del mes siguiente (relleno hasta completar filas de 7)
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ day: next++, current: false, date: new Date(year, month + 1, next - 1) });
  }
  return cells;
};

/* ── Componente ────────────────────────────────────────────── */
const CalendarioEventos = ({ eventos = [] }) => {
  const today    = new Date();
  const [year,   setYear]    = useState(today.getFullYear());
  const [month,  setMonth]   = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // key YYYY-MM-DD

  /* Indexar eventos por día: { 'YYYY-MM-DD': [ev, ev, ...] } */
  const eventosPorDia = useMemo(() => {
    const map = {};
    eventos.forEach((ev) => {
      if (!ev.fecha_inicio) return;
      const d = new Date(ev.fecha_inicio);
      // iterar desde fecha_inicio hasta fecha_fin (o mismo día)
      const fin = ev.fecha_fin ? new Date(ev.fecha_fin) : d;
      const cur = new Date(d);
      cur.setHours(0, 0, 0, 0);
      fin.setHours(0, 0, 0, 0);
      while (cur <= fin) {
        const k = toKey(cur);
        if (!map[k]) map[k] = [];
        map[k].push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [eventos]);

  const grid = useMemo(() => buildGrid(year, month), [year, month]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelected(null);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelected(null);
  };
  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelected(toKey(today));
  };

  const todayKey    = toKey(today);
  const selectedEvs = selected ? (eventosPorDia[selected] || []) : [];

  return (
    <div className={styles.wrapper}>

      {/* ── Cabecera ── */}
      <div className={styles.header}>
        <button className={styles.navBtn} onClick={prevMonth} aria-label="Mes anterior">
          <i className="fas fa-chevron-left" />
        </button>

        <div className={styles.headerCenter}>
          <h3 className={styles.monthTitle}>
            {MESES[month]} <span className={styles.year}>{year}</span>
          </h3>
          <button className={styles.todayBtn} onClick={goToday}>Hoy</button>
        </div>

        <button className={styles.navBtn} onClick={nextMonth} aria-label="Mes siguiente">
          <i className="fas fa-chevron-right" />
        </button>
      </div>

      {/* ── Días de la semana ── */}
      <div className={styles.weekRow}>
        {DIAS_SEMANA.map((d) => (
          <div key={d} className={styles.weekDay}>{d}</div>
        ))}
      </div>

      {/* ── Cuadrícula ── */}
      <div className={styles.grid}>
        {grid.map((cell, i) => {
          const key      = toKey(cell.date);
          const evs      = eventosPorDia[key] || [];
          const isToday  = key === todayKey;
          const isSel    = key === selected;
          const hasEvs   = evs.length > 0;

          return (
            <button
              key={i}
              className={[
                styles.cell,
                !cell.current   && styles.cellOther,
                isToday         && styles.cellToday,
                isSel           && styles.cellSelected,
                hasEvs          && styles.cellHasEvents,
              ].filter(Boolean).join(' ')}
              onClick={() => setSelected(isSel ? null : key)}
              aria-label={`${cell.day} ${MESES[cell.date.getMonth()]}`}
              aria-pressed={isSel}
            >
              <span className={styles.dayNum}>{cell.day}</span>

              {/* Puntos de eventos — máx 3 visibles */}
              {hasEvs && (
                <span className={styles.dots}>
                  {evs.slice(0, 3).map((ev, j) => (
                    <span
                      key={j}
                      className={styles.dot}
                      style={{ background: getColor(ev.tipo_evento).dot }}
                    />
                  ))}
                  {evs.length > 3 && (
                    <span className={styles.dotMore}>+{evs.length - 3}</span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Panel de eventos del día seleccionado ── */}
      {selected && (
        <div className={styles.dayPanel}>
          <div className={styles.dayPanelHeader}>
            <span className={styles.dayPanelDate}>
              {new Date(selected + 'T12:00:00').toLocaleDateString('es-CO', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </span>
            <button
              className={styles.dayPanelClose}
              onClick={() => setSelected(null)}
              aria-label="Cerrar"
            >✕</button>
          </div>

          {selectedEvs.length === 0 ? (
            <p className={styles.dayEmpty}>Sin eventos para este día.</p>
          ) : (
            <ul className={styles.dayList}>
              {selectedEvs.map((ev) => {
                const c     = getColor(ev.tipo_evento);
                const hora  = ev.fecha_inicio
                  ? new Date(ev.fecha_inicio).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
                  : null;
                return (
                  <li key={ev.id} className={styles.dayEvent} style={{ borderLeftColor: c.dot }}>
                    <div className={styles.dayEventTop}>
                      <span className={styles.dayEventName}>{ev.nombre}</span>
                      <span
                        className={styles.dayEventBadge}
                        style={{ background: c.bg, color: c.color }}
                      >
                        {ev.tipo_evento || 'Evento'}
                      </span>
                    </div>
                    <div className={styles.dayEventMeta}>
                      {hora && (
                        <span><i className="fas fa-clock" /> {hora}</span>
                      )}
                      {ev.lugar && (
                        <span><i className="fas fa-map-marker-alt" /> {ev.lugar}</span>
                      )}
                      {ev.modalidad && (
                        <span><i className="fas fa-laptop" /> {ev.modalidad}</span>
                      )}
                    </div>
                    {ev.descripcion && (
                      <p className={styles.dayEventDesc}>{ev.descripcion}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── Leyenda de tipos ── */}
      <div className={styles.legend}>
        {Object.entries(COLOR_TIPO).map(([tipo, c]) => (
          <span key={tipo} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: c.dot }} />
            <span className={styles.legendLabel}>
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default CalendarioEventos;

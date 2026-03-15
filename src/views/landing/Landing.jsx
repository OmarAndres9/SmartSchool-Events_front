/**
 * views/landing/Landing.jsx
 * Página de bienvenida pública de SmartSchool Events.
 * Secciones: Hero · Características · Cómo funciona · Estadísticas · CTA final
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Landing.module.css';

/* ─── Datos de contenido ─────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: '📅',
    title: 'Gestión de Eventos',
    desc: 'Crea, edita y administra todos los eventos institucionales desde un solo lugar. Académicos, culturales, deportivos y más.',
  },
  {
    icon: '👥',
    title: 'Gestión de Usuarios',
    desc: 'Administra estudiantes, docentes, acudientes y organizadores con roles y permisos diferenciados.',
  },
  {
    icon: '📦',
    title: 'Control de Recursos',
    desc: 'Gestiona salones, equipos y espacios. Visualiza disponibilidad en tiempo real y evita conflictos de reservas.',
  },
  {
    icon: '🔔',
    title: 'Notificaciones',
    desc: 'Mantén a toda la comunidad informada con alertas automáticas sobre cambios, aprobaciones y recordatorios.',
  },
  {
    icon: '📊',
    title: 'Reportes y Estadísticas',
    desc: 'Genera reportes detallados por fecha, tipo y estado. Toma decisiones basadas en datos reales.',
  },
  {
    icon: '🔒',
    title: 'Acceso Seguro',
    desc: 'Autenticación con roles. Cada usuario ve y hace exactamente lo que le corresponde según su perfil.',
  },
];

const STEPS = [
  { num: '01', title: 'Regístrate', desc: 'Crea tu cuenta con tu correo institucional y selecciona tu rol en la comunidad educativa.' },
  { num: '02', title: 'Crea un evento', desc: 'Completa el formulario con los datos del evento: nombre, fecha, lugar, tipo y descripción.' },
  { num: '03', title: 'Gestiona recursos', desc: 'Asigna los espacios y equipos necesarios. El sistema verifica disponibilidad automáticamente.' },
  { num: '04', title: 'Notifica a todos', desc: 'La comunidad recibe alertas automáticas. Todos saben qué pasa, cuándo y dónde.' },
];

const STATS = [
  { value: '500+', label: 'Estudiantes activos' },
  { value: '80+',  label: 'Eventos al año' },
  { value: '30+',  label: 'Docentes registrados' },
  { value: '15+',  label: 'Recursos gestionados' },
];

/* ─── Componente principal ───────────────────────────────────────────────── */
const Landing = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled,  setScrolled] = useState(false);

  // Sombra en navbar al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Redirigir si ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const scrollTo = (id) => {
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={styles.page}>

      {/* ══════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════ */}
      <header className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navContainer}>
          {/* Logo */}
          <Link to="/" className={styles.navLogo}>
            <span className={styles.navLogoIcon}>🎓</span>
            <span>SmartSchool<strong>Events</strong></span>
          </Link>

          {/* Links escritorio */}
          <nav className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
            <button className={styles.navLink} onClick={() => scrollTo('features')}>Características</button>
            <button className={styles.navLink} onClick={() => scrollTo('how')}>Cómo funciona</button>
            <button className={styles.navLink} onClick={() => scrollTo('stats')}>Estadísticas</button>
          </nav>

          {/* Acciones */}
          <div className={styles.navActions}>
            <Link to="/login"    className={styles.btnOutline}>Iniciar sesión</Link>
            <Link to="/register" className={styles.btnPrimary}>Registrarse</Link>
          </div>

          {/* Hamburguesa móvil */}
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            <span className={`${styles.hLine} ${menuOpen ? styles.hLine1Open : ''}`} />
            <span className={`${styles.hLine} ${menuOpen ? styles.hLine2Open : ''}`} />
            <span className={`${styles.hLine} ${menuOpen ? styles.hLine3Open : ''}`} />
          </button>
        </div>

        {/* Menú móvil desplegable */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <button className={styles.mobileLink} onClick={() => scrollTo('features')}>Características</button>
            <button className={styles.mobileLink} onClick={() => scrollTo('how')}>Cómo funciona</button>
            <button className={styles.mobileLink} onClick={() => scrollTo('stats')}>Estadísticas</button>
            <Link to="/login"    className={styles.mobileLink} onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
            <Link to="/register" className={`${styles.mobileLink} ${styles.mobileLinkPrimary}`} onClick={() => setMenuOpen(false)}>Registrarse</Link>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>🏫 Sistema Escolar Inteligente</span>
          <h1 className={styles.heroTitle}>
            Gestiona todos los eventos
            <span className={styles.heroTitleAccent}> de tu institución</span>
          </h1>
          <p className={styles.heroSubtitle}>
            SmartSchool Events centraliza la planificación, comunicación y seguimiento
            de actividades académicas, culturales y deportivas en un solo lugar.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/register" className={styles.btnHeroPrimary}>
              Comenzar gratis →
            </Link>
            <button className={styles.btnHeroSecondary} onClick={() => scrollTo('how')}>
              Ver cómo funciona
            </button>
          </div>
          <p className={styles.heroNote}>
            Sin tarjeta de crédito · Acceso inmediato · Para toda la comunidad educativa
          </p>
        </div>

        {/* Decoración visual */}
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.heroCard}>
            <div className={styles.hcHeader}>
              <span className={styles.hcDot} style={{ background: '#f44336' }} />
              <span className={styles.hcDot} style={{ background: '#ff9800' }} />
              <span className={styles.hcDot} style={{ background: '#4caf50' }} />
              <span className={styles.hcTitle}>Próximos Eventos</span>
            </div>
            {[
              { day: '01', mon: 'SEP', name: 'Feria de Ciencias',   tipo: 'Académico',  color: '#e3f2fd', tc: '#1565c0' },
              { day: '05', mon: 'SEP', name: 'Banda Escolar',        tipo: 'Cultural',   color: '#f3e5f5', tc: '#6a1b9a' },
              { day: '15', mon: 'SEP', name: 'Simulacro ICFES',      tipo: 'Examen',     color: '#ffebee', tc: '#c62828' },
              { day: '20', mon: 'OCT', name: 'Torneo Deportivo',     tipo: 'Deportivo',  color: '#e8f5e9', tc: '#2e7d32' },
            ].map((ev) => (
              <div className={styles.hcRow} key={ev.name}>
                <div className={styles.hcDate}>
                  <span className={styles.hcDay}>{ev.day}</span>
                  <span className={styles.hcMon}>{ev.mon}</span>
                </div>
                <span className={styles.hcName}>{ev.name}</span>
                <span className={styles.hcTag} style={{ background: ev.color, color: ev.tc }}>
                  {ev.tipo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CARACTERÍSTICAS
      ══════════════════════════════════════════ */}
      <section className={styles.features} id="features">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionLabel}>✦ Funcionalidades</div>
          <h2 className={styles.sectionTitle}>Todo lo que necesita tu institución</h2>
          <p className={styles.sectionSubtitle}>
            Una plataforma completa diseñada específicamente para la gestión de
            eventos en colegios y centros educativos.
          </p>

          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div className={styles.featureCard} key={f.title}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CÓMO FUNCIONA
      ══════════════════════════════════════════ */}
      <section className={styles.howSection} id="how">
        <div className={styles.sectionContainer}>
          <div className={styles.sectionLabel}>✦ Proceso</div>
          <h2 className={styles.sectionTitle}>Tan simple como 4 pasos</h2>
          <p className={styles.sectionSubtitle}>
            Comienza a gestionar eventos institucionales en minutos.
          </p>

          <div className={styles.stepsGrid}>
            {STEPS.map((s, i) => (
              <div className={styles.stepCard} key={s.num}>
                <div className={styles.stepNum}>{s.num}</div>
                {i < STEPS.length - 1 && <div className={styles.stepConnector} aria-hidden="true" />}
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ESTADÍSTICAS
      ══════════════════════════════════════════ */}
      <section className={styles.statsSection} id="stats">
        <div className={styles.sectionContainer}>
          <div className={styles.statsGrid}>
            {STATS.map((s) => (
              <div className={styles.statItem} key={s.label}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════ */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>¿Listo para transformar la gestión de tu institución?</h2>
          <p className={styles.ctaSubtitle}>
            Únete a la comunidad educativa que ya confía en SmartSchool Events.
          </p>
          <div className={styles.ctaBtns}>
            <Link to="/register" className={styles.btnCtaPrimary}>Crear cuenta gratis</Link>
            <Link to="/login"    className={styles.btnCtaOutline}>Iniciar sesión</Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <span>🎓</span>
            <span>SmartSchool<strong>Events</strong></span>
          </div>
          <p className={styles.footerText}>
            Sistema de Gestión de Eventos Escolares · {new Date().getFullYear()}
          </p>
          <div className={styles.footerLinks}>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;

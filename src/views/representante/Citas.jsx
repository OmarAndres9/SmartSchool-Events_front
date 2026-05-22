import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Check, X, Calendar, Clock, MessageSquare, User, RefreshCw, AlertTriangle } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import EmptyState from '../../components/ui/EmptyState';
import citasService from '../../services/citasService';
import usuariosService from '../../services/usuariosService';
import useAuth from '../../hooks/useAuth';
import { formatDate, formatDateShort } from '../../utils/dateUtils';

const ROLES_DOCENTES = ['docente', 'directivo', 'admin'];

const ModalCrearCita = ({ onClose, onCreated }) => {
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(true);
  const [formData, setFormData] = useState({
    destinatario_id: '',
    fecha_solicitada: '',
    motivo: '',
    comentario: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const res = await usuariosService.getAll();
        const data = Array.isArray(res.data) ? res.data : Array.isArray(res.data?.data) ? res.data.data : [];
        if (mounted.current) {
          const filtrados = data.filter(u => {
            const rolRaw = u.roles?.[0];
            const rol = (typeof rolRaw === 'string' ? rolRaw : rolRaw?.name || '').toLowerCase();
            return ROLES_DOCENTES.includes(rol);
          });
          setUsuarios(filtrados);
        }
      } catch (err) {
        if (mounted.current) setUsuarios([]);
      } finally {
        if (mounted.current) setLoadingUsuarios(false);
      }
    };
    fetchUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.destinatario_id) { setError('Debes seleccionar un destinatario.'); return; }
    if (!formData.fecha_solicitada) { setError('Debes seleccionar una fecha.'); return; }
    if (new Date(formData.fecha_solicitada) <= new Date()) { setError('La fecha debe ser posterior a hoy.'); return; }
    if (!formData.motivo.trim()) { setError('El motivo es obligatorio.'); return; }

    setSubmitting(true);
    try {
      await citasService.create({
        destinatario_id: formData.destinatario_id,
        fecha_solicitada: formData.fecha_solicitada,
        motivo: formData.motivo,
        comentario: formData.comentario || undefined,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al crear la cita.');
    } finally {
      if (mounted.current) setSubmitting(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="modal is-active" style={{ zIndex: 1000 }}>
      <div className="modal-background" onClick={onClose} />
      <div className="modal-card" style={{ maxWidth: '520px', width: '95%', borderRadius: '12px' }}>
        <header className="modal-card-head" style={{ padding: '16px 20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="modal-card-title" style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Solicitar Cita</p>
          <button className="delete" onClick={onClose} aria-label="Cerrar" />
        </header>

        <form onSubmit={handleSubmit}>
          <section className="modal-card-body" style={{ padding: '20px' }}>
            {error && (
              <div className="notification is-danger is-light" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                <AlertTriangle size={18} /> {error}
              </div>
            )}

            <div className="field">
              <label className="label">Destinatario</label>
              <div className="control">
                <div className={`select is-fullwidth ${loadingUsuarios ? 'is-loading' : ''}`}>
                  <select
                    name="destinatario_id"
                    value={formData.destinatario_id}
                    onChange={handleChange}
                    disabled={loadingUsuarios}
                    required
                  >
                    <option value="">Selecciona un destinatario</option>
                    {usuarios.map((u) => {
                      const rolRaw = u.roles?.[0];
                      const rol = (typeof rolRaw === 'string' ? rolRaw : rolRaw?.name || '');
                      return (
                        <option key={u.id} value={u.id}>
                          {u.nombre || u.name} ({rol})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Fecha de la Cita</label>
              <div className="control">
                <input
                  className="input"
                  type="date"
                  name="fecha_solicitada"
                  value={formData.fecha_solicitada}
                  onChange={handleChange}
                  min={minDateStr}
                  required
                />
              </div>
              <p className="help">La fecha debe ser posterior a hoy.</p>
            </div>

            <div className="field">
              <label className="label">Motivo</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  placeholder="Ej: Revision de notas, reunion academica..."
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label">Comentario <span style={{ fontWeight: 400, color: '#999' }}>(opcional)</span></label>
              <div className="control">
                <textarea
                  className="textarea"
                  name="comentario"
                  value={formData.comentario}
                  onChange={handleChange}
                  placeholder="Detalles adicionales..."
                  rows={3}
                />
              </div>
            </div>
          </section>

          <footer className="modal-card-foot" style={{ padding: '12px 20px', borderTop: '1px solid #e0e0e0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="button" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="button is-primary" disabled={submitting || loadingUsuarios}>
              {submitting ? 'Enviando...' : 'Enviar Solicitud'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

const EstadoBadge = ({ estado }) => {
  const colorMap = {
    pendiente: { bg: '#fff8e1', color: '#f57f17' },
    aprobada: { bg: '#e8f5e9', color: '#2e7d32' },
    rechazada: { bg: '#ffebee', color: '#c62828' },
  };
  const style = colorMap[estado?.toLowerCase()] || { bg: '#f5f5f5', color: '#555' };
  return (
    <span className="tag" style={{ background: style.bg, color: style.color, fontWeight: 700 }}>
      {estado || 'Pendiente'}
    </span>
  );
};

const Citas = () => {
  const { user } = useAuth();
  const rolRaw = user?.roles?.[0];
  const rol = (typeof rolRaw === 'string' ? rolRaw : rolRaw?.name || '').toLowerCase();
  const esDocenteDirectivo = ROLES_DOCENTES.includes(rol);

  const [citas, setCitas] = useState([]);
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const fetchCitas = useCallback(async () => {
    if (!mounted.current) return;
    setLoading(true);
    setError(null);
    try {
      const [citRes, penRes] = await Promise.all([
        citasService.getAll(),
        esDocenteDirectivo ? citasService.getPendientes() : Promise.resolve({ data: [] }),
      ]);

      if (mounted.current) {
        setCitas(Array.isArray(citRes.data) ? citRes.data : Array.isArray(citRes.data?.data) ? citRes.data.data : []);
        setPendientes(Array.isArray(penRes.data) ? penRes.data : Array.isArray(penRes.data?.data) ? penRes.data.data : []);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err.response?.data?.message || err.message || 'Error al cargar citas.');
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [esDocenteDirectivo]);

  useEffect(() => { fetchCitas(); }, [fetchCitas]);

  const handleAprobar = async (id) => {
    try {
      await citasService.aprobar(id);
      fetchCitas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al aprobar la cita.');
    }
  };

  const handleRechazar = async (id) => {
    try {
      await citasService.rechazar(id);
      fetchCitas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al rechazar la cita.');
    }
  };

  return (
    <DashboardLayout
      title="Citas"
      subtitle={esDocenteDirectivo ? 'Gestiona las solicitudes de citas recibidas.' : 'Administra tus solicitudes de citas.'}
    >
      <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="button is-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '6px' }} /> Solicitar Cita
        </button>
        <button className="button is-small is-light" onClick={fetchCitas} title="Actualizar">
          <RefreshCw size={14} />
        </button>
      </div>

      {showModal && (
        <ModalCrearCita
          onClose={() => setShowModal(false)}
          onCreated={fetchCitas}
        />
      )}

      {loading && <LoadingSpinner message="Cargando citas..." />}

      {!loading && error && <ErrorMessage message={error} onRetry={fetchCitas} />}

      {!loading && !error && esDocenteDirectivo && pendientes.length > 0 && (
        <div className="card-box" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">Solicitudes Pendientes de Aprobacion</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendientes.map((cita) => (
              <div key={cita.id} style={{
                padding: '14px', borderRadius: '10px', background: '#fff8e1',
                border: '1px solid #ffe082', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: '10px',
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 4px' }}>{cita.motivo}</p>
                  <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={12} /> {cita.solicitante?.nombre || cita.solicitante?.name || 'Solicitante'}
                    <span style={{ margin: '0 4px' }}>|</span>
                    <Calendar size={12} /> {cita.fecha_solicitada ? formatDateShort(cita.fecha_solicitada) : 'Sin fecha'}
                  </p>
                  {cita.comentario && (
                    <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 0', fontStyle: 'italic' }}>
                      "{cita.comentario}"
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="button is-small is-success" onClick={() => handleAprobar(cita.id)} title="Aprobar">
                    <Check size={14} style={{ marginRight: '4px' }} /> Aprobar
                  </button>
                  <button className="button is-small is-danger is-light" onClick={() => handleRechazar(cita.id)} title="Rechazar">
                    <X size={14} style={{ marginRight: '4px' }} /> Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="card-box">
          <div className="card-header">
            <h3 className="card-title">Mis Solicitudes</h3>
          </div>
          {citas.length === 0 ? (
            <EmptyState
              title="Sin solicitudes"
              description="Aun no has realizado ninguna solicitud de cita."
              action={rol !== 'docente' && rol !== 'directivo' ? { label: 'Solicitar Cita', onClick: () => setShowModal(true) } : undefined}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {citas.sort((a, b) => new Date(b.created_at || b.fecha_solicitada) - new Date(a.created_at || a.fecha_solicitada)).map((cita) => (
                <div key={cita.id} style={{
                  padding: '14px', borderRadius: '10px', background: '#f8f9fa',
                  border: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  flexWrap: 'wrap', gap: '10px',
                }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>{cita.motivo}</p>
                      <EstadoBadge estado={cita.estado || 'pendiente'} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#666', margin: 0, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <Calendar size={12} /> {cita.fecha_solicitada ? formatDate(cita.fecha_solicitada) : 'Sin fecha'}
                      {cita.destinatario && (
                        <>
                          <span style={{ margin: '0 4px' }}>|</span>
                          <User size={12} /> Para: {cita.destinatario?.nombre || cita.destinatario?.name || 'Destinatario'}
                        </>
                      )}
                    </p>
                    {cita.comentario && (
                      <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 0' }}>
                        <MessageSquare size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                        {cita.comentario}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Citas;

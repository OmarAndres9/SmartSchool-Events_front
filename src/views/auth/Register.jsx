import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        documento: '',
        tipo_documento: 'CC', // Por defecto
        email: '',
        password: '',
        password_confirmation: '',
        rol: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');
        setSuccessMsg('');

        if (formData.password !== formData.password_confirmation) {
            setErrorMsg('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/register', formData);
            setSuccessMsg('Registro exitoso. Redirigiendo al login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            console.error('Error en registro:', error);
            setErrorMsg(
                error.response?.data?.message ||
                'Ocurrió un error al intentar registrarse. Verifica los datos.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            minHeight: '100vh',
            margin: 0
        }}>
            <div className="login-card" style={{ maxWidth: '600px', minHeight: 'auto' }}>
                <div className="login-right" style={{ padding: '40px' }}>
                    <div className="login-form">
                        <h2 className="has-text-centered mb-2">Crear Cuenta</h2>
                        <p className="has-text-centered mb-5 has-text-grey">Únete a la comunidad educativa</p>

                        {errorMsg && <div className="notification is-danger is-light px-3 py-2">{errorMsg}</div>}
                        {successMsg && <div className="notification is-success is-light px-3 py-2">{successMsg}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="field">
                                <label className="label">Nombre Completo</label>
                                <div className="control">
                                    <input className="input" type="text" name="name" value={formData.name} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="columns is-mobile mb-0">
                                <div className="column is-4 field">
                                    <label className="label">Tipo ID</label>
                                    <div className="control">
                                        <div className="select is-fullwidth">
                                            <select name="tipo_documento" value={formData.tipo_documento} onChange={handleChange}>
                                                <option value="CC">CC</option>
                                                <option value="TI">TI</option>
                                                <option value="CE">CE</option>
                                                <option value="RC">RC</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="column is-8 field">
                                    <label className="label">Número de Documento</label>
                                    <div className="control">
                                        <input className="input" type="text" name="documento" value={formData.documento} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Correo Electrónico</label>
                                <div className="control">
                                    <input className="input" type="email" name="email" value={formData.email} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Rol en la institución</label>
                                <div className="control">
                                    <div className="select is-fullwidth">
                                        <select name="rol" value={formData.rol} onChange={handleChange} required>
                                            <option value="" disabled>Seleccionar Rol...</option>
                                            <option value="Estudiante">Estudiante</option>
                                            <option value="Docente">Docente</option>
                                            <option value="Acudiente">Acudiente</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="columns mb-0">
                                <div className="column field">
                                    <label className="label">Contraseña</label>
                                    <div className="control">
                                        <input className="input" type="password" name="password" value={formData.password} onChange={handleChange} required />
                                    </div>
                                </div>
                                <div className="column field">
                                    <label className="label">Confirmar Contraseña</label>
                                    <div className="control">
                                        <input className="input" type="password" name="password_confirmation" value={formData.password_confirmation} onChange={handleChange} required />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`button is-primary is-fullwidth mt-4 ${loading ? 'is-loading' : ''}`}
                                disabled={loading}
                            >
                                Registrar
                            </button>
                        </form>

                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                            <p>
                                ¿Ya tienes una cuenta? <Link to="/login" style={{ color: 'var(--secondary-color)', fontWeight: '600' }}>Inicia sesión aquí</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

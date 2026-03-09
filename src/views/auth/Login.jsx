import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

// Require Dashboard CSS in all layouts (contains login custom styles)
import '../../assets/dashboard.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rol: ''
    });
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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

        try {
            // Ajuste para emparejar con Laravel. Generalmente recibe email/password o username/password
            const response = await api.post('/login', {
                correo: formData.username, // Podría ser email o username según tu backend
                password: formData.password
                // role: formData.rol (Enviar si el backend lo requiere)
            });

            // Guardamos el token
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user || { nombre: formData.username, rol: formData.rol }));
                navigate('/dashboard');
            } else {
                setErrorMsg('No se recibió token del servidor. Respuesta inusual.');
            }
        } catch (error) {
            console.error('Error de login:', error);
            setErrorMsg(
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Ocurrió un error al intentar iniciar sesión. Verifica tus credenciales.'
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
            <div className="login-card">
                <div className="login-left">
                    <i className="fas fa-graduation-cap fa-4x" style={{ marginBottom: '20px' }}></i>
                    <h1>SmartSchool</h1>
                    <p>Gestión escolar inteligente para tu institución.</p>
                </div>

                <div className="login-right">
                    <div className="login-form">
                        <h2>Bienvenido 👋</h2>

                        {errorMsg && (
                            <div className="notification is-danger is-light mb-4">
                                {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="username" className="input-label">Usuario / Correo</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    className="custom-input"
                                    placeholder="Ingresa tu usuario o correo"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="password" className="input-label">Contraseña</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="custom-input"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label htmlFor="rol" className="input-label">Rol</label>
                                <div className="select is-fullwidth">
                                    <select
                                        id="rol"
                                        name="rol"
                                        className="custom-input p-0 px-3"
                                        value={formData.rol}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled>Selecciona tu rol</option>
                                        <option value="estudiante">Estudiante</option>
                                        <option value="docente">Docente/Profesor</option>
                                        <option value="acudiente">Acudiente</option>
                                        <option value="administrador">Administrador</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`btn-primary ${loading ? 'is-loading' : ''}`}
                                disabled={loading}
                            >
                                Ingresar
                            </button>
                        </form>

                        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
                            <p><a href="#" style={{ color: 'var(--secondary-color)', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</a></p>
                            <p style={{ marginTop: '10px' }}>
                                ¿No tienes cuenta? <Link to="/register" style={{ color: 'var(--secondary-color)', fontWeight: '600' }}>Regístrate</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

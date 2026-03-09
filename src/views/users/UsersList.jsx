import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('todos');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/usuarios'); // Basado en ERD
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else if (response.data.data) {
                setUsers(response.data.data);
            } else {
                setDummyData();
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setDummyData();
        } finally {
            setLoading(false);
        }
    };

    const setDummyData = () => {
        setUsers([
            { id: 1, nombre: 'Pepe The Frog', correo: 'pepe029sd@gmail.com', rol: 'Estudiante', usuario: '801' },
            { id: 2, nombre: 'Ana Pérez', correo: 'Ana_p@gmail.com', rol: 'Docente', usuario: 'Matemáticas' },
            { id: 3, nombre: 'Mrs. Frog', correo: 'Mfrog09@gmail.com', rol: 'Acudiente', usuario: 'Familiar' }
        ]);
    }

    const getRoleTagConfig = (rol) => {
        const normalize = rol?.toLowerCase() || '';
        if (normalize.includes('docente') || normalize.includes('profesor')) return 'tag-teacher';
        if (normalize.includes('admin') || normalize.includes('acudiente')) return 'tag-admin';
        return 'tag-student'; // Default (Estudiante)
    };

    const filteredUsers = filter === 'todos'
        ? users
        : users.filter(u => u.rol?.toLowerCase() === filter);

    return (
        <DashboardLayout
            title="Gestión de Usuarios"
            subtitle="Administra estudiantes, docentes y acudientes."
        >
            {/* Toolbar */}
            <div className="toolbar">
                <div className="control has-icons-left" style={{ flex: 1 }}>
                    <input className="input" type="text" placeholder="Buscar usuario..." />
                    <span className="icon is-small is-left"><i className="fas fa-search"></i></span>
                </div>
                <div className="select">
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="todos">Todos</option>
                        <option value="estudiante">Estudiantes</option>
                        <option value="docente">Docentes</option>
                        <option value="acudiente">Acudientes</option>
                    </select>
                </div>
                <Link to="#" className="button is-primary">
                    <span className="icon"><i className="fas fa-plus"></i></span>
                    <span>Agregar Usuario</span>
                </Link>
            </div>

            {/* User Grid */}
            {loading ? (
                <div className="has-text-centered my-6 py-6">
                    <div className="loader is-loading is-size-1 mx-auto" style={{ height: '3rem', width: '3rem' }}></div>
                    <p className="mt-3">Cargando usuarios...</p>
                </div>
            ) : (
                <section className="user-list">
                    {filteredUsers.length === 0 ? (
                        <p className="has-text-centered has-text-grey my-6" style={{ gridColumn: '1 / -1' }}>No hay usuarios para mostrar.</p>
                    ) : (
                        filteredUsers.map(user => (
                            <div className="user-card" key={user.id}>
                                <div className="user-card-header"></div>
                                {/* Fallback avatar if no image from DB */}
                                <div className="user-avatar" style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: '#e0e0e0', margin: '-40px auto 0', fontSize: '2rem', fontWeight: 'bold'
                                }}>
                                    {user.nombre.charAt(0).toUpperCase()}
                                </div>

                                <div className="user-info">
                                    <h3 className="user-name">{user.nombre}</h3>
                                    <span className="user-role">{user.correo}</span>
                                    <span className={`tag ${getRoleTagConfig(user.rol)}`}>{user.rol} {user.usuario ? `- ${user.usuario}` : ''}</span>
                                </div>
                                <div className="card-actions">
                                    <button className="action-btn" title="Ver"><i className="fas fa-eye"></i></button>
                                    <button className="action-btn" title="Editar"><i className="fas fa-pen"></i></button>
                                    {user.rol?.toLowerCase() === 'acudiente' ? (
                                        <button className="action-btn" title="Eliminar" style={{ color: '#e53935' }}><i className="fas fa-trash"></i></button>
                                    ) : (
                                        <button className="action-btn" title="Configurar"><i className="fas fa-cog"></i></button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </section>
            )}
        </DashboardLayout>
    );
};

export default UsersList;

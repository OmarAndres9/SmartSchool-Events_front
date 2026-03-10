import { formToJSON } from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TopNav = ({ title, subtitle }) => {
    const navigate = useNavigate();
    const [nameUser, setNameUser] = useState("");
    const [rolUser, setRolUser] = useState("");


    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                console.log("El usuario es ")
                let usuario = JSON.parse(storedUser);
                console.log(usuario);
                setNameUser(usuario.name)
                // setRolUser(usuario)
            } catch (e) {
                console.error('Error parseando user de localStorage', e);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="top-nav">
            <div className="welcome-msg">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>

            <div className="user-profile">
                {/* Notifications */}
                <div className="dropdown is-right is-hoverable">
                    <div className="dropdown-trigger">
                        <span className="icon is-medium has-text-grey" style={{ cursor: 'pointer' }}>
                            <i className="fas fa-bell fa-lg"></i>
                        </span>
                    </div>
                </div>

                <div style={{ width: '1px', height: '30px', background: '#eee', margin: '0 10px' }}></div>

                <div className="is-flex is-align-items-center dropdown is-right is-hoverable">
                    <div className="dropdown-trigger is-flex is-align-items-center" style={{ cursor: 'pointer' }}>
                        <div className="has-text-right mr-3 is-hidden-mobile">
                            <strong className="is-block has-text-dark">{nameUser}</strong>
                            {/* <small className="has-text-grey">{user.rol}</small> */}
                        </div>
                        {/* Si tienes una URL de imagen real, reemplázala aquí */}
                        {/* <div className="avatar" style={{ background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {nameUser}
                        </div> */}
                    </div>

                    <div className="dropdown-menu" id="dropdown-menu" role="menu">
                        <div className="dropdown-content">
                            <a href="#" className="dropdown-item">Mi Perfil</a>
                            <a href="/settings" className="dropdown-item">Configuración</a>
                            <hr className="dropdown-divider" />
                            <a href="#" className="dropdown-item has-text-danger" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt mr-2"></i> Cerrar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopNav;

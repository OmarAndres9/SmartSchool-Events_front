import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';

const Settings = () => {
    return (
        <DashboardLayout
            title="Ajustes y Configuración"
            subtitle="Personaliza la configuración de tu cuenta."
        >
            <div className="card-box" style={{ maxWidth: '600px' }}>
                <h3 className="card-title mb-4">Perfil</h3>

                <div className="field">
                    <label className="label">Correo Electrónico de Notificaciones</label>
                    <div className="control">
                        <input className="input" type="email" placeholder="ejemplo@escuela.edu" />
                    </div>
                </div>

                <div className="field mt-5">
                    <label className="label">Cambiar Contraseña</label>
                    <div className="control">
                        <input className="input mb-3" type="password" placeholder="Nueva Contraseña" />
                        <input className="input" type="password" placeholder="Confirmar Nueva Contraseña" />
                    </div>
                </div>

                <button className="button is-primary mt-5">Guardar Cambios</button>
            </div>
        </DashboardLayout>
    );
};

export default Settings;

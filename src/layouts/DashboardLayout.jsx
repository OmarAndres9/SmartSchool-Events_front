import React from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

// Require Dashboard CSS in all layouts
import '../assets/dashboard.css';

const DashboardLayout = ({ children, title = "Bienvenido 👋", subtitle = "Panel de control" }) => {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <TopNav title={title} subtitle={subtitle} />
                {/* Aquí se inyecta el contenido de cada vista */}
                <div className="page-content py-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;

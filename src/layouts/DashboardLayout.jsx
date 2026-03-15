/**
 * layouts/DashboardLayout.jsx
 * Layout principal. Gestiona el estado abierto/cerrado del sidebar en móvil.
 */

import React, { useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import TopNav from '../components/layout/TopNav';
import styles from './DashboardLayout.module.css';

const DashboardLayout = ({ title, subtitle, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.appLayout}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className={styles.mainWrapper}>
        <TopNav
          title={title}
          subtitle={subtitle}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />

        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

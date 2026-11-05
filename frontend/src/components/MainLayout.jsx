import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children, onSearchQuery }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`main-wrapper ${collapsed ? 'expanded' : ''}`}>
        <Header setMobileOpen={setMobileOpen} onSearchQuery={onSearchQuery} />
        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}

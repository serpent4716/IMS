import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AppLayout({ user, onLogout }) {
  const [search, setSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sidebar width syncs through CSS var approach — we pass it via prop
  const sidebarWidth = sidebarCollapsed ? 64 : 260;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={user} onLogout={onLogout} onCollapse={setSidebarCollapsed} />
      <div style={{
        flex: 1,
        marginLeft: sidebarWidth,
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.25s ease',
        minWidth: 0,
      }}>
        <TopHeader
          sidebarWidth={sidebarWidth}
          search={search}
          onSearchChange={e => setSearch(e.target.value)}
        />
        <main style={{
          marginTop: 'var(--header-height)',
          padding: '28px 28px 40px',
          flex: 1,
          minWidth: 0,
        }}>
          <div className="fade-in">
            <Outlet context={{ search }} />
          </div>
        </main>
      </div>
    </div>
  );
}

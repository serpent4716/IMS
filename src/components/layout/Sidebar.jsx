import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/', label: 'Dashboard', icon: '⬛', emoji: true },
    ]
  },
  {
    label: 'Operations',
    items: [
      { path: '/receipts', label: 'Receipts', icon: '📥', emoji: true },
      { path: '/deliveries', label: 'Delivery Orders', icon: '📤', emoji: true },
      { path: '/transfers', label: 'Internal Transfers', icon: '🔄', emoji: true },
      { path: '/adjustments', label: 'Stock Adjustments', icon: '⚖️', emoji: true },
      { path: '/history', label: 'Move History', icon: '🕑', emoji: true },
    ]
  },
  {
    label: 'Catalog',
    items: [
      { path: '/products', label: 'Products', icon: '📦', emoji: true },
    ]
  },
  {
    label: 'Settings',
    items: [
      { path: '/warehouses', label: 'Warehouses', icon: '🏭', emoji: true },
    ]
  },
];

// SVG icons
function GridIcon() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function InboxIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4m6 0v1a2 2 0 002 2h0a2 2 0 002-2v-1" /></svg>; }
function TruckIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17H5a2 2 0 01-2-2V5a2 2 0 012-2h8a2 2 0 012 2v3m0 0h2l3 4v5h-5m0 0a2 2 0 01-4 0m4 0a2 2 0 00-4 0" /></svg>; }
function ArrowsIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>; }
function ScaleIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>; }
function ClockIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" /></svg>; }
function BoxIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0v10l-8 4m0-14v14m-8-4l8 4" /></svg>; }
function BuildingIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>; }
function LogoutIcon() { return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>; }

const iconMap = {
  '/': <GridIcon />, '/receipts': <InboxIcon />, '/deliveries': <TruckIcon />,
  '/transfers': <ArrowsIcon />, '/adjustments': <ScaleIcon />, '/history': <ClockIcon />,
  '/products': <BoxIcon />, '/warehouses': <BuildingIcon />,
};

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside style={{
      width: collapsed ? 64 : 'var(--sidebar-width)',
      minHeight: '100vh',
      background: 'var(--sidebar-bg)',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      transition: 'width 0.25s ease',
      flexShrink: 0,
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
      zIndex: 100,
      overflowX: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>📦</div>
        {!collapsed && (
          <div>
            <div style={{ color: '#FFF', fontWeight: 700, fontSize: 15, lineHeight: 1 }}>CoreInventory</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>Warehouse Portal</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.07)', border: 'none',
            borderRadius: 6, width: 26, height: 26, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)', flexShrink: 0,
            fontSize: 13,
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {navGroups.map(group => (
          <div key={group.label} style={{ marginBottom: 4 }}>
            {!collapsed && (
              <div style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.1em', color: 'rgba(255,255,255,0.25)',
                padding: '12px 12px 4px',
              }}>
                {group.label}
              </div>
            )}
            {group.items.map(item => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    width: '100%', padding: collapsed ? '10px' : '9px 12px',
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: active ? 'rgba(37,99,235,0.18)' : 'transparent',
                    border: active ? '1px solid rgba(37,99,235,0.35)' : '1px solid transparent',
                    borderRadius: 9,
                    color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontSize: 13.5, fontWeight: active ? 600 : 400,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    marginBottom: 2,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = active ? '#fff' : 'rgba(255,255,255,0.5)'; }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : 0.75, display: 'flex', alignItems: 'center' }}>
                    {iconMap[item.path]}
                  </span>
                  {!collapsed && item.label}
                  {!collapsed && active && (
                    <span style={{
                      marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--brand-primary)', flexShrink: 0,
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom user */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: collapsed ? '8px' : '10px 10px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 13,
          }}>
            {user?.name?.[0] || 'W'}
          </div>
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', truncate: true }}>{user?.name || 'Warehouse Staff'}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{user?.role || 'Staff'}</div>
              </div>
              <button
                onClick={onLogout}
                title="Logout"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(255,255,255,0.35)', padding: 4,
                  display: 'flex', alignItems: 'center',
                  borderRadius: 6, transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                <LogoutIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

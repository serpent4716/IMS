import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchBar } from '../ui';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/receipts': 'Receipts',
  '/deliveries': 'Delivery Orders',
  '/transfers': 'Internal Transfers',
  '/adjustments': 'Stock Adjustments',
  '/history': 'Move History',
  '/products': 'Products',
  '/warehouses': 'Warehouses',
  '/profile': 'My Profile',
};

function BellIcon() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

export default function TopHeader({ sidebarWidth, search, onSearchChange }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'CoreInventory';
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: sidebarWidth,
      right: 0,
      height: 'var(--header-height)',
      background: 'var(--bg-white)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      zIndex: 90,
      boxShadow: 'var(--shadow-xs)',
      transition: 'left 0.25s ease',
    }}>
      {/* Page title */}
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', whiteSpace: 'nowrap', minWidth: 140 }}>
        {title}
      </div>

      {/* Search */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', maxWidth: 480 }}>
        <SearchBar
          placeholder="Search products, orders, SKU…"
          value={search}
          onChange={onSearchChange}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{
              width: 36, height: 36, borderRadius: 9,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-secondary)',
              transition: 'all 0.15s', position: 'relative',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-subtle)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-white)'; e.currentTarget.style.borderColor = 'var(--border-default)'; }}
          >
            <BellIcon />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: '#DC2626', border: '1.5px solid #fff',
            }} />
          </button>

          {notifOpen && (
            <div style={{
              position: 'absolute', top: 44, right: 0, zIndex: 200,
              background: 'var(--bg-white)', borderRadius: 12,
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-default)',
              minWidth: 280, padding: '8px 0',
              animation: 'fadeIn 0.15s ease',
            }}>
              <div style={{ padding: '8px 16px 10px', borderBottom: '1px solid var(--border-default)', fontSize: 13, fontWeight: 700 }}>
                Alerts
              </div>
              {[
                { msg: 'Aluminum Sheet 3mm – Low Stock (18 pcs)', color: '#D97706' },
                { msg: 'PVC Pipe 2" – Out of Stock', color: '#DC2626' },
                { msg: 'Wooden Pallet – Low Stock (6 pcs)', color: '#D97706' },
              ].map((n, i) => (
                <div key={i} style={{
                  padding: '10px 16px', fontSize: 12.5, color: 'var(--text-primary)',
                  display: 'flex', alignItems: 'flex-start', gap: 8,
                  borderBottom: i < 2 ? '1px solid var(--border-default)' : 'none',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: n.color, flexShrink: 0, marginTop: 3 }} />
                  {n.msg}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date badge */}
        <div style={{
          fontSize: 12, color: 'var(--text-muted)',
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          padding: '6px 12px', borderRadius: 8,
          whiteSpace: 'nowrap',
        }}>
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      </div>
    </header>
  );
}

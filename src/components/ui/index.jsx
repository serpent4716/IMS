import React from 'react';
import { STATUS_COLORS } from '../../utils/helpers';

// ─── STATUS BADGE ────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.Draft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px',
      borderRadius: 'var(--r-pill)',
      fontSize: 12,
      fontWeight: 600,
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: colors.text, flexShrink: 0,
      }} />
      {status}
    </span>
  );
}

// ─── CARD ────────────────────────────────────────────────────────
export function Card({ children, style, className }) {
  return (
    <div className={className} style={{
      background: 'var(--bg-white)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-sm)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', onClick, style, icon, disabled }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'inherit', fontWeight: 600,
    border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: 'var(--r-pill)',
    transition: 'all 0.2s',
    opacity: disabled ? 0.5 : 1,
  };
  const sizes = {
    sm: { padding: '5px 12px', fontSize: 12 },
    md: { padding: '8px 18px', fontSize: 14 },
    lg: { padding: '11px 24px', fontSize: 15 },
  };
  const variants = {
    primary: { background: 'var(--brand-primary)', color: '#fff' },
    success: { background: 'var(--brand-success)', color: '#fff' },
    danger: { background: 'var(--brand-danger)', color: '#fff' },
    ghost: { background: 'var(--bg-subtle)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' },
    outline: { background: 'transparent', color: 'var(--brand-primary)', border: '1px solid var(--brand-primary)' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
    >
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

// ─── INPUT ───────────────────────────────────────────────────────
export function Input({ label, placeholder, value, onChange, type = 'text', style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          padding: '9px 14px',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-sm)',
          fontSize: 14,
          outline: 'none',
          background: 'var(--bg-white)',
          color: 'var(--text-primary)',
          transition: 'border-color 0.2s',
          width: '100%',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--brand-primary)'}
        onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
      />
    </div>
  );
}

// ─── SELECT ──────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      {label && <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        style={{
          padding: '9px 14px',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-sm)',
          fontSize: 14,
          background: 'var(--bg-white)',
          color: 'var(--text-primary)',
          outline: 'none',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

// ─── TABLE ───────────────────────────────────────────────────────
export function Table({ columns, data, onRowClick }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '10px 16px',
                textAlign: col.align || 'left',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                borderBottom: '1px solid var(--border-default)',
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (onRowClick) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map(col => (
                <td key={col.key} style={{
                  padding: '13px 16px',
                  fontSize: 13.5,
                  color: 'var(--text-primary)',
                  textAlign: col.align || 'left',
                  verticalAlign: 'middle',
                }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{
                padding: '40px 16px', textAlign: 'center',
                color: 'var(--text-muted)', fontSize: 14,
              }}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,41,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-white)',
          borderRadius: 'var(--r-lg)',
          boxShadow: 'var(--shadow-lg)',
          width: '100%', maxWidth: width,
          maxHeight: '90vh', overflowY: 'auto',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-default)',
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-subtle)', border: 'none',
              borderRadius: '50%', width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, color: 'var(--text-secondary)',
            }}
          >×</button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────────
export function SearchBar({ placeholder, value, onChange }) {
  return (
    <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
      <svg
        style={{
          position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)',
          width: 16, height: 16, color: 'var(--text-muted)', pointerEvents: 'none',
        }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0010.15 10.15z" />
      </svg>
      <input
        type="text"
        placeholder={placeholder || 'Search...'}
        value={value}
        onChange={onChange}
        style={{
          width: '100%',
          padding: '9px 14px 9px 38px',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--r-pill)',
          fontSize: 14,
          background: 'var(--bg-subtle)',
          color: 'var(--text-primary)',
          outline: 'none',
          transition: 'all 0.2s',
        }}
        onFocus={e => {
          e.target.style.background = 'var(--bg-white)';
          e.target.style.borderColor = 'var(--brand-primary)';
          e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)';
        }}
        onBlur={e => {
          e.target.style.background = 'var(--bg-subtle)';
          e.target.style.borderColor = 'var(--border-default)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

// ─── EMPTY STATE ─────────────────────────────────────────────────
export function EmptyState({ icon, title, description }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 24px', gap: 12,
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: 40, marginBottom: 4 }}>{icon || '📦'}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>{title || 'No data'}</div>
      {description && <div style={{ fontSize: 13 }}>{description}</div>}
    </div>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────────
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 24, flexWrap: 'wrap', gap: 12,
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
  );
}

// ─── FILTER ROW ──────────────────────────────────────────────────
export function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 14px',
        borderRadius: 'var(--r-pill)',
        fontSize: 13,
        fontWeight: active ? 600 : 400,
        border: active ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-default)',
        background: active ? 'var(--brand-primary-light)' : 'var(--bg-white)',
        color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

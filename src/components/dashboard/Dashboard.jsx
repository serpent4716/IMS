import React from 'react';
import { useNavigate } from 'react-router-dom';
import { kpis, receipts, deliveries, transfers, products } from '../../data/mockData';
import { Card, StatusBadge, Button } from '../ui';
import { formatDate } from '../../utils/helpers';

function KpiCard({ label, value, sub, color, icon, onClick, progress, total }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-white)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--r-lg)',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: color + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          {icon}
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--bg-muted)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 99,
          background: color,
          width: total ? `${Math.min((value / total) * 100, 100)}%` : '60%',
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  );
}

function RecentRow({ label, id, status, date, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', padding: '13px 0',
        borderBottom: '1px solid var(--border-default)',
        cursor: 'pointer', gap: 12,
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-subtle)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{formatDate(date)}</div>
      <StatusBadge status={status} />
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const lowStockItems = products.filter(p => p.stock === 0 || p.stock < p.minStock);

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Good morning, Warehouse Team 👋</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
          Here's your inventory snapshot for today, {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}.
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <KpiCard
          label="Total Products" value={kpis.totalProducts}
          sub={`${kpis.totalStock.toLocaleString()} units on hand`}
          color="var(--brand-primary)" icon="📦"
          onClick={() => navigate('/products')} total={10}
        />
        <KpiCard
          label="Low / Out of Stock" value={kpis.lowStock + kpis.outOfStock}
          sub={`${kpis.outOfStock} out of stock`}
          color="var(--brand-danger)" icon="⚠️"
          onClick={() => navigate('/products')} total={kpis.totalProducts}
        />
        <KpiCard
          label="Pending Receipts" value={kpis.pendingReceipts}
          sub="Awaiting validation"
          color="var(--brand-info)" icon="📥"
          onClick={() => navigate('/receipts')} total={receipts.length}
        />
        <KpiCard
          label="Pending Deliveries" value={kpis.pendingDeliveries}
          sub="To pick & ship"
          color="var(--brand-warning)" icon="📤"
          onClick={() => navigate('/deliveries')} total={deliveries.length}
        />
        <KpiCard
          label="Transfers Scheduled" value={kpis.scheduledTransfers}
          sub="Internal movements"
          color="var(--brand-purple)" icon="🔄"
          onClick={() => navigate('/transfers')} total={transfers.length}
        />
      </div>

      {/* Bottom two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Operations */}
        <Card style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Recent Operations</h2>
            <Button size="sm" variant="ghost" onClick={() => navigate('/history')}>View all</Button>
          </div>
          {[
            ...receipts.slice(0, 2).map(r => ({ label: r.id, sub: `From ${r.supplier}`, status: r.status, date: r.date, onClick: () => navigate('/receipts') })),
            ...deliveries.slice(0, 2).map(d => ({ label: d.id, sub: `To ${d.customer}`, status: d.status, date: d.date, onClick: () => navigate('/deliveries') })),
          ].map((op, i) => (
            <RecentRow key={i} {...op} />
          ))}
        </Card>

        {/* Alerts */}
        <Card style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Stock Alerts</h2>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
              background: '#FEF2F2', color: '#DC2626',
            }}>{lowStockItems.length} items</span>
          </div>
          {lowStockItems.map((p, i) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 0', borderBottom: i < lowStockItems.length - 1 ? '1px solid var(--border-default)' : 'none',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: p.stock === 0 ? '#FEF2F2' : '#FFFBEB',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0,
              }}>
                {p.stock === 0 ? '🚫' : '⚠️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.location} · {p.stock} {p.uom} (min: {p.minStock})</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                background: p.stock === 0 ? '#FEF2F2' : '#FFFBEB',
                color: p.stock === 0 ? '#DC2626' : '#D97706',
                border: `1px solid ${p.stock === 0 ? '#FECACA' : '#FDE68A'}`,
              }}>
                {p.stock === 0 ? 'Out' : 'Low'}
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

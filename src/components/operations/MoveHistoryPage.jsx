import React, { useState } from 'react';
import { moveHistory } from '../../data/mockData';
import { Card, Table, PageHeader, SearchBar, FilterChip } from '../ui';
import { MOVE_TYPE_COLORS } from '../../utils/helpers';
import { useOutletContext } from 'react-router-dom';

const TYPES = ['All', 'Receipt', 'Delivery', 'Transfer', 'Adjustment'];

export default function MoveHistoryPage() {
  const { search } = useOutletContext();
  const [typeFilter, setTypeFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  const q = localSearch || search;
  const filtered = moveHistory.filter(m =>
    (typeFilter === 'All' || m.type === typeFilter) &&
    (m.product.toLowerCase().includes(q.toLowerCase()) ||
      m.ref.toLowerCase().includes(q.toLowerCase()) ||
      m.user.toLowerCase().includes(q.toLowerCase()) ||
      m.from.toLowerCase().includes(q.toLowerCase()) ||
      m.to.toLowerCase().includes(q.toLowerCase()))
  );

  const cols = [
    { key: 'date', label: 'Date & Time', render: v => <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{v}</span> },
    {
      key: 'type', label: 'Type',
      render: v => {
        const c = MOVE_TYPE_COLORS[v] || { bg: '#F1F5F9', text: '#64748B' };
        return (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
            background: c.bg, color: c.text,
          }}>{v}</span>
        );
      }
    },
    {
      key: 'ref', label: 'Reference',
      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--brand-primary)', fontWeight: 600 }}>{v}</span>
    },
    { key: 'product', label: 'Product', render: v => <span style={{ fontWeight: 600 }}>{v}</span> },
    {
      key: 'from', label: 'Movement',
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ color: 'var(--text-secondary)' }}>{v}</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span style={{ color: 'var(--text-secondary)' }}>{r.to}</span>
        </div>
      )
    },
    {
      key: 'qty', label: 'Qty',
      render: v => (
        <span style={{
          fontWeight: 800, fontSize: 14,
          color: v.startsWith('+') ? 'var(--brand-success)' : v.startsWith('-') ? 'var(--brand-danger)' : 'var(--text-primary)',
        }}>{v}</span>
      )
    },
    { key: 'user', label: 'By', render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0,
        }}>{v[0]}</div>
        <span style={{ fontSize: 13 }}>{v}</span>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="Move History"
        subtitle="Complete ledger of all stock movements"
      />

      {/* Type summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {TYPES.filter(t => t !== 'All').map(t => {
          const c = MOVE_TYPE_COLORS[t] || { bg: '#F1F5F9', text: '#64748B' };
          const count = moveHistory.filter(m => m.type === t).length;
          return (
            <div key={t} style={{
              padding: '10px 16px', background: c.bg,
              border: `1px solid ${c.text}22`,
              borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: c.text }}>{count}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{t}s</span>
            </div>
          );
        })}
      </div>

      <Card style={{ padding: '14px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar placeholder="Search by product, ref, user…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TYPES.map(t => <FilterChip key={t} label={t} active={typeFilter === t} onClick={() => setTypeFilter(t)} />)}
          </div>
        </div>
      </Card>

      <Card>
        <Table columns={cols} data={filtered} />
        <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
          Showing {filtered.length} of {moveHistory.length} movements
        </div>
      </Card>
    </div>
  );
}

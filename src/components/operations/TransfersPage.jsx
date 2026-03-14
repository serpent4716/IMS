import React, { useState } from 'react';
import { transfers as initialTransfers, warehouses } from '../../data/mockData';
import { Card, Table, StatusBadge, Button, SearchBar, PageHeader, FilterChip, Modal, Input, Select } from '../ui';
import { formatDate } from '../../utils/helpers';
import { useOutletContext } from 'react-router-dom';

const STATUSES = ['All', 'Draft', 'Ready', 'Done', 'Canceled'];

const allLocations = warehouses.flatMap(w => [w.name, ...w.zones]);

export default function TransfersPage() {
  const { search } = useOutletContext();
  const [transfers, setTransfers] = useState(initialTransfers);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ from: 'Main Warehouse', to: 'Production Floor', date: '' });

  const q = localSearch || search;
  const filtered = transfers.filter(t =>
    (statusFilter === 'All' || t.status === statusFilter) &&
    (t.id.toLowerCase().includes(q.toLowerCase()) ||
      t.fromLocation.toLowerCase().includes(q.toLowerCase()) ||
      t.toLocation.toLowerCase().includes(q.toLowerCase()))
  );

  function handleValidate(id) {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'Done' } : t));
    setSelectedTransfer(null);
  }

  function handleConfirm(id) {
    setTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'Ready' } : t));
  }

  function handleCreate() {
    const newId = `TRF-2024-${String(transfers.length + 1).padStart(3, '0')}`;
    setTransfers(prev => [{
      id: newId,
      date: form.date || new Date().toISOString().split('T')[0],
      status: 'Draft',
      fromLocation: form.from,
      toLocation: form.to,
      items: [],
    }, ...prev]);
    setShowModal(false);
    setForm({ from: 'Main Warehouse', to: 'Production Floor', date: '' });
  }

  const cols = [
    {
      key: 'id', label: 'Transfer ID',
      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: '#7C3AED' }}>{v}</span>
    },
    {
      key: 'fromLocation', label: 'Route',
      render: (v, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
          <span style={{ fontSize: 16, color: 'var(--text-muted)' }}>→</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{r.toLocation}</span>
        </div>
      )
    },
    { key: 'date', label: 'Date', render: v => formatDate(v) },
    { key: 'items', label: 'Items', render: v => `${v.length} product${v.length !== 1 ? 's' : ''}` },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'status', label: 'Action',
      render: (v, row) => v === 'Ready' ? (
        <Button size="sm" variant="primary" onClick={e => { e.stopPropagation(); handleValidate(row.id); }}>
          Transfer
        </Button>
      ) : v === 'Draft' ? (
        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleConfirm(row.id); }}>
          Confirm
        </Button>
      ) : null
    },
  ];

  return (
    <div>
      <PageHeader
        title="Internal Transfers"
        subtitle="Move stock between locations within the company"
        actions={<Button onClick={() => setShowModal(true)} icon={<span>+</span>}>New Transfer</Button>}
      />

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: transfers.length, color: '#7C3AED', bg: '#F5F3FF' },
          { label: 'Ready', count: transfers.filter(t => t.status === 'Ready').length, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Draft', count: transfers.filter(t => t.status === 'Draft').length, color: '#64748B', bg: '#F1F5F9' },
          { label: 'Done', count: transfers.filter(t => t.status === 'Done').length, color: '#16A34A', bg: '#F0FDF4' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 16px', background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <Card style={{ padding: '14px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar placeholder="Search by ID, location…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUSES.map(s => <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
          </div>
        </div>
      </Card>

      <Card>
        <Table columns={cols} data={filtered} onRowClick={t => setSelectedTransfer(t)} />
        <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
          Showing {filtered.length} of {transfers.length} transfers
        </div>
      </Card>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Internal Transfer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '14px 16px', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 10, fontSize: 13, color: '#5B21B6' }}>
            🔄 Stock will be moved between locations. Total quantity remains unchanged.
          </div>
          <Select
            label="From Location *"
            value={form.from}
            onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
            options={allLocations.map(l => ({ value: l, label: l }))}
          />
          <Select
            label="To Location *"
            value={form.to}
            onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
            options={allLocations.map(l => ({ value: l, label: l }))}
          />
          <Input label="Scheduled Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={form.from === form.to}>Create Transfer</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!selectedTransfer} onClose={() => setSelectedTransfer(null)} title={`Transfer: ${selectedTransfer?.id}`} width={600}>
        {selectedTransfer && (
          <div>
            {/* Route visual */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center',
              padding: '18px 24px', background: '#F5F3FF', borderRadius: 12, marginBottom: 20,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 4, textTransform: 'uppercase' }}>From</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedTransfer.fromLocation}</div>
              </div>
              <div style={{ flex: 1, height: 2, background: '#DDD6FE', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  background: '#7C3AED', color: '#fff', borderRadius: 99, padding: '2px 8px',
                  fontSize: 14, lineHeight: 1.5,
                }}>→</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#7C3AED', marginBottom: 4, textTransform: 'uppercase' }}>To</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{selectedTransfer.toLocation}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Date', value: formatDate(selectedTransfer.date) },
                { label: 'Status', value: <StatusBadge status={selectedTransfer.status} /> },
              ].map(d => (
                <div key={d.label} style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{d.value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items to Move</h3>
            <div style={{ border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                    {['Product', 'SKU', 'Quantity', 'UOM'].map(h => (
                      <th key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedTransfer.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < selectedTransfer.items.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                      <td style={{ padding: '11px 14px', fontSize: 13.5, fontWeight: 600 }}>{item.product}</td>
                      <td style={{ padding: '11px 14px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-muted)', padding: '2px 5px', borderRadius: 4 }}>{item.sku}</span></td>
                      <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 700 }}>{item.qty}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{item.uom}</td>
                    </tr>
                  ))}
                  {selectedTransfer.items.length === 0 && (
                    <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No items added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setSelectedTransfer(null)}>Close</Button>
              {selectedTransfer.status === 'Ready' && (
                <Button onClick={() => handleValidate(selectedTransfer.id)}>✓ Validate Transfer</Button>
              )}
              {selectedTransfer.status === 'Draft' && (
                <Button variant="outline" onClick={() => { handleConfirm(selectedTransfer.id); setSelectedTransfer(null); }}>Confirm Transfer</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

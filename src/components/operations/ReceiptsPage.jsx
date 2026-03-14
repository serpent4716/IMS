import React, { useState } from 'react';
import { receipts as initialReceipts } from '../../data/mockData';
import { Card, Table, StatusBadge, Button, SearchBar, PageHeader, FilterChip, Modal, Input, Select } from '../ui';
import { formatDate } from '../../utils/helpers';
import { useOutletContext } from 'react-router-dom';

const STATUSES = ['All', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];
const SUPPLIERS = ['Tata Steel Ltd.', 'ElectroParts Co.', 'SafetyFirst Inc.', 'Logistics Hub', 'Other'];

export default function ReceiptsPage() {
  const { search } = useOutletContext();
  const [receipts, setReceipts] = useState(initialReceipts);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [form, setForm] = useState({ supplier: '', warehouse: 'Main Warehouse', date: '', notes: '' });

  const q = localSearch || search;
  const filtered = receipts.filter(r =>
    (statusFilter === 'All' || r.status === statusFilter) &&
    (r.id.toLowerCase().includes(q.toLowerCase()) ||
      r.supplier.toLowerCase().includes(q.toLowerCase()) ||
      r.warehouse.toLowerCase().includes(q.toLowerCase()))
  );

  const cols = [
    {
      key: 'id', label: 'Receipt ID',
      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--brand-primary)' }}>{v}</span>
    },
    {
      key: 'supplier', label: 'Supplier',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {r.warehouse}</div>
        </div>
      )
    },
    { key: 'date', label: 'Date', render: v => formatDate(v) },
    {
      key: 'items', label: 'Items',
      render: v => <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{v.length} product{v.length !== 1 ? 's' : ''}</span>
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'id', label: 'Action',
      render: (v, row) => row.status === 'Ready' ? (
        <Button size="sm" variant="success" onClick={e => { e.stopPropagation(); handleValidate(row.id); }}>
          Validate
        </Button>
      ) : row.status === 'Draft' ? (
        <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); handleConfirm(row.id); }}>
          Confirm
        </Button>
      ) : null
    },
  ];

  function handleValidate(id) {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: 'Done' } : r));
  }
  function handleConfirm(id) {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: 'Ready' } : r));
  }
  function handleCreate() {
    const newId = `RCP-2024-${String(receipts.length + 1).padStart(3, '0')}`;
    setReceipts(prev => [{
      id: newId,
      supplier: form.supplier,
      date: form.date || new Date().toISOString().split('T')[0],
      status: 'Draft',
      warehouse: form.warehouse,
      items: [],
    }, ...prev]);
    setShowModal(false);
    setForm({ supplier: '', warehouse: 'Main Warehouse', date: '', notes: '' });
  }

  return (
    <div>
      <PageHeader
        title="Receipts"
        subtitle="Manage incoming stock from suppliers"
        actions={<Button onClick={() => setShowModal(true)} icon={<span>+</span>}>New Receipt</Button>}
      />

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', count: receipts.length, color: 'var(--brand-primary)', bg: 'var(--brand-primary-light)' },
          { label: 'Ready to Receive', count: receipts.filter(r => r.status === 'Ready').length, color: '#2563EB', bg: '#EFF6FF' },
          { label: 'Waiting', count: receipts.filter(r => r.status === 'Waiting').length, color: '#D97706', bg: '#FFFBEB' },
          { label: 'Done', count: receipts.filter(r => r.status === 'Done').length, color: '#16A34A', bg: '#F0FDF4' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '10px 16px', background: s.bg,
            border: `1px solid ${s.color}22`,
            borderRadius: 'var(--r-md)',
            display: 'flex', flexDirection: 'column', gap: 2,
          }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <Card style={{ padding: '14px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar placeholder="Search by ID, supplier…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUSES.map(s => <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
          </div>
        </div>
      </Card>

      <Card>
        <Table columns={cols} data={filtered} onRowClick={r => setSelectedReceipt(r)} />
        <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
          Showing {filtered.length} of {receipts.length} receipts
        </div>
      </Card>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Receipt">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select
            label="Supplier *"
            value={form.supplier}
            onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}
            options={[{ value: '', label: 'Select supplier…' }, ...SUPPLIERS.map(s => ({ value: s, label: s }))]}
          />
          <Select
            label="Destination Warehouse"
            value={form.warehouse}
            onChange={e => setForm(f => ({ ...f, warehouse: e.target.value }))}
            options={['Main Warehouse', 'Warehouse 2', 'Production Floor'].map(w => ({ value: w, label: w }))}
          />
          <Input label="Expected Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.supplier}>Create Receipt</Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!selectedReceipt} onClose={() => setSelectedReceipt(null)} title={`Receipt: ${selectedReceipt?.id}`} width={620}>
        {selectedReceipt && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { label: 'Supplier', value: selectedReceipt.supplier },
                { label: 'Warehouse', value: selectedReceipt.warehouse },
                { label: 'Date', value: formatDate(selectedReceipt.date) },
                { label: 'Status', value: <StatusBadge status={selectedReceipt.status} /> },
              ].map(d => (
                <div key={d.label} style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{d.value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)' }}>LINE ITEMS</h3>
            <div style={{ border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                    {['Product', 'SKU', 'Expected', 'Received', 'UOM'].map(h => (
                      <th key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedReceipt.items.map((item, i) => (
                    <tr key={i} style={{ borderBottom: i < selectedReceipt.items.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                      <td style={{ padding: '11px 14px', fontSize: 13.5, fontWeight: 600 }}>{item.product}</td>
                      <td style={{ padding: '11px 14px' }}><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-muted)', padding: '2px 5px', borderRadius: 4 }}>{item.sku}</span></td>
                      <td style={{ padding: '11px 14px', fontSize: 13 }}>{item.expected}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: item.received < item.expected ? 'var(--brand-warning)' : 'var(--brand-success)' }}>{item.received}</td>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{item.uom}</td>
                    </tr>
                  ))}
                  {selectedReceipt.items.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No items added yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {selectedReceipt.status === 'Ready' && (
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button variant="ghost" onClick={() => setSelectedReceipt(null)}>Close</Button>
                <Button variant="success" onClick={() => { handleValidate(selectedReceipt.id); setSelectedReceipt(null); }}>
                  ✓ Validate Receipt
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

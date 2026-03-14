import React, { useState } from 'react';
import { adjustments as initialAdjs, products, warehouses } from '../../data/mockData';
import { Card, Table, StatusBadge, Button, SearchBar, PageHeader, FilterChip, Modal, Input, Select } from '../ui';
import { formatDate } from '../../utils/helpers';
import { useOutletContext } from 'react-router-dom';

const STATUSES = ['All', 'Draft', 'Done'];
const REASONS = ['Cycle Count', 'Damaged', 'Theft', 'Expired', 'Found Extra', 'System Error'];

export default function AdjustmentsPage() {
  const { search } = useOutletContext();
  const [adjs, setAdjs] = useState(initialAdjs);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ warehouse: 'Main Warehouse', reason: 'Cycle Count' });
  const [countForm, setCountForm] = useState({});

  const q = localSearch || search;
  const filtered = adjs.filter(a =>
    (statusFilter === 'All' || a.status === statusFilter) &&
    (a.id.toLowerCase().includes(q.toLowerCase()) ||
      a.warehouse.toLowerCase().includes(q.toLowerCase()) ||
      a.reason.toLowerCase().includes(q.toLowerCase()))
  );

  function handleValidate(id) {
    setAdjs(prev => prev.map(a => a.id === id ? { ...a, status: 'Done' } : a));
    setSelected(null);
  }

  function handleCreate() {
    const newId = `ADJ-2024-${String(adjs.length + 1).padStart(3, '0')}`;
    setAdjs(prev => [{
      id: newId,
      date: new Date().toISOString().split('T')[0],
      warehouse: form.warehouse,
      reason: form.reason,
      status: 'Draft',
      items: [],
    }, ...prev]);
    setShowModal(false);
    setForm({ warehouse: 'Main Warehouse', reason: 'Cycle Count' });
  }

  const cols = [
    {
      key: 'id', label: 'Reference',
      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: '#D97706' }}>{v}</span>
    },
    { key: 'date', label: 'Date', render: v => formatDate(v) },
    { key: 'warehouse', label: 'Warehouse' },
    { key: 'reason', label: 'Reason', render: v => (
      <span style={{
        fontSize: 12, padding: '2px 10px', borderRadius: 99,
        background: 'var(--bg-subtle)', border: '1px solid var(--border-default)',
        color: 'var(--text-secondary)', fontWeight: 500,
      }}>{v}</span>
    )},
    { key: 'items', label: 'Products', render: v => `${v.length} item${v.length !== 1 ? 's' : ''}` },
    {
      key: 'items', label: 'Net Change',
      render: v => {
        const total = v.reduce((sum, i) => sum + (i.diff || 0), 0);
        return (
          <span style={{
            fontWeight: 700, fontSize: 14,
            color: total < 0 ? 'var(--brand-danger)' : total > 0 ? 'var(--brand-success)' : 'var(--text-muted)',
          }}>
            {total > 0 ? '+' : ''}{total}
          </span>
        );
      }
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'status', label: 'Action',
      render: (v, row) => v === 'Draft' ? (
        <Button size="sm" variant="warning" onClick={e => { e.stopPropagation(); setSelected(row); }}>
          Count
        </Button>
      ) : null
    },
  ];

  return (
    <div>
      <PageHeader
        title="Stock Adjustments"
        subtitle="Fix mismatches between recorded and physical stock"
        actions={<Button onClick={() => setShowModal(true)} icon={<span>+</span>}>New Adjustment</Button>}
      />

      {/* Info banner */}
      <div style={{
        padding: '14px 18px', background: '#FFFBEB',
        border: '1px solid #FDE68A', borderRadius: 12,
        marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: '#92400E',
      }}>
        <span>⚖️</span>
        <div>
          <strong>How adjustments work:</strong> Select a product and enter the physically counted quantity.
          The system calculates the difference and updates stock automatically when validated.
        </div>
      </div>

      <Card style={{ padding: '14px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar placeholder="Search by ID, warehouse, reason…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 6 }}>
            {STATUSES.map(s => <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
          </div>
        </div>
      </Card>

      <Card>
        <Table columns={cols} data={filtered} onRowClick={a => setSelected(a)} />
        <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
          Showing {filtered.length} of {adjs.length} adjustments
        </div>
      </Card>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Stock Adjustment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Select
            label="Warehouse"
            value={form.warehouse}
            onChange={e => setForm(f => ({ ...f, warehouse: e.target.value }))}
            options={warehouses.map(w => ({ value: w.name, label: w.name }))}
          />
          <Select
            label="Reason"
            value={form.reason}
            onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            options={REASONS.map(r => ({ value: r, label: r }))}
          />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create Adjustment</Button>
          </div>
        </div>
      </Modal>

      {/* Detail / Count Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Adjustment: ${selected?.id}`} width={660}>
        {selected && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Warehouse', value: selected.warehouse },
                { label: 'Reason', value: selected.reason },
                { label: 'Status', value: <StatusBadge status={selected.status} /> },
              ].map(d => (
                <div key={d.label} style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{d.value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Count Sheet</h3>

            <div style={{ border: '1px solid var(--border-default)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-default)' }}>
                    {['Product', 'System Qty', 'Counted Qty', 'Difference', 'UOM'].map(h => (
                      <th key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 700, textAlign: 'left', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map((item, i) => {
                    const counted = countForm[i] !== undefined ? Number(countForm[i]) : item.countedQty;
                    const diff = counted - item.systemQty;
                    return (
                      <tr key={i} style={{ borderBottom: i < selected.items.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                        <td style={{ padding: '11px 14px', fontSize: 13.5, fontWeight: 600 }}>{item.product}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600 }}>{item.systemQty}</td>
                        <td style={{ padding: '8px 14px' }}>
                          {selected.status === 'Draft' ? (
                            <input
                              type="number"
                              value={countForm[i] !== undefined ? countForm[i] : item.countedQty}
                              onChange={e => setCountForm(f => ({ ...f, [i]: e.target.value }))}
                              style={{
                                width: 80, padding: '5px 8px',
                                border: '1.5px solid var(--brand-primary)',
                                borderRadius: 6, fontSize: 13, fontWeight: 600,
                                outline: 'none', background: '#EFF6FF',
                              }}
                            />
                          ) : (
                            <span style={{ fontWeight: 600 }}>{item.countedQty}</span>
                          )}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 14, fontWeight: 800, color: diff < 0 ? 'var(--brand-danger)' : diff > 0 ? 'var(--brand-success)' : 'var(--text-muted)' }}>
                          {diff > 0 ? '+' : ''}{diff}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: 'var(--text-muted)' }}>{item.uom}</td>
                      </tr>
                    );
                  })}
                  {selected.items.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No items in this adjustment.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
              {selected.status === 'Draft' && selected.items.length > 0 && (
                <Button variant="warning" onClick={() => handleValidate(selected.id)}>✓ Apply Adjustment</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

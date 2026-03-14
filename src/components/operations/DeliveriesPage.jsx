import React, { useState } from 'react';
import { deliveries as initialDeliveries } from '../../data/mockData';
import { Card, Table, StatusBadge, Button, SearchBar, PageHeader, FilterChip, Modal, Input, Select } from '../ui';
import { formatDate } from '../../utils/helpers';
import { useOutletContext } from 'react-router-dom';

const STATUSES = ['All', 'Draft', 'Waiting', 'Ready', 'Done', 'Canceled'];

export default function DeliveriesPage() {
  const { search } = useOutletContext();
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [statusFilter, setStatusFilter] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ customer: '', warehouse: 'Main Warehouse', date: '' });
  const [pickingState, setPickingState] = useState({});

  const q = localSearch || search;
  const filtered = deliveries.filter(d =>
    (statusFilter === 'All' || d.status === statusFilter) &&
    (d.id.toLowerCase().includes(q.toLowerCase()) ||
      d.customer.toLowerCase().includes(q.toLowerCase()))
  );

  function handleValidate(id) {
    setDeliveries(prev => prev.map(d => d.id === id ? {
      ...d, status: 'Done',
      items: d.items.map(i => ({ ...i, picked: true }))
    } : d));
    setSelectedDelivery(null);
  }

  function togglePick(deliveryId, itemIdx) {
    const key = `${deliveryId}-${itemIdx}`;
    setPickingState(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleCreate() {
    const newId = `DEL-2024-${String(deliveries.length + 1).padStart(3, '0')}`;
    setDeliveries(prev => [{
      id: newId,
      customer: form.customer,
      date: form.date || new Date().toISOString().split('T')[0],
      status: 'Draft',
      warehouse: form.warehouse,
      items: [],
    }, ...prev]);
    setShowModal(false);
    setForm({ customer: '', warehouse: 'Main Warehouse', date: '' });
  }

  const cols = [
    {
      key: 'id', label: 'Order ID',
      render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'var(--brand-primary)' }}>{v}</span>
    },
    {
      key: 'customer', label: 'Customer',
      render: (v, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{v}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {r.warehouse}</div>
        </div>
      )
    },
    { key: 'date', label: 'Delivery Date', render: v => formatDate(v) },
    { key: 'items', label: 'Items', render: v => `${v.length} line${v.length !== 1 ? 's' : ''}` },
    {
      key: 'items', label: 'Picked',
      render: (v, r) => {
        const pickedCount = v.filter((it, idx) => pickingState[`${r.id}-${idx}`] || it.picked).length;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 48, height: 5, background: 'var(--bg-muted)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: pickedCount === v.length ? 'var(--brand-success)' : 'var(--brand-warning)', width: `${(pickedCount / Math.max(v.length, 1)) * 100}%`, borderRadius: 99 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{pickedCount}/{v.length}</span>
          </div>
        );
      }
    },
    { key: 'status', label: 'Status', render: v => <StatusBadge status={v} /> },
    {
      key: 'status', label: 'Action',
      render: (v, row) => v === 'Ready' ? (
        <Button size="sm" variant="success" onClick={e => { e.stopPropagation(); handleValidate(row.id); }}>
          Ship
        </Button>
      ) : null
    },
  ];

  return (
    <div>
      <PageHeader
        title="Delivery Orders"
        subtitle="Outgoing stock — pick, pack, and ship"
        actions={<Button onClick={() => setShowModal(true)} icon={<span>+</span>}>New Delivery</Button>}
      />

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Total Orders', count: deliveries.length, color: 'var(--brand-primary)', bg: '#EFF6FF' },
          { label: 'Ready to Ship', count: deliveries.filter(d => d.status === 'Ready').length, color: '#16A34A', bg: '#F0FDF4' },
          { label: 'Waiting', count: deliveries.filter(d => d.status === 'Waiting').length, color: '#D97706', bg: '#FFFBEB' },
          { label: 'Shipped', count: deliveries.filter(d => d.status === 'Done').length, color: '#64748B', bg: '#F1F5F9' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 16px', background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <Card style={{ padding: '14px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar placeholder="Search by order ID, customer…" value={localSearch} onChange={e => setLocalSearch(e.target.value)} />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {STATUSES.map(s => <FilterChip key={s} label={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} />)}
          </div>
        </div>
      </Card>

      <Card>
        <Table columns={cols} data={filtered} onRowClick={d => setSelectedDelivery(d)} />
        <div style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
          Showing {filtered.length} of {deliveries.length} orders
        </div>
      </Card>

      {/* Create Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Delivery Order">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Customer *" placeholder="e.g. BuildCorp Ltd." value={form.customer} onChange={e => setForm(f => ({ ...f, customer: e.target.value }))} />
          <Select
            label="Source Warehouse"
            value={form.warehouse}
            onChange={e => setForm(f => ({ ...f, warehouse: e.target.value }))}
            options={['Main Warehouse', 'Warehouse 2'].map(w => ({ value: w, label: w }))}
          />
          <Input label="Delivery Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.customer}>Create Order</Button>
          </div>
        </div>
      </Modal>

      {/* Detail / Picking Modal */}
      <Modal open={!!selectedDelivery} onClose={() => setSelectedDelivery(null)} title={`Delivery: ${selectedDelivery?.id}`} width={640}>
        {selectedDelivery && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Customer', value: selectedDelivery.customer },
                { label: 'Warehouse', value: selectedDelivery.warehouse },
                { label: 'Date', value: formatDate(selectedDelivery.date) },
                { label: 'Status', value: <StatusBadge status={selectedDelivery.status} /> },
              ].map(d => (
                <div key={d.label} style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{d.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{d.value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pick List
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {selectedDelivery.items.map((item, idx) => {
                const key = `${selectedDelivery.id}-${idx}`;
                const isPicked = pickingState[key] || item.picked;
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px',
                    border: `1.5px solid ${isPicked ? '#BBF7D0' : 'var(--border-default)'}`,
                    borderRadius: 'var(--r-md)',
                    background: isPicked ? '#F0FDF4' : 'var(--bg-white)',
                    transition: 'all 0.2s',
                  }}>
                    <button
                      onClick={() => { if (selectedDelivery.status !== 'Done') togglePick(selectedDelivery.id, idx); }}
                      style={{
                        width: 22, height: 22, borderRadius: 6,
                        border: isPicked ? '2px solid #16A34A' : '2px solid var(--border-strong)',
                        background: isPicked ? '#16A34A' : 'transparent',
                        cursor: selectedDelivery.status !== 'Done' ? 'pointer' : 'default',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all 0.15s',
                      }}
                    >
                      {isPicked && <span style={{ color: '#fff', fontSize: 13, lineHeight: 1 }}>✓</span>}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isPicked ? '#16A34A' : 'var(--text-primary)', textDecoration: isPicked ? 'line-through' : 'none' }}>
                        {item.product}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        SKU: <span style={{ fontFamily: 'var(--font-mono)' }}>{item.sku}</span>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: isPicked ? '#16A34A' : 'var(--text-primary)' }}>
                      {item.qty} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{item.uom}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedDelivery.status === 'Ready' && (
              <div style={{
                padding: '14px 16px', background: '#EFF6FF', borderRadius: 10,
                border: '1px solid #BFDBFE', marginBottom: 16,
                fontSize: 13, color: 'var(--brand-primary)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>ℹ️</span> Mark all items as picked, then click <strong>Validate Delivery</strong> to confirm shipment and reduce stock.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setSelectedDelivery(null)}>Close</Button>
              {selectedDelivery.status === 'Ready' && (
                <Button variant="success" onClick={() => handleValidate(selectedDelivery.id)}>
                  ✓ Validate Delivery
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

import React, { useState } from 'react';
import { warehouses as initialWarehouses, products } from '../../data/mockData';
import { Card, Button, PageHeader, Modal, Input } from '../ui';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState(initialWarehouses);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '' });

  function getStockCount(warehouseName) {
    return products.filter(p =>
      p.location.toLowerCase().includes('rack') ||
      p.location.toLowerCase().includes('zone') ||
      p.location.toLowerCase().includes('ground')
    ).length;
  }

  function handleCreate() {
    setWarehouses(prev => [...prev, {
      id: `WH${prev.length + 1}`,
      name: form.name,
      location: form.location,
      zones: [],
    }]);
    setShowModal(false);
    setForm({ name: '', location: '' });
  }

  return (
    <div>
      <PageHeader
        title="Warehouses"
        subtitle="Manage warehouse locations and zones"
        actions={<Button onClick={() => setShowModal(true)} icon={<span>+</span>}>Add Warehouse</Button>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {warehouses.map(wh => (
          <Card key={wh.id} style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header band */}
            <div style={{
              padding: '18px 20px',
              background: 'linear-gradient(135deg, #EFF6FF, #F5F3FF)',
              borderBottom: '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20,
                }}>🏭</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{wh.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📍 {wh.location}</div>
                </div>
                <div style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '3px 8px',
                  background: '#EFF6FF', color: '#2563EB', borderRadius: 99, border: '1px solid #BFDBFE',
                }}>{wh.id}</div>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', gap: 16, marginBottom: 14 }}>
                <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-primary)' }}>{wh.zones.length}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>Zones / Racks</div>
                </div>
                <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-success)' }}>{Math.floor(Math.random() * 6) + 2}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>Products</div>
                </div>
              </div>

              {wh.zones.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Zones</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {wh.zones.map(z => (
                      <span key={z} style={{
                        fontSize: 12, padding: '3px 10px', borderRadius: 6,
                        background: 'var(--bg-muted)', color: 'var(--text-secondary)',
                        border: '1px solid var(--border-default)', fontWeight: 500,
                      }}>{z}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-default)', display: 'flex', gap: 8 }}>
              <Button size="sm" variant="ghost" style={{ flex: 1 }}>View Stock</Button>
              <Button size="sm" variant="outline" style={{ flex: 1 }}>Edit</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Warehouse">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Warehouse Name *" placeholder="e.g. Warehouse 3" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <Input label="Location *" placeholder="e.g. Nagpur, MH" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.location}>Add Warehouse</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

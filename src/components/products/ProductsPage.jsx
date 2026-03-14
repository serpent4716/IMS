import React, { useState } from 'react';
import { products as initialProducts } from '../../data/mockData';
import { Card, Table, StatusBadge, Button, SearchBar, PageHeader, FilterChip, Modal, Input, Select } from '../ui';
import { getStockStatus } from '../../utils/helpers';
import { useOutletContext } from 'react-router-dom';

const CATEGORIES = ['All', 'Raw Material', 'Furniture', 'Plumbing', 'Electrical', 'Safety', 'Logistics', 'Lubricants'];

function StockIndicator({ product }) {
  const status = getStockStatus(product);
  const color = status === 'ok' ? 'var(--brand-success)' : status === 'low' ? 'var(--brand-warning)' : 'var(--brand-danger)';
  const label = status === 'ok' ? 'In Stock' : status === 'low' ? 'Low Stock' : 'Out of Stock';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 64, height: 6, background: 'var(--bg-muted)', borderRadius: 99, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: color,
          width: `${Math.min((product.stock / (product.minStock * 4)) * 100, 100)}%`,
          borderRadius: 99,
        }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
    </div>
  );
}

export default function ProductsPage() {
  const { search } = useOutletContext();
  const [products, setProducts] = useState(initialProducts);
  const [category, setCategory] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', category: 'Raw Material', uom: 'pcs', location: '', minStock: 10 });

  const q = localSearch || search;
  const filtered = products.filter(p =>
    (category === 'All' || p.category === category) &&
    (p.name.toLowerCase().includes(q.toLowerCase()) ||
      p.sku.toLowerCase().includes(q.toLowerCase()) ||
      p.location.toLowerCase().includes(q.toLowerCase()))
  );

  const cols = [
    { key: 'sku', label: 'SKU', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4, color: 'var(--text-secondary)' }}>{v}</span> },
    { key: 'name', label: 'Product Name', render: (v, r) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.category}</div>
      </div>
    )},
    { key: 'location', label: 'Location', render: v => <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📍 {v}</span> },
    { key: 'stock', label: 'On Hand', render: (v, r) => (
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{v} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>{r.uom}</span></div>
        <StockIndicator product={r} />
      </div>
    )},
    { key: 'minStock', label: 'Min Stock', render: (v, r) => <span style={{ fontSize: 13 }}>{v} {r.uom}</span> },
  ];

  function handleAdd() {
    const newProd = {
      id: `P${String(products.length + 1).padStart(3, '0')}`,
      name: form.name, sku: form.sku, category: form.category,
      uom: form.uom, location: form.location,
      stock: 0, minStock: Number(form.minStock),
    };
    setProducts(p => [newProd, ...p]);
    setShowModal(false);
    setForm({ name: '', sku: '', category: 'Raw Material', uom: 'pcs', location: '', minStock: 10 });
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products across all warehouses`}
        actions={<Button onClick={() => setShowModal(true)} icon={<span>+</span>}>New Product</Button>}
      />

      <Card style={{ padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <SearchBar
            placeholder="Search by name, SKU, location…"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <FilterChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <Table
          columns={cols}
          data={filtered}
        />
        <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
          Showing {filtered.length} of {products.length} products
        </div>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Product">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Product Name *" placeholder="e.g. Steel Rods 10mm" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="SKU / Code *" placeholder="e.g. STL-ROD-10" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Select
              label="Category"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              options={CATEGORIES.filter(c => c !== 'All').map(c => ({ value: c, label: c }))}
            />
            <Select
              label="Unit of Measure"
              value={form.uom}
              onChange={e => setForm(f => ({ ...f, uom: e.target.value }))}
              options={['pcs', 'kg', 'm', 'roll', 'can', 'box', 'ltr'].map(u => ({ value: u, label: u }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Storage Location" placeholder="e.g. Rack A-12" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
            <Input label="Min Stock Level" type="number" value={form.minStock} onChange={e => setForm(f => ({ ...f, minStock: e.target.value }))} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.name || !form.sku}>Create Product</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

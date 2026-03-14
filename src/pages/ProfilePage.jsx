import React, { useState } from 'react';
import { Card, Button, Input, PageHeader } from '../components/ui';

export default function ProfilePage({ user, onLogout }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', email: 'staff@warehouse.com', phone: '+91 98765 43210', warehouse: 'Main Warehouse' });

  return (
    <div style={{ maxWidth: 600 }}>
      <PageHeader title="My Profile" subtitle="Manage your account settings" />

      <Card style={{ padding: '28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 800, flexShrink: 0,
          }}>
            {user?.name?.[0] || 'W'}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>{user?.role}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 8,
              fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
              background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16A34A' }} />
              Active
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} type="email" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            <Input label="Assigned Warehouse" value={form.warehouse} onChange={() => {}} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
          <Button variant="ghost">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </Card>

      <Card style={{ padding: '20px 24px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Security</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 10 }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Password</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Last changed 30 days ago</div>
            </div>
            <Button size="sm" variant="outline">Change</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#FEF2F2', borderRadius: 10, border: '1px solid #FECACA' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#DC2626' }}>Sign Out</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sign out from all devices</div>
            </div>
            <Button size="sm" variant="danger" onClick={onLogout}>Logout</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

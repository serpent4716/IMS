import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';

import Dashboard from './components/dashboard/Dashboard';
import ProductsPage from './components/products/ProductsPage';
import ReceiptsPage from './components/operations/ReceiptsPage';
import DeliveriesPage from './components/operations/DeliveriesPage';
import TransfersPage from './components/operations/TransfersPage';
import AdjustmentsPage from './components/operations/AdjustmentsPage';
import MoveHistoryPage from './components/operations/MoveHistoryPage';
import WarehousesPage from './components/operations/WarehousesPage';

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout user={user} onLogout={() => setUser(null)} />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="receipts" element={<ReceiptsPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="transfers" element={<TransfersPage />} />
          <Route path="adjustments" element={<AdjustmentsPage />} />
          <Route path="history" element={<MoveHistoryPage />} />
          <Route path="warehouses" element={<WarehousesPage />} />
          <Route path="profile" element={<ProfilePage user={user} onLogout={() => setUser(null)} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

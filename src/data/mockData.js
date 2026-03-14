// ─── PRODUCTS ────────────────────────────────────────────────────
export const products = [
  { id: 'P001', name: 'Steel Rods 10mm', sku: 'STL-ROD-10', category: 'Raw Material', uom: 'kg', stock: 342, location: 'Rack A-12', minStock: 50 },
  { id: 'P002', name: 'Aluminum Sheet 3mm', sku: 'ALU-SHT-3', category: 'Raw Material', uom: 'pcs', stock: 18, location: 'Rack B-04', minStock: 25 },
  { id: 'P003', name: 'Office Chair – Ergo Pro', sku: 'FRN-CHR-001', category: 'Furniture', uom: 'pcs', stock: 54, location: 'Zone C-1', minStock: 10 },
  { id: 'P004', name: 'PVC Pipe 2"', sku: 'PVC-PIP-2', category: 'Plumbing', uom: 'm', stock: 0, location: 'Rack D-08', minStock: 30 },
  { id: 'P005', name: 'Copper Wire 6mm', sku: 'ELC-COP-6', category: 'Electrical', uom: 'roll', stock: 12, location: 'Rack E-02', minStock: 20 },
  { id: 'P006', name: 'Safety Helmet (Yellow)', sku: 'PPE-HLM-Y', category: 'Safety', uom: 'pcs', stock: 87, location: 'Zone F-1', minStock: 15 },
  { id: 'P007', name: 'Wooden Pallet', sku: 'LOG-PAL-W', category: 'Logistics', uom: 'pcs', stock: 6, location: 'Ground-G1', minStock: 20 },
  { id: 'P008', name: 'Motor Oil 5L', sku: 'LUB-MOT-5', category: 'Lubricants', uom: 'can', stock: 130, location: 'Rack A-05', minStock: 30 },
];

// ─── RECEIPTS ────────────────────────────────────────────────────
export const receipts = [
  {
    id: 'RCP-2024-001', supplier: 'Tata Steel Ltd.', date: '2024-06-10',
    status: 'Ready', warehouse: 'Main Warehouse',
    items: [
      { product: 'Steel Rods 10mm', sku: 'STL-ROD-10', expected: 100, received: 100, uom: 'kg' },
      { product: 'Aluminum Sheet 3mm', sku: 'ALU-SHT-3', expected: 50, received: 45, uom: 'pcs' },
    ]
  },
  {
    id: 'RCP-2024-002', supplier: 'ElectroParts Co.', date: '2024-06-12',
    status: 'Waiting', warehouse: 'Main Warehouse',
    items: [
      { product: 'Copper Wire 6mm', sku: 'ELC-COP-6', expected: 30, received: 0, uom: 'roll' },
    ]
  },
  {
    id: 'RCP-2024-003', supplier: 'SafetyFirst Inc.', date: '2024-06-08',
    status: 'Done', warehouse: 'Warehouse 2',
    items: [
      { product: 'Safety Helmet (Yellow)', sku: 'PPE-HLM-Y', expected: 50, received: 50, uom: 'pcs' },
    ]
  },
  {
    id: 'RCP-2024-004', supplier: 'Logistics Hub', date: '2024-06-14',
    status: 'Draft', warehouse: 'Main Warehouse',
    items: [
      { product: 'Wooden Pallet', sku: 'LOG-PAL-W', expected: 40, received: 0, uom: 'pcs' },
    ]
  },
];

// ─── DELIVERY ORDERS ─────────────────────────────────────────────
export const deliveries = [
  {
    id: 'DEL-2024-001', customer: 'BuildCorp Ltd.', date: '2024-06-11',
    status: 'Ready', warehouse: 'Main Warehouse',
    items: [
      { product: 'Steel Rods 10mm', sku: 'STL-ROD-10', qty: 20, uom: 'kg', picked: false },
      { product: 'Office Chair – Ergo Pro', sku: 'FRN-CHR-001', qty: 5, uom: 'pcs', picked: false },
    ]
  },
  {
    id: 'DEL-2024-002', customer: 'HomeFurnish Pvt.', date: '2024-06-12',
    status: 'Done', warehouse: 'Warehouse 2',
    items: [
      { product: 'Office Chair – Ergo Pro', sku: 'FRN-CHR-001', qty: 10, uom: 'pcs', picked: true },
    ]
  },
  {
    id: 'DEL-2024-003', customer: 'Plumb Masters', date: '2024-06-15',
    status: 'Waiting', warehouse: 'Main Warehouse',
    items: [
      { product: 'PVC Pipe 2"', sku: 'PVC-PIP-2', qty: 30, uom: 'm', picked: false },
    ]
  },
];

// ─── INTERNAL TRANSFERS ──────────────────────────────────────────
export const transfers = [
  {
    id: 'TRF-2024-001', date: '2024-06-10',
    status: 'Ready', fromLocation: 'Main Warehouse', toLocation: 'Production Floor',
    items: [
      { product: 'Steel Rods 10mm', sku: 'STL-ROD-10', qty: 30, uom: 'kg' },
    ]
  },
  {
    id: 'TRF-2024-002', date: '2024-06-13',
    status: 'Done', fromLocation: 'Rack A', toLocation: 'Rack B',
    items: [
      { product: 'Motor Oil 5L', sku: 'LUB-MOT-5', qty: 15, uom: 'can' },
    ]
  },
  {
    id: 'TRF-2024-003', date: '2024-06-15',
    status: 'Draft', fromLocation: 'Main Warehouse', toLocation: 'Warehouse 2',
    items: [
      { product: 'Copper Wire 6mm', sku: 'ELC-COP-6', qty: 8, uom: 'roll' },
      { product: 'Safety Helmet (Yellow)', sku: 'PPE-HLM-Y', qty: 20, uom: 'pcs' },
    ]
  },
];

// ─── ADJUSTMENTS ─────────────────────────────────────────────────
export const adjustments = [
  {
    id: 'ADJ-2024-001', date: '2024-06-09', warehouse: 'Main Warehouse',
    status: 'Done', reason: 'Damaged',
    items: [
      { product: 'Steel Rods 10mm', sku: 'STL-ROD-10', systemQty: 50, countedQty: 47, diff: -3, uom: 'kg' },
    ]
  },
  {
    id: 'ADJ-2024-002', date: '2024-06-14', warehouse: 'Warehouse 2',
    status: 'Draft', reason: 'Cycle Count',
    items: [
      { product: 'Office Chair – Ergo Pro', sku: 'FRN-CHR-001', systemQty: 54, countedQty: 54, diff: 0, uom: 'pcs' },
      { product: 'Safety Helmet (Yellow)', sku: 'PPE-HLM-Y', systemQty: 87, countedQty: 85, diff: -2, uom: 'pcs' },
    ]
  },
];

// ─── MOVE HISTORY ────────────────────────────────────────────────
export const moveHistory = [
  { id: 'MH001', date: '2024-06-10 09:12', type: 'Receipt', ref: 'RCP-2024-001', product: 'Steel Rods 10mm', from: 'Vendor', to: 'Rack A-12', qty: '+100 kg', user: 'Ravi S.' },
  { id: 'MH002', date: '2024-06-10 11:30', type: 'Transfer', ref: 'TRF-2024-001', product: 'Steel Rods 10mm', from: 'Rack A-12', to: 'Production Floor', qty: '-30 kg', user: 'Amit K.' },
  { id: 'MH003', date: '2024-06-09 15:00', type: 'Adjustment', ref: 'ADJ-2024-001', product: 'Steel Rods 10mm', from: '—', to: 'Rack A-12', qty: '-3 kg', user: 'Priya M.' },
  { id: 'MH004', date: '2024-06-08 10:45', type: 'Receipt', ref: 'RCP-2024-003', product: 'Safety Helmet (Yellow)', from: 'Vendor', to: 'Zone F-1', qty: '+50 pcs', user: 'Ravi S.' },
  { id: 'MH005', date: '2024-06-12 14:20', type: 'Delivery', ref: 'DEL-2024-002', product: 'Office Chair – Ergo Pro', from: 'Zone C-1', to: 'Customer', qty: '-10 pcs', user: 'Neha R.' },
  { id: 'MH006', date: '2024-06-13 16:00', type: 'Transfer', ref: 'TRF-2024-002', product: 'Motor Oil 5L', from: 'Rack A', to: 'Rack B', qty: '-15 can', user: 'Amit K.' },
];

// ─── WAREHOUSES ──────────────────────────────────────────────────
export const warehouses = [
  { id: 'WH1', name: 'Main Warehouse', location: 'Mumbai, MH', zones: ['Rack A', 'Rack B', 'Rack C', 'Rack D', 'Zone C-1', 'Ground-G1'] },
  { id: 'WH2', name: 'Warehouse 2', location: 'Pune, MH', zones: ['Zone F-1', 'Rack E-02', 'Rack D-08'] },
  { id: 'WH3', name: 'Production Floor', location: 'Mumbai, MH', zones: ['Prod-A', 'Prod-B'] },
];

// ─── DASHBOARD KPIs ──────────────────────────────────────────────
export const kpis = {
  totalProducts: products.length,
  totalStock: products.reduce((a, p) => a + p.stock, 0),
  lowStock: products.filter(p => p.stock > 0 && p.stock < p.minStock).length,
  outOfStock: products.filter(p => p.stock === 0).length,
  pendingReceipts: receipts.filter(r => ['Ready', 'Waiting', 'Draft'].includes(r.status)).length,
  pendingDeliveries: deliveries.filter(d => ['Ready', 'Waiting'].includes(d.status)).length,
  scheduledTransfers: transfers.filter(t => ['Ready', 'Draft'].includes(t.status)).length,
};

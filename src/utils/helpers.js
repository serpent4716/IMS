export const STATUS_COLORS = {
  Draft: { bg: '#F1F5F9', text: '#64748B', border: '#CBD5E1' },
  Waiting: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
  Ready: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
  Done: { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
  Canceled: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
};

export const MOVE_TYPE_COLORS = {
  Receipt: { bg: '#EFF6FF', text: '#2563EB' },
  Transfer: { bg: '#F5F3FF', text: '#7C3AED' },
  Delivery: { bg: '#F0FDF4', text: '#16A34A' },
  Adjustment: { bg: '#FFFBEB', text: '#D97706' },
};

export function getStockStatus(product) {
  if (product.stock === 0) return 'out';
  if (product.stock < product.minStock) return 'low';
  return 'ok';
}

export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

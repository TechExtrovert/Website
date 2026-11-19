import { useEffect, useState, useCallback } from 'react';
import {
  Package, Download, RefreshCw, ChevronDown, Search,
  Clock, Wrench, CheckCircle, XCircle, Filter, Trash2, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatNaira } from '../../lib/types';
import type { Order } from '../../lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock },
  preparing: { label: 'Preparing', color: 'bg-blue-50 text-blue-700 border-blue-200',     icon: Wrench },
  delivered: { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200',        icon: XCircle },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

function exportCSV(orders: Order[], label: string) {
  const headers = ['Order Number','Date','Customer Name','Email','Phone','Delivery Type','Address','Items','Subtotal','Discount','Total','Promo Code','Payment Method','Status','Notes'];
  const rows = orders.map((o) => [
    o.order_number, new Date(o.created_at).toLocaleString('en-NG'), o.customer_name, o.customer_email,
    o.customer_phone ?? '', o.delivery_type, (o.delivery_address ?? '').replace(/,/g, ';'),
    o.items.map((i) => `${i.name} x${i.quantity}`).join(' | '),
    o.subtotal, o.discount, o.total, o.promo_code ?? '', o.payment_method ?? '', o.status,
    (o.notes ?? '').replace(/,/g, ';'),
  ]);
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `orders-${label}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'all'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (dateFilter === 'today') {
      const today = new Date().toISOString().slice(0, 10);
      query = query.gte('created_at', `${today}T00:00:00.000Z`).lte('created_at', `${today}T23:59:59.999Z`);
    }
    const { data } = await query;
    setOrders((data as Order[]) || []);
    setLoading(false);
  }, [dateFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    setUpdatingId(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { data, error } = await supabase.from('orders').delete().eq('id', deleteTarget.id).select('id');
    setDeleting(false);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    if (!data || data.length === 0) {
      setDeleteError('This order could not be deleted. Please refresh and try again.');
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !search || o.order_number.toLowerCase().includes(q) ||
      o.customer_name.toLowerCase().includes(q) || o.customer_email.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['all', ...ALL_STATUSES] as const).map((s) => {
          const count = s === 'all' ? orders.length : orders.filter((o) => o.status === s).length;
          const cfg = s === 'all' ? null : STATUS_CONFIG[s];
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`p-3 rounded-xl border text-left transition-all ${
                statusFilter === s ? 'border-primary-400 bg-primary-50' : 'border-stone-100 dark:border-dark-500 bg-white dark:bg-dark-600 hover:border-stone-300'
              }`}
            >
              <p className="text-xs text-stone-400 dark:text-dark-300 uppercase tracking-wide">{cfg?.label ?? 'All Orders'}</p>
              <p className="text-xl font-bold font-heading text-stone-700 dark:text-dark-100 mt-0.5">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-4 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-dark-300" />
          <input
            type="text"
            placeholder="Search order #, name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-stone-200 dark:border-dark-500 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary-400 transition-colors"
          />
        </div>
        <div className="flex gap-1.5">
          {(['today', 'all'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDateFilter(d)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                dateFilter === d ? 'bg-stone-700 text-white border-stone-700' : 'border-stone-200 dark:border-dark-500 text-stone-500 dark:text-dark-300 hover:border-stone-400 bg-white dark:bg-dark-600'
              }`}
            >
              {d === 'today' ? "Today" : "All Time"}
            </button>
          ))}
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-2 border border-stone-200 dark:border-dark-500 rounded-xl text-xs text-stone-500 dark:text-dark-300 hover:border-stone-400 transition-colors bg-white dark:bg-dark-600">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
        <button
          onClick={() => exportCSV(filtered, dateFilter === 'today' ? new Date().toISOString().slice(0, 10) : 'all')}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-medium transition-colors"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-stone-100 dark:bg-dark-500 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-16 text-center shadow-sm">
          <Package className="h-10 w-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 dark:text-dark-300 font-medium">No orders found</p>
          <p className="text-stone-400 dark:text-dark-300 text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;
            const isExpanded = expandedId === order.id;

            return (
              <div key={order.id} className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 shadow-sm overflow-hidden">
                <div className="p-4 cursor-pointer hover:bg-stone-50 dark:bg-dark-600 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="min-w-[140px]">
                      <p className="font-mono font-bold text-primary-600 text-sm">{order.order_number}</p>
                      <p className="text-xs text-stone-400 dark:text-dark-300 mt-0.5">
                        {new Date(order.created_at).toLocaleString('en-NG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                      <p className="font-medium text-stone-700 dark:text-dark-100 text-sm">{order.customer_name}</p>
                      <p className="text-xs text-stone-400 dark:text-dark-300">{order.customer_email}</p>
                    </div>
                    <div className="hidden sm:flex gap-1">
                      {order.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="w-8 h-8 rounded-lg overflow-hidden bg-primary-50">
                          <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-dark-500 flex items-center justify-center text-xs text-stone-400 dark:text-dark-300 font-medium">+{order.items.length - 3}</div>
                      )}
                    </div>
                    <div className="min-w-[90px] text-right">
                      <p className="font-bold text-stone-700 dark:text-dark-100 font-heading">{formatNaira(order.total)}</p>
                      <p className="text-xs text-stone-400 dark:text-dark-300 capitalize">{order.delivery_type}</p>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3" />{cfg.label}
                      </span>
                      <div className="relative group">
                        <button
                          disabled={updatingId === order.id}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-stone-200 dark:border-dark-500 text-xs text-stone-500 dark:text-dark-300 hover:border-primary-400 hover:text-primary-600 transition-colors bg-white dark:bg-dark-600"
                        >
                          {updatingId === order.id
                            ? <div className="w-3 h-3 border border-primary-400 border-t-transparent rounded-full animate-spin" />
                            : <><span>Change</span><ChevronDown className="h-3 w-3" /></>
                          }
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-dark-600 border border-stone-200 dark:border-dark-500 rounded-xl shadow-lg z-20 min-w-[130px] hidden group-hover:block">
                          {ALL_STATUSES.filter((s) => s !== order.status).map((s) => {
                            const sc = STATUS_CONFIG[s]; const Icon = sc.icon;
                            return (
                              <button key={s} onClick={() => updateStatus(order.id, s)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-600 dark:text-dark-200 hover:bg-primary-50 hover:text-primary-600 transition-colors first:rounded-t-xl last:rounded-b-xl">
                                <Icon className="h-3.5 w-3.5" />{sc.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-stone-400 dark:text-dark-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-stone-100 dark:border-dark-500 p-5 bg-stone-50 dark:bg-dark-600 grid sm:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-dark-300 mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-primary-50 shrink-0">
                              <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-stone-700 dark:text-dark-100">{item.name}</p>
                              <p className="text-xs text-stone-400 dark:text-dark-300">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold text-primary-600">{formatNaira(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-dark-300 mb-3">Order Info</p>
                      {[
                        { label: 'Phone', value: order.customer_phone },
                        { label: 'Delivery', value: order.delivery_type },
                        { label: 'Address', value: order.delivery_address },
                        { label: 'Date', value: order.delivery_date },
                        { label: 'Time', value: order.delivery_time },
                        { label: 'Payment', value: order.payment_method },
                        { label: 'Transaction ref', value: order.transaction_reference },
                        { label: 'Promo', value: order.promo_code },
                        { label: 'Notes', value: order.notes },
                      ].filter((r) => r.value).map((r) => (
                        <div key={r.label} className="flex gap-2">
                          <span className="text-stone-400 dark:text-dark-300 w-20 shrink-0">{r.label}</span>
                          <span className="text-stone-700 dark:text-dark-100 font-medium capitalize">{r.value}</span>
                        </div>
                      ))}
                      {order.payment_proof_url && (
                        <a
                          href={order.payment_proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 underline underline-offset-2 mt-2"
                        >
                          View payment proof
                        </a>
                      )}
                      <div className="border-t border-stone-200 dark:border-dark-500 pt-3 space-y-1 mt-3">
                        <div className="flex justify-between text-stone-400 dark:text-dark-300"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
                        {order.discount > 0 && <div className="flex justify-between text-primary-600"><span>Discount</span><span>-{formatNaira(order.discount)}</span></div>}
                        <div className="flex justify-between font-bold text-stone-700 dark:text-dark-100"><span>Total</span><span>{formatNaira(order.total)}</span></div>
                      </div>
                      {(order.status === 'delivered' || order.status === 'cancelled') && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(order); setDeleteError(null); }}
                          className="flex items-center gap-1.5 px-3 py-2 mt-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors text-xs font-medium w-fit"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete Order
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-center text-xs text-stone-400 dark:text-dark-300">Showing {filtered.length} of {orders.length} orders</p>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { if (!deleting) setDeleteTarget(null); }}>
          <div className="bg-white dark:bg-dark-600 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg font-bold text-stone-800 dark:text-dark-100">Delete this order?</h3>
                <p className="text-sm text-stone-400 dark:text-dark-300 mt-1">
                  Order <span className="font-mono font-semibold text-stone-600 dark:text-dark-200">{deleteTarget.order_number}</span> for <span className="font-semibold text-stone-600 dark:text-dark-200">{deleteTarget.customer_name}</span> will be permanently removed. This action cannot be undone.
                </p>
              </div>
            </div>
            {deleteError && (
              <p className="text-sm text-red-600 mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">{deleteError}</p>
            )}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 dark:border-dark-500 text-stone-600 dark:text-dark-200 font-medium text-sm hover:bg-stone-50 dark:hover:bg-dark-500 transition-colors disabled:opacity-50"
              >Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting
                  ? <><div className="w-4 h-4 border-2 border-white/40 border-t-transparent rounded-full animate-spin" /> Deleting...</>
                  : <><Trash2 className="h-4 w-4" /> Delete Permanently</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

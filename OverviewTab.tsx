import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, ShoppingBag, Package, Users, Mail,
  Banknote, AlertCircle, CheckCircle, Clock, XCircle,
  BarChart2, ArrowUp, ArrowDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatNaira } from '../../lib/types';

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  totalSubscribers: number;
  totalInquiries: number;
  totalMessages: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  topProducts: { name: string; count: number; revenue: number }[];
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-stone-400 dark:text-dark-300 uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-2xl font-bold font-heading ${color}`}>{value}</p>
          {sub && <p className="text-xs text-stone-400 dark:text-dark-300 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('-600', '-50').replace('-700', '-50')}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
    </div>
  );
}

export function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const [ordersRes, productsRes, subsRes, inquiriesRes, messagesRes] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('products').select('id'),
      supabase.from('newsletter_subscribers').select('id'),
      supabase.from('wholesale_inquiries').select('id'),
      supabase.from('contact_messages').select('id'),
    ]);

    const orders = (ordersRes.data ?? []) as any[];
    const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s: number, o: any) => s + Number(o.total), 0);

    // Revenue by day (last 7 days)
    const dayMap: Record<string, { revenue: number; orders: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dayMap[key] = { revenue: 0, orders: 0 };
    }
    orders.forEach((o: any) => {
      const day = o.created_at?.slice(0, 10);
      if (dayMap[day]) {
        dayMap[day].orders++;
        if (o.status !== 'cancelled') dayMap[day].revenue += Number(o.total);
      }
    });
    const revenueByDay = Object.entries(dayMap).map(([date, v]) => ({ date, ...v }));

    // Top products from order items
    const productCount: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o: any) => {
      (o.items ?? []).forEach((item: any) => {
        if (!productCount[item.name]) productCount[item.name] = { count: 0, revenue: 0 };
        productCount[item.name].count += item.quantity;
        productCount[item.name].revenue += item.price * item.quantity;
      });
    });
    const topProducts = Object.entries(productCount)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalOrders: orders.length,
      totalRevenue: revenue,
      pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
      cancelledOrders: orders.filter((o: any) => o.status === 'cancelled').length,
      totalProducts: (productsRes.data ?? []).length,
      totalSubscribers: (subsRes.data ?? []).length,
      totalInquiries: (inquiriesRes.data ?? []).length,
      totalMessages: (messagesRes.data ?? []).length,
      revenueByDay,
      topProducts,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-stone-100 dark:bg-dark-500 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const maxRevenue = Math.max(...stats.revenueByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={formatNaira(stats.totalRevenue)} icon={Banknote} color="text-emerald-600" sub="All time" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="text-blue-600" />
        <StatCard label="Pending Orders" value={stats.pendingOrders} icon={Clock} color="text-amber-600" sub="Needs action" />
        <StatCard label="Cancelled" value={stats.cancelledOrders} icon={XCircle} color="text-red-500" />
        <StatCard label="Products" value={stats.totalProducts} icon={Package} color="text-violet-600" />
        <StatCard label="Subscribers" value={stats.totalSubscribers} icon={Mail} color="text-pink-600" />
        <StatCard label="Wholesale Inquiries" value={stats.totalInquiries} icon={Users} color="text-orange-600" />
        <StatCard label="Contact Messages" value={stats.totalMessages} icon={AlertCircle} color="text-teal-600" />
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <BarChart2 className="h-5 w-5 text-stone-400 dark:text-dark-300" />
          <h3 className="font-semibold text-stone-700 dark:text-dark-100">Revenue — Last 7 Days</h3>
        </div>
        <div className="flex items-end gap-2 h-40">
          {stats.revenueByDay.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <p className="text-xs text-stone-400 dark:text-dark-300 font-medium">{formatNaira(d.revenue).replace('₦', '₦')}</p>
              <div className="w-full relative group">
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary-500 to-primary-400 transition-all hover:from-primary-600 hover:to-primary-500 cursor-default"
                  style={{ height: `${Math.max((d.revenue / maxRevenue) * 100, 4)}px` }}
                />
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {d.orders} orders · {formatNaira(d.revenue)}
                </div>
              </div>
              <p className="text-xs text-stone-400 dark:text-dark-300">{new Date(d.date).toLocaleDateString('en', { weekday: 'short' })}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-stone-400 dark:text-dark-300" />
          <h3 className="font-semibold text-stone-700 dark:text-dark-100">Top Selling Products</h3>
        </div>
        {stats.topProducts.length === 0 ? (
          <p className="text-stone-400 dark:text-dark-300 text-sm">No order data yet.</p>
        ) : (
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-700 dark:text-dark-100 truncate">{p.name}</p>
                  <p className="text-xs text-stone-400 dark:text-dark-300">{p.count} units sold</p>
                </div>
                <p className="text-sm font-semibold text-emerald-600">{formatNaira(p.revenue)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

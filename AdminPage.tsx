import { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, Package, Tag,
  Inbox, BookOpen, LogOut, Menu, X,
} from 'lucide-react';
import { AdminLogin } from './admin/AdminLogin';
import { OverviewTab } from './admin/OverviewTab';
import { OrdersTab } from './admin/OrdersTab';
import { ProductsTab } from './admin/ProductsTab';
import { PromoCodesTab } from './admin/PromoCodesTab';
import { InquiriesTab } from './admin/InquiriesTab';
import { BlogTab } from './admin/BlogTab';
import { BundlesTab } from './admin/BundlesTab';

type Tab = 'overview' | 'orders' | 'products' | 'bundles' | 'promos' | 'inquiries' | 'blog';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'overview',   label: 'Overview',    icon: LayoutDashboard },
  { key: 'orders',     label: 'Orders',      icon: ShoppingBag },
  { key: 'products',   label: 'Products',    icon: Package },
  { key: 'bundles',    label: 'Bundles',     icon: Package },
  { key: 'promos',     label: 'Promo Codes', icon: Tag },
  { key: 'inquiries',  label: 'Inquiries',   icon: Inbox },
  { key: 'blog',       label: 'Blog',        icon: BookOpen },
];

export function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!authed) return <AdminLogin onAuth={() => setAuthed(true)} />;

  const ActiveIcon = TABS.find((t) => t.key === activeTab)?.icon ?? LayoutDashboard;
  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? '';

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-dark-700 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-stone-900 text-white flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:flex-col
      `}>
        {/* Brand */}
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-bold text-white text-base leading-tight">ZaraChills</p>
              <p className="text-xs text-stone-400 mt-0.5">Admin Dashboard</p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white dark:bg-dark-600 border-b border-stone-100 dark:border-dark-500 px-4 sm:px-6 py-4 flex items-center gap-4 shadow-sm">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl border border-stone-200 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <ActiveIcon className="h-4 w-4 text-primary-600" />
            </div>
            <h1 className="font-heading font-bold text-stone-800 dark:text-dark-100 text-lg">{activeLabel}</h1>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 overflow-y-auto dark:bg-dark-700">
          {activeTab === 'overview'  && <OverviewTab />}
          {activeTab === 'orders'    && <OrdersTab />}
          {activeTab === 'products'  && <ProductsTab />}
          {activeTab === 'bundles'   && <BundlesTab />}
          {activeTab === 'promos'    && <PromoCodesTab />}
          {activeTab === 'inquiries' && <InquiriesTab />}
          {activeTab === 'blog'      && <BlogTab />}
        </main>
      </div>
    </div>
  );
}

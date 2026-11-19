import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatNaira } from '../../lib/types';
import type { PromoCode } from '../../lib/types';

const emptyNew = (): Omit<PromoCode, 'id'> => ({
  code: '', discount_percent: null, discount_amount: null,
  min_order: 0, active: true, expires_at: null,
});

export function PromoCodesTab() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newPromo, setNewPromo] = useState(emptyNew());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('promo_codes').select('*').order('created_at', { ascending: false });
    setPromos((data as PromoCode[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('promo_codes').update({ active: !current }).eq('id', id);
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, active: !current } : p)));
  };

  const deletePromo = async (id: string) => {
    setDeletingId(id);
    await supabase.from('promo_codes').delete().eq('id', id);
    setPromos((prev) => prev.filter((p) => p.id !== id));
    setDeletingId(null);
  };

  const saveNew = async () => {
    if (!newPromo.code.trim()) return;
    setSaving(true);
    const { data, error } = await supabase.from('promo_codes').insert([newPromo]).select().single();
    if (!error && data) {
      setPromos((prev) => [data as PromoCode, ...prev]);
      setAdding(false);
      setNewPromo(emptyNew());
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500 dark:text-dark-300">{promos.length} promo codes</p>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Promo Code
        </button>
      </div>

      {adding && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5 space-y-4">
          <h3 className="font-semibold text-stone-700 dark:text-dark-100">New Promo Code</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 dark:text-dark-300 mb-1 block">Code *</label>
              <input
                type="text" placeholder="e.g. ZARA20" value={newPromo.code}
                onChange={(e) => setNewPromo((v) => ({ ...v, code: e.target.value.toUpperCase() }))}
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 dark:text-dark-300 mb-1 block">Min. Order Amount (₦)</label>
              <input
                type="number" placeholder="0" value={newPromo.min_order}
                onChange={(e) => setNewPromo((v) => ({ ...v, min_order: Number(e.target.value) }))}
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 dark:text-dark-300 mb-1 block">Discount % (leave blank for fixed)</label>
              <input
                type="number" placeholder="e.g. 10" value={newPromo.discount_percent ?? ''}
                onChange={(e) => setNewPromo((v) => ({ ...v, discount_percent: e.target.value ? Number(e.target.value) : null }))}
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 dark:text-dark-300 mb-1 block">Fixed Discount Amount (₦)</label>
              <input
                type="number" placeholder="e.g. 500" value={newPromo.discount_amount ?? ''}
                onChange={(e) => setNewPromo((v) => ({ ...v, discount_amount: e.target.value ? Number(e.target.value) : null }))}
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600"
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 dark:text-dark-300 mb-1 block">Expires At (optional)</label>
              <input
                type="date" value={newPromo.expires_at ?? ''}
                onChange={(e) => setNewPromo((v) => ({ ...v, expires_at: e.target.value || null }))}
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveNew} disabled={saving || !newPromo.code.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
              <Check className="h-4 w-4" /> Save
            </button>
            <button onClick={() => { setAdding(false); setNewPromo(emptyNew()); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-600 dark:text-dark-200 rounded-xl text-sm font-medium transition-colors">
              <X className="h-4 w-4" /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-stone-100 dark:bg-dark-500 animate-pulse" />)}</div>
      ) : promos.length === 0 ? (
        <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-12 text-center shadow-sm">
          <p className="text-stone-500 dark:text-dark-300">No promo codes yet. Create one above.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 dark:border-dark-500">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Code</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Discount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide hidden sm:table-cell">Min. Order</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide hidden sm:table-cell">Expires</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {promos.map((p) => {
                const isExpired = p.expires_at && new Date(p.expires_at) < new Date();
                return (
                  <tr key={p.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50 dark:bg-dark-600 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-stone-700 dark:text-dark-100 bg-stone-100 dark:bg-dark-500 px-2 py-0.5 rounded-lg text-sm">{p.code}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-600 dark:text-dark-200">
                      {p.discount_percent ? `${p.discount_percent}% off` : p.discount_amount ? `${formatNaira(p.discount_amount)} off` : '—'}
                    </td>
                    <td className="px-4 py-3 text-stone-500 dark:text-dark-300 hidden sm:table-cell">
                      {p.min_order > 0 ? `Min. ${formatNaira(p.min_order)}` : 'No minimum'}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {p.expires_at ? (
                        <span className={isExpired ? 'text-red-500 text-xs' : 'text-stone-500 dark:text-dark-300 text-xs'}>
                          {isExpired ? 'Expired · ' : ''}{new Date(p.expires_at).toLocaleDateString()}
                        </span>
                      ) : <span className="text-stone-400 dark:text-dark-300 text-xs">No expiry</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(p.id, p.active)}
                        className={`transition-colors ${p.active ? 'text-emerald-500' : 'text-stone-300'}`}>
                        {p.active ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => deletePromo(p.id)} disabled={deletingId === p.id}
                        className="w-7 h-7 rounded-lg border border-stone-200 dark:border-dark-500 hover:border-red-300 hover:text-red-500 text-stone-400 dark:text-dark-300 flex items-center justify-center transition-colors ml-auto">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

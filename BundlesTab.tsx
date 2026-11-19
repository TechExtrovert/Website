import { useEffect, useState, useCallback, useRef } from 'react';
import { Edit2, Check, X, Upload, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatNaira } from '../../lib/types';
import type { Bundle } from '../../lib/types';

type EditField = Partial<Pick<Bundle, 'name' | 'price' | 'original_price' | 'description' | 'badge' | 'image_url'>>;

function BundleImageCell({ bundle, onSaved }: { bundle: Bundle; onSaved: (id: string, imageUrl: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB.');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `bundles/${fileName}`;
    const { error: upErr } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });
    if (upErr) {
      setUploading(false);
      setError(upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(filePath);
    const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;
    const { error: dbErr } = await supabase
      .from('bundles')
      .update({ image_url: publicUrl })
      .eq('id', bundle.id);
    setUploading(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved(bundle.id, publicUrl);
  };

  const removeImage = async () => {
    setError(null);
    const { error: dbErr } = await supabase
      .from('bundles')
      .update({ image_url: null })
      .eq('id', bundle.id);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved(bundle.id, '');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2 relative">
      <div className="relative group shrink-0">
        {bundle.image_url ? (
          <>
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 dark:bg-dark-500 border border-stone-200 dark:border-dark-500">
              <img src={bundle.image_url} alt={bundle.name} className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Remove image"
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-12 h-12 rounded-xl border-2 border-dashed border-stone-200 dark:border-dark-500 hover:border-primary-300 hover:bg-primary-50/50 flex items-center justify-center text-stone-300 hover:text-primary-400 transition-colors"
            aria-label="Upload image"
            title="Upload image"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </button>
        )}
      </div>
      {bundle.image_url && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="text-xs text-primary-500 hover:text-primary-600 font-medium disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Change'}
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
      {error && (
        <div className="absolute left-0 top-full mt-1 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-2 py-1 whitespace-normal max-w-[200px] z-10">
          {error}
        </div>
      )}
    </div>
  );
}

const BADGES = ['', 'Save 25%', 'Best Value', 'Popular', 'New', 'Limited'];

export function BundlesTab() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditField>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('bundles').select('*');
    setBundles((data as Bundle[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (b: Bundle) => {
    setEditingId(b.id);
    setEditValues({
      name: b.name,
      price: b.price,
      original_price: b.original_price,
      description: b.description,
      badge: b.badge,
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveEdit = async (id: string) => {
    setSaving(true);
    const { data, error } = await supabase.from('bundles').update(editValues).eq('id', id).select().single();
    if (!error && data) {
      setBundles((prev) => prev.map((b) => (b.id === id ? { ...b, ...data } : b)));
    }
    setSaving(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-stone-800 dark:text-dark-100">Fitness Bundles</h2>
          <p className="text-sm text-stone-400 dark:text-dark-300 mt-0.5">Edit bundle images, prices, and details</p>
        </div>
        <span className="text-sm text-stone-400 dark:text-dark-300">{bundles.length} bundles</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-stone-100 dark:bg-dark-500 animate-pulse" />)}</div>
      ) : (
        <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 dark:border-dark-500">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Bundle</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Image</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Price</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide hidden sm:table-cell">Orig. Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide hidden md:table-cell">Badge</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {bundles.map((b) => {
                const isEditing = editingId === b.id;
                return (
                  <tr key={b.id} className={`border-b border-stone-50 last:border-0 ${isEditing ? 'bg-primary-50/50' : 'hover:bg-stone-50 dark:bg-dark-600'} transition-colors`}>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text" value={editValues.name ?? ''}
                            onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                            className="border border-primary-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary-500 w-full"
                          />
                          <textarea
                            rows={2} value={editValues.description ?? ''}
                            onChange={(e) => setEditValues((v) => ({ ...v, description: e.target.value }))}
                            placeholder="Description"
                            className="border border-primary-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary-500 w-full resize-none"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-stone-700 dark:text-dark-100">{b.name}</p>
                          {b.description && <p className="text-xs text-stone-400 dark:text-dark-300 line-clamp-2 max-w-xs">{b.description}</p>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <BundleImageCell bundle={b} onSaved={(id, url) => setBundles((prev) => prev.map((bb) => bb.id === id ? { ...bb, image_url: url } : bb))} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number" value={editValues.price ?? 0}
                          onChange={(e) => setEditValues((v) => ({ ...v, price: Number(e.target.value) }))}
                          className="border border-primary-300 rounded-lg px-2 py-1 text-sm text-right w-28 focus:outline-none focus:border-primary-500"
                        />
                      ) : (
                        <span className="font-semibold text-stone-700 dark:text-dark-100">{formatNaira(b.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      {isEditing ? (
                        <input
                          type="number" value={editValues.original_price ?? ''}
                          onChange={(e) => setEditValues((v) => ({ ...v, original_price: e.target.value ? Number(e.target.value) : null }))}
                          className="border border-primary-300 rounded-lg px-2 py-1 text-sm text-right w-28 focus:outline-none focus:border-primary-500"
                        />
                      ) : (
                        <span className="text-stone-400 dark:text-dark-300">{b.original_price ? formatNaira(b.original_price) : '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {isEditing ? (
                        <select
                          value={editValues.badge ?? ''}
                          onChange={(e) => setEditValues((v) => ({ ...v, badge: e.target.value || null }))}
                          className="border border-primary-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary-500 bg-white dark:bg-dark-600"
                        >
                          {BADGES.map((bd) => <option key={bd} value={bd}>{bd || '— None —'}</option>)}
                        </select>
                      ) : (
                        b.badge && <span className="text-xs px-2 py-1 rounded-full bg-secondary-100 text-secondary-700 font-medium">{b.badge}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => saveEdit(b.id)} disabled={saving}
                            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={cancelEdit}
                            className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-600 dark:text-dark-200 flex items-center justify-center transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(b)}
                          className="w-7 h-7 rounded-lg border border-stone-200 dark:border-dark-500 hover:border-primary-400 hover:text-primary-600 text-stone-400 dark:text-dark-300 flex items-center justify-center transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
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

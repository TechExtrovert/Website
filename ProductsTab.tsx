import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit2, Check, X, ToggleLeft, ToggleRight, Search, ChevronDown, ChevronUp, Upload, Link as LinkIcon, Image as ImageIcon, Loader2, Barcode, QrCode, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatNaira } from '../../lib/types';
import type { Product } from '../../lib/types';

type ImagePickerProps = {
  value: string;
  onChange: (url: string) => void;
};

function ImagePicker({ value, onChange }: ImagePickerProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `products/${fileName}`;
    const { data: upData, error: upErr } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      });
    setUploading(false);
    if (upErr) {
      setUploadError(`Upload failed: ${upErr.message}${upErr.statusCode ? ` (code ${upErr.statusCode})` : ''}`);
      return;
    }
    if (!upData) {
      setUploadError('Upload failed: no data returned. Please try again.');
      return;
    }
    const { data: pub } = supabase.storage.from('product-images').getPublicUrl(filePath);
    if (!pub.publicUrl) {
      setUploadError('Could not get public URL for uploaded image.');
      return;
    }
    onChange(`${pub.publicUrl}?t=${Date.now()}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-2">Product Image</label>

      {/* Preview */}
      {value && (
        <div className="relative inline-block mb-3">
          <img src={value} alt="preview" className="h-24 w-24 object-cover rounded-xl border border-stone-200 dark:border-dark-500" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-stone-100 dark:bg-dark-500 rounded-xl mb-3 w-fit">
        <button
          type="button"
          onClick={() => setTab('upload')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'upload' ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm' : 'text-stone-400 dark:text-dark-300 hover:text-stone-600 dark:text-dark-200'
          }`}
        >
          <Upload className="h-3.5 w-3.5" />
          Upload from Device
        </button>
        <button
          type="button"
          onClick={() => setTab('url')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            tab === 'url' ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm' : 'text-stone-400 dark:text-dark-300 hover:text-stone-600 dark:text-dark-200'
          }`}
        >
          <LinkIcon className="h-3.5 w-3.5" />
          Paste URL
        </button>
      </div>

      {/* Upload tab */}
      {tab === 'upload' && (
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-primary-400 bg-primary-50/50' : 'border-stone-200 dark:border-dark-500 hover:border-primary-300 hover:bg-stone-50 dark:bg-dark-600'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2 text-stone-400 dark:text-dark-300">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-sm">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-stone-400 dark:text-dark-300">
                <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-dark-500 flex items-center justify-center">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-stone-500 dark:text-dark-300">Click to browse or drag an image here</span>
                <span className="text-xs text-stone-300">PNG, JPG, WEBP up to 5 MB</span>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}
        </div>
      )}

      {/* URL tab */}
      {tab === 'url' && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-mono"
        />
      )}
    </div>
  );
}

type EditField = Partial<Product>;

type ImageCellProps = {
  product: Product;
  onSaved: (id: string, imageUrl: string) => void;
};

function ImageCell({ product, onSaved }: ImageCellProps) {
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
    const filePath = `products/${fileName}`;
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
      .from('products')
      .update({ image_url: publicUrl })
      .eq('id', product.id);
    setUploading(false);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved(product.id, publicUrl);
  };

  const removeImage = async () => {
    setError(null);
    const { error: dbErr } = await supabase
      .from('products')
      .update({ image_url: null })
      .eq('id', product.id);
    if (dbErr) {
      setError(dbErr.message);
      return;
    }
    onSaved(product.id, '');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative group shrink-0">
        {product.image_url ? (
          <>
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-100 dark:bg-dark-500 border border-stone-200 dark:border-dark-500">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
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
            className="w-11 h-11 rounded-xl border-2 border-dashed border-stone-200 dark:border-dark-500 hover:border-primary-300 hover:bg-primary-50/50 flex items-center justify-center text-stone-300 hover:text-primary-400 transition-colors"
            aria-label="Upload image"
            title="Upload image"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {product.image_url && (
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

const GOALS = ['Fat Burn', 'Weight Gain', 'Energy', 'Recovery', 'Hydration', 'Wellness', 'Detox'];
const CATEGORIES = ['single', 'bundle'];
const BADGES = ['', 'Best Seller', 'New', 'Popular', 'Limited', 'Sale'];

const BLANK_FORM = {
  name: '',
  slug: '',
  tagline: '',
  description: '',
  category: 'single',
  goal: [] as string[],
  goals: [] as string[],
  ingredients: '',
  how_to_use: '',
  nutrition: [] as string[],
  price: 0,
  original_price: null as number | null,
  image_url: '',
  barcode: '',
  qr_code: '',
  badge: '',
  in_stock: true,
  featured: false,
  sort_order: 0,
};

type FormState = typeof BLANK_FORM;

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function AddProductForm({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState<FormState>({ ...BLANK_FORM });
  const [nutritionInput, setNutritionInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleNameChange = (name: string) => {
    set('name', name);
    set('slug', toSlug(name));
  };

  const toggleGoal = (g: string) => {
    set('goal', form.goal.includes(g) ? form.goal.filter((x) => x !== g) : [...form.goal, g]);
  };

  const addNutritionLine = () => {
    const line = nutritionInput.trim();
    if (!line) return;
    set('nutrition', [...form.nutrition, line]);
    setNutritionInput('');
  };

  const removeNutritionLine = (i: number) =>
    set('nutrition', form.nutrition.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    if (!form.slug.trim()) { setError('Slug is required.'); return; }
    if (form.price <= 0) { setError('Price must be greater than 0.'); return; }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      tagline: form.tagline.trim() || null,
      description: form.description.trim() || null,
      category: form.category,
      goal: form.goal.length ? form.goal : null,
      goals: form.goal,
      ingredients: form.ingredients.trim() || null,
      how_to_use: form.how_to_use.trim() || null,
      nutrition: form.nutrition.length ? form.nutrition : null,
      price: form.price,
      original_price: form.original_price || null,
      image_url: form.image_url.trim() || null,
      barcode: form.barcode.trim() || null,
      qr_code: form.qr_code.trim() || `${window.location.origin}/#/product/${form.slug.trim()}`,
      badge: form.badge || null,
      in_stock: form.in_stock,
      featured: form.featured,
      sort_order: form.sort_order,
    };

    const { error: err } = await supabase.from('products').insert(payload);
    setSaving(false);
    if (err) { setError(err.message); return; }
    setForm({ ...BLANK_FORM });
    setNutritionInput('');
    setOpen(false);
    onAdded();
  };

  return (
    <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-stone-50 dark:bg-dark-600 transition-colors"
      >
        <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm">
          <Plus className="h-4 w-4" />
          Add New Product
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-stone-400 dark:text-dark-300" /> : <ChevronDown className="h-4 w-4 text-stone-400 dark:text-dark-300" />}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-stone-100 dark:border-dark-500 px-5 py-5 space-y-5">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Name + Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">
                Product Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text" required value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Fat Burn Boost"
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">
                Slug (URL) <span className="text-red-400">*</span>
              </label>
              <input
                type="text" required value={form.slug}
                onChange={(e) => set('slug', e.target.value)}
                placeholder="fat-burn-boost"
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 font-mono"
              />
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">Tagline</label>
            <input
              type="text" value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder="Short one-line description shown on cards"
              className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">Full Description</label>
            <textarea
              rows={3} value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Detailed product description shown on the product page"
              className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none"
            />
          </div>

          {/* Category + Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">Badge</label>
              <select
                value={form.badge}
                onChange={(e) => set('badge', e.target.value)}
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600"
              >
                {BADGES.map((b) => <option key={b} value={b}>{b || '— None —'}</option>)}
              </select>
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-2">Goals (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((g) => (
                <button
                  key={g} type="button"
                  onClick={() => toggleGoal(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.goal.includes(g)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white dark:bg-dark-600 text-stone-500 dark:text-dark-300 border-stone-200 dark:border-dark-500 hover:border-primary-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Price + Original Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">
                Price (₦) <span className="text-red-400">*</span>
              </label>
              <input
                type="number" required min={1} value={form.price || ''}
                onChange={(e) => set('price', Number(e.target.value))}
                placeholder="e.g. 5000"
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">
                Original Price (₦) <span className="text-stone-300">optional — shows strikethrough</span>
              </label>
              <input
                type="number" min={0} value={form.original_price || ''}
                onChange={(e) => set('original_price', e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 6000"
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
            </div>
          </div>

          {/* Image picker */}
          <ImagePicker value={form.image_url} onChange={(url) => set('image_url', url)} />

          {/* Product identification */}
          <div className="rounded-2xl border border-primary-100 bg-primary-50/40 dark:bg-dark-500/40 dark:border-dark-500 p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-dark-600 border border-primary-100 dark:border-dark-500 flex items-center justify-center text-primary-600 shrink-0">
                <Barcode className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-700 dark:text-dark-100">Product identification</h3>
                <p className="text-xs text-stone-400 dark:text-dark-300 mt-0.5">Add a barcode for stock identification and a QR code for quick product access.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">
                  <Barcode className="h-3.5 w-3.5" /> Barcode
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={form.barcode}
                  onChange={(e) => set('barcode', e.target.value.replace(/[^0-9A-Za-z-]/g, ''))}
                  placeholder="e.g. 8901058858985"
                  className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600 font-mono"
                />
                <p className="text-[11px] text-stone-400 dark:text-dark-300 mt-1">EAN, UPC, or your internal product code</p>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">
                  <QrCode className="h-3.5 w-3.5" /> QR code destination
                </label>
                <input
                  type="url"
                  value={form.qr_code || `${window.location.origin}/#/product/${form.slug || 'new-product'}`}
                  onChange={(e) => set('qr_code', e.target.value)}
                  placeholder="Product page link"
                  className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 bg-white dark:bg-dark-600"
                />
                <button
                  type="button"
                  onClick={() => set('qr_code', `${window.location.origin}/#/product/${form.slug || 'new-product'}`)}
                  className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium mt-1"
                >
                  <RefreshCw className="h-3 w-3" /> Use product page
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-xl bg-white dark:bg-dark-600 border border-stone-100 dark:border-dark-500 p-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(form.qr_code || `${window.location.origin}/#/product/${form.slug || 'new-product'}`)}`}
                alt="QR code preview"
                className="w-20 h-20 rounded-lg border border-stone-100"
              />
              <div>
                <p className="text-sm font-semibold text-stone-700 dark:text-dark-100">QR code preview</p>
                <p className="text-xs text-stone-400 dark:text-dark-300 mt-1">Customers can scan this code to open the product page.</p>
              </div>
            </div>
          </div>

          {/* Ingredients + How to use */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">Ingredients</label>
              <textarea
                rows={3} value={form.ingredients}
                onChange={(e) => set('ingredients', e.target.value)}
                placeholder="e.g. Mango, Pineapple, Ginger..."
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">How to Use</label>
              <textarea
                rows={3} value={form.how_to_use}
                onChange={(e) => set('how_to_use', e.target.value)}
                placeholder="e.g. Shake well. Drink chilled..."
                className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none"
              />
            </div>
          </div>

          {/* Nutrition facts */}
          <div>
            <label className="block text-xs font-semibold text-stone-500 dark:text-dark-300 uppercase tracking-wide mb-1">
              Nutrition Facts <span className="text-stone-300 normal-case font-normal">(add one line at a time, e.g. "Calories 180 kcal")</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text" value={nutritionInput}
                onChange={(e) => setNutritionInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNutritionLine(); } }}
                placeholder='e.g. Calories 180 kcal'
                className="flex-1 border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
              />
              <button
                type="button" onClick={addNutritionLine}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-dark-500 hover:bg-stone-200 text-stone-600 dark:text-dark-200 text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            {form.nutrition.length > 0 && (
              <ul className="space-y-1">
                {form.nutrition.map((line, i) => (
                  <li key={i} className="flex items-center justify-between bg-stone-50 dark:bg-dark-600 rounded-lg px-3 py-2 text-sm">
                    <span>{line}</span>
                    <button type="button" onClick={() => removeNutritionLine(i)} className="text-stone-400 dark:text-dark-300 hover:text-red-400 transition-colors ml-2">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Toggles + Sort */}
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => set('in_stock', !form.in_stock)}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.in_stock ? 'bg-emerald-500' : 'bg-stone-200'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white dark:bg-dark-600 rounded-full shadow transition-transform ${form.in_stock ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-medium text-stone-600 dark:text-dark-200">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => set('featured', !form.featured)}
                className={`relative w-10 h-6 rounded-full transition-colors ${form.featured ? 'bg-amber-400' : 'bg-stone-200'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 bg-white dark:bg-dark-600 rounded-full shadow transition-transform ${form.featured ? 'translate-x-4' : 'translate-x-0'}`} />
              </button>
              <span className="text-sm font-medium text-stone-600 dark:text-dark-200">Featured</span>
            </label>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-stone-600 dark:text-dark-200">Sort Order</label>
              <input
                type="number" min={0} value={form.sort_order}
                onChange={(e) => set('sort_order', Number(e.target.value))}
                className="w-20 border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 text-center"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-stone-100 dark:border-dark-500">
            <button
              type="submit" disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              {saving ? 'Saving...' : 'Add Product'}
            </button>
            <button
              type="button" onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-dark-500 hover:bg-stone-200 text-stone-600 dark:text-dark-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditField>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('sort_order');
    setProducts((data as Product[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditValues({ name: p.name, price: p.price, original_price: p.original_price, tagline: p.tagline, badge: p.badge, in_stock: p.in_stock, featured: p.featured });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveEdit = async (id: string) => {
    setSaving(true);
    const { data, error } = await supabase.from('products').update(editValues).eq('id', id).select().single();
    if (!error && data) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    }
    setSaving(false);
    setEditingId(null);
  };

  const toggleStock = async (id: string, current: boolean) => {
    await supabase.from('products').update({ in_stock: !current }).eq('id', id);
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, in_stock: !current } : p)));
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    const { data, error } = await supabase.from('products').delete().eq('id', deleteTarget.id).select('id');
    setDeleting(false);
    if (error) {
      setDeleteError(error.message);
      return;
    }
    if (!data || data.length === 0) {
      setDeleteError('This product could not be deleted. Please refresh and try again.');
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const filtered = products.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Add product form */}
      <AddProductForm onAdded={load} />

      {/* Search + count */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-dark-300" />
          <input
            type="text" placeholder="Search products..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-stone-200 dark:border-dark-500 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary-400 transition-colors bg-white dark:bg-dark-600"
          />
        </div>
        <span className="text-sm text-stone-400 dark:text-dark-300">{filtered.length} products</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-stone-100 dark:bg-dark-500 animate-pulse" />)}</div>
      ) : (
        <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 dark:border-dark-500">
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Product</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Image</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide hidden sm:table-cell">Category</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Price</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Stock</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Featured</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Delete</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} className={`border-b border-stone-50 last:border-0 ${isEditing ? 'bg-primary-50/50' : 'hover:bg-stone-50 dark:bg-dark-600'} transition-colors`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image_url && (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 dark:bg-dark-500 shrink-0">
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          {isEditing ? (
                            <input
                              type="text" value={editValues.name ?? ''}
                              onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                              className="border border-primary-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-primary-500 w-full"
                            />
                          ) : (
                            <p className="font-medium text-stone-700 dark:text-dark-100">{p.name}</p>
                          )}
                          {p.badge && <span className="text-xs text-primary-500 font-medium">{p.badge}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ImageCell product={p} onSaved={(id, url) => setProducts((prev) => prev.map((pp) => pp.id === id ? { ...pp, image_url: url } : pp))} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="px-2 py-1 rounded-full bg-stone-100 dark:bg-dark-500 text-stone-500 dark:text-dark-300 text-xs capitalize">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <input
                          type="number" value={editValues.price ?? 0}
                          onChange={(e) => setEditValues((v) => ({ ...v, price: Number(e.target.value) }))}
                          className="border border-primary-300 rounded-lg px-2 py-1 text-sm text-right w-28 focus:outline-none focus:border-primary-500"
                        />
                      ) : (
                        <span className="font-semibold text-stone-700 dark:text-dark-100">{formatNaira(p.price)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => isEditing ? setEditValues((v) => ({ ...v, in_stock: !v.in_stock })) : toggleStock(p.id, p.in_stock)}
                        className={`transition-colors ${(isEditing ? editValues.in_stock : p.in_stock) ? 'text-emerald-500' : 'text-stone-300'}`}>
                        {(isEditing ? editValues.in_stock : p.in_stock)
                          ? <ToggleRight className="h-6 w-6" />
                          : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => isEditing ? setEditValues((v) => ({ ...v, featured: !v.featured })) : null}
                        className={`text-xs px-2 py-1 rounded-full font-medium ${(isEditing ? editValues.featured : p.featured) ? 'bg-amber-100 text-amber-700' : 'bg-stone-100 dark:bg-dark-500 text-stone-400 dark:text-dark-300'}`}>
                        {(isEditing ? editValues.featured : p.featured) ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isEditing ? (
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => saveEdit(p.id)} disabled={saving}
                            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={cancelEdit}
                            className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-600 dark:text-dark-200 flex items-center justify-center transition-colors">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(p)}
                          className="w-7 h-7 rounded-lg border border-stone-200 dark:border-dark-500 hover:border-primary-400 hover:text-primary-600 text-stone-400 dark:text-dark-300 flex items-center justify-center transition-colors">
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => { setDeleteTarget(p); setDeleteError(null); }}
                        disabled={isEditing}
                        className="w-7 h-7 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed mx-auto"
                        aria-label="Delete product"
                        title="Delete product"
                      >
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

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { if (!deleting) setDeleteTarget(null); }}>
          <div className="bg-white dark:bg-dark-600 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-lg font-bold text-stone-800 dark:text-dark-100">Delete this product?</h3>
                <p className="text-sm text-stone-400 dark:text-dark-300 mt-1">
                  <span className="font-semibold text-stone-600 dark:text-dark-200">{deleteTarget.name}</span> will be permanently removed from your store. This action cannot be undone.
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

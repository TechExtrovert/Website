import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Check, X, Search, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { BlogPost } from '../../lib/types';

type EditField = Partial<BlogPost>;

export function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<EditField>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
    setPosts((data as BlogPost[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const startEdit = (p: BlogPost) => {
    setEditingId(p.id);
    setEditValues({ title: p.title, author: p.author, category: p.category, excerpt: p.excerpt, read_time: p.read_time });
  };

  const cancelEdit = () => { setEditingId(null); setEditValues({}); };

  const saveEdit = async (id: string) => {
    setSaving(true);
    const { data, error } = await supabase.from('blog_posts').update(editValues).eq('id', id).select().single();
    if (!error && data) {
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
    }
    setSaving(false);
    setEditingId(null);
  };

  const filtered = posts.filter((p) =>
    !search || p.title.toLowerCase().includes(search.toLowerCase()) || (p.author ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-dark-300" />
          <input
            type="text" placeholder="Search posts..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-stone-200 dark:border-dark-500 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary-400 transition-colors bg-white dark:bg-dark-600"
          />
        </div>
        <span className="text-sm text-stone-400 dark:text-dark-300">{filtered.length} posts</span>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-stone-100 dark:bg-dark-500 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-12 text-center shadow-sm">
          <p className="text-stone-400 dark:text-dark-300">No blog posts found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const isEditing = editingId === p.id;
            return (
              <div key={p.id} className={`bg-white dark:bg-dark-600 rounded-2xl border shadow-sm overflow-hidden ${isEditing ? 'border-primary-300' : 'border-stone-100 dark:border-dark-500'}`}>
                <div className="p-4">
                  <div className="flex gap-4">
                    {p.image_url && (
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 dark:bg-dark-500 shrink-0">
                        <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-2">
                      {isEditing ? (
                        <>
                          <input type="text" value={editValues.title ?? ''}
                            onChange={(e) => setEditValues((v) => ({ ...v, title: e.target.value }))}
                            className="w-full border border-primary-300 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-primary-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input type="text" value={editValues.author ?? ''} placeholder="Author"
                              onChange={(e) => setEditValues((v) => ({ ...v, author: e.target.value }))}
                              className="border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-400"
                            />
                            <input type="text" value={editValues.category ?? ''} placeholder="Category"
                              onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}
                              className="border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-400"
                            />
                            <input type="text" value={editValues.read_time ?? ''} placeholder="Read time (e.g. 5 min)"
                              onChange={(e) => setEditValues((v) => ({ ...v, read_time: e.target.value }))}
                              className="border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-400"
                            />
                          </div>
                          <textarea
                            value={editValues.excerpt ?? ''}
                            onChange={(e) => setEditValues((v) => ({ ...v, excerpt: e.target.value }))}
                            placeholder="Excerpt..."
                            rows={2}
                            className="w-full border border-stone-200 dark:border-dark-500 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary-400 resize-none"
                          />
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-stone-700 dark:text-dark-100 text-sm leading-snug">{p.title}</p>
                          <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-dark-300">
                            {p.author && <span>By {p.author}</span>}
                            {p.category && <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-dark-500 text-stone-500 dark:text-dark-300 capitalize">{p.category}</span>}
                            {p.read_time && <span>{p.read_time}</span>}
                            <span>{new Date(p.published_at).toLocaleDateString()}</span>
                          </div>
                          {p.excerpt && <p className="text-xs text-stone-400 dark:text-dark-300 line-clamp-2">{p.excerpt}</p>}
                        </>
                      )}
                    </div>
                    <div className="shrink-0">
                      {isEditing ? (
                        <div className="flex gap-1">
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

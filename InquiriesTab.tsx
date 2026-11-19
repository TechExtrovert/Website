import { useEffect, useState, useCallback } from 'react';
import { Mail, Building2, Phone, MessageSquare, ChevronDown, Trash2, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Inquiry = {
  id: string; business_name: string; contact_name: string; email: string;
  phone: string; business_type: string; location: string; message: string; created_at: string;
};

type Message = {
  id: string; name: string; email: string; subject: string; message: string; created_at: string;
};

type Sub = { id: string; email: string; created_at: string };

function exportCSV(rows: any[], filename: string, headers: string[], keys: string[]) {
  const csv = [headers, ...rows.map((r) => keys.map((k) => String(r[k] ?? '').replace(/,/g, ';')))].map((r) => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function CollapsibleRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-stone-400 dark:text-dark-300 w-24 shrink-0">{label}</span>
      <span className={`text-stone-700 dark:text-dark-100 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export function InquiriesTab() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [subscribers, setSubscribers] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'inquiries' | 'messages' | 'subscribers'>('inquiries');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [inqRes, msgRes, subRes] = await Promise.all([
      supabase.from('wholesale_inquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
    ]);
    setInquiries((inqRes.data as Inquiry[]) ?? []);
    setMessages((msgRes.data as Message[]) ?? []);
    setSubscribers((subRes.data as Sub[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sections = [
    { key: 'inquiries', label: 'Wholesale Inquiries', count: inquiries.length, icon: Building2 },
    { key: 'messages', label: 'Contact Messages', count: messages.length, icon: MessageSquare },
    { key: 'subscribers', label: 'Newsletter Subscribers', count: subscribers.length, icon: Mail },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-2 flex-wrap">
        {sections.map(({ key, label, count, icon: Icon }) => (
          <button key={key} onClick={() => { setActiveSection(key); setExpandedId(null); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              activeSection === key ? 'bg-stone-700 text-white border-stone-700' : 'bg-white dark:bg-dark-600 border-stone-200 dark:border-dark-500 text-stone-500 dark:text-dark-300 hover:border-stone-400'
            }`}>
            <Icon className="h-4 w-4" />
            {label}
            <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeSection === key ? 'bg-white dark:bg-dark-600/20 text-white' : 'bg-stone-100 dark:bg-dark-500 text-stone-500 dark:text-dark-300'}`}>{count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-stone-100 dark:bg-dark-500 animate-pulse" />)}</div>
      ) : (
        <>
          {activeSection === 'inquiries' && (
            <div className="space-y-2">
              <div className="flex justify-end">
                <button
                  onClick={() => exportCSV(inquiries, 'wholesale-inquiries.csv',
                    ['Business', 'Contact', 'Email', 'Phone', 'Type', 'Location', 'Message', 'Date'],
                    ['business_name', 'contact_name', 'email', 'phone', 'business_type', 'location', 'message', 'created_at'])}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
              </div>
              {inquiries.length === 0 ? (
                <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-12 text-center shadow-sm">
                  <Building2 className="h-10 w-10 text-stone-200 mx-auto mb-2" />
                  <p className="text-stone-400 dark:text-dark-300">No wholesale inquiries yet.</p>
                </div>
              ) : inquiries.map((inq) => (
                <div key={inq.id} className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 shadow-sm overflow-hidden">
                  <div className="p-4 cursor-pointer hover:bg-stone-50 dark:bg-dark-600 transition-colors flex items-center justify-between gap-3"
                    onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-700 dark:text-dark-100">{inq.business_name}</p>
                      <p className="text-sm text-stone-400 dark:text-dark-300">{inq.contact_name} · {inq.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-2 py-1 rounded-full bg-stone-100 dark:bg-dark-500 text-stone-500 dark:text-dark-300 text-xs capitalize">{inq.business_type}</span>
                      <p className="text-xs text-stone-400 dark:text-dark-300 mt-1">{new Date(inq.created_at).toLocaleDateString()}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-stone-400 dark:text-dark-300 transition-transform shrink-0 ${expandedId === inq.id ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedId === inq.id && (
                    <div className="border-t border-stone-100 dark:border-dark-500 p-5 bg-stone-50 dark:bg-dark-600 space-y-2">
                      <CollapsibleRow label="Phone" value={inq.phone} />
                      <CollapsibleRow label="Location" value={inq.location} />
                      <CollapsibleRow label="Business Type" value={inq.business_type} />
                      <div className="pt-2">
                        <p className="text-xs text-stone-400 dark:text-dark-300 mb-1">Message</p>
                        <p className="text-sm text-stone-700 dark:text-dark-100 bg-white dark:bg-dark-600 rounded-xl border border-stone-100 dark:border-dark-500 p-3">{inq.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'messages' && (
            <div className="space-y-2">
              <div className="flex justify-end">
                <button
                  onClick={() => exportCSV(messages, 'contact-messages.csv',
                    ['Name', 'Email', 'Subject', 'Message', 'Date'],
                    ['name', 'email', 'subject', 'message', 'created_at'])}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </button>
              </div>
              {messages.length === 0 ? (
                <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-12 text-center shadow-sm">
                  <MessageSquare className="h-10 w-10 text-stone-200 mx-auto mb-2" />
                  <p className="text-stone-400 dark:text-dark-300">No contact messages yet.</p>
                </div>
              ) : messages.map((msg) => (
                <div key={msg.id} className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 shadow-sm overflow-hidden">
                  <div className="p-4 cursor-pointer hover:bg-stone-50 dark:bg-dark-600 transition-colors flex items-center justify-between gap-3"
                    onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-700 dark:text-dark-100">{msg.name}</p>
                      <p className="text-sm text-stone-400 dark:text-dark-300">{msg.email} · <span className="text-stone-500 dark:text-dark-300">{msg.subject}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-stone-400 dark:text-dark-300">{new Date(msg.created_at).toLocaleDateString()}</p>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-stone-400 dark:text-dark-300 transition-transform shrink-0 ${expandedId === msg.id ? 'rotate-180' : ''}`} />
                  </div>
                  {expandedId === msg.id && (
                    <div className="border-t border-stone-100 dark:border-dark-500 p-5 bg-stone-50 dark:bg-dark-600">
                      <p className="text-sm text-stone-700 dark:text-dark-100 bg-white dark:bg-dark-600 rounded-xl border border-stone-100 dark:border-dark-500 p-3">{msg.message}</p>
                      <a href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium">
                        <Mail className="h-4 w-4" /> Reply via Email
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeSection === 'subscribers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-stone-500 dark:text-dark-300"><span className="font-semibold text-stone-700 dark:text-dark-100">{subscribers.length}</span> subscribers</p>
                <button
                  onClick={() => exportCSV(subscribers, 'newsletter-subscribers.csv', ['Email', 'Subscribed At'], ['email', 'created_at'])}
                  className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Export Emails
                </button>
              </div>
              {subscribers.length === 0 ? (
                <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 p-12 text-center shadow-sm">
                  <Mail className="h-10 w-10 text-stone-200 mx-auto mb-2" />
                  <p className="text-stone-400 dark:text-dark-300">No subscribers yet.</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-dark-600 rounded-2xl border border-stone-100 dark:border-dark-500 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 dark:border-dark-500">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">#</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-stone-400 dark:text-dark-300 uppercase tracking-wide">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((s, i) => (
                        <tr key={s.id} className="border-b border-stone-50 last:border-0 hover:bg-stone-50 dark:bg-dark-600 transition-colors">
                          <td className="px-4 py-3 text-stone-400 dark:text-dark-300 text-xs">{i + 1}</td>
                          <td className="px-4 py-3 font-medium text-stone-700 dark:text-dark-100">{s.email}</td>
                          <td className="px-4 py-3 text-stone-400 dark:text-dark-300 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

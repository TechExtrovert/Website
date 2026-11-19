import { useState } from 'react';
import { Building2, Store, Coffee, Hotel, Dumbbell, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';

const PARTNER_TYPES = [
  { icon: Dumbbell, title: 'Gyms', desc: 'Offer functional nutrition to your members' },
  { icon: Store, title: 'Supermarkets', desc: 'Stock premium organic blends' },
  { icon: Coffee, title: 'Cafés', desc: 'Serve health-conscious customers' },
  { icon: Hotel, title: 'Hotels', desc: 'Elevate your wellness offerings' },
];

const BENEFITS = [
  'Competitive wholesale pricing',
  'Marketing support & materials',
  'Dedicated account manager',
  'Flexible ordering & delivery',
  'Product training & education',
  'Exclusive partner promotions',
];

export function WholesalePage() {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    business_type: '',
    location: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.from('wholesale_inquiries').insert(form);
    if (error) {
      setStatus('error');
      return;
    }
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-contact-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.contact_name || form.business_name,
          email: form.email,
          subject: `Wholesale Inquiry — ${form.business_name}`,
          message: form.message || `Wholesale inquiry from ${form.business_name} (${form.business_type}) in ${form.location}. Phone: ${form.phone}`,
        }),
      });
    } catch {
      // email notification is best-effort; the inquiry is already saved
    }
    setStatus('success');
    setForm({
      business_name: '',
      contact_name: '',
      email: '',
      phone: '',
      business_type: '',
      location: '',
      message: '',
    });
  };

  return (
    <div className="pt-20 min-h-screen">
      <section className="bg-gradient-to-br from-dark-600 to-dark-700 py-16">
        <div className="container-x text-center">
          <span className="badge bg-secondary-500 text-dark-600 mb-4">Partnerships</span>
          {/* text-dark-600 on secondary badge is intentional — dark text on amber badge */}
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">
            Become a Zarachills Partner
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Join the wellness movement. Partner with Zarachills and bring premium
            functional nutrition to your customers.
          </p>
        </div>
      </section>

      {/* Partner types */}
      <section className="section-pad bg-white">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-stone-800 dark:text-dark-100 mb-4">
              Who We Partner With
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {PARTNER_TYPES.map((type, i) => (
              <div
                key={type.title}
                className="card p-8 text-center group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <type.icon className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-stone-700 dark:text-dark-100 mb-2">
                  {type.title}
                </h3>
                <p className="text-stone-400 dark:text-dark-300 text-sm">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits + Form */}
      <section className="section-pad bg-gradient-to-b from-primary-50/30 to-white">
        <div className="container-x grid lg:grid-cols-2 gap-12 items-start">
          {/* Benefits */}
          <div>
            <span className="badge bg-primary-50 text-primary-600 mb-4">Why Partner</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-stone-800 dark:text-dark-100 mb-8">
              Benefits of Partnership
            </h2>
            <ul className="space-y-4 mb-8">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-stone-700 dark:text-dark-100 text-lg">{benefit}</span>
                </li>
              ))}
            </ul>
            <div className="card p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
              <Building2 className="h-10 w-10 mb-4" />
              <h3 className="font-heading text-xl font-bold mb-2">Distributor Program</h3>
              <p className="text-white/80 mb-4">
                Interested in becoming a regional distributor? We offer exclusive
                territories and enhanced support for committed partners.
              </p>
              <p className="text-white/60 text-sm">
                Contact us for distributor pricing and territory availability.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="card p-8">
            <h3 className="font-heading text-2xl font-bold text-stone-800 dark:text-dark-100 mb-2">
              Partner Inquiry
            </h3>
            <p className="text-stone-400 dark:text-dark-300 mb-6">Fill out the form and we'll be in touch within 48 hours.</p>

            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="font-heading text-xl font-bold text-stone-800 dark:text-dark-100 mb-2">
                  Inquiry Received!
                </h3>
                <p className="text-stone-400 dark:text-dark-300 mb-6">
                  Thank you for your interest. Our team will contact you within 48 hours.
                </p>
                <button onClick={() => navigate('/')} className="btn-primary">
                  Back to Home <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">
                      Business Name *
                    </label>
                    <input
                      required
                      value={form.business_name}
                      onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                      className="input-field"
                      placeholder="Your business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">
                      Contact Name *
                    </label>
                    <input
                      required
                      value={form.contact_name}
                      onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                      className="input-field"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field"
                      placeholder="you@business.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">
                      Phone
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="input-field"
                      placeholder="080..."
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">
                      Business Type
                    </label>
                    <select
                      value={form.business_type}
                      onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Select type</option>
                      <option value="gym">Gym</option>
                      <option value="supermarket">Supermarket</option>
                      <option value="cafe">Café</option>
                      <option value="hotel">Hotel</option>
                      <option value="distributor">Distributor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">
                      Location
                    </label>
                    <input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="input-field"
                      placeholder="City, State"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Tell us about your business and what you're looking for..."
                  />
                </div>
                {status === 'error' && (
                  <p className="text-red-500 text-sm">
                    Something went wrong. Please try again or call us directly.
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full"
                >
                  {status === 'loading' ? 'Sending...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

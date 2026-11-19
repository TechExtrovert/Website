import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, Clock, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';

const CONTACT_INFO = [
  { icon: Phone, label: 'Call Us', value: '07065927859', href: 'tel:07065927859' },
  { icon: Mail, label: 'Email Us', value: 'zarachillsorganicblends@gmail.com', href: 'mailto:zarachillsorganicblends@gmail.com' },
  { icon: MessageCircle, label: 'WhatsApp', value: '07065927859', href: 'https://wa.me/2347065927859' },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', handle: '@zarachillsorganicblends', url: 'https://instagram.com/zarachillsorganicblends' },
  { label: 'Facebook', handle: 'zarachillsorganicblends', url: 'https://www.facebook.com/share/1JLLiKgchL/' },
  { label: 'Twitter', handle: '@Zarachills001', url: 'https://twitter.com/Zarachills001' },
];

const COVERAGE_AREAS = [
  'Enugu', 'Anambra', 'Imo', 'Abia', 'Ebonyi', 'Rivers', 'Delta',
  'Akwa Ibom', 'Cross River', 'Edo', 'Lagos', 'FCT Abuja',
];

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.from('contact_messages').insert(form);
    if (error) {
      setStatus('error');
      return;
    }
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-contact-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
    } catch {
      // email notification is best-effort; the message is already saved
    }
    setStatus('success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="pt-20 min-h-screen">
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 py-16">
        <div className="container-x text-center">
          <span className="badge bg-white/20 text-white mb-4">Get in Touch</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">
            We'd Love to Hear From You
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Questions, feedback, or just want to say hello? Our team is here to help.
          </p>
        </div>
      </section>

      <section className="container-x py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-stone-800 dark:text-dark-100 mb-6">
              Contact Information
            </h2>
            <div className="space-y-4 mb-8">
              {CONTACT_INFO.map((info) => (
                <a
                  key={info.label}
                  href={info.href}
                  target={info.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="card p-5 flex items-center gap-4 group hover:border-primary-200 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <info.icon className="h-6 w-6 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-sm text-stone-400 dark:text-dark-300">{info.label}</p>
                    <p className="font-medium text-stone-700 dark:text-dark-100 break-all">{info.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social */}
            <div className="card p-6 mb-8">
              <h3 className="font-heading font-semibold text-stone-700 dark:text-dark-100 mb-4">Follow Us</h3>
              <div className="space-y-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-primary-50 transition-colors group"
                  >
                    <div>
                      <p className="font-medium text-stone-700 dark:text-dark-100">{social.label}</p>
                      <p className="text-sm text-stone-400 dark:text-dark-300">{social.handle}</p>
                    </div>
                    <Send className="h-4 w-4 text-stone-400 dark:text-dark-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {/* Hours */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-primary-500" />
                <h3 className="font-heading font-semibold text-stone-700 dark:text-dark-100">Business Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-dark-300">Monday - Friday</span>
                  <span className="text-stone-700 dark:text-dark-100 font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-dark-300">Saturday</span>
                  <span className="text-stone-700 dark:text-dark-100 font-medium">9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 dark:text-dark-300">Sunday</span>
                  <span className="text-stone-700 dark:text-dark-100 font-medium">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="card p-8">
            <h2 className="font-heading text-2xl font-bold text-stone-800 dark:text-dark-100 mb-2">
              Send Us a Message
            </h2>
            <p className="text-stone-400 dark:text-dark-300 mb-6">We'll get back to you within 24 hours.</p>

            {status === 'success' ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="font-heading text-xl font-bold text-stone-800 dark:text-dark-100 mb-2">
                  Message Sent!
                </h3>
                <p className="text-stone-400 dark:text-dark-300 mb-6">
                  Thank you for reaching out. We'll respond within 24 hours.
                </p>
                <button onClick={() => navigate('/')} className="btn-primary">
                  Back to Home
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input-field"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">Subject</label>
                  <input
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="input-field"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-dark-100 mb-1">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="input-field resize-none"
                    placeholder="Your message..."
                  />
                </div>
                {status === 'error' && (
                  <p className="text-red-500 text-sm">Something went wrong. Please try again.</p>
                )}
                <button type="submit" disabled={status === 'loading'} className="btn-primary w-full">
                  {status === 'loading' ? 'Sending...' : 'Send Message'}
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Delivery coverage */}
      <section className="section-pad bg-gradient-to-b from-primary-50/30 to-white">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge bg-primary-50 text-primary-600 mb-4">Delivery Coverage</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-stone-800 dark:text-dark-100 mb-4">
              We Deliver Across Nigeria
            </h2>
            <p className="text-stone-400 dark:text-dark-300 text-lg">
              Starting from the Southeast and expanding nationwide. Check if we
              deliver to your area.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="card p-8 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="h-5 w-5 text-primary-500" />
                <h3 className="font-heading font-semibold text-stone-700 dark:text-dark-100">Coverage Areas</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {COVERAGE_AREAS.map((area) => (
                  <div key={area} className="flex items-center gap-2 p-3 rounded-xl bg-primary-50/50">
                    <Check className="h-4 w-4 text-primary-500 shrink-0" />
                    <span className="text-stone-700 dark:text-dark-100 text-sm font-medium">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Simplified map */}
            <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary-500 mx-auto mb-4" />
                <h3 className="font-heading text-xl font-bold text-stone-800 dark:text-dark-100 mb-2">
                  Don't See Your Area?
                </h3>
                <p className="text-stone-400 dark:text-dark-300 mb-6">
                  We're expanding fast. Contact us and we'll let you know when we
                  deliver to your location.
                </p>
                <a href="https://wa.me/2347065927859" target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';

const FOOTER_LINKS = {
  Shop: [
    { label: 'All Products', path: '/shop' },
    { label: 'Fat Burn', path: '/shop?goal=fat-loss' },
    { label: 'Weight Gain', path: '/shop?goal=weight-gain' },
    { label: 'Energy', path: '/shop?goal=energy' },
    { label: 'Recovery', path: '/shop?goal=recovery' },
    { label: 'Hydration', path: '/shop?goal=hydration' },
    { label: 'Wellness', path: '/shop?goal=wellness' },
  ],
  Company: [
    { label: 'About Us', path: '/about' },
    { label: 'Find Your Blend', path: '/find-blend' },
    { label: 'Fitness Bundles', path: '/bundles' },
    { label: 'Blog', path: '/blog' },
    { label: 'Wholesale', path: '/wholesale' },
    { label: 'Contact', path: '/contact' },
  ],
  Support: [
    { label: 'My Account', path: '/account' },
    { label: 'Wishlist', path: '/wishlist' },
    { label: 'Cart', path: '/cart' },
    { label: 'Track Order', path: '/account' },
  ],
};

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email });
    if (error) {
      if (error.code === '23505') {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } else {
      fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-newsletter-subscribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      }).catch(() => {});
      setStatus('success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-dark-600 text-white pt-20 pb-8 dark:bg-dark-800">
      <div className="container-x">
        {/* Newsletter banner */}
        <div className="glass-dark rounded-3xl p-6 sm:p-8 md:p-12 mb-12 md:mb-16 grid md:grid-cols-2 gap-6 md:gap-8 items-center">
          <div>
            <h3 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              Join the Zarachills Tribe
            </h3>
            <p className="text-white/70 text-sm sm:text-base">
              Get exclusive offers, wellness tips, and early access to new blends.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-secondary-500"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-secondary whitespace-nowrap"
            >
              {status === 'loading' ? '...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
              {status === 'idle' && <Send className="h-4 w-4" />}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-secondary-400 text-sm md:col-span-2 -mt-4">
              You're in! Welcome to the tribe.
            </p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-sm md:col-span-2 -mt-4">
              Something went wrong. Please try again.
            </p>
          )}
        </div>

        {/* Main footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 mb-10 md:mb-12">
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 mb-4">
              <img src="/assets/images/Z.png" alt="Zarachills" className="h-12 w-12 object-contain" />
              <span className="font-heading font-bold text-lg text-primary-400">Zarachills</span>
            </button>
            <p className="text-white/60 text-sm mb-4 max-w-xs">
              Functional nutrition through natural fruit blends. Fuel your body.
              Transform your lifestyle.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Instagram, label: 'Instagram', url: 'https://instagram.com/zarachillsorganicblends' },
                { icon: Facebook, label: 'Facebook', url: 'https://www.facebook.com/share/1JLLiKgchL/' },
                { icon: Twitter, label: 'Twitter', url: 'https://twitter.com/Zarachills001' },
              ].map(({ icon: Icon, label, url }) => (
                <a
                  key={label}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-secondary-500 hover:text-dark-600 transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-secondary-400 mb-4">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => navigate(link.path)}
                      className="text-white/60 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-secondary-400 mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <Phone className="h-4 w-4 mt-0.5 text-primary-400 shrink-0" />
                <a href="tel:07065927859" className="hover:text-white">07065927859</a>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <Mail className="h-4 w-4 mt-0.5 text-primary-400 shrink-0" />
                <a href="mailto:zarachillsorganicblends@gmail.com" className="hover:text-white break-all">
                  zarachillsorganicblends@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/60 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 text-primary-400 shrink-0" />
                <span>Southeast Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          <p className="text-white/40 text-xs sm:text-sm text-center md:text-left">
            © {new Date().getFullYear()} Zarachills Organic Blends. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-white/40">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Shipping Info</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

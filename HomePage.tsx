import { useEffect, useState } from 'react';
import {
  Flame, TrendingUp, Zap, HeartPulse, Droplets, Sparkles,
  ArrowRight, ShieldCheck, Leaf, Award, Truck, Quote,
  ChevronRight, Star,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { navigate } from '../lib/router';
import { useCart } from '../lib/cart';
import type { Product, Bundle } from '../lib/types';
import { GOALS, formatNaira } from '../lib/types';
import { ProductCard } from '../components/ProductCard';
import { AnimatedNumber } from '../components/useInView';

const GOAL_ICONS: Record<string, typeof Flame> = {
  'fat-loss': Flame,
  'weight-gain': TrendingUp,
  'energy': Zap,
  'recovery': HeartPulse,
  'hydration': Droplets,
  'wellness': Sparkles,
};

const TESTIMONIALS = [
  {
    name: 'Chidinma O.',
    role: 'Marathon Runner, Enugu',
    text: 'VoltActive has completely changed my training. I no longer hit that mid-run wall. The energy is clean and sustained — no jitters, no crash.',
    rating: 5,
    image: 'https://images.pexels.com/photos/1820575/pexels-photo-1820575.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Emeka N.',
    role: 'Bodybuilder, Onitsha',
    text: 'Mass Up helped me gain 5kg of lean muscle in 3 months. The taste is incredible and I love that it\'s all natural. No artificial junk.',
    rating: 5,
    image: 'https://images.pexels.com/photos/10156412/pexels-photo-10156412.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
  {
    name: 'Amara I.',
    role: 'Yoga Instructor, Owerri',
    text: 'VivaSkin has given me a glow I didn\'t think was possible from a drink. My skin looks healthier and I feel more balanced overall.',
    rating: 5,
    image: 'https://images.pexels.com/photos/14267849/pexels-photo-14267849.jpeg?auto=compress&cs=tinysrgb&w=200',
  },
];

const STATS = [
  { value: 15000, suffix: '+', label: 'Happy Customers' },
  { value: 6, suffix: '', label: 'Signature Blends' },
  { value: 100, suffix: '%', label: 'Organic Ingredients' },
  { value: 24, suffix: 'h', label: 'Fresh Delivery' },
];

const WHY_CHOOSE = [
  { icon: Leaf, title: '100% Organic', desc: 'No artificial flavors, preservatives, or added sugars. Just pure fruit nutrition.' },
  { icon: ShieldCheck, title: 'Lab-Tested', desc: 'Every batch is tested for quality, purity, and nutritional content.' },
  { icon: Award, title: 'Award-Winning', desc: 'Recognized for excellence in functional nutrition across Nigeria.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Fresh blends delivered to your door across Southeast Nigeria.' },
];

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { addItem } = useCart();

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterStatus('loading');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: newsletterEmail });
    if (error) {
      if (error.code === '23505') {
        setNewsletterStatus('success');
        setNewsletterEmail('');
        return;
      }
      setNewsletterStatus('error');
      return;
    }
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-newsletter-subscribe`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: newsletterEmail }),
    }).catch(() => {});
    setNewsletterStatus('success');
    setNewsletterEmail('');
  };

  useEffect(() => {
    (async () => {
      const [{ data: prods }, { data: buns }] = await Promise.all([
        supabase.from('products').select('*').order('sort_order'),
        supabase.from('bundles').select('*'),
      ]);
      setProducts(prods || []);
      setBundles(buns || []);
      setLoading(false);
    })();
  }, []);

  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src="/assets/images/files_10766544-2026-06-26T15-58-16-481Z-file_0000000023b071fb8dd2e0de8a3471a1.webp"
            alt="Athlete lifestyle"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-600/90 via-dark-600/70 to-dark-600/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-600/80 via-transparent to-transparent" />
        </div>

        <div className="container-x relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-2 mb-6 animate-fade-in-down">
              <Sparkles className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-white/90 font-medium">
                Functional Nutrition. Naturally Crafted.
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 animate-fade-in-up text-balance">
              Fuel Your Body.
              <br />
              <span className="bg-gradient-to-r from-secondary-400 to-accent-500 bg-clip-text text-transparent">
                Transform Your Lifestyle.
              </span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl animate-fade-in-up animate-delay-200">
              Premium organic fruit blends engineered for fitness, recovery, and
              wellness. Not just juice — functional nutrition in every bottle.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up animate-delay-300">
              <button onClick={() => navigate('/shop')} className="btn-primary text-base">
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/find-blend')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 glass text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
              >
                Find Your Blend
              </button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-slow">
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5">
            <div className="w-1 h-2 rounded-full bg-white/60" />
          </div>
        </div>
      </section>

      {/* Goals strip */}
      <section className="bg-dark-600 py-6">
        <div className="container-x">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            {GOALS.map((goal) => {
              const Icon = GOAL_ICONS[goal.id] || Sparkles;
              return (
                <button
                  key={goal.id}
                  onClick={() => navigate(`/shop?goal=${goal.id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all whitespace-nowrap group"
                >
                  <Icon className="h-4 w-4 text-secondary-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-white/80 font-medium">{goal.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="section-pad bg-white dark:bg-dark-700">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge bg-primary-50 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 mb-4">Why Zarachills</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-dark-600 dark:text-dark-100 mb-4 text-balance">
              Not Just Juice.
              <span className="heading-gradient"> Functional Nutrition.</span>
            </h2>
            <p className="text-dark-200 dark:text-dark-300 text-lg">
              Every blend is engineered with purpose — targeting specific fitness
              goals through nature's most potent ingredients.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE.map((item, i) => (
              <div
                key={item.title}
                className="card p-8 text-center group hover:border-primary-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-dark-600 mb-2">
                  {item.title}
                </h3>
                <p className="text-dark-200 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic video showcase */}
      <section className="relative bg-dark-600 overflow-hidden">
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="/assets/images/files_10766544-2026-06-26T15-58-16-481Z-file_0000000023b071fb8dd2e0de8a3471a1.webp"
          >
            <source src="/gemini_generated_video_eda68913_gwr_video_mvp.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-r from-dark-600/85 via-dark-600/50 to-dark-600/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-600/70 via-transparent to-dark-600/70" />
        </div>

        <div className="container-x relative z-10 py-24 md:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-2 mb-6 animate-fade-in-down">
              <Sparkles className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-white/90 font-medium tracking-wide">
                The Zarachills Experience
              </span>
            </div>
            <h2 className="font-heading text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance animate-fade-in-up">
              Pure Nutrition,
              <span className="bg-gradient-to-r from-secondary-400 to-accent-500 bg-clip-text text-transparent">
                {' '}Beautifully Crafted
              </span>
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto animate-fade-in-up animate-delay-200">
              From hand-picked organic fruits to the final blend — witness the
              craft behind every bottle of functional nutrition.
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up animate-delay-300">
              <button onClick={() => navigate('/shop')} className="btn-primary text-base">
                Explore Blends
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/about')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 glass text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300"
              >
                Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="section-pad bg-gradient-to-b from-white to-primary-50/30 dark:from-dark-700 dark:to-dark-600">
        <div className="container-x">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="badge bg-secondary-100 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-400 mb-4">Featured</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-dark-600 dark:text-dark-100 text-balance">
                Signature Blends
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="hidden md:flex items-center gap-2 text-primary-600 font-semibold hover:gap-3 transition-all"
            >
              View All
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-3xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <button
            onClick={() => navigate('/shop')}
            className="md:hidden btn-outline w-full mt-8"
          >
            View All Products
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-dark-600 py-20">
        <div className="container-x">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-heading text-4xl md:text-6xl font-bold text-secondary-400 mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/60 text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad bg-white dark:bg-dark-700">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge bg-secondary-100 dark:bg-secondary-500/20 text-secondary-700 dark:text-secondary-400 mb-4">Testimonials</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-dark-600 dark:text-dark-100 text-balance">
              Loved by Thousands
            </h2>
            <p className="text-dark-200 dark:text-dark-300 text-lg mt-4">
              Real stories from real customers who transformed their lives with Zarachills.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="card p-8 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <Quote className="h-10 w-10 text-primary-200 mb-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-secondary-500 text-secondary-500" />
                  ))}
                </div>
                <p className="text-dark-600 dark:text-dark-200 mb-6 leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-heading font-semibold text-dark-600">{t.name}</p>
                    <p className="text-sm text-dark-200">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundles */}
      {!loading && bundles.length > 0 && (
        <section className="section-pad bg-gradient-to-b from-primary-50/30 to-white dark:from-dark-600 dark:to-dark-700">
          <div className="container-x">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="badge bg-accent-100 dark:bg-accent-500/20 text-accent-700 dark:text-accent-400 mb-4">Save More</span>
              <h2 className="font-heading text-3xl md:text-5xl font-bold text-dark-600 dark:text-dark-100 text-balance">
                Fitness Bundles
              </h2>
              <p className="text-dark-200 dark:text-dark-300 text-lg mt-4">
                Curated packs designed for your goals. Save up to 25%.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {bundles.slice(0, 2).map((bundle) => {
                const savings = bundle.original_price
                  ? bundle.original_price - bundle.price
                  : 0;
                return (
                  <div key={bundle.id} className="card overflow-hidden group">
                    <div className="grid sm:grid-cols-2">
                      <div className="relative aspect-square sm:aspect-auto overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
                        <img
                          src={bundle.image_url || ''}
                          alt={bundle.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {bundle.badge && (
                          <span className="absolute top-4 left-4 badge bg-secondary-500 text-dark-600">
                            {bundle.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-6 flex flex-col">
                        <h3 className="font-heading text-xl font-bold text-dark-600 mb-2">
                          {bundle.name}
                        </h3>
                        <p className="text-dark-200 text-sm mb-4">{bundle.description}</p>
                        <div className="mt-auto">
                          <div className="flex items-baseline gap-3 mb-4">
                            <span className="font-heading text-2xl font-bold text-primary-600">
                              {formatNaira(bundle.price)}
                            </span>
                            {bundle.original_price && (
                              <>
                                <span className="text-dark-200 line-through">
                                  {formatNaira(bundle.original_price)}
                                </span>
                                <span className="badge bg-accent-100 text-accent-700">
                                  Save {formatNaira(savings)}
                                </span>
                              </>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              addItem({
                                id: bundle.id,
                                name: bundle.name,
                                slug: bundle.slug,
                                price: bundle.price,
                                image_url: bundle.image_url,
                                type: 'bundle',
                              });
                              navigate('/cart');
                            }}
                            className="btn-primary w-full"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <button onClick={() => navigate('/bundles')} className="btn-outline">
                View All Bundles
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="container-x text-center">
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-white mb-4 text-balance">
            Ready to Transform Your Lifestyle?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of Nigerians who've made Zarachills part of their daily routine.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/shop')} className="btn-secondary text-base">
              Shop Now
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/find-blend')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 glass text-white font-semibold rounded-full hover:bg-white/20 transition-all"
            >
              Find Your Blend
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section-pad bg-dark-600">
        <div className="container-x max-w-2xl text-center">
          <Sparkles className="h-10 w-10 text-secondary-400 mx-auto mb-4" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
            Join the Zarachills Wellness Circle
          </h2>
          <p className="text-white/70 mb-8">
            Get nutrition tips, exclusive offers, and early access to new blends.
          </p>
          <form
            onSubmit={handleNewsletter}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              className="input-field flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
            />
            <button type="submit" disabled={newsletterStatus === 'loading'} className="btn-primary">
              {newsletterStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
              {newsletterStatus === 'idle' && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
          {newsletterStatus === 'success' && (
            <p className="text-secondary-400 text-sm mt-3">You're in! Check your inbox for a welcome email.</p>
          )}
          {newsletterStatus === 'error' && (
            <p className="text-red-400 text-sm mt-3">Something went wrong. Please try again.</p>
          )}
        </div>
      </section>
    </div>
  );
}

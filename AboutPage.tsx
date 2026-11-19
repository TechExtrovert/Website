import { Leaf, Heart, Target, Award, Users, Truck, Sparkles, ArrowRight } from 'lucide-react';
import { navigate } from '../lib/router';
import { AnimatedNumber } from '../components/useInView';

const VALUES = [
  { icon: Leaf, title: 'Natural First', desc: 'We never compromise on quality. Every ingredient is 100% organic, sourced from trusted Nigerian farms.' },
  { icon: Heart, title: 'Customer Obsessed', desc: 'Your health journey is our mission. We craft blends that genuinely support your goals.' },
  { icon: Target, title: 'Purpose-Driven', desc: 'Every blend has a function. We don\'t make juice — we make functional nutrition.' },
  { icon: Award, title: 'Excellence Always', desc: 'From sourcing to bottling to delivery, we hold ourselves to the highest standards.' },
];

const TIMELINE = [
  { year: '2023', title: 'The Idea', desc: 'Founded with a vision to bring functional nutrition to Nigeria through natural fruit blends.' },
  { year: '2024', title: 'First Blends', desc: 'Launched our first 6 signature blends, each targeting a specific fitness goal.' },
  { year: '2025', title: 'Growing Fast', desc: 'Expanded across Southeast Nigeria with 15,000+ happy customers and counting.' },
  { year: '2026', title: 'The Future', desc: 'Building toward nationwide delivery, subscriptions, and a wellness movement.' },
];

export function AboutPage() {
  return (
    <div className="pt-20 min-h-screen">
      {/* Hero */}
      <section className="relative py-24 bg-dark-600 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src="/assets/images/file_000000000ea071fbadacd77250c60f41.png"
            alt="Zarachills lifestyle"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container-x relative z-10 text-center">
          <span className="badge bg-white/20 text-white mb-4">Our Story</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-6 text-balance">
            We Don't Sell Juice.
            <br />
            <span className="bg-gradient-to-r from-secondary-400 to-accent-500 bg-clip-text text-transparent">
              We Sell Transformation.
            </span>
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Zarachills Organic Blends was born from a simple belief: that nature
            already has everything we need to fuel our bodies, transform our health,
            and elevate our lives.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="section-pad bg-white dark:bg-dark-700">
        <div className="container-x grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300 mb-4">Our Mission</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-dark-600 dark:text-dark-100 mb-6">
              Functional Nutrition for Every Body
            </h2>
            <p className="text-dark-600 dark:text-dark-100 leading-relaxed mb-4">
              We exist to bridge the gap between what your body needs and what
              nature provides. Every blend we create is engineered with purpose —
              targeting specific fitness goals through carefully selected fruit
              combinations and natural ingredients.
            </p>
            <p className="text-dark-600 dark:text-dark-100 leading-relaxed mb-6">
              From fat loss to muscle gain, from energy to recovery, from hydration
              to wellness — we believe that the right blend, consumed consistently,
              can transform not just your body, but your entire lifestyle.
            </p>
            <button onClick={() => navigate('/shop')} className="btn-primary">
              Explore Our Blends <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden">
              <img
                src="https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Organic ingredients"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <Leaf className="h-8 w-8 text-primary-500" />
                <div>
                  <p className="font-heading font-bold text-2xl text-dark-600 dark:text-dark-100">100%</p>
                  <p className="text-sm text-dark-200 dark:text-dark-300">Organic & Natural</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-pad bg-gradient-to-b from-primary-50/30 to-white dark:from-dark-700 dark:to-dark-700">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-300 mb-4">Our Values</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-dark-600 dark:text-dark-100 text-balance">
              What We Stand For
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((value, i) => (
              <div
                key={value.title}
                className="card p-8 text-center group animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                  <value.icon className="h-8 w-8 text-primary-500" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-dark-600 dark:text-dark-100 mb-2">
                  {value.title}
                </h3>
                <p className="text-dark-200 dark:text-dark-300 text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-dark-600 py-20">
        <div className="container-x">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { value: 15000, suffix: '+', label: 'Customers', icon: Users },
              { value: 6, suffix: '', label: 'Signature Blends', icon: Sparkles },
              { value: 100, suffix: '%', label: 'Organic', icon: Leaf },
              { value: 5, suffix: '+', label: 'States Covered', icon: Truck },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <stat.icon className="h-8 w-8 text-secondary-400 mx-auto mb-3" />
                <div className="font-heading text-3xl md:text-5xl font-bold text-white mb-1">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-white/60 text-sm uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-pad bg-white dark:bg-dark-700">
        <div className="container-x">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="badge bg-primary-50 text-primary-600 dark:bg-primary-500/20 dark:text-primary-300 mb-4">Our Journey</span>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-dark-600 dark:text-dark-100 text-balance">
              From Idea to Movement
            </h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-100 md:-translate-x-1/2" />
            {TIMELINE.map((item, i) => (
              <div
                key={i}
                className={`relative flex gap-6 mb-12 ${
                  i % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="hidden md:block flex-1" />
                <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-primary-100 md:-translate-x-1/2 mt-2" />
                <div className={`flex-1 pl-12 md:pl-0 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'}`}>
                  <div className="card p-6">
                    <span className="badge bg-secondary-100 text-secondary-700 dark:bg-secondary-500/20 dark:text-secondary-300 mb-2">{item.year}</span>
                    <h3 className="font-heading font-bold text-lg text-dark-600 dark:text-dark-100 mb-2">{item.title}</h3>
                    <p className="text-dark-200 dark:text-dark-300 text-sm">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
              Shop Now <ArrowRight className="h-5 w-5" />
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
    </div>
  );
}

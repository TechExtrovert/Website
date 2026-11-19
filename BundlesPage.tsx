import { useEffect, useState } from 'react';
import { Check, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/cart';
import { navigate } from '../lib/router';
import type { Bundle } from '../lib/types';
import { formatNaira } from '../lib/types';

export function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('bundles').select('*');
      setBundles(data || []);
      setLoading(false);
    })();
  }, []);

  const handleAddBundle = (bundle: Bundle) => {
    addItem({
      id: bundle.id,
      name: bundle.name,
      slug: bundle.slug,
      price: bundle.price,
      image_url: bundle.image_url,
      type: 'bundle',
    });
    navigate('/cart');
  };

  return (
    <div className="pt-20 min-h-screen">
      <section className="bg-gradient-to-br from-dark-600 to-dark-700 py-16">
        <div className="container-x text-center">
          <span className="badge bg-secondary-500 text-dark-600 dark:text-dark-100 mb-4">Save Up to 25%</span>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">
            Fitness Bundles
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Curated packs of our signature blends, designed to work together for
            your specific fitness goals. Better results, better value.
          </p>
        </div>
      </section>

      <section className="container-x py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-3xl bg-gray-100 dark:bg-dark-600 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {bundles.map((bundle, i) => {
              const savings = bundle.original_price
                ? bundle.original_price - bundle.price
                : 0;
              return (
                <div
                  key={bundle.id}
                  className="card overflow-hidden group animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <div className="grid sm:grid-cols-2">
                    {/* Image */}
                    <div className="relative aspect-square sm:aspect-auto overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
                      <img
                        src={bundle.image_url || ''}
                        alt={bundle.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {bundle.badge && (
                        <span className="absolute top-4 left-4 badge bg-secondary-500 text-dark-600 dark:text-dark-100">
                          {bundle.badge}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        <Package className="h-5 w-5 text-primary-500" />
                        <span className="text-xs uppercase tracking-wider text-primary-600 font-semibold">
                          Bundle Pack
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl font-bold text-dark-600 dark:text-dark-100 mb-2">
                        {bundle.name}
                      </h3>
                      <p className="text-dark-200 dark:text-dark-300 text-sm mb-4">{bundle.description}</p>

                      <div className="mb-4">
                        <p className="text-sm font-semibold text-dark-600 dark:text-dark-100 mb-2">Includes:</p>
                        <div className="flex flex-wrap gap-2">
                          {bundle.products?.map((p) => (
                            <span key={p} className="badge bg-primary-50 text-primary-700 text-xs">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-baseline gap-3 mb-4">
                          <span className="font-heading text-2xl font-bold text-primary-600">
                            {formatNaira(bundle.price)}
                          </span>
                          {bundle.original_price && (
                            <>
                              <span className="text-dark-200 dark:text-dark-300 line-through">
                                {formatNaira(bundle.original_price)}
                              </span>
                              <span className="badge bg-accent-100 text-accent-700">
                                Save {formatNaira(savings)}
                              </span>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddBundle(bundle)}
                          className="btn-primary w-full"
                        >
                          <ShoppingBag className="h-4 w-4" /> Add Bundle to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16 card p-12 bg-gradient-to-br from-primary-50 to-secondary-50">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark-600 dark:text-dark-100 mb-4">
            Not Sure Which Bundle is Right?
          </h2>
          <p className="text-dark-200 dark:text-dark-300 mb-6 max-w-xl mx-auto">
            Take our 60-second quiz and we'll recommend the perfect bundle for your goals.
          </p>
          <button onClick={() => navigate('/find-blend')} className="btn-primary">
            Find Your Blend <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  Minus, Plus, ShoppingBag, Heart, Share2, ChevronRight,
  Check, Leaf, ShieldCheck, Truck, Star,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/cart';
import { navigate } from '../lib/router';
import type { Product } from '../lib/types';
import { formatNaira } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

export function ProductPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'nutrition' | 'benefits'>('description');
  const [added, setAdded] = useState(false);
  const { addItem, toggleWishlist, isWishlisted, addRecentlyViewed } = useCart();

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (data) {
        setProduct(data as Product);
        addRecentlyViewed(data.id);
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .neq('id', data.id)
          .limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen container-x py-20">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square rounded-3xl bg-gray-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-6 bg-gray-100 rounded animate-pulse w-1/2" />
            <div className="h-32 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-dark-600 dark:text-white mb-4">Product not found</p>
          <button onClick={() => navigate('/shop')} className="btn-primary">Back to Shop</button>
        </div>
      </div>
    );
  }

  const wished = isWishlisted(product.id);

  const handleAdd = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image_url: product.image_url,
        type: 'product',
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="pt-20 min-h-screen">
      {/* Breadcrumb */}
      <div className="container-x py-4">
        <div className="flex items-center gap-2 text-sm text-dark-200 dark:text-white">
          <button onClick={() => navigate('/')} className="hover:text-primary-600">Home</button>
          <ChevronRight className="h-3 w-3" />
          <button onClick={() => navigate('/shop')} className="hover:text-primary-600">Shop</button>
          <ChevronRight className="h-3 w-3" />
          <span className="text-dark-600 dark:text-white font-medium">{product.name}</span>
        </div>
      </div>

      {/* Product detail */}
      <section className="container-x pb-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="relative">
            <div className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
              <img
                src={product.image_url || ''}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.badge && (
              <span className="absolute top-4 left-4 badge bg-secondary-500 text-dark-600 dark:text-black">
                {product.badge}
              </span>
            )}
            {product.original_price && (
              <span className="absolute top-4 right-4 badge bg-accent-500 text-white">
                Save {formatNaira(product.original_price - product.price)}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-secondary-500 text-secondary-500" />
              ))}
              <span className="text-sm text-dark-200 dark:text-white ml-2">(48 reviews)</span>
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark-600 dark:text-white mb-2">
              {product.name}
            </h1>
            <p className="text-lg text-dark-200 dark:text-white mb-4">{product.tagline}</p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-heading text-3xl font-bold text-primary-600">
                {formatNaira(product.price)}
              </span>
              {product.original_price && (
                <span className="text-lg text-dark-200 dark:text-white line-through">
                  {formatNaira(product.original_price)}
                </span>
              )}
            </div>

            <p className="text-dark-600 dark:text-white leading-relaxed mb-6">{product.description}</p>

            {/* Quantity + Add */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border-2 border-gray-200 rounded-full">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:text-primary-600 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:text-primary-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAdd}
                className={`flex-1 btn-primary ${added ? '!bg-primary-600' : ''}`}
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" /> Add to Cart
                  </>
                )}
              </button>
            </div>

            <div className="flex gap-3 mb-8">
              <button
                onClick={() => toggleWishlist(product.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 hover:border-accent-300 transition-colors text-sm font-medium"
              >
                <Heart className={`h-4 w-4 ${wished ? 'fill-accent-500 text-accent-500' : ''}`} />
                {wished ? 'Wishlisted' : 'Wishlist'}
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-200 hover:border-primary-300 transition-colors text-sm font-medium">
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-gray-100">
              {[
                { icon: Leaf, label: '100% Organic' },
                { icon: ShieldCheck, label: 'Lab-Tested' },
                { icon: Truck, label: 'Fast Delivery' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2">
                  <Icon className="h-6 w-6 text-primary-500" />
                  <span className="text-xs text-dark-200 dark:text-white font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="container-x pb-16">
        <div className="flex gap-2 mb-8 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {(['description', 'ingredients', 'nutrition', 'benefits'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-dark-200 dark:text-white hover:text-primary-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-w-3xl">
          {activeTab === 'description' && (
            <p className="text-dark-600 dark:text-white leading-relaxed text-lg">{product.description}</p>
          )}
          {activeTab === 'ingredients' && (
            <div className="flex flex-wrap gap-3">
              {product.ingredients?.map((ing) => (
                <span key={ing} className="badge bg-primary-50 text-primary-700 px-4 py-2 text-sm">
                  <Leaf className="h-3 w-3 mr-1.5 inline" />
                  {ing}
                </span>
              ))}
            </div>
          )}
          {activeTab === 'nutrition' && product.nutrition && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(product.nutrition).map(([key, value]) => (
                <div key={key} className="card p-4 text-center">
                  <p className="text-2xl font-heading font-bold text-primary-600">{value}</p>
                  <p className="text-sm text-dark-200 dark:text-white capitalize">{key.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'benefits' && (
            <ul className="space-y-3">
              {product.benefits?.map((benefit) => (
                <li key={benefit} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-dark-600 dark:text-white">{benefit}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="container-x pb-20">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-dark-600 dark:text-white mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

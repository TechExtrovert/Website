import { useEffect, useState } from 'react';
import { Heart, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../lib/cart';
import { navigate } from '../lib/router';
import type { Product } from '../lib/types';
import { ProductCard } from '../components/ProductCard';

export function WishlistPage() {
  const { wishlist, toggleWishlist } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', wishlist);
      setProducts(data || []);
      setLoading(false);
    })();
  }, [wishlist]);

  if (wishlist.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-accent-50 flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-accent-300" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-dark-600 mb-3">
            Your Wishlist is Empty
          </h1>
          <p className="text-dark-200 mb-6">
            Save your favorite blends here for later.
          </p>
          <button onClick={() => navigate('/shop')} className="btn-primary">
            Browse Blends <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen container-x py-12 bg-gradient-to-b from-primary-50/20 to-white dark:from-dark-600 dark:to-dark-700">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark-600">
          My Wishlist
        </h1>
        <span className="text-dark-200">{wishlist.length} items</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square rounded-3xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

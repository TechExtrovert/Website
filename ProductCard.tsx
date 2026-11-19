import { Heart, ShoppingBag, Plus, Star } from 'lucide-react';
import type { Product } from '../lib/types';
import { formatNaira } from '../lib/types';
import { useCart } from '../lib/cart';
import { navigate } from '../lib/router';
import { useState } from 'react';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, toggleWishlist, isWishlisted } = useCart();
  const [added, setAdded] = useState(false);
  const wished = isWishlisted(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image_url: product.image_url,
      type: 'product',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      className="card card-hover cursor-pointer group overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50">
        <img
          src={product.image_url || ''}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 badge bg-secondary-500 text-dark-600 dark:text-dark-100">
            {product.badge}
          </span>
        )}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all"
          aria-label="Add to wishlist"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              wished ? 'fill-accent-500 text-accent-500' : 'text-dark-400'
            }`}
          />
        </button>
        {product.original_price && (
          <span className="absolute bottom-3 left-3 badge bg-accent-500 text-white">
            -{Math.round((1 - product.price / product.original_price) * 100)}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-secondary-500 text-secondary-500" />
          ))}
          <span className="text-xs text-dark-200 dark:text-dark-300 ml-1">(48)</span>
        </div>
        <h3 className="font-heading font-semibold text-dark-600 dark:text-white group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-dark-200 dark:text-white mb-3">{product.tagline}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-lg text-primary-600">
              {formatNaira(product.price)}
            </span>
            {product.original_price && (
              <span className="text-sm text-dark-200 dark:text-white line-through">
                {formatNaira(product.original_price)}
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`p-2.5 rounded-full transition-all duration-300 ${
              added
                ? 'bg-primary-500 text-white scale-110'
                : 'bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white'
            }`}
            aria-label="Add to cart"
          >
            {added ? <ShoppingBag className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

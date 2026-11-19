import { useState } from 'react';
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X, ShoppingCart,
} from 'lucide-react';
import { useCart } from '../lib/cart';
import { navigate } from '../lib/router';
import { formatNaira } from '../lib/types';

export function CartPage() {
  const {
    items, removeItem, updateQuantity, subtotal, discount, total,
    promo, promoError, applyPromo, removePromo, clearCart,
  } = useCart();
  const [promoInput, setPromoInput] = useState('');

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-12 w-12 text-primary-300" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-dark-600 dark:text-white mb-3">
            Your Cart is Empty
          </h1>
          <p className="text-dark-200 dark:text-white mb-6">
            Looks like you haven't added any blends yet. Let's fix that!
          </p>
          <button onClick={() => navigate('/shop')} className="btn-primary">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen container-x py-12 bg-gradient-to-b from-primary-50/20 to-white dark:from-dark-600 dark:to-dark-700">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-dark-600 dark:text-white mb-8">
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <div
                onClick={() => navigate(`/product/${item.slug}`)}
                className="w-24 h-24 rounded-2xl overflow-hidden bg-primary-50 cursor-pointer shrink-0"
              >
                <img src={item.image_url || ''} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-dark-600 dark:text-white">{item.name}</h3>
                    <p className="text-sm text-dark-200 dark:text-white capitalize">{item.type}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-full hover:bg-red-50 text-dark-200 dark:text-white hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center border border-gray-200 rounded-full">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 hover:text-primary-600"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 hover:text-primary-600"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-heading font-bold text-primary-600">
                    {formatNaira(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={clearCart}
              className="text-sm text-dark-200 dark:text-white hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Clear Cart
            </button>
            <button onClick={() => navigate('/shop')} className="text-sm text-primary-600 font-medium hover:underline">
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="font-heading text-xl font-bold text-dark-600 dark:text-white mb-6">Order Summary</h2>

            {/* Promo */}
            {promo ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50 mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary-600" />
                  <span className="text-sm font-medium text-primary-700">{promo.code}</span>
                </div>
                <button onClick={removePromo} className="p-1 hover:bg-primary-100 rounded-full">
                  <X className="h-4 w-4 text-primary-600" />
                </button>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Promo code"
                    className="input-field text-sm"
                  />
                  <button
                    onClick={() => applyPromo(promoInput)}
                    className="btn-outline !py-2 !px-4 text-sm whitespace-nowrap"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                <p className="text-xs text-dark-200 dark:text-white mt-2">Try: WELCOME10, ZARA20, FIRSTORDER</p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-dark-200 dark:text-white">
                <span>Subtotal</span>
                <span className="font-medium text-dark-600 dark:text-white">{formatNaira(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary-600">
                  <span>Discount</span>
                  <span className="font-medium">-{formatNaira(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-dark-200 dark:text-white">
                <span>Delivery</span>
                <span className="font-medium text-dark-600 dark:text-white">Calculated at checkout</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="font-heading font-bold text-lg text-dark-600 dark:text-white">Total</span>
                <span className="font-heading font-bold text-2xl text-primary-600">
                  {formatNaira(total)}
                </span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-dark-200 dark:text-white">
              <ShoppingBag className="h-3 w-3" /> Secure checkout · Card, Bank Transfer & Cash on Delivery
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

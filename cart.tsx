import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, PromoCode } from './types';
import { supabase } from './supabase';

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  count: number;
  promo: PromoCode | null;
  promoError: string | null;
  applyPromo: (code: string) => Promise<void>;
  removePromo: () => void;
  discount: number;
  total: number;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
};

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = 'zarachills_cart';
const WISHLIST_KEY = 'zarachills_wishlist';
const RECENT_KEY = 'zarachills_recent';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    } catch {
      return [];
    }
  });
  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  const addItem: CartContextType['addItem'] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  const applyPromo = async (code: string) => {
    setPromoError(null);
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .maybeSingle();

    if (error || !data) {
      setPromoError('Invalid promo code');
      setPromo(null);
      return;
    }
    if (data.min_order && subtotal < data.min_order) {
      setPromoError(`Minimum order of ₦${data.min_order.toLocaleString()} required`);
      setPromo(null);
      return;
    }
    setPromo(data as PromoCode);
  };

  const removePromo = () => {
    setPromo(null);
    setPromoError(null);
  };

  let discount = 0;
  if (promo) {
    if (promo.discount_percent) {
      discount = (subtotal * promo.discount_percent) / 100;
    } else if (promo.discount_amount) {
      discount = promo.discount_amount;
    }
  }
  const total = Math.max(0, subtotal - discount);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isWishlisted = (id: string) => wishlist.includes(id);

  const addRecentlyViewed = (id: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p !== id);
      return [id, ...filtered].slice(0, 8);
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        count,
        promo,
        promoError,
        applyPromo,
        removePromo,
        discount,
        total,
        wishlist,
        toggleWishlist,
        isWishlisted,
        recentlyViewed,
        addRecentlyViewed,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export type Product = {
  id: string;
  name: string;
  tagline: string | null;
  slug: string;
  category: string;
  goal: string;
  description: string | null;
  ingredients: string[] | null;
  benefits: string[] | null;
  nutrition: Record<string, string> | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  barcode: string | null;
  qr_code: string | null;
  badge: string | null;
  in_stock: boolean;
  featured: boolean;
  sort_order: number;
};

export type Bundle = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  products: string[] | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  badge: string | null;
  goal: string | null;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  author: string | null;
  category: string | null;
  read_time: string | null;
  published_at: string;
};

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_url: string | null;
  quantity: number;
  type: 'product' | 'bundle';
};

export type PromoCode = {
  id: string;
  code: string;
  discount_percent: number | null;
  discount_amount: number | null;
  min_order: number;
  active: boolean;
  expires_at: string | null;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  delivery_type: string;
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  promo_code: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  payment_proof_url: string | null;
  transaction_reference: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export const GOALS = [
  { id: 'fat-loss', label: 'Fat Burn', color: 'from-red-500 to-orange-500', icon: 'Flame' },
  { id: 'weight-gain', label: 'Weight Gain', color: 'from-amber-500 to-yellow-500', icon: 'TrendingUp' },
  { id: 'energy', label: 'Energy', color: 'from-yellow-400 to-orange-500', icon: 'Zap' },
  { id: 'recovery', label: 'Recovery', color: 'from-blue-500 to-cyan-500', icon: 'HeartPulse' },
  { id: 'hydration', label: 'Hydration', color: 'from-cyan-400 to-blue-500', icon: 'Droplets' },
  { id: 'wellness', label: 'Wellness', color: 'from-pink-500 to-rose-500', icon: 'Sparkles' },
] as const;

export const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
};

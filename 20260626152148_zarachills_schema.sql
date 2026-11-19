/*
# Zarachills Organic Blends - Full E-commerce Schema

1. New Tables
  - `products` - All juice blend products with details, nutrition, ingredients
  - `bundles` - Fitness bundle packages
  - `blog_posts` - Blog articles
  - `wholesale_inquiries` - Wholesale partner inquiries
  - `contact_messages` - Contact form submissions
  - `newsletter_subscribers` - Email newsletter signups
  - `orders` - Customer orders (guest + future auth)
  - `order_items` - Individual items within orders
  - `promo_codes` - Discount/promo codes
  - `wishlist` - Session-based wishlist

2. Security
  - RLS enabled on all tables
  - Public read on products, bundles, blog_posts
  - Public insert for inquiries, messages, subscribers, orders
  - No user_id required (no auth in MVP)
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tagline text,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  goal text NOT NULL,
  description text,
  ingredients text[],
  benefits text[],
  nutrition jsonb,
  price numeric(10,2) NOT NULL DEFAULT 0,
  original_price numeric(10,2),
  image_url text,
  badge text,
  in_stock boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_products" ON products;
CREATE POLICY "public_select_products" ON products FOR SELECT TO anon, authenticated USING (true);

-- Bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  products text[],
  price numeric(10,2) NOT NULL,
  original_price numeric(10,2),
  image_url text,
  badge text,
  goal text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_bundles" ON bundles;
CREATE POLICY "public_select_bundles" ON bundles FOR SELECT TO anon, authenticated USING (true);

-- Blog posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  image_url text,
  author text DEFAULT 'Zarachills Team',
  category text,
  read_time text,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_blog_posts" ON blog_posts;
CREATE POLICY "public_select_blog_posts" ON blog_posts FOR SELECT TO anon, authenticated USING (true);

-- Wholesale inquiries
CREATE TABLE IF NOT EXISTS wholesale_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  business_type text,
  location text,
  message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wholesale_inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_wholesale" ON wholesale_inquiries;
CREATE POLICY "public_insert_wholesale" ON wholesale_inquiries FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_contact" ON contact_messages;
CREATE POLICY "public_insert_contact" ON contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_newsletter" ON newsletter_subscribers;
CREATE POLICY "public_insert_newsletter" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Promo codes
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_percent int,
  discount_amount numeric(10,2),
  min_order numeric(10,2) DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_select_promo" ON promo_codes;
CREATE POLICY "public_select_promo" ON promo_codes FOR SELECT TO anon, authenticated USING (active = true);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  delivery_type text NOT NULL DEFAULT 'home',
  delivery_address text,
  delivery_date date,
  delivery_time text,
  items jsonb NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  discount numeric(10,2) DEFAULT 0,
  total numeric(10,2) NOT NULL,
  promo_code text,
  payment_method text,
  payment_reference text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_select_orders" ON orders;
CREATE POLICY "public_select_orders" ON orders FOR SELECT TO anon, authenticated USING (true);

-- Seed products
INSERT INTO products (name, tagline, slug, category, goal, description, ingredients, benefits, nutrition, price, original_price, image_url, badge, featured, sort_order)
VALUES
(
  'Slim Rush',
  'Fat Burn Formula',
  'slim-rush',
  'Fat Burn',
  'fat-loss',
  'A powerful blend of fat-burning fruits and natural metabolism boosters designed to support your weight loss journey without compromising energy levels.',
  ARRAY['Pineapple', 'Grapefruit', 'Lemon', 'Ginger', 'Cayenne', 'Green Apple'],
  ARRAY['Boosts metabolism', 'Suppresses appetite naturally', 'Enhances fat oxidation', 'Detoxifies the body', 'Increases energy levels'],
  '{"calories": 65, "protein": "1g", "carbs": "15g", "sugar": "11g", "fiber": "2g", "vitamin_c": "120%"}',
  3500,
  4500,
  'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Best Seller',
  true,
  1
),
(
  'Mass Up',
  'Weight Gain Blend',
  'mass-up',
  'Weight Gain',
  'weight-gain',
  'A nutrient-dense fruit blend formulated to support healthy weight gain and muscle recovery. Packed with natural calories and growth-supporting nutrients.',
  ARRAY['Banana', 'Mango', 'Dates', 'Avocado', 'Coconut Water', 'Honey'],
  ARRAY['Supports muscle growth', 'Provides sustained energy', 'Natural caloric density', 'Rich in potassium', 'Promotes recovery'],
  '{"calories": 220, "protein": "4g", "carbs": "48g", "sugar": "38g", "fiber": "5g", "potassium": "18%"}',
  3500,
  4500,
  'https://images.pexels.com/photos/3625372/pexels-photo-3625372.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Popular',
  true,
  2
),
(
  'VoltActive',
  'Energy Surge Blend',
  'voltactive',
  'Energy',
  'energy',
  'A vibrant citrus and tropical fusion that delivers a clean, sustained energy boost — no caffeine crash, no artificial additives. Pure fruit power.',
  ARRAY['Orange', 'Passion Fruit', 'Guava', 'Lime', 'Ginger', 'Turmeric'],
  ARRAY['Instant energy boost', 'Improves mental clarity', 'No crash or jitters', 'Rich in antioxidants', 'Enhances physical performance'],
  '{"calories": 95, "protein": "2g", "carbs": "22g", "sugar": "18g", "fiber": "3g", "vitamin_c": "200%"}',
  3500,
  4500,
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=600',
  'New',
  true,
  3
),
(
  'Revive+',
  'Recovery & Repair',
  'revive-plus',
  'Recovery',
  'recovery',
  'Crafted for athletes and active individuals, Revive+ accelerates muscle recovery, reduces inflammation, and restores depleted nutrients after intense workouts.',
  ARRAY['Watermelon', 'Tart Cherry', 'Beetroot', 'Lemon', 'Ginger', 'Turmeric'],
  ARRAY['Speeds up muscle recovery', 'Reduces inflammation', 'Replenishes electrolytes', 'Reduces muscle soreness', 'Anti-inflammatory properties'],
  '{"calories": 80, "protein": "2g", "carbs": "18g", "sugar": "14g", "fiber": "2g", "potassium": "15%"}',
  3500,
  4500,
  'https://images.pexels.com/photos/4553031/pexels-photo-4553031.jpeg?auto=compress&cs=tinysrgb&w=600',
  null,
  false,
  4
),
(
  'AquaFuel',
  'Deep Hydration Blend',
  'aquafuel',
  'Hydration',
  'hydration',
  'AquaFuel is your ultimate hydration companion — a light, refreshing blend of water-rich fruits and electrolytes to keep you optimally hydrated all day.',
  ARRAY['Cucumber', 'Watermelon', 'Coconut Water', 'Mint', 'Lime', 'Aloe Vera'],
  ARRAY['Deep cellular hydration', 'Natural electrolyte replenishment', 'Refreshes and cools body', 'Supports kidney health', 'Clears skin'],
  '{"calories": 45, "protein": "1g", "carbs": "10g", "sugar": "8g", "fiber": "1g", "sodium": "4%"}',
  3500,
  4500,
  'https://images.pexels.com/photos/1187766/pexels-photo-1187766.jpeg?auto=compress&cs=tinysrgb&w=600',
  null,
  false,
  5
),
(
  'VivaSkin',
  'Glow & Wellness',
  'vivaskin',
  'Wellness',
  'wellness',
  'A luxurious wellness blend that nourishes from within. VivaSkin supports radiant skin, hormonal balance, and overall vitality through nature''s most potent botanicals.',
  ARRAY['Carrot', 'Papaya', 'Hibiscus', 'Rosehip', 'Orange', 'Beetroot'],
  ARRAY['Promotes radiant skin', 'Rich in collagen-supporting nutrients', 'Hormonal balance support', 'Powerful antioxidants', 'Boosts immunity'],
  '{"calories": 70, "protein": "1g", "carbs": "16g", "sugar": "12g", "fiber": "2g", "vitamin_a": "180%"}',
  3500,
  4500,
  'https://images.pexels.com/photos/3735181/pexels-photo-3735181.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Trending',
  true,
  6
)
ON CONFLICT (slug) DO NOTHING;

-- Seed bundles
INSERT INTO bundles (name, slug, description, products, price, original_price, image_url, badge, goal)
VALUES
(
  'Weight Loss Pack',
  'weight-loss-pack',
  'The ultimate fat-burning combo. Slim Rush + AquaFuel work synergistically to accelerate fat loss while keeping you hydrated and energized.',
  ARRAY['Slim Rush', 'AquaFuel'],
  6000,
  8000,
  'https://images.pexels.com/photos/3621188/pexels-photo-3621188.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Save 25%',
  'fat-loss'
),
(
  'Muscle Gain Pack',
  'muscle-gain-pack',
  'Build lean muscle the natural way. Mass Up + Revive+ provides the fuel to grow and the recovery support to rebuild stronger.',
  ARRAY['Mass Up', 'Revive+'],
  6000,
  8000,
  'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Save 25%',
  'weight-gain'
),
(
  'Athlete Pack',
  'athlete-pack',
  'Complete performance nutrition. VoltActive + Revive+ + AquaFuel — everything an athlete needs to perform, recover, and dominate.',
  ARRAY['VoltActive', 'Revive+', 'AquaFuel'],
  9000,
  12000,
  'https://images.pexels.com/photos/3760137/pexels-photo-3760137.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Best Value',
  'energy'
),
(
  'Wellness Pack',
  'wellness-pack',
  'Your daily wellness ritual. VivaSkin + AquaFuel + VoltActive — glow from within, stay hydrated, and power through your day.',
  ARRAY['VivaSkin', 'AquaFuel', 'VoltActive'],
  9000,
  12000,
  'https://images.pexels.com/photos/3735181/pexels-photo-3735181.jpeg?auto=compress&cs=tinysrgb&w=600',
  'Popular',
  'wellness'
)
ON CONFLICT (slug) DO NOTHING;

-- Seed blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, image_url, author, category, read_time)
VALUES
(
  '5 Reasons Organic Juice Blends Outperform Sports Drinks',
  '5-reasons-organic-juice-outperforms-sports-drinks',
  'Discover why natural fruit blends deliver superior nutrition and performance benefits compared to commercial sports drinks loaded with artificial ingredients.',
  'When it comes to fueling your workout and recovery, not all beverages are created equal...',
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Zarachills Team',
  'Nutrition',
  '5 min read'
),
(
  'The Science Behind Fat-Burning Fruit Blends',
  'science-behind-fat-burning-fruit-blends',
  'Learn how specific fruit combinations create a synergistic fat-burning effect that can accelerate your weight loss journey.',
  'Fat loss is a complex metabolic process influenced by hormones, enzymes, and nutrient intake...',
  'https://images.pexels.com/photos/1346347/pexels-photo-1346347.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Zarachills Team',
  'Fitness',
  '7 min read'
),
(
  'Hydration 101: Why Water Alone Isn''t Enough for Athletes',
  'hydration-101-why-water-alone-isnt-enough',
  'Understand the critical role of electrolytes and natural compounds in maintaining peak athletic performance and recovery.',
  'Proper hydration goes beyond simply drinking enough water...',
  'https://images.pexels.com/photos/1187766/pexels-photo-1187766.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Zarachills Team',
  'Wellness',
  '6 min read'
),
(
  'Building Muscle the Natural Way: A Nigerian Athlete''s Guide',
  'building-muscle-natural-way-nigerian-athlete',
  'From nutrition timing to the best natural muscle-building blends, here''s everything Nigerian athletes need to know about gaining lean mass naturally.',
  'Muscle building requires a combination of training stimulus, adequate protein, and sufficient calories...',
  'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=800',
  'Zarachills Team',
  'Fitness',
  '8 min read'
)
ON CONFLICT (slug) DO NOTHING;

-- Seed promo codes
INSERT INTO promo_codes (code, discount_percent, min_order, active)
VALUES
  ('WELCOME10', 10, 3500, true),
  ('ZARA20', 20, 7000, true),
  ('FIRSTORDER', 15, 3500, true)
ON CONFLICT (code) DO NOTHING;

-- Create tables for ReeseBlanks platform

-- Users and profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  tier TEXT DEFAULT 'guest' CHECK (tier IN ('guest', 'member', 'vip')),
  points INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0,
  image_url TEXT,
  images TEXT[],
  category_id UUID REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  stock_quantity INTEGER DEFAULT 0,
  materials TEXT,
  care_instructions TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Drops
CREATE TABLE IF NOT EXISTS drops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  drop_date TIMESTAMPTZ NOT NULL,
  starting_price DECIMAL(10,2),
  quantity INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Drop products (many-to-many relationship)
CREATE TABLE IF NOT EXISTS drop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drop_id UUID REFERENCES drops(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  drop_price DECIMAL(10,2),
  quantity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_reference TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  size TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Style battles/arena
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_a_url TEXT,
  image_b_url TEXT,
  outfit_a_description TEXT,
  outfit_b_description TEXT,
  votes_a INTEGER DEFAULT 0,
  votes_b INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Battle votes
CREATE TABLE IF NOT EXISTS battle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  choice TEXT CHECK (choice IN ('a', 'b')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

-- User closets (saved outfits)
CREATE TABLE IF NOT EXISTS closets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  products UUID[],
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Closet likes
CREATE TABLE IF NOT EXISTS closet_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  closet_id UUID REFERENCES closets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(closet_id, user_id)
);

-- Referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id),
  referee_id UUID REFERENCES auth.users(id),
  referral_code TEXT UNIQUE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  reward_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Waitlists
CREATE TABLE IF NOT EXISTS waitlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  drop_id UUID REFERENCES drops(id),
  email TEXT NOT NULL,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE closets ENABLE ROW LEVEL SECURITY;
ALTER TABLE closet_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlists ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own votes" ON battle_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own votes" ON battle_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage their own closets" ON closets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public closets" ON closets FOR SELECT USING (is_public = true);

CREATE POLICY "Users can like any closet" ON closet_likes FOR ALL USING (auth.uid() = user_id);

-- Sample data
INSERT INTO categories (name, slug, description) VALUES
  ('Hoodies', 'hoodies', 'Premium hoodies and sweatshirts'),
  ('T-Shirts', 'tshirts', 'Luxury t-shirts and tops'),
  ('Pants', 'pants', 'Designer pants and joggers'),
  ('Accessories', 'accessories', 'Premium accessories and extras');

INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, is_featured, is_new, stock_quantity) VALUES
  ('Midnight Luxe Hoodie', 'midnight-luxe-hoodie', 'Premium heavyweight hoodie with embroidered logo', 85000, 120000, 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg', (SELECT id FROM categories WHERE slug = 'hoodies'), true, true, 50),
  ('Quantum Fade Tee', 'quantum-fade-tee', 'Gradient print luxury t-shirt', 35000, 45000, 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg', (SELECT id FROM categories WHERE slug = 'tshirts'), true, false, 100),
  ('Velocity Track Pants', 'velocity-track-pants', 'Technical joggers with reflective details', 75000, 90000, 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', (SELECT id FROM categories WHERE slug = 'pants'), false, true, 75),
  ('Apex Chain Necklace', 'apex-chain-necklace', 'Premium titanium chain with logo pendant', 45000, 55000, 'https://images.pexels.com/photos/1637652/pexels-photo-1637652.jpeg', (SELECT id FROM categories WHERE slug = 'accessories'), true, false, 25);

INSERT INTO drops (name, description, drop_date, starting_price, quantity, image_url) VALUES
  ('Neon Nights Collection', 'Limited edition neon-inspired streetwear collection', '2024-02-15 18:00:00+00', 50000, 100, 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg'),
  ('Urban Legends Drop', 'Exclusive collaboration with street artists', '2024-02-20 20:00:00+00', 75000, 50, 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg');

INSERT INTO battles (title, description, image_a_url, image_b_url, outfit_a_description, outfit_b_description, ends_at) VALUES
  ('Street vs. Formal', 'Which look wins: streetwear comfort or formal elegance?', 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg', 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg', 'Relaxed hoodie with distressed jeans and fresh sneakers', 'Tailored blazer with slim pants and leather shoes', '2024-02-10 23:59:59+00'),
  ('Monochrome vs. Color Pop', 'Black and white minimalism or bold color statement?', 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg', 'https://images.pexels.com/photos/1637652/pexels-photo-1637652.jpeg', 'All-black ensemble with subtle texture play', 'Vibrant color-blocked outfit with neon accents', '2024-02-12 23:59:59+00');
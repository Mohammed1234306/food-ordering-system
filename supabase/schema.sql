-- ============================================================
-- FOOD ORDERING SYSTEM - COMPLETE SUPABASE DATABASE SCHEMA
-- ============================================================
-- 
-- HOW TO USE:
-- 1. Go to your Supabase project dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Paste this entire file and click "Run"
-- 4. All tables, indexes, RLS policies, and initial data
--    will be created automatically
--
-- TABLES CREATED:
-- 1. profiles          - Extended user data (linked to auth.users)
-- 2. categories        - Menu item categories
-- 3. menu_items        - All food/drink items
-- 4. orders            - Customer orders
-- 5. order_items       - Individual items within each order
-- 6. restaurant_settings - App configuration (sounds, delivery fee, etc.)
--
-- ============================================================


-- ============================================================
-- STEP 1: ENABLE REQUIRED EXTENSIONS
-- ============================================================

-- uuid-ossp: Generates UUID primary keys automatically
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- STEP 2: CREATE TABLES
-- ============================================================

-- ------------------------------------------------------------
-- TABLE: profiles
-- Extends Supabase's built-in auth.users table
-- Created automatically when a user signs up (via trigger below)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary key matches auth.users.id exactly
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- User's display name
  full_name TEXT,
  
  -- User's email (mirrored from auth.users for easy querying)
  email TEXT,
  
  -- User's phone number (for delivery contact)
  phone TEXT,
  
  -- User's default delivery address (saved for convenience)
  default_address TEXT,
  
  -- User's default location coordinates (for map pre-fill)
  default_lat DECIMAL(10, 8),
  default_lng DECIMAL(11, 8),
  
  -- Avatar URL (from Google OAuth or Supabase storage)
  avatar_url TEXT,
  
  -- Role: 'customer' or 'admin'
  -- HOW TO MAKE SOMEONE ADMIN:
  --   UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@example.com';
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add a comment to the table for documentation
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users. Role = admin gives access to /admin dashboard.';


-- ------------------------------------------------------------
-- TABLE: categories
-- Menu categories (e.g., Burgers, Pizza, Drinks, Desserts)
-- Admins manage these from the dashboard
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Category display name (e.g., "Burgers", "Salads")
  name TEXT NOT NULL UNIQUE,
  
  -- Optional emoji or icon identifier (e.g., "🍔", "🥗")
  -- Used in the UI for visual category indicators
  icon TEXT DEFAULT '🍽️',
  
  -- Display order in the menu (lower = shown first)
  sort_order INTEGER DEFAULT 0,
  
  -- Whether this category is visible to customers
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.categories IS 'Menu categories. Sort by sort_order for consistent display.';


-- ------------------------------------------------------------
-- TABLE: menu_items
-- All food/drink items available for ordering
-- Can be managed from the admin dashboard OR via lib/menuData.ts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reference to categories table
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  
  -- Item name (e.g., "Classic Cheeseburger")
  -- !! CHANGE ITEM NAMES IN lib/menuData.ts !!
  name TEXT NOT NULL,
  
  -- Full description shown on the item card
  description TEXT,
  
  -- Price in the local currency (stored as decimal)
  -- !! CHANGE PRICES IN lib/menuData.ts !!
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  
  -- URL to the item's photo
  -- Either a Supabase storage URL or external image URL
  image_url TEXT,
  
  -- Whether item is currently available for ordering
  -- Set to FALSE for temporarily unavailable items
  is_available BOOLEAN DEFAULT TRUE,
  
  -- Mark popular/featured items (shown in hero section)
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Dietary tags as a JSON array
  -- Examples: ["vegetarian", "vegan", "gluten-free", "spicy", "new"]
  tags TEXT[] DEFAULT '{}',
  
  -- Estimated prep time in minutes (shown to customer)
  prep_time_minutes INTEGER DEFAULT 15,
  
  -- Optional: calories count
  calories INTEGER,
  
  -- Display order within category
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.menu_items IS 'All menu items. Sync with lib/menuData.ts for initial seed data.';


-- ------------------------------------------------------------
-- TABLE: orders
-- Each row is one complete order from a customer
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- The customer who placed this order
  -- NULL is allowed for guest checkout if you enable it later
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Order status flow:
  -- pending → accepted → preparing → ready → completed
  -- Any status can move to: cancelled
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled')
  ),
  
  -- Total price of all items (before fees)
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  
  -- Delivery fee charged for this order
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Grand total (subtotal + delivery_fee)
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  
  -- Payment method (currently only COD supported)
  -- You can extend this to add: 'card', 'wallet', etc.
  payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery',
  
  -- Whether payment has been collected
  is_paid BOOLEAN DEFAULT FALSE,
  
  -- Delivery address as typed/selected by customer
  delivery_address TEXT NOT NULL,
  
  -- GPS coordinates from the map picker
  delivery_lat DECIMAL(10, 8),
  delivery_lng DECIMAL(11, 8),
  
  -- Customer contact for the delivery driver
  customer_phone TEXT,
  customer_name TEXT,
  
  -- Special instructions from the customer
  notes TEXT,
  
  -- Admin notes (internal, not shown to customer)
  admin_notes TEXT,
  
  -- Estimated delivery time in minutes (set by admin when accepting)
  estimated_minutes INTEGER,
  
  -- Timestamps for each status transition
  -- These power the order tracking timeline
  accepted_at TIMESTAMPTZ,
  preparing_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.orders IS 'Customer orders. Status flows: pending→accepted→preparing→ready→completed. Any status can → cancelled.';


-- ------------------------------------------------------------
-- TABLE: order_items
-- Individual line items within each order
-- Each row = one item (possibly with quantity > 1)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- The order this item belongs to
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  
  -- The menu item ordered
  -- Stored as reference AND snapshot (name/price at time of order)
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  
  -- IMPORTANT: We snapshot the name and price at order time!
  -- This ensures order history is accurate even if menu prices change later
  item_name TEXT NOT NULL,
  item_price DECIMAL(10, 2) NOT NULL,
  item_image_url TEXT,
  
  -- How many of this item were ordered
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  
  -- Line total (item_price × quantity)
  line_total DECIMAL(10, 2) NOT NULL,
  
  -- Customer customization notes for this specific item
  -- e.g., "no onions", "extra sauce"
  special_instructions TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.order_items IS 'Line items per order. Prices/names are snapshotted at order time to preserve history.';


-- ------------------------------------------------------------
-- TABLE: restaurant_settings
-- Single-row table for restaurant configuration
-- The app reads this to configure behavior
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  -- Always use id = 1 (single-row pattern)
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  
  -- !! CHANGE THIS !! Restaurant display name
  restaurant_name TEXT DEFAULT 'RESTAURANT_NAME_HERE',
  
  -- !! CHANGE THIS !! Tagline shown in hero section
  tagline TEXT DEFAULT 'Delicious food, delivered fast',
  
  -- Delivery fee charged per order
  -- Set to 0 for free delivery
  delivery_fee DECIMAL(10, 2) DEFAULT 2.99,
  
  -- Minimum order amount (0 = no minimum)
  min_order_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Estimated delivery time range shown to customers
  delivery_time_min INTEGER DEFAULT 25,  -- minutes
  delivery_time_max INTEGER DEFAULT 45,  -- minutes
  
  -- Whether the restaurant is currently accepting orders
  -- Toggle this to temporarily close the store
  is_open BOOLEAN DEFAULT TRUE,
  
  -- Alert sound for new orders in admin dashboard
  -- Options: 'bell1', 'bell2', 'bell3', or a custom URL
  -- !! CHANGE THIS !! to the sound you prefer
  alert_sound TEXT DEFAULT 'bell1',
  
  -- Volume for the alert sound (0.0 to 1.0)
  alert_volume DECIMAL(3, 2) DEFAULT 0.8 CHECK (alert_volume BETWEEN 0 AND 1),
  
  -- Whether to show the restaurant's location on the home page
  show_location BOOLEAN DEFAULT TRUE,
  
  -- Restaurant's GPS coordinates (for the "find us" map)
  -- !! CHANGE THESE !! to your actual restaurant location
  restaurant_lat DECIMAL(10, 8) DEFAULT 40.7128,
  restaurant_lng DECIMAL(11, 8) DEFAULT -74.0060,
  
  -- Restaurant address shown in footer
  restaurant_address TEXT DEFAULT '123 Food Street, City, Country',
  
  -- Contact details
  restaurant_phone TEXT DEFAULT '+1 234 567 8900',
  restaurant_email TEXT DEFAULT 'hello@restaurant.com',
  
  -- Social media links (set to empty string to hide)
  instagram_url TEXT DEFAULT '',
  facebook_url TEXT DEFAULT '',
  
  -- Currency settings
  -- !! CHANGE THIS !! to your currency symbol
  currency_symbol TEXT DEFAULT '$',
  
  -- Whether to require phone number at checkout
  require_phone BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.restaurant_settings IS 'Single-row config table. Always query with WHERE id = 1.';


-- ============================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- These speed up the most common database queries
-- ============================================================

-- Find all orders by a specific customer (order history page)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Find orders by status (admin dashboard filters)
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- Find most recent orders first
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Find all items in a specific order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Find all menu items in a category
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);

-- Find only available items (menu page query)
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON public.menu_items(is_available);

-- Find featured items (home page query)
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON public.menu_items(is_featured);


-- ============================================================
-- STEP 4: ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- RLS prevents unauthorized data access at the database level.
-- Even if someone gets your anon key, they cannot access other
-- users' data because the database enforces these rules.
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- PROFILES RLS POLICIES
-- ------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view ALL profiles
CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- The trigger function below handles INSERT (new user signup)
-- We don't need a user-facing INSERT policy for profiles


-- ------------------------------------------------------------
-- CATEGORIES RLS POLICIES
-- ------------------------------------------------------------

-- EVERYONE (including non-logged-in users) can read categories
-- This allows the public menu page to load without login
CREATE POLICY "categories_select_public" ON public.categories
  FOR SELECT USING (TRUE);

-- Only admins can create/edit/delete categories
CREATE POLICY "categories_insert_admin" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "categories_update_admin" ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "categories_delete_admin" ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ------------------------------------------------------------
-- MENU ITEMS RLS POLICIES
-- ------------------------------------------------------------

-- EVERYONE can read active menu items (public menu page)
CREATE POLICY "menu_items_select_public" ON public.menu_items
  FOR SELECT USING (TRUE);

-- Only admins can modify menu items
CREATE POLICY "menu_items_insert_admin" ON public.menu_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "menu_items_update_admin" ON public.menu_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "menu_items_delete_admin" ON public.menu_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ------------------------------------------------------------
-- ORDERS RLS POLICIES
-- ------------------------------------------------------------

-- Logged-in users can view ONLY their own orders
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- Logged-in users can create orders for themselves
CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view ALL orders
CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update order status (accept, prepare, complete, cancel)
CREATE POLICY "orders_update_admin" ON public.orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Customers can cancel their own PENDING orders
CREATE POLICY "orders_update_cancel_own" ON public.orders
  FOR UPDATE USING (
    auth.uid() = user_id AND status = 'pending'
  );


-- ------------------------------------------------------------
-- ORDER ITEMS RLS POLICIES
-- ------------------------------------------------------------

-- Users can view their own order items
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Users can insert items into their own orders
CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "order_items_select_admin" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ------------------------------------------------------------
-- RESTAURANT SETTINGS RLS POLICIES
-- ------------------------------------------------------------

-- EVERYONE can read settings (needed for menu page, footer, etc.)
CREATE POLICY "settings_select_public" ON public.restaurant_settings
  FOR SELECT USING (TRUE);

-- Only admins can update settings
CREATE POLICY "settings_update_admin" ON public.restaurant_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ============================================================
-- STEP 5: FUNCTIONS AND TRIGGERS
-- ============================================================

-- ------------------------------------------------------------
-- FUNCTION: handle_new_user
-- Automatically creates a profile row when a new user signs up
-- This is called by the trigger below
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    -- Get name from Google OAuth metadata, or fall back to email
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    -- Get avatar from Google OAuth metadata
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$;

-- Create the trigger that calls handle_new_user after signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ------------------------------------------------------------
-- FUNCTION: update_updated_at
-- Automatically updates the updated_at timestamp on row changes
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to tables that need it
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

CREATE TRIGGER set_updated_at_menu_items
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

CREATE TRIGGER set_updated_at_orders
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();

CREATE TRIGGER set_updated_at_settings
  BEFORE UPDATE ON public.restaurant_settings
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at();


-- ============================================================
-- STEP 6: ENABLE REAL-TIME SUBSCRIPTIONS
-- ============================================================
-- This allows the admin dashboard to receive instant notifications
-- when a new order comes in (without polling)

-- Add the orders table to Supabase's real-time publication
-- This enables the useRealtimeOrders hook to work
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;


-- ============================================================
-- STEP 7: SEED DATA - Initial restaurant configuration
-- ============================================================

-- Insert default restaurant settings (single row, id = 1)
INSERT INTO public.restaurant_settings (id) 
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- STEP 8: SEED CATEGORIES
-- !! CHANGE THESE !! to your actual menu categories
-- Add more INSERT statements to add more categories
-- ============================================================
INSERT INTO public.categories (name, icon, sort_order) VALUES
  -- Category name    -- Emoji icon   -- Display order
  ('Starters',        '🥗',           1),
  ('Burgers',         '🍔',           2),
  ('Pizza',           '🍕',           3),
  ('Pasta',           '🍝',           4),
  ('Grills',          '🥩',           5),
  ('Sandwiches',      '🥪',           6),
  ('Sides',           '🍟',           7),
  ('Drinks',          '🥤',           8),
  ('Desserts',        '🍰',           9)
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- STEP 9: SEED MENU ITEMS
-- !! IMPORTANT: Also update lib/menuData.ts with these same items !!
-- The lib/menuData.ts is used for the initial UI before DB loads
-- These are just examples - replace with your real menu!
-- ============================================================

-- We'll insert items using a CTE to get category IDs by name
-- This way we don't need to hardcode UUIDs

WITH cat AS (
  SELECT id, name FROM public.categories
)
INSERT INTO public.menu_items (
  category_id, name, description, price, 
  image_url, is_available, is_featured, tags, prep_time_minutes
)
SELECT
  cat.id,
  item.name,
  item.description,
  item.price,
  item.image_url,
  item.is_available,
  item.is_featured,
  item.tags::text[],
  item.prep_time_minutes
FROM (VALUES
  -- ==========================================================
  -- STARTERS
  -- !! CHANGE THESE !! - Replace with your actual starter items
  -- ==========================================================
  ('Starters', 'Crispy Calamari',
   'Lightly breaded, flash-fried calamari with marinara sauce',
   9.99, 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=500',
   TRUE, FALSE, '["seafood","popular"]', 10),

  ('Starters', 'Bruschetta Al Pomodoro',
   'Toasted sourdough, ripe tomatoes, fresh basil, extra virgin olive oil',
   7.99, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=500',
   TRUE, FALSE, '["vegetarian","vegan"]', 8),

  ('Starters', 'Chicken Wings',
   'Crispy chicken wings with your choice of buffalo or honey BBQ sauce',
   12.99, 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=500',
   TRUE, TRUE, '["popular","spicy"]', 15),

  -- ==========================================================
  -- BURGERS
  -- !! ADD YOUR OWN ITEM HERE !!
  -- ==========================================================
  ('Burgers', 'Classic Smash Burger',
   'Double smashed patties, American cheese, pickles, special sauce on a brioche bun',
   14.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
   TRUE, TRUE, '["popular","bestseller"]', 12),

  ('Burgers', 'Crispy Chicken Burger',
   'Southern-fried chicken thigh, coleslaw, sriracha mayo, brioche bun',
   13.99, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=500',
   TRUE, FALSE, '["popular"]', 14),

  ('Burgers', 'Mushroom Swiss Burger',
   'Beef patty, sautéed mushrooms, Swiss cheese, garlic aioli',
   15.99, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500',
   TRUE, FALSE, '[]', 12),

  ('Burgers', 'Veggie Black Bean Burger',
   'Black bean patty, avocado, pickled jalapeños, chipotle mayo',
   12.99, 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500',
   TRUE, FALSE, '["vegetarian"]', 12),

  -- ==========================================================
  -- PIZZA
  -- ==========================================================
  ('Pizza', 'Margherita Classica',
   'San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil',
   13.99, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500',
   TRUE, TRUE, '["vegetarian","popular"]', 20),

  ('Pizza', 'Pepperoni Supreme',
   'Crushed tomato, mozzarella, generous pepperoni, dried oregano',
   15.99, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
   TRUE, FALSE, '["popular","bestseller"]', 20),

  ('Pizza', 'BBQ Chicken Pizza',
   'BBQ sauce, grilled chicken, red onion, mozzarella, fresh cilantro',
   16.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500',
   TRUE, FALSE, '[]', 22),

  -- ==========================================================
  -- PASTA
  -- ==========================================================
  ('Pasta', 'Spaghetti Carbonara',
   'Spaghetti, pancetta, egg yolk, Pecorino Romano, black pepper',
   14.99, 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500',
   TRUE, TRUE, '["popular"]', 18),

  ('Pasta', 'Penne Arrabbiata',
   'Penne, spicy tomato sauce, garlic, fresh parsley',
   12.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=500',
   TRUE, FALSE, '["vegetarian","vegan","spicy"]', 15),

  -- ==========================================================
  -- GRILLS
  -- ==========================================================
  ('Grills', 'Ribeye Steak 300g',
   '300g dry-aged ribeye, chimichurri, roasted garlic butter, fries',
   32.99, 'https://images.unsplash.com/photo-1558030006-450675393462?w=500',
   TRUE, TRUE, '["premium"]', 25),

  ('Grills', 'Half Rotisserie Chicken',
   'Free-range rotisserie chicken, herb butter, seasonal vegetables',
   18.99, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=500',
   TRUE, FALSE, '["popular"]', 30),

  -- ==========================================================
  -- SIDES
  -- ==========================================================
  ('Sides', 'Truffle Parmesan Fries',
   'Crispy fries, truffle oil, grated Parmesan, fresh herbs',
   6.99, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500',
   TRUE, FALSE, '["vegetarian","popular"]', 10),

  ('Sides', 'Onion Rings',
   'Beer-battered onion rings, smoky dipping sauce',
   5.99, 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500',
   TRUE, FALSE, '["vegetarian"]', 10),

  ('Sides', 'Garden Salad',
   'Mixed greens, cherry tomatoes, cucumber, house vinaigrette',
   6.99, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
   TRUE, FALSE, '["vegetarian","vegan","healthy"]', 5),

  -- ==========================================================
  -- DRINKS
  -- !! CHANGE THESE !! - Add your actual drinks
  -- ==========================================================
  ('Drinks', 'Fresh Lemonade',
   'Freshly squeezed lemonade with mint and ice',
   3.99, 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=500',
   TRUE, FALSE, '["cold","vegan"]', 3),

  ('Drinks', 'Craft Cola',
   'Small-batch cola with natural flavors, served over ice',
   2.99, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500',
   TRUE, FALSE, '["cold"]', 2),

  ('Drinks', 'Mango Smoothie',
   'Fresh mango, yogurt, honey, topped with granola',
   5.99, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=500',
   TRUE, FALSE, '["cold","healthy"]', 5),

  ('Drinks', 'Espresso',
   'Double shot of our house blend espresso',
   2.99, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500',
   TRUE, FALSE, '["hot","caffeine"]', 3),

  -- ==========================================================
  -- DESSERTS
  -- ==========================================================
  ('Desserts', 'Warm Chocolate Lava Cake',
   'Dark chocolate fondant, vanilla ice cream, salted caramel drizzle',
   8.99, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
   TRUE, TRUE, '["popular","vegetarian","sweet"]', 12),

  ('Desserts', 'Classic Tiramisu',
   'Ladyfingers soaked in espresso, mascarpone cream, cocoa powder',
   7.99, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=500',
   TRUE, FALSE, '["vegetarian"]', 5),

  ('Desserts', 'Cheesecake Slice',
   'New York-style cheesecake, strawberry compote, graham cracker crust',
   7.99, 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500',
   TRUE, FALSE, '["vegetarian","popular"]', 5)

) AS item(category_name, name, description, price, image_url, is_available, is_featured, tags, prep_time_minutes)
JOIN cat ON cat.name = item.category_name;


-- ============================================================
-- SETUP COMPLETE!
-- ============================================================
-- 
-- NEXT STEPS:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Enable Google OAuth in Supabase:
--    Authentication > Providers > Google > Enable
--    Add your Google Client ID and Secret
--    Add redirect URL: https://your-project.supabase.co/auth/v1/callback
-- 3. Set up Supabase Storage bucket:
--    Storage > New Bucket > Name: "menu-images" > Public bucket: YES
-- 4. Make yourself admin:
--    UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
-- 5. Copy .env.local.example to .env.local and fill in values
-- 6. Run: npm install && npm run dev
--
-- ============================================================

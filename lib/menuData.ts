// ============================================================
// MENU DATA - SINGLE SOURCE OF TRUTH
// ============================================================
// 
// !! THIS IS THE MAIN FILE YOU EDIT TO CUSTOMIZE YOUR MENU !!
//
// This file defines all menu categories and items.
// The admin dashboard syncs with the database, but this file
// is used to seed the database and as a fallback while loading.
//
// HOW TO ADD A NEW ITEM:
// 1. Find the category array below (or create a new one)
// 2. Copy an existing item and modify its fields
// 3. Make sure the category name matches exactly
//
// HOW TO ADD A NEW CATEGORY:
// 1. Add a new entry to MENU_CATEGORIES
// 2. Add the category name to MENU_ITEMS
//
// HOW TO CHANGE PRICES:
// - Find the item below and change the `price` field
// - Prices are in your local currency (change currency_symbol in settings)
//
// TAGS AVAILABLE:
// "vegetarian", "vegan", "gluten-free", "spicy", "popular",
// "bestseller", "new", "healthy", "premium", "cold", "hot"
// You can add your own tags - they'll appear as filter chips
//
// ============================================================

import type { Category, MenuItem } from '@/types';

// ============================================================
// CATEGORIES
// !! CHANGE THESE to your actual menu categories !!
// ============================================================
export const MENU_CATEGORIES: Omit<Category, 'id' | 'created_at'>[] = [
  // { name: '', icon: '🍽️', sort_order: 0, is_active: true }
  
  { name: 'Starters',    icon: '🥗', sort_order: 1, is_active: true },
  { name: 'Burgers',     icon: '🍔', sort_order: 2, is_active: true },
  { name: 'Pizza',       icon: '🍕', sort_order: 3, is_active: true },
  { name: 'Pasta',       icon: '🍝', sort_order: 4, is_active: true },
  { name: 'Grills',      icon: '🥩', sort_order: 5, is_active: true },
  { name: 'Sandwiches',  icon: '🥪', sort_order: 6, is_active: true },
  { name: 'Sides',       icon: '🍟', sort_order: 7, is_active: true },
  { name: 'Drinks',      icon: '🥤', sort_order: 8, is_active: true },
  { name: 'Desserts',    icon: '🍰', sort_order: 9, is_active: true },
];

// ============================================================
// MENU ITEMS
// !! EDIT ALL ITEMS BELOW TO MATCH YOUR REAL MENU !!
//
// Each item has:
// - name: string          !! WRITE ITEM NAME HERE !!
// - description: string   Short appetizing description
// - price: number         !! CHANGE PRICE HERE !! (e.g., 12.99)
// - category: string      Must match a name in MENU_CATEGORIES exactly
// - image_url: string     URL to item photo (use your own or Unsplash)
// - is_featured: boolean  Show on homepage? Set to true for top picks
// - tags: string[]        Filter tags
// - prep_time_minutes: number  Estimated cooking time
// - calories: number | null   Optional calorie count
// ============================================================

export type MenuItemSeed = {
  category: string;       // Category name (must match MENU_CATEGORIES)
  name: string;           // !! WRITE ITEM NAME HERE !!
  description: string;
  price: number;          // !! CHANGE PRICE HERE !!
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  tags: string[];
  prep_time_minutes: number;
  calories: number | null;
  sort_order: number;
};

export const MENU_ITEMS: MenuItemSeed[] = [

  // ==========================================================
  // 🥗 STARTERS
  // !! ADD YOUR OWN STARTER ITEMS HERE !!
  // ==========================================================
  {
    category: 'Starters',
    name: 'Crispy Calamari',                    // !! WRITE ITEM NAME HERE !!
    description: 'Lightly breaded, flash-fried calamari with homemade marinara sauce and lemon wedge',
    price: 9.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600',
    is_available: true,
    is_featured: false,
    tags: ['seafood', 'popular'],
    prep_time_minutes: 10,
    calories: 380,
    sort_order: 1,
  },
  {
    category: 'Starters',
    name: 'Bruschetta Al Pomodoro',             // !! WRITE ITEM NAME HERE !!
    description: 'Toasted sourdough topped with ripe tomatoes, fresh basil, garlic, and extra virgin olive oil',
    price: 7.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600',
    is_available: true,
    is_featured: false,
    tags: ['vegetarian', 'vegan'],
    prep_time_minutes: 8,
    calories: 220,
    sort_order: 2,
  },
  {
    category: 'Starters',
    name: 'Crispy Chicken Wings',               // !! WRITE ITEM NAME HERE !!
    description: '8 crispy chicken wings with your choice of buffalo, honey BBQ, or garlic parmesan sauce',
    price: 12.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=600',
    is_available: true,
    is_featured: true,
    tags: ['popular', 'spicy'],
    prep_time_minutes: 15,
    calories: 580,
    sort_order: 3,
  },

  // ==========================================================
  // 🍔 BURGERS
  // !! ADD YOUR OWN BURGER ITEMS HERE !!
  // ==========================================================
  {
    category: 'Burgers',
    name: 'Classic Smash Burger',               // !! WRITE ITEM NAME HERE !!
    description: 'Double smashed beef patties, American cheese, caramelized onions, pickles, and our secret sauce on a toasted brioche bun',
    price: 14.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600',
    is_available: true,
    is_featured: true,
    tags: ['popular', 'bestseller'],
    prep_time_minutes: 12,
    calories: 720,
    sort_order: 1,
  },
  {
    category: 'Burgers',
    name: 'Crispy Chicken Burger',              // !! WRITE ITEM NAME HERE !!
    description: 'Southern-fried chicken thigh, creamy coleslaw, sriracha mayo, and crispy lettuce on a toasted brioche bun',
    price: 13.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600',
    is_available: true,
    is_featured: false,
    tags: ['popular'],
    prep_time_minutes: 14,
    calories: 650,
    sort_order: 2,
  },
  {
    category: 'Burgers',
    name: 'Mushroom Swiss Burger',              // !! WRITE ITEM NAME HERE !!
    description: 'Beef patty, sautéed wild mushrooms, melted Swiss cheese, garlic aioli, baby spinach',
    price: 15.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600',
    is_available: true,
    is_featured: false,
    tags: [],
    prep_time_minutes: 12,
    calories: 690,
    sort_order: 3,
  },
  {
    category: 'Burgers',
    name: 'Veggie Black Bean Burger',           // !! WRITE ITEM NAME HERE !!
    description: 'Homemade black bean and corn patty, avocado, pickled jalapeños, chipotle mayo, fresh tomato',
    price: 12.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600',
    is_available: true,
    is_featured: false,
    tags: ['vegetarian', 'vegan'],
    prep_time_minutes: 12,
    calories: 520,
    sort_order: 4,
  },

  // ==========================================================
  // 🍕 PIZZA
  // !! ADD YOUR OWN PIZZA ITEMS HERE !!
  // ==========================================================
  {
    category: 'Pizza',
    name: 'Margherita Classica',                // !! WRITE ITEM NAME HERE !!
    description: 'San Marzano tomato sauce, buffalo mozzarella, fresh basil leaves, extra virgin olive oil',
    price: 13.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600',
    is_available: true,
    is_featured: true,
    tags: ['vegetarian', 'popular'],
    prep_time_minutes: 20,
    calories: 680,
    sort_order: 1,
  },
  {
    category: 'Pizza',
    name: 'Pepperoni Supreme',                  // !! WRITE ITEM NAME HERE !!
    description: 'Crushed tomato, mozzarella cheese, generous pepperoni slices, dried oregano',
    price: 15.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600',
    is_available: true,
    is_featured: false,
    tags: ['popular', 'bestseller'],
    prep_time_minutes: 20,
    calories: 820,
    sort_order: 2,
  },
  {
    category: 'Pizza',
    name: 'BBQ Chicken Pizza',                  // !! WRITE ITEM NAME HERE !!
    description: 'Smoky BBQ sauce, grilled chicken breast, caramelized red onions, mozzarella, fresh cilantro',
    price: 16.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600',
    is_available: true,
    is_featured: false,
    tags: [],
    prep_time_minutes: 22,
    calories: 780,
    sort_order: 3,
  },

  // ==========================================================
  // 🍝 PASTA
  // !! ADD YOUR OWN PASTA ITEMS HERE !!
  // ==========================================================
  {
    category: 'Pasta',
    name: 'Spaghetti Carbonara',                // !! WRITE ITEM NAME HERE !!
    description: 'Al dente spaghetti, crispy pancetta, egg yolk sauce, Pecorino Romano, freshly cracked black pepper',
    price: 14.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600',
    is_available: true,
    is_featured: true,
    tags: ['popular'],
    prep_time_minutes: 18,
    calories: 720,
    sort_order: 1,
  },
  {
    category: 'Pasta',
    name: 'Penne Arrabbiata',                   // !! WRITE ITEM NAME HERE !!
    description: 'Penne pasta in a fiery tomato sauce with garlic, chili, and fresh flat-leaf parsley',
    price: 12.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=600',
    is_available: true,
    is_featured: false,
    tags: ['vegetarian', 'vegan', 'spicy'],
    prep_time_minutes: 15,
    calories: 560,
    sort_order: 2,
  },

  // ==========================================================
  // 🥩 GRILLS
  // !! ADD YOUR OWN GRILL ITEMS HERE !!
  // ==========================================================
  {
    category: 'Grills',
    name: 'Ribeye Steak 300g',                  // !! WRITE ITEM NAME HERE !!
    description: 'Dry-aged 300g ribeye steak, homemade chimichurri, roasted garlic butter, served with seasoned fries',
    price: 32.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600',
    is_available: true,
    is_featured: true,
    tags: ['premium'],
    prep_time_minutes: 25,
    calories: 980,
    sort_order: 1,
  },
  {
    category: 'Grills',
    name: 'Half Rotisserie Chicken',            // !! WRITE ITEM NAME HERE !!
    description: 'Juicy free-range half chicken, slow-roasted with herb butter, seasonal roasted vegetables',
    price: 18.99,                               // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=600',
    is_available: true,
    is_featured: false,
    tags: ['popular'],
    prep_time_minutes: 30,
    calories: 760,
    sort_order: 2,
  },

  // ==========================================================
  // 🍟 SIDES
  // !! ADD YOUR OWN SIDE ITEMS HERE !!
  // ==========================================================
  {
    category: 'Sides',
    name: 'Truffle Parmesan Fries',             // !! WRITE ITEM NAME HERE !!
    description: 'Golden crispy fries tossed in truffle oil, freshly grated Parmesan, and chopped herbs',
    price: 6.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
    is_available: true,
    is_featured: false,
    tags: ['vegetarian', 'popular'],
    prep_time_minutes: 10,
    calories: 420,
    sort_order: 1,
  },
  {
    category: 'Sides',
    name: 'Beer-Battered Onion Rings',          // !! WRITE ITEM NAME HERE !!
    description: 'Thick-cut onion rings in crispy beer batter, served with smoky chipotle dipping sauce',
    price: 5.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=600',
    is_available: true,
    is_featured: false,
    tags: ['vegetarian'],
    prep_time_minutes: 10,
    calories: 380,
    sort_order: 2,
  },
  {
    category: 'Sides',
    name: 'Garden Side Salad',                  // !! WRITE ITEM NAME HERE !!
    description: 'Mixed greens, cherry tomatoes, cucumber slices, house balsamic vinaigrette',
    price: 6.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    is_available: true,
    is_featured: false,
    tags: ['vegetarian', 'vegan', 'healthy'],
    prep_time_minutes: 5,
    calories: 120,
    sort_order: 3,
  },

  // ==========================================================
  // 🥤 DRINKS
  // !! ADD YOUR OWN DRINK ITEMS HERE !!
  // ==========================================================
  {
    category: 'Drinks',
    name: 'Fresh Lemonade',                     // !! WRITE ITEM NAME HERE !!
    description: 'Hand-squeezed lemonade with fresh mint and a pinch of sea salt, served over ice',
    price: 3.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1570831739435-6601aa3fa4fb?w=600',
    is_available: true,
    is_featured: false,
    tags: ['cold', 'vegan'],
    prep_time_minutes: 3,
    calories: 120,
    sort_order: 1,
  },
  {
    category: 'Drinks',
    name: 'Mango Passion Smoothie',             // !! WRITE ITEM NAME HERE !!
    description: 'Blended fresh mango, passion fruit, yogurt, and a drizzle of honey',
    price: 5.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600',
    is_available: true,
    is_featured: false,
    tags: ['cold', 'healthy'],
    prep_time_minutes: 5,
    calories: 220,
    sort_order: 2,
  },
  {
    category: 'Drinks',
    name: 'Artisan Cola',                       // !! WRITE ITEM NAME HERE !!
    description: 'Small-batch craft cola with natural spices, served over ice',
    price: 2.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600',
    is_available: true,
    is_featured: false,
    tags: ['cold'],
    prep_time_minutes: 2,
    calories: 140,
    sort_order: 3,
  },
  {
    category: 'Drinks',
    name: 'Double Espresso',                    // !! WRITE ITEM NAME HERE !!
    description: 'Two shots of our signature dark roast espresso blend',
    price: 2.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600',
    is_available: true,
    is_featured: false,
    tags: ['hot', 'caffeine'],
    prep_time_minutes: 3,
    calories: 10,
    sort_order: 4,
  },

  // ==========================================================
  // 🍰 DESSERTS
  // !! ADD YOUR OWN DESSERT ITEMS HERE !!
  // ==========================================================
  {
    category: 'Desserts',
    name: 'Chocolate Lava Cake',                // !! WRITE ITEM NAME HERE !!
    description: 'Warm dark chocolate fondant with a molten center, served with vanilla bean ice cream and salted caramel',
    price: 8.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600',
    is_available: true,
    is_featured: true,
    tags: ['popular', 'vegetarian', 'sweet'],
    prep_time_minutes: 12,
    calories: 480,
    sort_order: 1,
  },
  {
    category: 'Desserts',
    name: 'Classic Tiramisu',                   // !! WRITE ITEM NAME HERE !!
    description: 'Traditional Italian tiramisu, ladyfingers soaked in espresso, silky mascarpone cream, dusted with cocoa',
    price: 7.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600',
    is_available: true,
    is_featured: false,
    tags: ['vegetarian'],
    prep_time_minutes: 5,
    calories: 380,
    sort_order: 2,
  },
  {
    category: 'Desserts',
    name: 'NY Cheesecake Slice',                // !! WRITE ITEM NAME HERE !!
    description: 'Dense, creamy New York-style cheesecake on a buttery graham cracker crust, topped with strawberry compote',
    price: 7.99,                                // !! CHANGE PRICE HERE !!
    image_url: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600',
    is_available: true,
    is_featured: false,
    tags: ['vegetarian', 'popular'],
    prep_time_minutes: 5,
    calories: 420,
    sort_order: 3,
  },

  // !! ADD YOUR OWN ITEM HERE !!
  // {
  //   category: 'Desserts',        // Category name (must match MENU_CATEGORIES)
  //   name: 'My New Item',         // !! WRITE ITEM NAME HERE !!
  //   description: 'Description',
  //   price: 9.99,                 // !! CHANGE PRICE HERE !!
  //   image_url: 'https://...',
  //   is_available: true,
  //   is_featured: false,
  //   tags: [],
  //   prep_time_minutes: 10,
  //   calories: null,
  //   sort_order: 99,
  // },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get all unique tags from menu items
 * Used to build the filter chips on the menu page
 */
export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  MENU_ITEMS.forEach(item => item.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort();
}

/**
 * Get featured items for the home page hero section
 * Returns only items marked as is_featured: true
 */
export function getFeaturedItems(): MenuItemSeed[] {
  return MENU_ITEMS.filter(item => item.is_featured && item.is_available);
}

/**
 * Get items by category name
 */
export function getItemsByCategory(categoryName: string): MenuItemSeed[] {
  return MENU_ITEMS.filter(
    item => item.category === categoryName && item.is_available
  );
}

/**
 * Format a price number as a currency string
 * !! CHANGE THE CURRENCY SYMBOL if needed !!
 * Or better: use the currency_symbol from restaurant_settings
 */
export function formatPrice(price: number, symbol = '$'): string {
  return `${symbol}${price.toFixed(2)}`;
}

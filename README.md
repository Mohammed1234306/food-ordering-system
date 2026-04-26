# 🍽️ Food Ordering System — Complete Setup Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Full Folder Structure](#full-folder-structure)
3. [Prerequisites](#prerequisites)
4. [Step 1: Clone & Install](#step-1-clone--install)
5. [Step 2: Supabase Setup](#step-2-supabase-setup)
6. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
7. [Step 4: Run Locally](#step-4-run-locally)
8. [Step 5: Customize Your Restaurant](#step-5-customize-your-restaurant)
9. [Step 6: Deploy to Vercel](#step-6-deploy-to-vercel)
10. [How to Make Someone an Admin](#how-to-make-someone-an-admin)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

A full-stack food ordering system built with:
- **Next.js 14** (App Router) + TypeScript
- **Supabase** (Auth + Realtime DB + Storage)
- **Tailwind CSS** + **Framer Motion**
- **Zustand** (cart state) + **Leaflet** (map picker)

### Customer Features
- Google OAuth + Email/Password login
- Interactive menu with search & filters
- Shopping cart with persistent storage
- Checkout with map-based location picker
- Real-time order tracking
- Order history

### Admin Features
- Real-time orders dashboard with audio bell alerts
- 3 built-in alert sounds + custom URL support
- Order status management (Accept → Prepare → Ready → Complete)
- Menu item management (add/edit/delete/hide)
- Restaurant settings panel

---

## Full Folder Structure

```
food-ordering-system/
├── app/
│   ├── layout.tsx                    ← Root layout (fonts, providers)
│   ├── page.tsx                      ← Home page
│   ├── globals.css                   ← Global styles & design tokens
│   ├── auth/
│   │   ├── login/page.tsx            ← Login (Google + email)
│   │   ├── register/page.tsx         ← Registration
│   │   ├── forgot-password/page.tsx  ← Password reset
│   │   └── callback/route.ts         ← OAuth callback handler
│   ├── menu/
│   │   └── page.tsx                  ← Full interactive menu
│   ├── checkout/
│   │   └── page.tsx                  ← Checkout + map picker
│   ├── orders/
│   │   ├── page.tsx                  ← Order history
│   │   └── [id]/page.tsx             ← Order tracking (real-time)
│   └── admin/
│       ├── layout.tsx                ← Admin layout (auth check)
│       ├── page.tsx                  ← Dashboard overview
│       ├── orders/page.tsx           ← Real-time orders + audio alert
│       ├── menu/page.tsx             ← Menu management
│       └── settings/page.tsx         ← Settings + sound picker
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                ← Top navigation bar
│   │   ├── CartDrawer.tsx            ← Slide-in cart panel
│   │   └── Footer.tsx                ← Site footer
│   ├── home/
│   │   ├── HeroSection.tsx           ← Hero banner
│   │   ├── StatsBar.tsx              ← Delivery stats strip
│   │   ├── CategoryGrid.tsx          ← Category quick links
│   │   └── FeaturedItems.tsx         ← Featured menu items
│   ├── menu/
│   │   └── MenuItemCard.tsx          ← Food item card
│   ├── checkout/
│   │   └── LocationPicker.tsx        ← Leaflet map picker
│   ├── orders/
│   │   └── OrderCard.tsx             ← Order history card
│   ├── admin/
│   │   └── AdminSidebar.tsx          ← Admin navigation
│   └── providers/
│       └── CartProvider.tsx          ← Cart hydration provider
│
├── hooks/
│   ├── useCart.ts                    ← Zustand cart store
│   ├── useAuth.ts                    ← Auth state hook
│   └── useRealtimeOrders.ts          ← Real-time orders + audio
│
├── lib/
│   ├── menuData.ts                   ← !! EDIT YOUR MENU HERE !!
│   ├── utils.ts                      ← Utility functions
│   └── supabase/
│       ├── client.ts                 ← Browser Supabase client
│       ├── server.ts                 ← Server Supabase client
│       └── middleware.ts             ← Middleware auth helper
│
├── types/
│   └── index.ts                      ← All TypeScript types
│
├── supabase/
│   └── schema.sql                    ← Complete DB schema + RLS
│
├── public/
│   └── sounds/
│       ├── bell1.mp3                 ← !! ADD YOUR SOUND FILES !!
│       ├── bell2.mp3
│       └── bell3.mp3
│
├── middleware.ts                     ← Route protection middleware
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── .env.local.example               ← Copy to .env.local and fill in
```

---

## Prerequisites

- **Node.js** 18.17 or later → https://nodejs.org
- **npm** 9+ (comes with Node.js)
- A **Supabase account** (free) → https://supabase.com
- A **Vercel account** (free) → https://vercel.com (for deployment)
- A **Google Cloud Console** account (for Google OAuth)

---

## Step 1: Clone & Install

```bash
# If using git
git clone <your-repo-url>
cd food-ordering-system

# Install all dependencies
npm install

# This installs: Next.js, Supabase, Framer Motion, Leaflet,
# Zustand, shadcn/ui, Tailwind, and all other packages
```

---

## Step 2: Supabase Setup

### 2a. Create a Supabase Project
1. Go to https://supabase.com and sign up/log in
2. Click **"New Project"**
3. Choose an organization, project name, and **strong database password**
4. Select a region close to your users
5. Click **"Create new project"** and wait ~2 minutes

### 2b. Run the Database Schema
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy the **entire contents** and paste into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned" - that's correct!

### 2c. Set Up Google OAuth (Optional but Recommended)
1. Go to **Google Cloud Console** → https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable the **Google+ API** (or "Google Identity" API)
4. Go to **APIs & Services → Credentials**
5. Click **"Create Credentials → OAuth Client ID"**
6. Choose **Web Application**
7. Add **Authorized redirect URIs**:
   ```
   https://YOUR_PROJECT_ID.supabase.co/auth/v1/callback
   ```
   (Replace `YOUR_PROJECT_ID` with your actual Supabase project ID)
8. Copy the **Client ID** and **Client Secret**
9. In Supabase dashboard: **Authentication → Providers → Google**
10. Enable Google, paste the Client ID and Secret
11. Save

### 2d. Set Up Supabase Storage (for menu item images)
1. In Supabase dashboard, click **"Storage"**
2. Click **"New bucket"**
3. Name it: `menu-images`
4. Check **"Public bucket"** ✓ (so images are publicly accessible)
5. Click **"Create bucket"**

### 2e. Get Your API Keys
1. In Supabase dashboard, go to **Settings → API**
2. Copy these values for the next step:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon/public key** (long JWT string)
   - **service_role key** (keep this SECRET!)

---

## Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Then edit `.env.local` with your values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL (for OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Restaurant name shown in the UI
NEXT_PUBLIC_RESTAURANT_NAME="My Restaurant"
```

> ⚠️ **Never commit `.env.local` to git!** It's already in `.gitignore`.

---

## Step 4: Run Locally

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

You should see:
- ✅ Home page loads with your restaurant name
- ✅ Menu page shows the seeded items
- ✅ Login page works (try Google OAuth)
- ✅ Cart works (add items, see count in navbar)

---

## Step 5: Customize Your Restaurant

### Change Restaurant Name
Edit `.env.local`:
```env
NEXT_PUBLIC_RESTAURANT_NAME="Your Actual Restaurant Name"
```

Also update `supabase/schema.sql` (for database):
```sql
UPDATE public.restaurant_settings 
SET restaurant_name = 'Your Actual Restaurant Name'
WHERE id = 1;
```

### Edit Your Menu
Open `lib/menuData.ts` - this is the **single file** for all menu customization:

```typescript
// Change category names and icons
export const MENU_CATEGORIES = [
  { name: 'Starters', icon: '🥗', sort_order: 1, is_active: true },
  { name: 'Mains',    icon: '🍽️', sort_order: 2, is_active: true },
  // !! ADD YOUR OWN CATEGORY HERE !!
];

// Change item names, prices, descriptions
export const MENU_ITEMS = [
  {
    category: 'Starters',
    name: 'Your Item Name',        // !! WRITE ITEM NAME HERE !!
    description: 'Description...',
    price: 9.99,                   // !! CHANGE PRICE HERE !!
    image_url: 'https://...',
    // ...
  },
  // !! ADD YOUR OWN ITEM HERE !!
];
```

After editing `menuData.ts`, sync with the database:
1. Go to Supabase SQL Editor
2. Delete old items: `DELETE FROM menu_items; DELETE FROM categories;`
3. Re-run the seed section of `schema.sql`

Or use the **Admin Dashboard → Menu Management** to add/edit items directly.

### Change Brand Colors
Edit `tailwind.config.ts`:
```typescript
colors: {
  primary: {
    500: '#f77f17',  // !! CHANGE THIS to your brand color !!
    // Use https://uicolors.app/create to generate a full palette
  }
}
```

### Change Fonts
Edit `app/layout.tsx`:
```typescript
import { YourFont } from 'next/font/google';
// Browse fonts at https://fonts.google.com
```

Also update `tailwind.config.ts` fontFamily section.

### Add Alert Sounds
1. Download MP3 files from https://freesound.org or https://mixkit.co
2. Place them in `public/sounds/` as `bell1.mp3`, `bell2.mp3`, `bell3.mp3`
3. Or in Admin Settings, paste any public MP3 URL

### Change Delivery Map Center
Edit `components/checkout/LocationPicker.tsx`:
```typescript
// !! CHANGE THESE to your city's coordinates !!
const DEFAULT_LAT = 40.7128;   // New York
const DEFAULT_LNG = -74.0060;
```

Find coordinates at: https://www.latlong.net/

---

## How to Make Someone an Admin

Run this SQL in your Supabase SQL Editor:
```sql
-- Replace with the actual email address
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@yourrestaurant.com';
```

Then the admin can log in and visit `/admin` to access the dashboard.

---

## Step 6: Deploy to Vercel

### 6a. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### 6b. Deploy on Vercel
1. Go to https://vercel.com and sign in
2. Click **"Add New → Project"**
3. Import your GitHub repository
4. Vercel auto-detects Next.js - no build config needed
5. **Add Environment Variables** (click "Environment Variables"):
   ```
   NEXT_PUBLIC_SUPABASE_URL         = your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY    = your_anon_key
   SUPABASE_SERVICE_ROLE_KEY        = your_service_role_key
   NEXT_PUBLIC_APP_URL              = https://your-app.vercel.app
   NEXT_PUBLIC_RESTAURANT_NAME      = Your Restaurant Name
   ```
6. Click **"Deploy"**

### 6c. Update Supabase Auth Redirect URLs
After deployment, update your Google OAuth redirect URL:
1. Supabase Dashboard → Authentication → URL Configuration
2. Add to **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
4. Also update in Google Cloud Console's OAuth credentials

---

## Troubleshooting

### "Map not loading" / Leaflet error
- The map uses dynamic import with `ssr: false`. Make sure you're using the `LocationPicker` through the dynamic import in checkout/page.tsx.
- Run `npm install leaflet react-leaflet @types/leaflet` if packages are missing.

### "Audio not playing" in admin
- Browsers block autoplay until the user interacts with the page.
- Click anywhere on the admin page first, then new orders will trigger audio.
- Check that `public/sounds/bell1.mp3` exists.

### "RLS policy error" / Can't read data
- Make sure you ran the full `supabase/schema.sql` file.
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.

### "User not redirected after Google login"
- Check that your redirect URL in Google Cloud Console matches exactly:
  `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
- Make sure `NEXT_PUBLIC_APP_URL` is set correctly.

### Orders not appearing in admin in real-time
- Check that you ran `ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;` from the schema file.
- In Supabase dashboard → Database → Replication, confirm `orders` table is enabled.

### Can't access /admin
- Make sure you made your user an admin in the database:
  ```sql
  UPDATE public.profiles SET role = 'admin' WHERE email = 'you@example.com';
  ```
- Sign out and sign back in for the change to take effect.

---

## Tech Stack Details

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 14.x | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Supabase | 2.x | Auth, Database, Realtime, Storage |
| Tailwind CSS | 3.x | Utility-first styling |
| Framer Motion | 11.x | Animations |
| Zustand | 4.x | Cart state management |
| Leaflet | 1.9 | Interactive map |
| Sonner | 1.x | Toast notifications |
| date-fns | 3.x | Date formatting |

---

Made with ❤️ — Ready to serve 🍽️

// ============================================================
// ROOT LAYOUT
// ============================================================
// This is the top-level layout for the ENTIRE application.
// It wraps every single page in the app.
//
// What it does:
// 1. Sets up Google Fonts (Playfair Display + DM Sans)
// 2. Wraps everything in necessary providers
// 3. Sets up the Sonner toast notification system
// 4. Configures metadata (browser tab title, description, etc.)
//
// HOW TO CHANGE THE FONT:
// 1. Update the import below (pick from https://fonts.google.com)
// 2. Update the variable names
// 3. Update tailwind.config.ts fontFamily to match
// ============================================================

import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { CartProvider } from '@/components/providers/CartProvider';

// ============================================================
// FONTS
// !! CHANGE THESE to your preferred fonts !!
// Browse fonts at: https://fonts.google.com
// ============================================================

// Display font - used for headings and the restaurant name
// Playfair Display gives an elegant, upscale food brand feel
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',     // CSS variable name (used in Tailwind)
  display: 'swap',                // Prevents layout shift while font loads
  weight: ['400', '500', '600', '700', '800'],
});

// Body font - used for all body text, buttons, labels
// DM Sans is clean, modern, and highly readable
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

// ============================================================
// PAGE METADATA
// !! CHANGE THESE !! to your restaurant's details
// This controls what appears in the browser tab and
// in search engine results / social media previews
// ============================================================
export const metadata: Metadata = {
  // !! CHANGE THIS !! - Restaurant name in browser tab
  title: {
    default: 'RESTAURANT_NAME_HERE',  // Default page title
    template: '%s | RESTAURANT_NAME_HERE',  // Pattern for sub-pages
  },
  
  // !! CHANGE THIS !! - Short description of your restaurant
  description: 'Fresh, delicious food delivered to your door. Order online for fast delivery.',
  
  // Favicon - place your favicon.ico in the /public folder
  icons: {
    icon: '/favicon.ico',
  },
  
  // Open Graph - controls how your site looks when shared on social media
  openGraph: {
    type: 'website',
    siteName: 'RESTAURANT_NAME_HERE',  // !! CHANGE THIS !!
    title: 'RESTAURANT_NAME_HERE - Order Online',  // !! CHANGE THIS !!
    description: 'Fresh, delicious food delivered to your door.',  // !! CHANGE THIS !!
  },
};

/**
 * Root Layout Component
 * 
 * Every page in the app is rendered inside this component.
 * The {children} is replaced with the actual page content.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfairDisplay.variable} ${dmSans.variable} font-sans bg-background antialiased`}>
        
        {/* CartProvider makes the cart state available to all components */}
        <CartProvider>
          
          {/* Main content area */}
          {children}
          
          {/* 
            Sonner Toast Notifications
            These are the pop-up notifications for:
            - "Item added to cart" 
            - "Order placed successfully"
            - Error messages
            
            HOW TO CHANGE TOAST POSITION:
            Change position="bottom-right" to:
            "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
          */}
          <Toaster 
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans)',
              },
            }}
          />
          
        </CartProvider>
        
      </body>
    </html>
  );
}

import type { Config } from 'tailwindcss'

// ============================================================
// TAILWIND CSS CONFIGURATION
// ============================================================
// This defines the design system for the entire application.
// 
// HOW TO CUSTOMIZE:
// - colors: Change the primary color to match your brand
//   The current scheme uses warm amber/orange for a food brand
// - fonts: Change 'Playfair Display' and 'DM Sans' to your preferred fonts
//   (also update the Google Fonts link in app/layout.tsx)
// - borderRadius: Adjust for more/less rounded corners
// ============================================================

const config: Config = {
  // darkMode: Tell Tailwind to toggle dark mode using a CSS class
  darkMode: ["class"],
  
  // content: All files that contain Tailwind classes (for tree-shaking)
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ============================================================
      // BRAND COLOR PALETTE
      // !! CHANGE THESE to match your restaurant's brand colors !!
      // Use https://uicolors.app/create to generate a palette
      // ============================================================
      colors: {
        // Primary brand color - warm amber/orange for food brand feel
        // Replace these hex values with your brand color
        primary: {
          50:  '#fff8ed',
          100: '#ffefd5',
          200: '#fddcaa',
          300: '#fcc274',
          400: '#f99e3b',
          500: '#f77f17',  // !! MAIN BRAND COLOR - CHANGE THIS !!
          600: '#e86209',
          700: '#c14b09',
          800: '#9a3b10',
          900: '#7c3210',
          950: '#431706',
          DEFAULT: '#f77f17', // This is what 'bg-primary' uses
        },
        
        // Neutral/background colors - warm off-white feel
        background: {
          DEFAULT: '#fdf9f5',  // Page background - warm white
          dark: '#1a1208',     // Dark mode background
        },
        
        // Surface colors for cards, modals
        surface: {
          DEFAULT: '#ffffff',
          warm: '#fef3e2',     // Warm tinted surface
        },
        
        // Text colors
        foreground: {
          DEFAULT: '#1c1209',  // Primary text
          muted: '#6b5c4c',    // Muted/secondary text
        },
        
        // Status colors for order states
        status: {
          pending:    '#f59e0b',   // Amber - waiting
          accepted:   '#3b82f6',   // Blue - accepted
          preparing:  '#8b5cf6',   // Purple - being made
          ready:      '#10b981',   // Green - ready
          completed:  '#6b7280',   // Gray - done
          cancelled:  '#ef4444',   // Red - cancelled
        },
        
        // shadcn/ui required color tokens (do not rename these)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
      },
      
      // ============================================================
      // TYPOGRAPHY
      // !! CHANGE THESE to your preferred fonts !!
      // Remember to also update the Google Fonts link in app/layout.tsx
      // ============================================================
      fontFamily: {
        // Display/heading font - elegant serif for food brand
        display: ['Playfair Display', 'Georgia', 'serif'],
        
        // Body font - clean, readable sans-serif
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        
        // Monospace for prices/numbers
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      // Border radius tokens
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      
      // Custom animations for cart and UI interactions
      keyframes: {
        // Slide up and fade in (used for toasts, modals)
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        // Wiggle animation used when item is added to cart
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        // Pop animation for cart badge
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)' },
        },
        // Shimmer animation for skeleton loading states
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Pulse ring for notification bell
        'ping-slow': {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        wiggle: 'wiggle 0.3s ease-in-out',
        pop: 'pop 0.3s ease-in-out',
        shimmer: 'shimmer 1.5s infinite linear',
        'ping-slow': 'ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      
      // Box shadow presets
      boxShadow: {
        'warm': '0 4px 24px rgba(247, 127, 23, 0.15)',
        'warm-lg': '0 8px 40px rgba(247, 127, 23, 0.2)',
        'card': '0 2px 16px rgba(28, 18, 9, 0.08)',
        'card-hover': '0 8px 32px rgba(28, 18, 9, 0.12)',
      },
    },
  },
  
  plugins: [
    require("tailwindcss-animate"),
  ],
}

export default config

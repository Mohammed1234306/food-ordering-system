/** @type {import('next').NextConfig} */

// ============================================================
// NEXT.JS CONFIGURATION
// ============================================================
// This configures the Next.js build system.
// - images.remotePatterns: Allows loading images from external URLs
//   (Supabase storage, placeholder services, etc.)
// - Add your own image domains here as needed
// ============================================================

const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Allow images from your Supabase storage bucket
        // Replace 'your-project-id' with your actual Supabase project ID
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Allow placeholder images from picsum.photos (for development)
        // Remove this in production if you don't need it
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Allow placeholder images 
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  
  // Enable React strict mode for better development warnings
  reactStrictMode: true,
  
  // Webpack configuration for Leaflet maps
  // Leaflet requires special handling in Next.js due to SSR
  webpack: (config) => {
    // This prevents Leaflet from breaking during server-side rendering
    config.resolve.fallback = { 
      ...config.resolve.fallback, 
      fs: false 
    };
    return config;
  },
};

module.exports = nextConfig;

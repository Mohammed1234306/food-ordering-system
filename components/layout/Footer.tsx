'use client';
// ============================================================
// FOOTER COMPONENT
// ============================================================
// Site footer shown on all customer-facing pages.
// Shows restaurant info, links, and social media.
//
// HOW TO CUSTOMIZE:
// - Change RESTAURANT_NAME to your actual name
// - Update the address, phone, email
// - Add/remove footer links
// - Update social media URLs
// ============================================================

import Link from 'next/link';
import { ChefHat, MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

const RESTAURANT_NAME = process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'RESTAURANT_NAME_HERE';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-foreground text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl">
                {RESTAURANT_NAME}
              </span>
            </div>
            {/* !! CHANGE THIS !! - Your tagline */}
            <p className="text-white/60 text-sm leading-relaxed">
              Fresh, delicious food crafted with care and delivered straight to your door.
            </p>
            
            {/* Social links */}
            <div className="flex gap-3 mt-6">
              {/* !! CHANGE THE HREF VALUES !! to your social media URLs */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/10 hover:bg-primary-500 rounded-lg flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'Home' },
                { href: '/menu', label: 'Our Menu' },
                { href: '/orders', label: 'My Orders' },
                { href: '/auth/login', label: 'Sign In' },
              ].map(link => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-widest text-white/40 mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              {/* !! CHANGE THESE !! to your actual contact details */}
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                <span>123 Food Street, City, Country</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+12345678900" className="hover:text-white transition-colors">
                  +1 234 567 8900
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:hello@restaurant.com" className="hover:text-white transition-colors">
                  hello@restaurant.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="py-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <span>© {currentYear} {RESTAURANT_NAME}. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

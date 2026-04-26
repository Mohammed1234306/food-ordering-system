'use client';
// ============================================================
// NAVBAR COMPONENT
// ============================================================
// The main navigation bar shown on all customer-facing pages.
//
// Features:
// - Restaurant name/logo on the left
// - Navigation links in the center
// - Cart button with item count badge
// - User avatar/login button on the right
// - Scrolled state (becomes opaque with shadow when scrolled)
// - Mobile responsive (hamburger menu on small screens)
// ============================================================

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X, User, LogOut, ChefHat } from 'lucide-react';
import { useCartStore } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';
import { toast } from 'sonner';

// !! CHANGE THIS !! - Your restaurant name
const RESTAURANT_NAME = process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'RESTAURANT_NAME_HERE';

// Navigation links shown in the header
// Add/remove links here to customize navigation
const NAV_LINKS = [
  { href: '/',       label: 'Home'    },
  { href: '/menu',   label: 'Menu'    },
  { href: '/orders', label: 'Orders'  },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, profile, signOut, isAdmin } = useAuth();
  const itemCount = useCartStore(state => state.getItemCount());
  const setIsOpen = useCartStore(state => state.setIsOpen);
  
  // Track if user has scrolled down (for navbar appearance)
  const [isScrolled, setIsScrolled] = useState(false);
  // Mobile menu open/close state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // User dropdown open/close
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Listen to scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    setIsUserMenuOpen(false);
  };

  return (
    <>
      {/* Main navbar */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled || isMobileMenuOpen
            ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-border'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* ---- LOGO / RESTAURANT NAME ---- */}
            <Link
              href="/"
              className="flex items-center gap-2.5 flex-shrink-0 group"
            >
              {/* Icon */}
              <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-warm group-hover:shadow-warm-lg transition-shadow">
                <ChefHat className="w-5 h-5 text-white" />
              </div>
              
              {/* Restaurant name */}
              {/* !! CHANGE THE CLASS FONT/SIZE BELOW !! */}
              <span className="font-display font-bold text-xl text-foreground tracking-tight">
                {RESTAURANT_NAME}
              </span>
            </Link>

            {/* ---- DESKTOP NAVIGATION LINKS ---- */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150',
                    pathname === link.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-foreground/70 hover:text-foreground hover:bg-secondary'
                  )}
                >
                  {link.label}
                  {/* Active indicator dot */}
                  {pathname === link.href && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"
                    />
                  )}
                </Link>
              ))}
            </nav>

            {/* ---- RIGHT SIDE ACTIONS ---- */}
            <div className="flex items-center gap-2">

              {/* Cart button with item count badge */}
              <motion.button
                onClick={() => setIsOpen(true)}
                className="relative p-2.5 rounded-xl hover:bg-secondary transition-colors"
                whileTap={{ scale: 0.93 }}
                aria-label={`Cart with ${itemCount} items`}
              >
                <ShoppingCart className="w-5 h-5 text-foreground/70" />
                
                {/* Item count badge - only shown when cart has items */}
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key={itemCount}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-primary-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* User Menu (desktop) */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary transition-colors"
                  >
                    {/* Avatar */}
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || 'Avatar'}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 text-xs font-bold">
                          {getInitials(profile?.full_name || user.email || "")}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* User dropdown menu */}
                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <>
                        {/* Backdrop to close dropdown */}
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-card-hover border border-border z-20 overflow-hidden"
                        >
                          {/* User info header */}
                          <div className="px-4 py-3 border-b border-border">
                            <p className="font-medium text-sm text-foreground truncate">
                              {profile?.full_name || 'Welcome!'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                          </div>
                          
                          {/* Menu items */}
                          <div className="p-2">
                            {isAdmin && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm text-foreground"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <ChefHat className="w-4 h-4 text-primary-500" />
                                Admin Dashboard
                              </Link>
                            )}
                            
                            <Link
                              href="/orders"
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm text-foreground"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User className="w-4 h-4 text-muted-foreground" />
                              My Orders
                            </Link>
                            
                            <button
                              onClick={handleSignOut}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-sm text-red-600"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                // Login button (desktop)
                <Link
                  href="/auth/login"
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-semibold transition-all hover:shadow-warm"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile hamburger menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-secondary transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ---- MOBILE MENU ---- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border bg-white overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-colors',
                      pathname === link.href
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-foreground hover:bg-secondary'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile user section */}
                <div className="pt-2 border-t border-border mt-2">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-muted-foreground">
                        {profile?.full_name || user.email}
                      </div>
                      {isAdmin && (
                        <Link href="/admin" className="flex items-center px-4 py-3 rounded-xl font-medium text-sm text-foreground hover:bg-secondary">
                          <ChefHat className="w-4 h-4 mr-2 text-primary-500" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center px-4 py-3 rounded-xl font-medium text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-xl font-semibold text-sm"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16 md:h-20" />
    </>
  );
}

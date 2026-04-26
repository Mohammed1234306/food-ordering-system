'use client';
// ============================================================
// ADMIN SIDEBAR COMPONENT
// ============================================================
// The left sidebar navigation for the admin dashboard.
// Dark themed to contrast with the main content area.
// Responsive: collapses to a bottom bar on mobile.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Settings,
  LogOut,
  ChefHat,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { cn, getInitials } from '@/lib/utils';
import type { Profile } from '@/types';

// !! CHANGE THESE to add/remove admin navigation items !!
const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
    exact: true,   // Only highlight when exactly on this path
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: ClipboardList,
    exact: false,
  },
  {
    href: '/admin/menu',
    label: 'Menu Management',
    icon: UtensilsCrossed,
    exact: false,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    exact: false,
  },
];

interface AdminSidebarProps {
  profile: Profile;
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      {/* Logo/Brand */}
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-500 rounded-xl flex items-center justify-center shadow-warm">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-sm leading-tight">
              Admin Panel
            </p>
            {/* !! CHANGE THIS !! to your restaurant name */}
            <p className="text-white/40 text-xs">
              {process.env.NEXT_PUBLIC_RESTAURANT_NAME || 'RESTAURANT_NAME_HERE'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto admin-sidebar">
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary-500 text-white shadow-warm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {item.label}

              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="admin-active"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.full_name || ''}
              className="w-8 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <span className="text-primary-400 text-xs font-bold">
                {getInitials(profile.full_name)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {profile.full_name || 'Admin'}
            </p>
            <p className="text-white/40 text-xs truncate">{profile.email}</p>
          </div>
        </div>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ---- DESKTOP SIDEBAR (fixed, always visible on md+) ---- */}
      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-white/10 z-40 flex-col">
        <SidebarContent />
      </div>

      {/* ---- MOBILE: Hamburger button ---- */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-gray-900 rounded-xl text-white shadow-lg"
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ---- MOBILE: Slide-in drawer ---- */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/60 z-50"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-gray-900 z-50"
            >
              <button
                onClick={() => setIsMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-white/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// ADMIN LAYOUT
// ============================================================
// The wrapper layout for all /admin/* pages.
// Provides:
// - Sidebar navigation with links to admin sections
// - Header with restaurant name and user info
// - Auth protection (redirects if not admin)
//
// This is a Server Component that fetches the current user
// and verifies admin role before rendering.
// ============================================================

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import type { Profile } from '@/types';

export const metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // Verify the user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login?redirectTo=/admin');
  }

  // Verify the user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    // Not an admin - redirect to home with a message
    redirect('/?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <AdminSidebar profile={profile as Profile} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-64">
        {/* Children = actual admin page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

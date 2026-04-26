// ============================================================
// ADMIN LAYOUT (MODIFIED FOR FORCE ACCESS)
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

  // 1. التحقق من تسجيل الدخول
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/login?redirectTo=/admin');
  }

  // 2. التحقق من صلاحيات الأدمن
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // --- تعديل القوة الضاربة لمحمد علي ---
  const isMyEmail = user.email === 'mohammed.ali.pro.tech@gmail.com';
  const isAdminRole = profile && profile.role === 'admin';

  // لو مش إيميلك الشخصي وموش أدمن في قاعدة البيانات، اطرده بره
  if (!isMyEmail && !isAdminRole) {
    redirect('/?error=unauthorized');
  }
  // -----------------------------------

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <AdminSidebar profile={(profile || { full_name: user.email, role: 'admin' }) as Profile} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-64">
        {/* Children = actual admin page content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
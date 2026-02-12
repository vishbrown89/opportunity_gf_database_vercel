'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAdminAuthenticated, clearAdminSession, getAdminSession } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Plus, List, Link as LinkIcon, LogOut } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/admin/login');
    } else {
      setAdminEmail(getAdminSession());
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}

    clearAdminSession();
    router.push('/admin/login');
  };

  if (!isAdminAuthenticated()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex-shrink-0">
                <img
                  src="https://growthforum.my/wp-content/uploads/2025/04/GROWTH-FORUM-Logo-Latest-3.png"
                  alt="Growth Forum"
                  className="h-10 w-auto"
                />
              </Link>

              <div className="flex space-x-4">
                <Link href="/admin">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>

                <Link href="/admin/opportunities">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <List className="w-4 h-4" />
                    Manage
                  </Button>
                </Link>

                <Link href="/admin/add">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add New
                  </Button>
                </Link>

                <Link href="/admin/import-url">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Import
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">{adminEmail}</span>
              <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

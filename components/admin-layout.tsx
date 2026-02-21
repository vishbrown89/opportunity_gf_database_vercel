'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Plus, List, Link as LinkIcon, LogOut, ClipboardCheck } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch('/api/admin/session', { credentials: 'include', cache: 'no-store' });
        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data?.authenticated) {
          router.push('/admin/login');
          return;
        }

        setAdminEmail(data?.email || null);
      } catch {
        router.push('/admin/login');
      } finally {
        setChecking(false);
      }
    };

    verify();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {}

    router.push('/admin/login');
  };

  if (checking) {
    return <div className="min-h-screen bg-slate-50" />;
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

                <Link href="/admin/drafts">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4" />
                    Drafts
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  );
}

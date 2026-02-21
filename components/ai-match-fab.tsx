'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function AiMatchFab() {
  const pathname = usePathname();

  if (pathname === '/ai-match') {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <Link
        href="/ai-match"
        className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-[linear-gradient(135deg,#0f172a_0%,#0e7490_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_44px_-26px_rgba(8,47,73,0.85)] transition-transform hover:-translate-y-0.5"
      >
        <Sparkles className="h-4 w-4" />
        AI Match
      </Link>
    </div>
  );
}

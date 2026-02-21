'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, Sparkles, X } from 'lucide-react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMobile = () => setMobileMenuOpen(false);

  const linkClass =
    'rounded-lg px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-800';

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-slate-200 bg-white/95 shadow-sm backdrop-blur-md'
          : 'border-slate-200/60 bg-white/90 backdrop-blur-md'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex-shrink-0" onClick={closeMobile}>
            <img
              src="https://growthforum.my/wp-content/uploads/2025/04/GROWTH-FORUM-Logo-Latest-3.png"
              alt="Growth Forum"
              className="h-11 w-auto transition-transform hover:scale-[1.02]"
            />
          </Link>

          <div className="hidden items-center space-x-1 lg:flex">
            <Link href="/opportunities" className={linkClass}>
              Opportunities
            </Link>

            <Link href="/saved" className={linkClass}>
              Saved
            </Link>

            <Link
              href="/ai-match"
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50/70 px-4 py-2 font-semibold text-cyan-900 transition-colors hover:bg-cyan-100"
            >
              <Sparkles className="h-4 w-4" />
              AI Match
            </Link>

            <a href="https://growthforum.my/newsletter/" className={linkClass} target="_blank" rel="noreferrer">
              Newsletter
            </a>
            <a href="https://growthforum.my/about-us/" className={linkClass} target="_blank" rel="noreferrer">
              About Us
            </a>
            <a href="https://growthforum.my/contact/" className={linkClass} target="_blank" rel="noreferrer">
              Contact
            </a>
          </div>

          <button
            className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/opportunities"
              className="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
              onClick={closeMobile}
            >
              Opportunities
            </Link>

            <Link
              href="/saved"
              className="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
              onClick={closeMobile}
            >
              Saved
            </Link>

            <Link
              href="/ai-match"
              className="block rounded-lg border border-cyan-200 bg-cyan-50/70 px-4 py-3 font-semibold text-cyan-900 hover:bg-cyan-100"
              onClick={closeMobile}
            >
              AI Match
            </Link>

            <a
              href="https://growthforum.my/newsletter/"
              className="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
              target="_blank"
              rel="noreferrer"
              onClick={closeMobile}
            >
              Newsletter
            </a>
            <a
              href="https://growthforum.my/about-us/"
              className="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
              target="_blank"
              rel="noreferrer"
              onClick={closeMobile}
            >
              About Us
            </a>
            <a
              href="https://growthforum.my/contact/"
              className="block rounded-lg px-4 py-3 font-medium text-slate-700 hover:bg-cyan-50 hover:text-cyan-800"
              target="_blank"
              rel="noreferrer"
              onClick={closeMobile}
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

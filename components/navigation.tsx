'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';

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
    'px-4 py-2 text-slate-700 hover:text-cyan-800 hover:bg-cyan-50 font-medium transition-colors rounded-lg';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-slate-200'
          : 'bg-white/90 backdrop-blur-md border-slate-200/60'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex-shrink-0" onClick={closeMobile}>
            <img
              src="https://growthforum.my/wp-content/uploads/2025/04/GROWTH-FORUM-Logo-Latest-3.png"
              alt="Growth Forum"
              className="h-11 w-auto transition-transform hover:scale-[1.02]"
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            <Link href="/opportunities" className={linkClass}>
              Opportunities
            </Link>

            <Link href="/saved" className={linkClass}>
              Saved
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
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200">
          <div className="px-4 py-3 space-y-1">
            <Link href="/opportunities" className="block px-4 py-3 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 rounded-lg font-medium" onClick={closeMobile}>
              Opportunities
            </Link>

            <Link href="/saved" className="block px-4 py-3 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 rounded-lg font-medium" onClick={closeMobile}>
              Saved
            </Link>

            <a href="https://growthforum.my/newsletter/" className="block px-4 py-3 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 rounded-lg font-medium" target="_blank" rel="noreferrer" onClick={closeMobile}>
              Newsletter
            </a>
            <a href="https://growthforum.my/about-us/" className="block px-4 py-3 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 rounded-lg font-medium" target="_blank" rel="noreferrer" onClick={closeMobile}>
              About Us
            </a>
            <a href="https://growthforum.my/contact/" className="block px-4 py-3 text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 rounded-lg font-medium" target="_blank" rel="noreferrer" onClick={closeMobile}>
              Contact
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

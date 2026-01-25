import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SavedSubscribe from '@/components/saved-subscribe';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Growth Forum Opportunities Directory',
  description: 'A curated hub for grants, scholarships, fellowships, jobs and programmes that support your growth.',
  icons: {
    icon: 'https://growthforum.my/wp-content/uploads/2025/04/GROWTH-FORUM-Logo-Latest-3.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SavedSubscribe />
      </body>
    </html>
  );
}

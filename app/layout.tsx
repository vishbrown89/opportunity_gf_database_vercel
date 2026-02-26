import './globals.css';
import type { Metadata } from 'next';
import { Manrope, Source_Serif_4 } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

import AiMatchFab from '@/components/ai-match-fab';
import SavedSubscribe from '@/components/saved-subscribe';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans' });
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Growth Forum Opportunities Platform',
  description:
    'A curated platform for grants, scholarships, fellowships, jobs, and programmes that support your growth.',
  icons: {
    icon: 'https://growthforum.my/wp-content/uploads/2025/04/GROWTH-FORUM-Logo-Latest-3.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${sourceSerif.variable}`}>
        {children}
        <AiMatchFab />
        <SavedSubscribe />
        <SpeedInsights />
      </body>
    </html>
  );
}

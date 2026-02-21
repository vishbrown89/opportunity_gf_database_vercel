import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import HomeClient from '@/components/home-client';
import { supabase, CATEGORIES } from '@/lib/supabase';
import { getOpportunityStatus } from '@/lib/opportunity-utils';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: allOpportunities } = await supabase
    .from('opportunities')
    .select('*')
    .order('date_added', { ascending: false });

  const activeOpportunities =
    allOpportunities?.filter((opp) => getOpportunityStatus(opp.deadline) === 'Active') || [];

  const featuredOpportunities = activeOpportunities.filter((opp) => opp.featured).slice(0, 6);

  const latestOpportunities = activeOpportunities.slice(0, 12);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="pt-20">
        <HomeClient
          featuredOpportunities={featuredOpportunities}
          latestOpportunities={latestOpportunities}
          activeOpportunities={activeOpportunities}
          categories={CATEGORIES}
        />
      </main>

      <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="text-sm leading-relaxed text-slate-700">
              <span className="font-semibold text-slate-900">Disclaimer:</span> Listings are compiled
              from publicly available sources or submitted to Growth Forum for visibility. Growth
              Forum does not represent funders and does not guarantee accuracy, availability,
              deadlines, or outcomes. Always verify details on the official provider website before
              applying. Please use caution when sharing personal, financial, or identity information.
              If you notice an issue or suspect a listing is unsafe, report it to us.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

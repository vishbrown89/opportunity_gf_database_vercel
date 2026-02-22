'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, ExternalLink, MapPin, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Opportunity } from '@/lib/supabase';
import AiMatchForm from '@/components/ai-match-form';

interface HomeClientProps {
  featuredOpportunities: Opportunity[];
  latestOpportunities: Opportunity[];
  activeOpportunities: Opportunity[];
  categories: readonly string[];
}

export default function HomeClient({
  featuredOpportunities,
  latestOpportunities,
  activeOpportunities,
}: HomeClientProps) {
  const featuredPool = featuredOpportunities.slice(0, 6);
  const latestPool = latestOpportunities.filter((opp) => !featuredPool.some((f) => f.id === opp.id));
  const displayOpportunities = [...featuredPool, ...latestPool].slice(0, 6);

  return (
    <>
      <section className="border-b border-slate-200 bg-[#f8fafc] py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-42px_rgba(15,23,42,0.65)]">
            <div className="grid gap-0 lg:grid-cols-[1.18fr_0.82fr]">
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-700">
                  Global Opportunity Advisory
                </div>

                <h1 className="mt-5 text-[2.4rem] font-semibold leading-[1.02] text-slate-900 sm:text-[2.9rem] lg:text-[3.35rem]">
                  Global Opportunity Intelligence
                  <span className="block text-slate-700">for Decision-Makers</span>
                </h1>

                <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
                  Curated opportunities for institutions, professionals, and growth leaders. Evaluate grants, fellowships,
                  scholarships, and strategic programmes with greater clarity and execution speed.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link href="/opportunities" className="w-full sm:w-auto">
                    <Button className="h-12 w-full min-w-[220px] rounded-lg bg-slate-900 px-7 text-base font-semibold text-white transition-colors hover:bg-slate-800">
                      Browse Opportunities
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 w-full min-w-[220px] rounded-lg border-slate-300 bg-white px-7 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-100 sm:w-auto"
                      >
                        <Sparkles className="mr-2 h-4 w-4 text-slate-700" />
                        AI Match Concierge
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[92vh] overflow-y-auto border-slate-200 sm:max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold text-slate-900">AI Match Concierge</DialogTitle>
                      </DialogHeader>
                      <AiMatchForm variant="page" sourcePage="home-modal" />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Link
                    href="/listing"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                  >
                    List Your Opportunity
                  </Link>

                  <a
                    href="https://growthforum.my"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100"
                  >
                    Growth Forum Main Page
                  </a>

                  <a
                    href="https://growthforum.my/newsletter/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 sm:col-span-2 xl:col-span-1"
                  >
                    Be Part of the Community
                  </a>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Why Leaders Use This Platform</div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xl font-semibold text-slate-900">Quality-Curated</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Listings are structured for fast scanning and practical decision making.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xl font-semibold text-slate-900">Global Coverage</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Opportunities across regions and categories relevant to high-impact teams.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xl font-semibold text-slate-900">Execution Focused</div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Built for quick shortlisting, team sharing, and application follow-through.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Latest Opportunities</h2>
              <p className="mt-2 text-slate-600">Curated daily for founders, professionals, and high-impact builders.</p>
            </div>
            <Link href="/opportunities">
              <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayOpportunities.map((opportunity) => (
              <Link key={opportunity.id} href={`/opportunity/${opportunity.slug}`} className="group block">
                <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_52px_-36px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_24px_56px_-34px_rgba(6,95,117,0.4)]">
                  {opportunity.logo_url && (
                    <div className="flex h-40 w-full items-center justify-center bg-[linear-gradient(145deg,#f9fafb_0%,#eef2f7_100%)] p-6">
                      <img
                        src={opportunity.logo_url}
                        alt={opportunity.title}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                        {opportunity.category}
                      </Badge>
                      {opportunity.featured && <Badge className="bg-amber-100 text-amber-800">Featured</Badge>}
                    </div>

                    <h3 className="mb-3 text-xl font-semibold leading-tight text-slate-900 transition-colors group-hover:text-cyan-800">
                      {opportunity.title}
                    </h3>

                    {opportunity.summary && (
                      <p className="mb-4 line-clamp-2 leading-relaxed text-slate-600">{opportunity.summary}</p>
                    )}

                    <div className="flex flex-col gap-2 text-sm text-slate-500">
                      {opportunity.country_or_region && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">{opportunity.country_or_region}</span>
                        </div>
                      )}
                      {opportunity.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 border-t border-slate-200 pt-4">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-800">
                        View Details
                        <ExternalLink className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {activeOpportunities.length > 6 && (
            <div className="mt-10 text-center">
              <Link href="/opportunities">
                <Button size="lg" variant="outline" className="h-12 border-slate-300 px-8 text-base font-semibold text-slate-700 hover:bg-slate-50">
                  Explore All {activeOpportunities.length} Opportunities
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

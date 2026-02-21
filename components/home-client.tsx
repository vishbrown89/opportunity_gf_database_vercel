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
  const spotlight = featuredOpportunities.length > 0 ? featuredOpportunities : latestOpportunities;
  const displayOpportunities = spotlight.slice(0, 6);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[radial-gradient(circle_at_12%_0%,rgba(8,145,178,0.16),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(15,23,42,0.06),transparent_38%),linear-gradient(180deg,#f7fbff_0%,#f8fafc_100%)] py-10 md:py-14">
        <div className="absolute -left-36 top-8 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />
        <div className="absolute -right-32 top-4 h-80 w-80 rounded-full bg-slate-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-[0_20px_60px_-45px_rgba(8,47,73,0.65)] backdrop-blur-xl md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-700" />
                  Premium opportunity discovery
                </div>

                <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-5xl md:leading-[1.07]">
                  Discover High-Quality Opportunities Faster
                </h1>

                <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
                  Explore curated grants, fellowships, scholarships, jobs, and funding calls with a cleaner, faster application workflow.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[290px]">
                <Link href="/opportunities">
                  <Button className="h-11 w-full bg-slate-900 px-6 text-white hover:bg-slate-800">
                    Browse Opportunities
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-11 w-full border-cyan-300 bg-cyan-50/60 px-6 font-semibold text-cyan-900 hover:bg-cyan-100"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Match
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[92vh] overflow-y-auto border-slate-200 sm:max-w-xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-semibold text-slate-900">AI Match Intake</DialogTitle>
                    </DialogHeader>
                    <AiMatchForm variant="page" sourcePage="home-modal" />
                  </DialogContent>
                </Dialog>
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

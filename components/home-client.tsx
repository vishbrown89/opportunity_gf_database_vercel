'use client';

import Link from 'next/link';
import { ArrowRight, Calendar, ExternalLink, MapPin, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const displayOpportunities = spotlight.slice(0, 5);

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-[radial-gradient(circle_at_12%_0%,rgba(8,145,178,0.2),transparent_42%),radial-gradient(circle_at_88%_0%,rgba(15,23,42,0.08),transparent_38%),linear-gradient(180deg,#f7fbff_0%,#f8fafc_100%)] py-16 md:py-24">
        <div className="absolute -left-36 top-16 h-72 w-72 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute -right-32 top-12 h-80 w-80 rounded-full bg-slate-300/25 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">
              <Sparkles className="h-3.5 w-3.5 text-cyan-700" />
              Consultancy-grade discovery engine
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-tight text-slate-900 md:text-6xl md:leading-[1.04]">
              Match Faster With The Right Opportunities
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Provide your LinkedIn profile link for AI-powered matching to the most relevant opportunities and funding options.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 text-sm text-slate-700">
                <Target className="mb-2 h-4 w-4 text-cyan-700" />
                Targeted to your profile
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 text-sm text-slate-700">
                <ShieldCheck className="mb-2 h-4 w-4 text-cyan-700" />
                Consent-based processing
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 text-sm text-slate-700">
                <Sparkles className="mb-2 h-4 w-4 text-cyan-700" />
                Built for high-intent applicants
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/opportunities">
                <Button className="h-12 w-full bg-slate-900 px-7 text-white hover:bg-slate-800 sm:w-auto">
                  Browse Opportunities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/ai-match">
                <Button variant="outline" className="h-12 w-full border-slate-300 px-7 text-slate-700 hover:bg-slate-50 sm:w-auto">
                  Open AI Match Page
                </Button>
              </Link>
            </div>
          </div>

          <AiMatchForm sourcePage="home-hero" variant="hero" />
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
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

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayOpportunities.map((opportunity, index) => (
              <Link
                key={opportunity.id}
                href={`/opportunity/${opportunity.slug}`}
                className={`group block ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <div className="h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_52px_-36px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_24px_56px_-34px_rgba(6,95,117,0.4)]">
                  {opportunity.logo_url && (
                    <div className={`flex w-full items-center justify-center bg-[linear-gradient(145deg,#f9fafb_0%,#eef2f7_100%)] p-6 ${index === 0 ? 'h-64 lg:h-80' : 'h-40'}`}>
                      <img
                        src={opportunity.logo_url}
                        alt={opportunity.title}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className={`p-6 ${index === 0 ? 'lg:p-8' : ''}`}>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                        {opportunity.category}
                      </Badge>
                      {opportunity.featured && <Badge className="bg-amber-100 text-amber-800">Featured</Badge>}
                    </div>

                    <h3 className={`mb-3 font-semibold leading-tight text-slate-900 transition-colors group-hover:text-cyan-800 ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                      {opportunity.title}
                    </h3>

                    {opportunity.summary && (
                      <p className={`mb-4 leading-relaxed text-slate-600 ${index === 0 ? 'line-clamp-4' : 'line-clamp-2'}`}>
                        {opportunity.summary}
                      </p>
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

            <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(170deg,#0f172a_0%,#083344_100%)] p-8 text-white shadow-[0_26px_70px_-40px_rgba(8,47,73,0.8)]">
              <div className="flex h-full flex-col justify-center">
                <h3 className="text-2xl font-semibold leading-tight">Need a tailored shortlist?</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-100">
                  Use AI matching to identify opportunities aligned to your profile and save review time.
                </p>
                <div className="mt-6">
                  <Link href="/ai-match">
                    <Button className="h-11 bg-white px-5 text-slate-900 hover:bg-slate-100">
                      Start AI Matching
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {activeOpportunities.length > 6 && (
            <div className="mt-12 text-center">
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

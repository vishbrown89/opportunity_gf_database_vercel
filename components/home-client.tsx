'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { Opportunity } from '@/lib/supabase';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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
  categories,
}: HomeClientProps) {
  const displayOpportunities = latestOpportunities.slice(0, 5);

  return (
    <>
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
              Discover Your Next
              <span className="text-blue-600"> Growth Opportunity</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl">
              Explore curated grants, scholarships, fellowships, jobs, and programs designed to accelerate your personal and professional growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/opportunities">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all">
                  Browse Opportunities
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link href="/listing">
  <Button
    size="lg"
    variant="outline"
    className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 h-12 text-base font-semibold"
  >
    List your opportunity
  </Button>
</Link>

              <a href="https://growthforum.my/newsletter/">
  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 h-12 text-base font-semibold">
    Subscribe to Updates
  </Button>
</a>
<a href="https://growthforum.my/">
  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 h-12 text-base font-semibold">
    Growth Forum main page
  </Button>
</a>

            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Latest Opportunities</h2>
              <p className="text-slate-600">Hand-picked opportunities updated regularly</p>
            </div>
            <Link href="/opportunities">
              <Button variant="outline" className="border-2 hover:bg-slate-50">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayOpportunities.map((opportunity, index) => (
              <Link
                key={opportunity.id}
                href={`/opportunity/${opportunity.slug}`}
                className={`group block ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
              >
                <div className="h-full bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {opportunity.logo_url && (
                    <div className={`w-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6 ${index === 0 ? 'h-64 lg:h-80' : 'h-40'}`}>
                      <img
                        src={opportunity.logo_url}
                        alt={opportunity.title}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className={`p-6 ${index === 0 ? 'lg:p-8' : ''}`}>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-medium">
                        {opportunity.category}
                      </Badge>
                      {opportunity.featured && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-medium">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <h3 className={`font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                      {opportunity.title}
                    </h3>

                    {opportunity.summary && (
                      <p className={`text-slate-600 mb-4 leading-relaxed ${index === 0 ? 'line-clamp-4' : 'line-clamp-2'}`}>
                        {opportunity.summary}
                      </p>
                    )}

                    <div className="flex flex-col gap-2 text-sm text-slate-500">
                      {opportunity.country_or_region && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">{opportunity.country_or_region}</span>
                        </div>
                      )}
                      {opportunity.deadline && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <span className="text-blue-600 font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                        View Details
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            <div className="group bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-all">
              <div className="h-full flex flex-col justify-center">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                  Never Miss an Opportunity
                </h3>
                <p className="text-blue-50 mb-6 leading-relaxed">
                  Get the latest opportunities delivered to your inbox every week
                </p>
                <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); window.open('https://growthforum.my/newsletter/', '_blank'); }}>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 h-12 flex-1 focus:bg-white/20 transition-colors"
                  />
                  <Button
                    type="submit"
                    className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-6 font-semibold shadow-md"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </div>
          </div>

          {activeOpportunities.length > 6 && (
            <div className="text-center mt-12">
              <Link href="/opportunities">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 px-8 h-12 text-base font-semibold"
                >
                  Explore All {activeOpportunities.length} Opportunities
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

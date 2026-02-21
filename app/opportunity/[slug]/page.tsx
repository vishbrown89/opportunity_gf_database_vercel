import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import OpportunityCard from '@/components/opportunity-card';
import OpportunityLogo from '@/components/opportunity-logo';
import ShareButtons from '@/components/share-buttons';
import MobileOpportunityActions from '@/components/mobile-opportunity-actions';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { supabase } from '@/lib/supabase';
import { getOpportunityStatus, formatDeadline, isDeadlineSoon } from '@/lib/opportunity-utils';

import { Calendar, MapPin, ExternalLink, Tag, Clock } from 'lucide-react';
import { GetReminderButton } from '@/components/saved-subscribe';

export const dynamic = 'force-dynamic';

function safeUrl(raw: any) {
  const v = String(raw || '').trim();
  if (!v) return '';
  if (v.startsWith('//')) return `https:${v}`;
  return v;
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!opportunity) return { title: 'Opportunity Not Found' };

  const title = String(opportunity.title || 'Opportunity');
  const description = String(opportunity.summary || '');
  const ogImage = safeUrl(opportunity.logo_url);

  return {
    title: `${title} | Growth Forum Opportunities`,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function OpportunityDetailPage(
  { params }: { params: { slug: string } }
) {
  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!opportunity) notFound();

  const title = String(opportunity.title || 'Opportunity');
  const status = getOpportunityStatus(opportunity.deadline);
  const deadlineSoon = isDeadlineSoon(opportunity.deadline);

  const officialUrl = safeUrl(opportunity.source_url);

  const { data: relatedOpportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('category', opportunity.category)
    .neq('id', opportunity.id)
    .limit(6);

  const relatedActive =
    (relatedOpportunities || [])
      .filter((opp: any) => getOpportunityStatus(opp.deadline) === 'Active')
      .slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main className="pt-16 pb-28 md:pb-0">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
                  <OpportunityLogo
                    title={title}
                    logoUrl={safeUrl(opportunity.logo_url)}
                    imgClassName="max-w-full max-h-full object-contain"
                    fallbackClassName="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center"
                  />
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                    {opportunity.category}
                  </Badge>

                  <Badge variant={status === 'Active' ? 'default' : 'destructive'}>
                    {status}
                  </Badge>

                  {opportunity.featured ? (
                    <Badge variant="outline" className="border-yellow-400 text-yellow-700">
                      Featured
                    </Badge>
                  ) : null}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {title}
                </h1>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-slate-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{opportunity.country_or_region}</span>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span
                      className={
                        deadlineSoon && status === 'Active'
                          ? 'text-orange-600 font-medium'
                          : 'text-slate-600'
                      }
                    >
                      Deadline: {formatDeadline(opportunity.deadline)}
                    </span>
                  </div>

                  <div className="flex items-center text-slate-600">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>
                      Added {new Date(opportunity.date_added).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {status === 'Active' && officialUrl ? (
                    <a href={officialUrl} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-cyan-700 hover:bg-cyan-800 text-white">
                        Apply on Official Site
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  ) : null}

                  <GetReminderButton slug={String(opportunity.slug)} />
                </div>

                {status === 'Active' && !officialUrl ? (
                  <div className="mt-3 text-sm text-slate-500">
                    Official application link is not available for this listing.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Summary</h2>
                <p className="text-slate-700 leading-relaxed">{opportunity.summary}</p>
              </section>

              {opportunity.full_description ? (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Full Description</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {opportunity.full_description}
                    </p>
                  </div>
                </section>
              ) : null}

              {opportunity.eligibility ? (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Eligibility</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {opportunity.eligibility}
                    </p>
                  </div>
                </section>
              ) : null}

              {opportunity.funding_or_benefits ? (
                <section>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">Funding & Benefits</h2>
                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {opportunity.funding_or_benefits}
                    </p>
                  </div>
                </section>
              ) : null}

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Apply</h2>

                {officialUrl ? (
                  <>
                    <p className="text-slate-700 mb-4">
                      Visit the official website to submit your application:
                    </p>

                    <a href={officialUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        Go to Application Page
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  </>
                ) : (
                  <p className="text-slate-700">
                    Official application link is not available for this listing.
                  </p>
                )}
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>At a Glance</CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Category</p>
                      <p className="text-slate-900">{opportunity.category}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Location</p>
                      <p className="text-slate-900">{opportunity.country_or_region}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Deadline</p>
                      <p
                        className={
                          deadlineSoon && status === 'Active'
                            ? 'text-orange-600 font-medium'
                            : 'text-slate-900'
                        }
                      >
                        {formatDeadline(opportunity.deadline)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
                      <Badge variant={status === 'Active' ? 'default' : 'destructive'}>
                        {status}
                      </Badge>
                    </div>

                    {opportunity.tags && opportunity.tags.length > 0 ? (
                      <div>
                        <p className="text-sm font-medium text-slate-500 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <p className="text-sm font-medium text-slate-500 mb-1">Date Added</p>
                      <p className="text-slate-900">
                        {new Date(opportunity.date_added).toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <ShareButtons title={title} />
              </div>
            </div>
          </div>

          {relatedActive.length > 0 ? (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Opportunities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedActive.map((relatedOpp: any) => (
                  <OpportunityCard key={relatedOpp.id} opportunity={relatedOpp} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />

      <MobileOpportunityActions
        slug={String(opportunity.slug)}
        title={String(opportunity.title)}
        sourceUrl={String(opportunity.source_url || '')}
        isActive={status === 'Active'}
      />
    </div>
  );
}

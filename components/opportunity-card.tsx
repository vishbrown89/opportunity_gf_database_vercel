'use client';

import Link from 'next/link';
import { Opportunity } from '@/lib/supabase';
import { getOpportunityStatus, isDeadlineSoon, formatDeadline } from '@/lib/opportunity-utils';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';
import { SaveLocalButton } from '@/components/save-local';
import { GetReminderButton } from '@/components/saved-subscribe';
import OpportunityLogo from '@/components/opportunity-logo';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const status = getOpportunityStatus(opportunity.deadline);
  const deadlineSoon = isDeadlineSoon(opportunity.deadline);

  return (
    <Link href={`/opportunity/${opportunity.slug}`} className="group h-full block">
      <div className="h-full flex flex-col bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden">
        <div className="relative flex items-center justify-center h-40 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="absolute right-3 top-3 z-10">
            <SaveLocalButton slug={String(opportunity.slug)} />
          </div>

          <OpportunityLogo
            title={String(opportunity.title || 'Opportunity')}
            logoUrl={String(opportunity.logo_url || '')}
            imgClassName="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
            fallbackClassName="w-20 h-20 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center shadow-sm"
          />
        </div>

        <div className="flex-grow p-6 flex flex-col">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 font-medium">
              {opportunity.category}
            </Badge>

            {status === 'Expired' && (
              <Badge variant="destructive" className="font-medium">
                Expired
              </Badge>
            )}

            {opportunity.featured && status === 'Active' && (
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-medium">
                Featured
              </Badge>
            )}
          </div>

          <h3 className="text-xl font-bold text-slate-900 line-clamp-2 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
            {opportunity.title}
          </h3>

          <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-grow">
            {opportunity.summary || ''}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-slate-500">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{opportunity.country_or_region || ''}</span>
            </div>

            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className={deadlineSoon && status === 'Active' ? 'text-orange-600 font-semibold' : 'text-slate-500'}>
                {formatDeadline(opportunity.deadline)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 mt-auto flex items-center justify-between gap-3">
            <span className="text-blue-600 font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
              View Details
              <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>

            <GetReminderButton slug={String(opportunity.slug)} />
          </div>
        </div>
      </div>
    </Link>
  );
}

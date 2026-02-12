import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Opportunity = {
  id: string;
  title: string;
  slug: string;
  category: string;
  country_or_region: string;
  deadline: string;
  summary: string;
  full_description: string | null;
  eligibility: string | null;
  funding_or_benefits: string | null;
  tags: string[];
  source_url: string;
  logo_url: string | null;
  featured: boolean;
  date_added: string;
  created_at: string;
  updated_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
};

export const CATEGORIES = [
  'Award',
  'Challenge',
  'Conference',
  'Fellowship',
  'Grant',
  'Internship',
  'Job',
  'Research Funding',
  'Scholarship',
  'Seminar',
  'Training',
  'Volunteer',
  'Workshop',
] as const;

export type Category = typeof CATEGORIES[number];

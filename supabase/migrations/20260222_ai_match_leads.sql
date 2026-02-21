create table if not exists public.ai_match_leads (
  id bigserial primary key,
  linkedin_url text not null,
  resume_url text,
  processing_consent boolean not null default false,
  newsletter_consent boolean not null default false,
  source_page text,
  profile_data jsonb not null default '{}'::jsonb,
  user_agent text,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists ai_match_leads_created_at_idx
  on public.ai_match_leads (created_at desc);

create index if not exists ai_match_leads_source_page_idx
  on public.ai_match_leads (source_page);

alter table public.ai_match_leads enable row level security;

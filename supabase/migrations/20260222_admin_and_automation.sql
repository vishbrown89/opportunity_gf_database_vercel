create table if not exists public.admin_users (
  id bigserial primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.opportunity_sources (
  id bigserial primary key,
  source_url text not null unique,
  active boolean not null default true,
  priority int not null default 100,
  last_processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_drafts (
  id bigserial primary key,
  source_url text not null,
  title text not null,
  summary text,
  full_description text,
  eligibility text,
  funding_or_benefits text,
  category text,
  country_or_region text,
  deadline date,
  tags jsonb not null default '[]'::jsonb,
  logo_url text,
  status text not null default 'pending',
  extraction_model text,
  extraction_error text,
  approved_by text,
  approved_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists opportunity_drafts_source_url_idx
  on public.opportunity_drafts (source_url);

create index if not exists opportunity_drafts_status_idx
  on public.opportunity_drafts (status, created_at desc);

alter table public.admin_users enable row level security;
alter table public.opportunity_sources enable row level security;
alter table public.opportunity_drafts enable row level security;

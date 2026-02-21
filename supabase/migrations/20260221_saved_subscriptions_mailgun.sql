create table if not exists public.saved_subscriptions (
  id bigserial primary key,
  email text not null,
  saved_slugs jsonb not null default '[]'::jsonb,
  ref_from text,
  is_active boolean not null default true,
  last_reminder_sent_on date,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.saved_subscriptions
  add column if not exists is_active boolean not null default true,
  add column if not exists last_reminder_sent_on date,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists created_at timestamptz not null default now();

create unique index if not exists saved_subscriptions_email_idx
  on public.saved_subscriptions (lower(email));

create index if not exists saved_subscriptions_active_idx
  on public.saved_subscriptions (is_active, last_reminder_sent_on);

alter table public.saved_subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'saved_subscriptions'
      and policyname = 'Allow public insert subscriptions'
  ) then
    create policy "Allow public insert subscriptions"
      on public.saved_subscriptions
      for insert
      to anon, authenticated
      with check (true);
  end if;
end$$;

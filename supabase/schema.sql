-- Tables
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cover_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  storage_path text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.reportings (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

-- Onboarding fields
-- Enum for frequenz / visitor traffic level
do $$ begin
  create type public.traffic_level as enum ('sehr_stark','stark','mittel','schwach','sehr_schwach');
exception when duplicate_object then null; end $$;

-- Add structured columns for reporting questionnaire (kept nullable for backward compatibility)
alter table public.reportings
  add column if not exists promoter_name text,
  add column if not exists work_date date,
  add column if not exists dienstbeginn time,
  add column if not exists frequenz public.traffic_level,
  add column if not exists kontakte_count integer,
  add column if not exists pause boolean,
  add column if not exists pause_minutes smallint,
  add column if not exists leave_time time,
  add column if not exists notes text;

-- Helpful indexes
create index if not exists idx_reportings_event_id on public.reportings(event_id);
create index if not exists idx_reportings_work_date on public.reportings(work_date);

-- Ensure storage bucket `photos` exists and is public
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do update set public = excluded.public;

-- Storage policies must be created by the storage schema owner.
-- Use the Supabase UI (Storage → photos → Policies) to add read/insert policies as needed.

-- Enable RLS
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.reportings enable row level security;

-- Policies (public can read events, insert photos/reportings)
do $$ begin
  create policy read_events on public.events for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy insert_events_public on public.events for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy insert_photos on public.photos for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy insert_reportings on public.reportings for insert with check (true);
exception when duplicate_object then null; end $$;

-- TEMP: allow reading photos/reportings until admin auth is added
do $$ begin
  create policy read_photos_public on public.photos for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy read_reportings_public on public.reportings for select using (true);
exception when duplicate_object then null; end $$;

-- Storage policies intentionally omitted here to avoid ownership errors in SQL editor



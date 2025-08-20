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

-- Enable RLS
alter table public.events enable row level security;
alter table public.photos enable row level security;
alter table public.reportings enable row level security;

-- Policies (public can read events, insert photos/reportings)
do $$ begin
  create policy read_events on public.events for select using (true);
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

-- Storage: bucket `photos` must exist
-- Public can read and insert files in bucket `photos`
do $$ begin
  create policy storage_photos_read on storage.objects
  for select using (bucket_id = 'photos');
exception when duplicate_object then null; end $$;

do $$ begin
  create policy storage_photos_insert on storage.objects
  for insert with check (bucket_id = 'photos');
exception when duplicate_object then null; end $$;



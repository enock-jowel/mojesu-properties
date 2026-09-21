-- Contact + service enquiry lead tables (public insert, staff read/update)
-- Mirrors viewing_bookings / property_submissions RLS pattern.

create table if not exists public.contact_enquiries (
  id uuid primary key default gen_random_uuid(),
  purpose text not null,
  location text not null,
  message text not null,
  name text not null,
  email text not null,
  phone text not null,
  source_path text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'converted', 'closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.service_enquiries (
  id uuid primary key default gen_random_uuid(),
  service_id text,
  service_slug text,
  service_name text not null,
  brief jsonb not null default '{}'::jsonb,
  name text not null,
  email text not null,
  phone text not null,
  source_path text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'won', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists contact_enquiries_created_at_idx
  on public.contact_enquiries (created_at desc);
create index if not exists service_enquiries_created_at_idx
  on public.service_enquiries (created_at desc);

alter table public.contact_enquiries enable row level security;
alter table public.service_enquiries enable row level security;

drop policy if exists "Public can insert contact enquiries" on public.contact_enquiries;
create policy "Public can insert contact enquiries"
  on public.contact_enquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Staff can read contact enquiries" on public.contact_enquiries;
create policy "Staff can read contact enquiries"
  on public.contact_enquiries for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Staff can update contact enquiries" on public.contact_enquiries;
create policy "Staff can update contact enquiries"
  on public.contact_enquiries for update
  to authenticated
  using (public.is_staff());

drop policy if exists "Public can insert service enquiries" on public.service_enquiries;
create policy "Public can insert service enquiries"
  on public.service_enquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Staff can read service enquiries" on public.service_enquiries;
create policy "Staff can read service enquiries"
  on public.service_enquiries for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Staff can update service enquiries" on public.service_enquiries;
create policy "Staff can update service enquiries"
  on public.service_enquiries for update
  to authenticated
  using (public.is_staff());

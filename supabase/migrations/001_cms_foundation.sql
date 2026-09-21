-- Mojesu CMS foundation — profiles, listings, images, bookings, submissions + RLS
-- Run in Supabase SQL editor or via `supabase db push`.

-- Normalize any leftover role enum from partial local boots (role must be text).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
      and udt_name <> 'text'
  ) then
    alter table public.profiles
      alter column role drop default,
      alter column role type text using role::text,
      alter column role set default 'staff';
  end if;

  if exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
             where n.nspname = 'public' and t.typname = 'user_role') then
    drop type public.user_role;
  end if;
exception
  when dependent_objects_still_exist then
    -- Column still depends on the enum; force via text rewrite above first.
    null;
end $$;

-- profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text not null default 'staff' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup (staff created via dashboard / seed)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- listings
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  listing_mode text not null check (listing_mode in ('rent', 'sale')),
  category text not null check (category in ('house', 'apartment', 'land', 'commercial')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),

  title text not null,
  description text,
  area text not null,
  area_tier text check (area_tier in ('prime', 'mid-market', 'emerging')),
  address_internal text,

  price numeric,
  price_negotiable boolean default false,
  currency text default 'UGX',

  bedrooms int,
  bathrooms int,
  size_sqm numeric,
  furnishing text,
  year_built int,
  condition text,

  plot_dimensions text,
  plot_size_total text,
  surveyed boolean,
  topography text,
  zoning text,
  title_status text check (title_status in ('freehold', 'leasehold', 'mailo', 'customary')),
  encumbrances text,

  floor_area numeric,
  unit_type text,
  floor_count int,
  layout text,
  power_capacity text,

  deposit numeric,
  deposit_refundable boolean,
  min_lease_term text,
  included_utilities text[],
  pet_policy text,
  available_from date,
  service_charge numeric,
  escalation_clause text,
  occupancy_status text,

  highlights text[],
  amenities text[],
  location_notes text,

  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listings_status_idx on public.listings (status);
create index if not exists listings_mode_category_idx on public.listings (listing_mode, category);
create index if not exists listings_area_idx on public.listings (area);

-- listing_images
create table if not exists public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  url text not null,
  is_cover boolean default false,
  room_tag text,
  sort_order int default 0
);

create index if not exists listing_images_listing_id_idx on public.listing_images (listing_id);

-- viewing_bookings
create table if not exists public.viewing_bookings (
  id uuid primary key default gen_random_uuid(),
  listing_ids uuid[] not null,
  preferred_date date,
  preferred_time text,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'completed', 'expired', 'declined')),
  confirmed_at timestamptz,
  expires_at timestamptz,
  requested_at timestamptz not null default now()
);

-- property_submissions (List With Us)
create table if not exists public.property_submissions (
  id uuid primary key default gen_random_uuid(),
  listing_mode text check (listing_mode in ('rent', 'sale')),
  category text,
  area text,
  rough_address text,
  bedrooms int,
  bathrooms int,
  approx_plot_size text,
  approx_floor_area numeric,
  photo_urls text[],
  asking_price numeric,
  contact_name text not null,
  contact_phone text not null,
  best_time_to_reach text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'visited', 'listed', 'declined')),
  submitted_at timestamptz not null default now()
);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists listings_set_updated_at on public.listings;
create trigger listings_set_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- RLS
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.viewing_bookings enable row level security;
alter table public.property_submissions enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role::text in ('admin', 'staff')
  );
$$;

-- profiles
create policy "Staff can read profiles"
  on public.profiles for select
  to authenticated
  using (public.is_staff());

create policy "Users can read own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Staff can update profiles"
  on public.profiles for update
  to authenticated
  using (public.is_staff());

-- listings: public read published; staff full write
create policy "Anyone can read published listings"
  on public.listings for select
  to anon, authenticated
  using (status = 'published');

create policy "Staff can read all listings"
  on public.listings for select
  to authenticated
  using (public.is_staff());

create policy "Staff can insert listings"
  on public.listings for insert
  to authenticated
  with check (public.is_staff());

create policy "Staff can update listings"
  on public.listings for update
  to authenticated
  using (public.is_staff());

create policy "Staff can delete listings"
  on public.listings for delete
  to authenticated
  using (public.is_staff());

-- listing_images
create policy "Anyone can read images of published listings"
  on public.listing_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'published'
    )
  );

create policy "Staff can read all listing images"
  on public.listing_images for select
  to authenticated
  using (public.is_staff());

create policy "Staff can insert listing images"
  on public.listing_images for insert
  to authenticated
  with check (public.is_staff());

create policy "Staff can update listing images"
  on public.listing_images for update
  to authenticated
  using (public.is_staff());

create policy "Staff can delete listing images"
  on public.listing_images for delete
  to authenticated
  using (public.is_staff());

-- viewing_bookings: public insert; staff read/update
create policy "Anyone can create viewing bookings"
  on public.viewing_bookings for insert
  to anon, authenticated
  with check (true);

create policy "Staff can read viewing bookings"
  on public.viewing_bookings for select
  to authenticated
  using (public.is_staff());

create policy "Staff can update viewing bookings"
  on public.viewing_bookings for update
  to authenticated
  using (public.is_staff());

-- property_submissions: public insert; staff read/update
create policy "Anyone can create property submissions"
  on public.property_submissions for insert
  to anon, authenticated
  with check (true);

create policy "Staff can read property submissions"
  on public.property_submissions for select
  to authenticated
  using (public.is_staff());

create policy "Staff can update property submissions"
  on public.property_submissions for update
  to authenticated
  using (public.is_staff());

-- Storage bucket (run once; policies below)
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Public read listing-images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'listing-images');

create policy "Staff upload listing-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images' and public.is_staff());

create policy "Staff update listing-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'listing-images' and public.is_staff());

create policy "Staff delete listing-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'listing-images' and public.is_staff());

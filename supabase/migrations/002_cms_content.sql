-- Mojesu CMS Phase 4 — insights, services, agents, reviews + RLS

-- insight_posts (blog / insights)
create table if not exists public.insight_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null default '',
  description text not null default '',
  cover_image text not null default '',
  category text not null
    check (category in ('market-update', 'area-guide', 'buying-guide', 'legal-title')),
  read_time_minutes int not null default 5 check (read_time_minutes > 0),
  content jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  published_at date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insight_posts_status_idx on public.insight_posts (status);
create index if not exists insight_posts_published_at_idx on public.insight_posts (published_at desc);

-- services (full nested detail as jsonb for enquiry / sections)
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  service_key text unique not null,
  slug text unique not null,
  name text not null,
  description text not null default '',
  hero_description text not null default '',
  image text not null default '',
  image_alt text not null default '',
  icon_class text not null default 'fi fi-sr-building',
  enquiry jsonb not null default '{}'::jsonb,
  what_we_do jsonb not null default '{}'::jsonb,
  offerings jsonb not null default '{}'::jsonb,
  process jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists services_status_sort_idx on public.services (status, sort_order);

-- agents
create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  photo_url text not null default '',
  profile_href text,
  instagram_url text,
  linkedin_url text,
  phone text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  sort_order int not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agents_status_sort_idx on public.agents (status, sort_order);

-- reviews / testimonials
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  role text not null default '',
  avatar_url text,
  photo_url text not null default '',
  rating int not null check (rating between 1 and 5),
  quote text not null,
  related_to text not null default 'other'
    check (related_to in (
      'rental', 'purchase', 'valuation', 'property-management', 'other'
    )),
  featured boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  review_date date not null default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_status_date_idx on public.reviews (status, review_date desc);

-- updated_at triggers
create or replace function public.set_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists insight_posts_set_updated_at on public.insight_posts;
create trigger insight_posts_set_updated_at
  before update on public.insight_posts
  for each row execute function public.set_content_updated_at();

drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_content_updated_at();

drop trigger if exists agents_set_updated_at on public.agents;
create trigger agents_set_updated_at
  before update on public.agents
  for each row execute function public.set_content_updated_at();

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_content_updated_at();

-- RLS
alter table public.insight_posts enable row level security;
alter table public.services enable row level security;
alter table public.agents enable row level security;
alter table public.reviews enable row level security;

-- Public read published
create policy "Anyone can read published insights"
  on public.insight_posts for select
  to anon, authenticated
  using (status = 'published');

create policy "Anyone can read published services"
  on public.services for select
  to anon, authenticated
  using (status = 'published');

create policy "Anyone can read published agents"
  on public.agents for select
  to anon, authenticated
  using (status = 'published');

create policy "Anyone can read published reviews"
  on public.reviews for select
  to anon, authenticated
  using (status = 'published');

-- Staff full access
create policy "Staff can read all insights"
  on public.insight_posts for select to authenticated using (public.is_staff());
create policy "Staff can insert insights"
  on public.insight_posts for insert to authenticated with check (public.is_staff());
create policy "Staff can update insights"
  on public.insight_posts for update to authenticated using (public.is_staff());
create policy "Staff can delete insights"
  on public.insight_posts for delete to authenticated using (public.is_staff());

create policy "Staff can read all services"
  on public.services for select to authenticated using (public.is_staff());
create policy "Staff can insert services"
  on public.services for insert to authenticated with check (public.is_staff());
create policy "Staff can update services"
  on public.services for update to authenticated using (public.is_staff());
create policy "Staff can delete services"
  on public.services for delete to authenticated using (public.is_staff());

create policy "Staff can read all agents"
  on public.agents for select to authenticated using (public.is_staff());
create policy "Staff can insert agents"
  on public.agents for insert to authenticated with check (public.is_staff());
create policy "Staff can update agents"
  on public.agents for update to authenticated using (public.is_staff());
create policy "Staff can delete agents"
  on public.agents for delete to authenticated using (public.is_staff());

create policy "Staff can read all reviews"
  on public.reviews for select to authenticated using (public.is_staff());
create policy "Staff can insert reviews"
  on public.reviews for insert to authenticated with check (public.is_staff());
create policy "Staff can update reviews"
  on public.reviews for update to authenticated using (public.is_staff());
create policy "Staff can delete reviews"
  on public.reviews for delete to authenticated using (public.is_staff());

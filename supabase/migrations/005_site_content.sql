-- Site marketing content — keyed JSON documents editable in CMS

create table if not exists public.site_content (
  key text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create or replace function public.set_site_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_content_set_updated_at on public.site_content;
create trigger site_content_set_updated_at
  before update on public.site_content
  for each row execute function public.set_site_content_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content"
  on public.site_content for select
  to anon, authenticated
  using (true);

drop policy if exists "Staff can upsert site content" on public.site_content;
create policy "Staff can upsert site content"
  on public.site_content for insert
  to authenticated
  with check (public.is_staff());

drop policy if exists "Staff can update site content" on public.site_content;
create policy "Staff can update site content"
  on public.site_content for update
  to authenticated
  using (public.is_staff());

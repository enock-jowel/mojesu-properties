-- Phase 5: who last edited (created_by stays insert-only)

alter table public.listings
  add column if not exists updated_by uuid references public.profiles(id);

alter table public.insight_posts
  add column if not exists updated_by uuid references public.profiles(id);

alter table public.services
  add column if not exists updated_by uuid references public.profiles(id);

alter table public.agents
  add column if not exists updated_by uuid references public.profiles(id);

alter table public.reviews
  add column if not exists updated_by uuid references public.profiles(id);

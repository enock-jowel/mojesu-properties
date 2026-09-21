-- Phase: Settings — notification config + tighter profiles RLS

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  notify_email text,
  whatsapp_number text,
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

-- Single-row config: seed one empty row if table is empty
insert into public.notification_settings (notify_email, whatsapp_number)
select null, null
where not exists (select 1 from public.notification_settings);

create or replace function public.set_notification_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notification_settings_set_updated_at
  on public.notification_settings;
create trigger notification_settings_set_updated_at
  before update on public.notification_settings
  for each row execute function public.set_notification_settings_updated_at();

alter table public.notification_settings enable row level security;

drop policy if exists "Staff can read notification settings"
  on public.notification_settings;
create policy "Staff can read notification settings"
  on public.notification_settings for select
  to authenticated
  using (public.is_staff());

drop policy if exists "Admins can insert notification settings"
  on public.notification_settings;
create policy "Admins can insert notification settings"
  on public.notification_settings for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins can update notification settings"
  on public.notification_settings;
create policy "Admins can update notification settings"
  on public.notification_settings for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Tighten profiles updates: own name vs admin role changes
drop policy if exists "Staff can update profiles" on public.profiles;

drop policy if exists "Users can update own profile name" on public.profiles;
create policy "Users can update own profile name"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Non-admins cannot change their own role via the own-profile policy
create or replace function public.profiles_guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Service-role (auth.uid() null) may change roles; JWT users need admin.
    if auth.uid() is not null and not exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    ) then
      raise exception 'Only admins can change roles';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role_change on public.profiles;
create trigger profiles_guard_role_change
  before update on public.profiles
  for each row execute function public.profiles_guard_role_change();

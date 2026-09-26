-- Add superadmin (owner) above admin; keep admin/staff.
-- Superadmins pass all admin RLS checks and app requireAdmin() gates.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('superadmin', 'admin', 'staff'));

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role::text in ('superadmin', 'admin', 'staff')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role::text in ('superadmin', 'admin')
  );
$$;

-- Notification settings (policy names from 004)
drop policy if exists "Admins can insert notification settings"
  on public.notification_settings;
create policy "Admins can insert notification settings"
  on public.notification_settings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admins can update notification settings"
  on public.notification_settings;
create policy "Admins can update notification settings"
  on public.notification_settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Profiles: admins (incl. superadmin) can update any profile
drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.profiles_guard_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    -- Service-role (auth.uid() null) may change roles; JWT users need admin+.
    if auth.uid() is not null and not public.is_admin() then
      raise exception 'Only admins can change roles';
    end if;
    -- Only superadmins may assign or strip superadmin.
    if (new.role = 'superadmin' or old.role = 'superadmin')
       and auth.uid() is not null
       and not exists (
         select 1 from public.profiles p
         where p.id = auth.uid() and p.role = 'superadmin'
       ) then
      raise exception 'Only superadmins can change the superadmin role';
    end if;
  end if;
  return new;
end;
$$;

-- Security harden: ignore client-supplied Auth role metadata; durable rate-limit table.
-- New Auth users always land as staff. Admins elevate only via invite/update (service role).

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
    'staff'
  );
  return new;
end;
$$;

-- Sliding-window counters for public lead APIs (service role only).
create table if not exists public.api_rate_limits (
  bucket_key text primary key,
  hit_count int not null default 0,
  reset_at timestamptz not null
);

create index if not exists api_rate_limits_reset_at_idx
  on public.api_rate_limits (reset_at);

alter table public.api_rate_limits enable row level security;

revoke all on table public.api_rate_limits from anon, authenticated;
grant all on table public.api_rate_limits to service_role;

-- Atomic check+increment. Returns allowed + retry_after_seconds.
create or replace function public.consume_rate_limit(
  p_key text,
  p_limit int,
  p_window_seconds int
)
returns table (allowed boolean, retry_after_sec int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.api_rate_limits%rowtype;
  v_retry int;
begin
  if p_key is null or length(trim(p_key)) = 0 then
    return query select false, 60;
    return;
  end if;
  if p_limit < 1 or p_window_seconds < 1 then
    return query select false, 60;
    return;
  end if;

  perform pg_advisory_xact_lock(hashtext('rate:' || p_key));

  select * into v_row from public.api_rate_limits where bucket_key = p_key;

  if not found or v_row.reset_at <= v_now then
    insert into public.api_rate_limits (bucket_key, hit_count, reset_at)
    values (p_key, 1, v_now + make_interval(secs => p_window_seconds))
    on conflict (bucket_key) do update
      set hit_count = 1,
          reset_at = excluded.reset_at;
    return query select true, 0;
    return;
  end if;

  if v_row.hit_count >= p_limit then
    v_retry := greatest(1, ceil(extract(epoch from (v_row.reset_at - v_now)))::int);
    return query select false, v_retry;
    return;
  end if;

  update public.api_rate_limits
    set hit_count = hit_count + 1
    where bucket_key = p_key;

  return query select true, 0;
end;
$$;

revoke all on function public.consume_rate_limit(text, int, int) from public;
revoke all on function public.consume_rate_limit(text, int, int) from anon, authenticated;
grant execute on function public.consume_rate_limit(text, int, int) to service_role;

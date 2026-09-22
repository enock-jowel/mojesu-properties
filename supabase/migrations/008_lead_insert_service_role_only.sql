-- Harden lead tables: revoke public INSERT.
-- Public APIs insert via the service-role client (bypasses RLS).
-- Staff retain SELECT/UPDATE via is_staff().

-- viewing_bookings
drop policy if exists "Anyone can create viewing bookings" on public.viewing_bookings;

-- property_submissions
drop policy if exists "Anyone can create property submissions" on public.property_submissions;

-- contact_enquiries
drop policy if exists "Public can insert contact enquiries" on public.contact_enquiries;

-- service_enquiries
drop policy if exists "Public can insert service enquiries" on public.service_enquiries;

# Mojesu Supabase (CMS foundation)

## Setup

### Local (recommended for Phase 1)

```bash
# Requires Docker (OrbStack/Docker Desktop)
./scripts/setup-local-supabase.sh
```

This starts local Supabase, writes keys to `.env.local`, applies
`migrations/001_cms_foundation.sql`, creates an invite-only staff user
(`hello@mojesuproperties.com` by default; password in gitignored `.env.staff.local`),
and seeds listings.

Or step-by-step:

1. `supabase start`
2. Copy URL + anon key + service role key from `supabase status` into `.env.local`.
3. Apply `migrations/001_cms_foundation.sql` (auto on first start, or SQL editor).
4. Create a staff user via Admin API / Studio (public signup is disabled).
5. `pnpm seed:listings`

### Hosted Supabase

1. Create a Supabase project.
2. Copy URL + anon key + service role key into `.env.local` (see root `.env.example`).
3. In the Supabase SQL editor, run `migrations/001_cms_foundation.sql`.
4. Create a staff user (Authentication → Users → Add user), then confirm a
   `profiles` row exists with `role = 'staff'` (auto-created by trigger).
5. Seed listings: `pnpm seed:listings`

## Notes

- No public signup — invite staff only via the dashboard / Admin API.
- Phase 5 cutover: public routes read published rows from Supabase only
  (60s revalidate). Static catalogs live under `scripts/seed-data/` for
  `pnpm seed:listings` / `pnpm seed:content` — not used at runtime.
- Activity: `created_by` (insert) + `updated_by` / `updated_at` (edits)
  via `003_activity_updated_by.sql`.
- Admin Settings (`/admin/settings`): Account (all staff); Team +
  Notifications (admin only). Notification email / WhatsApp live in
  `notification_settings` (`004_notification_settings.sql`); env vars
  remain fallback when the row is empty.
- Site marketing content (`005_site_content.sql`): keyed JSON docs for
  company/contact, about, list-with-us, home, taxonomy (amenities/kinds),
  areas, viewing fees, form microcopy, and nav. Edit under
  `/admin/content/site/*`. Seed with `pnpm seed:site`.
- Admin: `/admin/listings` list + multi-step create/edit with Storage uploads.
- Admin: `/admin/requests` inbox (viewing bookings + property submissions).
  Public `/api/viewing-bookings` and `/api/property-submissions` persist to
  Supabase (additive to email / wa.me).
- Admin: `/admin/content` — insights, services, agents, reviews CRUD
  (`002_cms_content.sql`). Seed with `pnpm seed:content`.
- Storage bucket `listing-images` is created by the migration (public read,
  staff write).

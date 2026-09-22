# Mojesu Supabase (CMS foundation)

## Canonical hosted project

- **Live:** `https://mdbxvcjyawgtzpingquq.supabase.co` (Forever Free)
- **Retired:** do not point apps at `tbrbir…`
- See also `docs/ops-debt-closure.md`

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
3. Apply migrations in order (auto on first start, or SQL editor).
4. Create a staff user via Admin API / Studio (public signup is disabled).
5. `pnpm seed:listings` — **demo catalog**, not client inventory (archive/replace before launch)

### Hosted Supabase (mdbx)

1. Use the canonical mdbx project (or create a new one and update env everywhere).
2. Copy URL + anon key + service role key into `.env.local` / Vercel (see root `.env.example`).
3. In the SQL editor, run migrations in order through **`008`**:
   - `001_cms_foundation.sql` … `006_listing_featured.sql`
   - `007_lead_enquiries.sql` (contact + service tables)
   - `008_lead_insert_service_role_only.sql` (drop anon INSERT on lead tables)
4. Create a staff user, then confirm a `profiles` row with `role = 'staff'`.
5. Seed: `pnpm seed:listings` / `pnpm seed:content` / `pnpm seed:site` as needed.

Public lead APIs insert with the **service role**; anon clients must not INSERT
into `viewing_bookings`, `property_submissions`, `contact_enquiries`, or
`service_enquiries` (enforced by `008`).

## Notes

- No public signup — invite staff only via the dashboard / Admin API.
- Public routes read published rows from Supabase only (60s revalidate).
  Static catalogs under `scripts/seed-data/` are for seed scripts only.
- Activity: `created_by` + `updated_by` / `updated_at` via `003_activity_updated_by.sql`.
- Admin Settings: Account (all staff); Team + Notifications (admin only).
  Notification settings in `004_notification_settings.sql`; env vars remain fallback.
- Site marketing content (`005_site_content.sql`): company/contact, about,
  list-with-us, home, taxonomy, areas catalog, viewing fees, forms, nav.
  Edit under `/admin/content/site/*`. Seed with `pnpm seed:site`.
- Admin: `/admin/listings` + Storage uploads (`listing-images`).
- Admin: `/admin/requests` inbox — viewings, list-with-us, contact, services.
  Public APIs: `/api/viewing-bookings`, `/api/property-submissions`,
  `/api/contact-enquiries`, `/api/service-enquiries`.
- Admin: `/admin/content` — insights, services, agents, reviews (`002`).
- Featured flag: `006_listing_featured.sql` + CMS “Featured on home”.
- Public area guides: `/areas/`, `/areas/[slug]/`, `/areas/tier/[tier]/`
  (copy in `lib/area-guides.ts`).

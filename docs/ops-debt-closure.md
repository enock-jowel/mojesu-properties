# Ops checklist — debt closure

## Canonical environment
- **Live Supabase:** `https://mdbxvcjyawgtzpingquq.supabase.co` (Forever Free)
- **Do not** point Vercel or local `.env.local` at the retired `tbrbir…` project
- **Site / email:** mojesuproperties.com / hello@mojesuproperties.com
- **Vercel commit author:** `enockjowel1231@gmail.com` (other authors block deploy)

## Done in code
- Contact + service enquiry APIs (same pattern as viewings)
- Rate limit + origin check + honeypot on lead POSTs
- Fail-closed lead submits (no public Storage PII fallback)
- CMS `is_featured` load/save + “Featured on home” toggle (omit-safe on update)
- Admin Requests inbox: viewings, list-with-us, contact, services (+ detail pages)
- Public `/areas/`, `/areas/[slug]/`, `/areas/tier/[tier]/` + sitemap + home explore strip
- Migration `008_lead_insert_service_role_only.sql` (drop anon INSERT on lead tables)
- Shared `publishBlocked()` for CMS UI + `saveListing` (`lib/listings/publish.ts`)
- Staff role gate in `app/admin/(app)/layout.tsx` (non-staff → login)
- Local `.env.local` pointed at **mdbx** (not tbrbir)
- Favorites persist via `useFavorites`
- Domain strings → `mojesuproperties.com`
- Supabase image transform in `sizedImageUrl`
- `wrangler.jsonc` → mdbx URL only (no committed anon JWT)

## Apply once on live mdbx (SQL Editor)

**Done (2026-09-22):** `008` DROP POLICY ran on mdbx — Success. No rows returned.

Lead tables from `007` verified present (read-only counts).

## Owner-only (cannot finish from repo alone)
1. ~~**Resend** API key on Vercel~~ — set on mojesu-preview (production/preview/development)
2. ~~Confirm Vercel `SUPABASE_*` → mdbx~~ — force-synced from `.env.preview.local`
3. Redeploy after env/migration changes (in progress / done with this ship)
4. Google Business Profile when ready (`docs/seo-geo-phase5-6.md`)

### Vercel deploy blocked
Commits whose author is not a Vercel collaborator are **BLOCKED**. Always:
`git -c user.email=enockjowel1231@gmail.com -c user.name='Enock Jowel' …`
(do not change global git config).

## Sequenced fix PRs — status

| PR | Scope | Status |
|----|--------|--------|
| **1** | Fail-closed + featured | Done (working tree) |
| **2** | Requests inbox (all four) | Done (working tree) |
| **3** | Public `/areas/` | Done (working tree) |
| **4** | RLS harden (`008`) | **Applied on mdbx** |
| **5** | Docs + dual-Supabase | Done |

## Demo / seed data
- `pnpm seed:listings` = **demo catalog**, not client stock — archive/replace before launch
- `pnpm seed:content` / `pnpm seed:site` for CMS defaults

## Deferred (optional)
- `form_submission_errors` durable table (dashboard gap card)
- Cloudflare Workers secrets for optional `cf:deploy`

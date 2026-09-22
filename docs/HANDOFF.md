# Mojesu — engineer handoff (single source of truth)

**Read this first.** It is the canonical map of the product, stack, repos, environments, third-party accounts, and where secrets live.

| | |
|--|--|
| **Product** | Mojesu Properties — Kampala listings site + staff CMS |
| **Live site** | https://mojesuproperties.com |
| **Canonical email** | hello@mojesuproperties.com |
| **Repo** | https://github.com/enock-jowel/mojesu-properties |
| **Primary host** | Vercel project **`mojesu-preview`** (aliased to the custom domain) |
| **Primary data** | Supabase project **`mdbxvcjyawgtzpingquq`** (Forever Free) |
| **Last ops ship** | Fail-closed leads, Requests inbox, `/areas/`, RLS `008`, featured CMS (see `docs/ops-debt-closure.md`) |

### Security rule (non-negotiable)

- **Never commit passwords, API keys, or service-role JWTs.**
- This file lists **who / what / where**. Live secrets live only in:
  - gitignored `.env*.local` files on the owner machine, and/or
  - Vercel project env (dashboard / CLI), and/or
  - a private copy of [`credentials.private.example.md`](./credentials.private.example.md) → `credentials.private.md` (gitignored).
- Rotate any secret that ever appeared in chat logs, screenshots, or CI output.

---

## 1. What this system is

Public Next.js App Router site for **rent / buy / land** listings, viewing bookings, list-with-us, contact, and service enquiries. Staff CMS under `/admin` (Supabase Auth + RLS).

| Surface | Path | Data |
|--------|------|------|
| Marketing home | `/` | Listings + CMS site content |
| Browse | `/rent/`, `/buy/`, `/land/` | `getProperties()` only |
| Area guides | `/areas/`, `/areas/[slug]/`, `/areas/tier/[tier]/` | `lib/area-guides.ts` |
| Listing detail | `/listings/[slug]/` | Supabase `listings` |
| Lead forms | viewing / list-with-us / contact / services | API → service-role insert → optional Resend |
| Admin | `/admin/*` | Staff/admin profiles only |

**Architecture constraints:** `.cursor/rules/foundation.mdc`

**Listing data seam:** all public listing reads go through `lib/properties.ts` → never import seed catalogs in UI components.

---

## 2. Stack (complete)

| Layer | Choice | Notes |
|-------|--------|--------|
| Framework | **Next.js 15** App Router | Not `output: 'export'` |
| UI | React 19, Tailwind CSS v4 | Tokens in `app/globals.css` |
| Language | TypeScript | |
| Package manager | **pnpm** | |
| Hosting (primary) | **Vercel** | Project `mojesu-preview` |
| Hosting (optional) | OpenNext + **Cloudflare Workers** | `pnpm cf:build` / `cf:deploy`, `wrangler.jsonc` |
| CMS / Auth / DB / Storage | **Supabase** | Postgres + Auth + Storage bucket `listing-images` |
| Email (transactional) | **Resend** | Lead notify mail |
| Mailbox / domain mail | **Zoho Mail** (forever-free) | `hello@mojesuproperties.com` |
| WhatsApp | **wa.me deep links only** | No Meta Business API / Twilio |
| Charts (admin) | Recharts | Dashboard only |
| Icons | Lucide + Flaticon uicons | npm |
| Optional | Bitly URL shortener | `BITLY_ACCESS_TOKEN` — often unset |
| Optional | Google Places API (New) | Live home reviews — often unset |
| Optional | Cloudflare Turnstile | Types exist; not wired as required CAPTCHA |
| CI / perf | Lighthouse CI config | `.lighthouserc.cjs`, `.github/workflows/lighthouse.yml` |

Node targeting: Vercel Node 24.x (as of last deploy).

---

## 3. Repositories & local layout

| Item | Value |
|------|--------|
| GitHub org/user | `enock-jowel` |
| Repo | `mojesu-properties` |
| Default branch | `main` |
| Vercel Git connection | Linked to that GitHub repo |

### Top-level map

```
app/                  Next.js routes (public + admin + api)
components/           UI (public + admin)
lib/                  Domain logic (properties, leads, CMS, supabase)
scripts/              Seed, deploy, migrations helpers
supabase/migrations/  SQL 001–008 (apply in order)
docs/                 This handoff + ops/SEO/copy docs
.cursor/rules/        Agent/engineering constraints
```

### Important `lib/` modules

| Path | Role |
|------|------|
| `lib/properties.ts` | Public listing read API |
| `lib/listings/*` | CMS listing CRUD + `publish.ts` shared publish rules |
| `lib/viewing-bookings/*` | Viewing pass bookings |
| `lib/property-submissions/*` | List-with-us |
| `lib/contact-enquiries/*` | Contact form |
| `lib/service-enquiries/*` | Service enquiry form |
| `lib/requests/*` | Admin Requests inbox actions |
| `lib/site-content/*` | CMS marketing copy / nav / areas catalog |
| `lib/area-guides.ts` | Public neighbourhood guide copy |
| `lib/supabase/*` | Browser / server / service-role clients |
| `lib/api/rate-limit.ts` | Origin + rate limit + honeypot |

---

## 4. Environments

| Env | Site URL | Supabase | Deploy |
|-----|----------|----------|--------|
| **Production** | https://mojesuproperties.com | `mdbxvcjyawgtzpingquq` | `pnpm vercel:preview` (script deploys **--prod** + aliases domain) |
| **Local** | http://localhost:3000 | Same mdbx **or** Docker local Supabase | `pnpm dev` |
| **Optional CF** | `*.workers.dev` (see `wrangler.jsonc`) | Should be mdbx | `pnpm cf:deploy` |

### Retired / do not use

| Item | Status |
|------|--------|
| Supabase `tbrbirakvdlrfndhmlmm` | **Retired** — do not point env here |
| Accidental Vercel project `mojesu` | **Deleted** — only `mojesu-preview` remains |

---

## 5. Database & migrations

Apply in order on any new Supabase project:

| File | Purpose |
|------|---------|
| `001_cms_foundation.sql` | Listings, images, bookings, submissions, RLS, storage |
| `002_cms_content.sql` | Insights / services / agents / reviews |
| `003_activity_updated_by.sql` | Audit columns |
| `004_notification_settings.sql` | CMS notify email / WhatsApp |
| `005_site_content.sql` | Keyed marketing JSON |
| `006_listing_featured.sql` | `is_featured` |
| `007_lead_enquiries.sql` | `contact_enquiries`, `service_enquiries` |
| `008_lead_insert_service_role_only.sql` | Drop anon INSERT on lead tables |

**Lead inserts:** Next.js API routes use **`SUPABASE_SERVICE_ROLE_KEY`** (bypasses RLS). Anon clients must not INSERT leads after `008`.

Bootstrap dump for empty hosted projects: `scripts/bootstrap-remote.sql` (keep in sync with migration intent).

More: `supabase/README.md`.

---

## 6. Third-party & service accounts (inventory)

Passwords / API keys are **not** written here. Column **Secrets live in** points to the owner machine / Vercel.

### 6.1 Product & DNS / mail

| Service | Purpose | Login / identity | Dashboard | Secrets live in | Notes |
|---------|---------|------------------|-----------|-----------------|-------|
| **Domain** `mojesuproperties.com` | Public site + email | *(registrar account — confirm owner)* | *(TBD registrar)* | Owner password manager | DNS must point to Vercel; MX to Zoho |
| **Zoho Mail** | Mailbox for `hello@…` | Admin contact: `jowelnionzima@gmail.com`; mailbox: `hello@mojesuproperties.com` | https://mail.zoho.com · admin https://mailadmin.zoho.com | `.env.zoho.local` | Plan: forever-free; domain `mojesuproperties.com` |
| **WhatsApp** | Booking confirmation CTA (`wa.me`) | Business number digits `256780827159` | WhatsApp app / business phone | Display also in CMS company + `NEXT_PUBLIC_WHATSAPP_NUMBER` | **Not** a Cloud API account |

### 6.2 App hosting & source

| Service | Purpose | Login / identity | Dashboard | Secrets live in | Notes |
|---------|---------|------------------|-----------|-----------------|-------|
| **GitHub** | Source of truth | Org/user `enock-jowel` | https://github.com/enock-jowel/mojesu-properties | GitHub credentials / SSH | |
| **Vercel** | Production host | Team/user `enockjowel1231-7456` (email `enockjowel1231@gmail.com`) | https://vercel.com | CLI login; project env | Project **`mojesu-preview`** → domain mojesuproperties.com |
| **Cloudflare** (optional) | Workers via OpenNext | *(account that owns workers.dev subdomain)* | https://dash.cloudflare.com | `wrangler` login; secrets via dashboard | `wrangler.jsonc` name `mojesu-preview`; do not commit anon keys |

### 6.3 Data & auth

| Service | Purpose | Login / identity | Dashboard | Secrets live in | Notes |
|---------|---------|------------------|-----------|-----------------|-------|
| **Supabase (live)** | DB, Auth, Storage | Project ref `mdbxvcjyawgtzpingquq` | https://supabase.com/dashboard/project/mdbxvcjyawgtzpingquq | `.env.mdbx.local`, `.env.local`, Vercel env | Forever Free; org under owner email |
| **Supabase (retired)** | Old project | ref `tbrbir…` | — | Do not use | |
| **Supabase Auth (staff)** | `/admin` login | See §7 staff users | Auth → Users | Staff passwords in `.env.*.local` | Public signup disabled |

### 6.4 Email send / notify

| Service | Purpose | Login / identity | Dashboard | Secrets live in | Notes |
|---------|---------|------------------|-----------|-----------------|-------|
| **Resend** | Transactional lead emails | Signup email `jowelnionzima@gmail.com`; org/workspace for Mojesu | https://resend.com · API keys | `.env.resend.local`, `.env.mdbx.local`, Vercel `RESEND_API_KEY` | From address should match verified domain / Zoho mailbox strategy |
| Notify To | Inbox for alerts | `hello@mojesuproperties.com` | Zoho | `NOTIFY_EMAIL_TO` | Also editable in Admin → Settings |

### 6.5 Optional / not always configured

| Service | Purpose | Status | Secrets |
|---------|---------|--------|---------|
| **Bitly** | Shorten listing URLs in WhatsApp text | Optional; unset OK | `BITLY_ACCESS_TOKEN` |
| **Google Cloud Places API (New)** | Live Google reviews on home | Optional | `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` |
| **Google Business Profile** | Local SEO / NAP | **Not created yet** | See `docs/seo-geo-phase5-6.md` |
| **Turnstile** | Bot protection | Types only; honeypot + rate limit used instead | — |

### 6.6 Social (public CMS defaults)

Editable in Admin → Site content → Company (or `lib/site-content/defaults.ts`):

| Network | Default handle / URL |
|---------|----------------------|
| TikTok | https://www.tiktok.com/@mojesu.properties |
| YouTube | https://www.youtube.com/@Mojesupropertiesuganda3292 |

Confirm ownership of social accounts with the business owner — they are marketing surfaces, not deploy blockers.

### 6.7 Local / bootstrap identity files (gitignored)

| File | Contains |
|------|----------|
| `.env.local` | Active Next.js env (mdbx + Resend + site) |
| `.env.mdbx.local` | Canonical mdbx + Resend snapshot |
| `.env.preview.local` | Used by `pnpm vercel:preview` deploy script |
| `.env.resend.local` | Resend signup email/password + API key |
| `.env.zoho.local` | Zoho admin + mailbox metadata + password |
| `.env.admin.local` | `ADMIN_EMAIL=enockjowel1231@gmail.com` + password |
| `.env.staff.local` | `STAFF_EMAIL=hello@mojesu.com` + password |
| `.env.preview-staff.local` | `STAFF_EMAIL=admin@mojesu.com` + password |
| `/Users/…/Downloads/mojesu-mdbx.env.local` | Owner export of mdbx keys (do not commit) |

Template for a private vault copy: [`credentials.private.example.md`](./credentials.private.example.md).

---

## 7. Staff / admin users (Supabase Auth)

| Email (typical) | Role intent | Password location |
|-----------------|-------------|-------------------|
| `enockjowel1231@gmail.com` | Owner / Vercel / often Supabase admin | `.env.admin.local` |
| `hello@mojesu.com` | Staff bootstrap (local script default historically) | `.env.staff.local` |
| `admin@mojesu.com` | Preview staff | `.env.preview-staff.local` |

Production Auth users must exist in **mdbx** Auth with a matching `profiles.role` of `staff` or `admin`. Gate: `app/admin/(app)/layout.tsx` + `lib/admin/auth.ts`.

**Vercel deploy author rule:** git commits that trigger Vercel must use:

```bash
git -c user.email=enockjowel1231@gmail.com -c user.name='Enock Jowel' …
```

Other authors (`mojesu@local`, other Gmail) have been **blocked** by Vercel collaborator checks.

---

## 8. Environment variables (complete catalogue)

See also root `.env.example`.

| Variable | Required for | Public? |
|----------|--------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, emails | Yes |
| `SITE_URL` | Server-side notify / absolute links | No |
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + middleware | Yes (RLS-scoped) |
| `SUPABASE_SERVICE_ROLE_KEY` | API lead inserts, admin service tasks | **Secret** |
| `NOTIFY_EMAIL_TO` | Resend destination | Prefer secret |
| `NOTIFY_EMAIL_FROM` | Resend from header | Prefer secret |
| `RESEND_API_KEY` | Sending mail | **Secret** |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | wa.me CTA | Yes |
| `ALLOWED_LEAD_ORIGINS` | Extra CORS origins | Optional |
| `BITLY_ACCESS_TOKEN` | URL shorten | Optional secret |
| `GOOGLE_PLACES_API_KEY` | Live reviews | Optional secret |
| `GOOGLE_PLACE_ID` | Live reviews | Optional |
| `GOOGLE_BUSINESS_MAPS_URL` | Resolve place id script | Optional |
| `OPEN_NEXT_BUILD` | CF build only | Script-set |

Vercel: set on **mojesu-preview** for Production + Preview + Development (already synced for mdbx + Resend as of handoff).

---

## 9. Day-1 engineer checklist

1. Get access: GitHub repo, Vercel team, Supabase mdbx, Resend, Zoho (as needed).
2. Clone repo; `pnpm install`.
3. Copy `.env.example` → `.env.local`; fill from owner vault / `.env.mdbx.local` (never commit).
4. `pnpm dev` → http://localhost:3000
5. Admin: http://localhost:3000/admin/login/ with a staff user that exists on the same Supabase project.
6. Read `.cursor/rules/foundation.mdc` and this file.
7. Before changing leads/RLS: confirm `007`/`008` applied on the target DB.
8. Deploy: `pnpm vercel:preview` (uses `.env.preview.local`, deploys production, aliases domain).

### Common scripts

| Script | Does |
|--------|------|
| `pnpm seed:listings` | Demo catalog → listings (**not** real inventory) |
| `pnpm seed:content` | CMS content seed |
| `pnpm seed:site` | Site content keys |
| `pnpm check:images` | Image budget |
| `pnpm vercel:preview` | Sync env + production deploy |
| `pnpm cf:deploy` | Optional Cloudflare path |

---

## 10. Lead / notify flow (mental model)

```
Browser form
  → POST /api/{viewing-bookings|property-submissions|contact-enquiries|service-enquiries}
  → rate limit + origin + honeypot
  → service-role Supabase insert (fail-closed on error)
  → Resend email (optional; failure does not undo DB write)
  → return ok + optional wa.me URL
```

Admin: `/admin/requests/` tabs for all four lead types.

---

## 11. Related docs (indexed)

| Doc | Use when |
|-----|----------|
| **This file** | Onboarding, accounts, stack |
| [`README.md`](./README.md) | Docs index |
| [`ops-debt-closure.md`](./ops-debt-closure.md) | What shipped / remaining ops |
| [`supabase/README.md`](../supabase/README.md) | Migrations & CMS notes |
| [`full-system-report.md`](./full-system-report.md) | Deep product/architecture report (may lag; prefer this HANDOFF for accounts) |
| [`seo-geo-phase4.md`](./seo-geo-phase4.md) / [`seo-geo-phase5-6.md`](./seo-geo-phase5-6.md) | SEO / areas / GBP |
| [`performance-baseline.md`](./performance-baseline.md) | Perf method |
| [`mojesu-copy-request-template.md`](./mojesu-copy-request-template.md) | Copy/content collection |
| [`credentials.private.example.md`](./credentials.private.example.md) | Private password vault template |

---

## 12. Known gaps / owner follow-ups

- Confirm **domain registrar** account and DNS panel access; document in `credentials.private.md`.
- **Google Business Profile** not created — NAP must match CMS company content.
- Demo **seed listings** may still be live — archive/replace before marketing “live inventory”.
- Optional: Bitly, Google Places, Turnstile, `form_submission_errors` table.
- Optional Cloudflare deploy needs Wrangler auth + secrets (URL only in `wrangler.jsonc`).

---

*Maintainer: update this file whenever a provider, project ref, domain, or login email changes.*

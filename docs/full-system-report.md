# Mojesu — Full System Report

**Generated:** 18 July 2026  
**Scope:** Public website + admin CMS as implemented in the current codebase  
**Method:** Read-only verification of routes, libraries, migrations, and a live local Supabase query  
**Output rule:** Describes what exists today — not prior plans or intended scope

---

## PART A — Executive summary (for the business owner)

Mojesu is a Kampala property website where visitors can browse homes and land for rent or sale, open listing detail pages, request a viewing, and ask Mojesu to list their own property. Behind that site sits a staff CMS: officers log in to publish listings (with a five-photo minimum), manage viewing and “list with us” requests, edit marketing pages and labels, and (for admins) manage team and notification settings.

**What visitors can do today**

- Search and filter rent / buy / land listings  
- Read listing details, amenities, and “things to know”  
- Book a viewing (form → database + optional email + WhatsApp deep link)  
- Submit a “List with us” request (same pattern)  
- Browse services, insights, about, and contact chrome  

**What staff can do today**

- Create and edit listings (multi-step wizard + live preview of the public page)  
- Work the requests inbox (viewing bookings + property submissions)  
- Edit catalog content: insights, services, agents, reviews  
- Edit site-wide copy: company/contact, about, home, nav, areas, amenity/kind labels, viewing fees, form wording  
- Account settings; admins also manage team invites and notification email/WhatsApp numbers  

**Fully working vs incomplete**

| Area | Status |
|------|--------|
| Browse listings from database | Working |
| Viewing / List-with-us / Contact / Service enquiry APIs | Working — persist to Supabase; fail closed on store errors (no silent success / no public Storage PII fallback) |
| CMS listings / requests / content / site copy | Working for staff (Requests inbox: bookings, submissions, contact, services) |
| Featured listings (`is_featured`) | Working — CMS editor toggle + home/browse filter |
| Multi-listing “viewing cart” page | **Not built** — booking is one listing at a time |
| Archive listing from the editor | Status exists in data model; **no Archive button** in UI |

**The single most important thing to know:**  
Lead forms (viewing, list-with-us, contact, service) require a live Supabase insert. If migration `007` is missing or the insert fails, visitors see an error — they are not told “success” while the lead is dropped.

---

## PART B — Public website

### B1. Full site map

Verified by reading each `app/**/page.tsx` outside `admin/`.

| Path | Purpose | Live DB / CMS? |
|------|---------|----------------|
| `/` | Home: hero search, listing carousels, services/reviews/agents/insights, CTA, contact | **DB:** listings, services, reviews, agents, insights; **CMS:** `home`, `company`, `contact` via `app/page.tsx` |
| `/rent/` | Rent browse + filters | **DB:** `getProperties()` → `ListingsBrowse` |
| `/buy/` | Sale browse (buildings) | **DB:** same |
| `/land/` | Land browse | **DB:** same |
| `/buy/property/` | Legacy redirect → `/buy/` | None |
| `/buy/land/` | Legacy redirect → `/land/` | None |
| `/listings/[slug]/` | Listing detail + similar | **DB:** `getPropertyBySlug`, `getProperties` |
| `/services/` | Services index | **DB:** `getAllServices`; shell copy from `home` CMS |
| `/services/[slug]/` | Service detail + enquiry UI | **DB:** services |
| `/insights/` | Blog index | **DB:** `getAllBlogPosts`; shell from `home` CMS |
| `/insights/[slug]/` | Article | **DB:** insights |
| `/about/` | About + agents + contact | **DB:** agents; **CMS:** about, company, contact, home (agents intro) |
| `/list-with-us/` | Owner intake marketing + form | **CMS:** `list_with_us`; services for related cards |

**Public APIs**

| Path | Purpose |
|------|---------|
| `POST /api/viewing-bookings` | Persist booking, optional Resend email, return `wa.me` URL — `app/api/viewing-bookings/route.ts` |
| `POST /api/property-submissions` | Persist list-with-us lead, photos, email, `wa.me` — `app/api/property-submissions/route.ts` |
| `POST /api/contact-enquiries` | Persist contact lead + optional email — `app/api/contact-enquiries/route.ts` |
| `POST /api/service-enquiries` | Persist service enquiry + optional email — `app/api/service-enquiries/route.ts` |

There is **no** public `/viewings`, favorites, or multi-listing booking cart page under `app/`.

Default nav links (overridable in CMS `nav`): Rent, Buy, About, Services, Contact — see `lib/site-content/catalog-defaults.ts`. Land and Insights appear in footer defaults.

---

### B2. Core user journeys

#### B2.1 Browsing (home → category → filter → detail)

| Step | Code path |
|------|-----------|
| Home load | `app/page.tsx` → `getProperties`, content getters → `HomeDiscovery` / `HomeFeed` |
| Search | `components/hero-search.tsx` → `heroCriteriaToHref` (`lib/hero-search-criteria.ts`) → `/rent/`, `/buy/`, or `/land/` + query string |
| Browse | `app/rent|buy|land/page.tsx` → `components/listings-browse.tsx` → client `filterProperties` |
| Card | `components/property-card.tsx` → `/listings/{slug}/` |
| Detail | `app/listings/[slug]/page.tsx` → `PropertyDetailPage` |

**Works today for a real visitor?** Yes, when Supabase has published listings. If the DB/env is unavailable, `getProperties()` returns an empty list (`lib/properties.ts`) — the UI still loads with empty carousels.

Heart icons on cards are **in-memory only** (session state); they are not a saved favorites journey.

#### B2.2 Booking a viewing

| Step | Code path |
|------|-----------|
| Entry | Listing detail → `ViewingStickyCard` → `ViewingBookingForm` |
| Payload | Always `listingIds: [item.id]` (single listing) — `components/viewing-booking-form.tsx` |
| Client | `lib/viewing-bookings/client-submit.ts` → `POST /api/viewing-bookings` |
| Server | Validate → resolve listings → insert `viewing_bookings` → `submitViewingBooking` → Resend email (if configured) → return WhatsApp URL |
| WhatsApp | **Not sent by server.** Manager opens a `wa.me` link with a pre-filled message (`lib/viewing-bookings/templates.ts`) |
| Staff follow-up | `/admin/requests/` booking detail |

**Is there a viewing list page?** No. The API accepts multiple IDs; the UI never builds a multi-listing cart.

**Works today?** Yes when the Next API and Supabase are healthy. Caveats:

1. If the API or store insert fails, the client shows an error (`ok: false`) — no localStorage fake success.  
2. Email is skipped (not thrown) when `RESEND_API_KEY` or notify email is missing (`lib/viewing-bookings/email.ts`).  
3. Missing store/d1 or insert errors return `ok: false` from `submitViewingBooking`.

**Live DB check (local):** 2 rows in `viewing_bookings` — confirms the path has been exercised.

#### B2.3 List with us (property submission)

| Step | Code path |
|------|-----------|
| Page | `app/list-with-us/page.tsx` → form in `components/list-with-us-form.tsx` |
| Client | `lib/property-submissions/client-submit.ts` → `POST /api/property-submissions` |
| Server | Cap photos → Storage upload → insert `property_submissions` → email → `wa.me` |
| Product rule | Does **not** create a public listing automatically |

**Works today?** Same reliability pattern as viewings. Staff can later open `/admin/listings/new/?from={submissionId}` to prefill a draft.

**Live DB check (local):** 2 rows in `property_submissions`.

#### B2.4 Contact form (homepage)

| Step | Code path |
|------|-----------|
| UI | `ContactSection` — `components/contact-section.tsx` |
| Client | `lib/contact-enquiries/client-submit.ts` → `POST /api/contact-enquiries` |
| Server | Insert `contact_enquiries` (requires migration `007`) → optional Resend |

**Works today?** Yes when Supabase + `007` are applied. Fail closed on insert errors. Staff inbox for these leads is PR2.

#### B2.5 Service enquiry

| Step | Code path |
|------|-----------|
| UI | `ServiceEnquiryForm` — `components/service-enquiry-form.tsx` |
| Client | `lib/service-enquiries/client-submit.ts` → `POST /api/service-enquiries` |
| Server | Insert `service_enquiries` → optional Resend |

**Works today?** Same pattern as contact. Staff inbox for these leads is PR2.

---

### B3. Content currently live

Queried against the local Supabase project used by this workspace (18 Jul 2026). Production counts will differ.

#### Listings (`listings`)

| Dimension | Count |
|-----------|------:|
| **Total** | **35** |
| Status: published | 35 |
| Status: draft / archived | 0 |
| Category: apartment | 8 |
| Category: house | 7 |
| Category: commercial | 10 |
| Category: land | 10 |
| Mode: rent | 17 |
| Mode: sale | 18 |
| Images (`listing_images`) | 315 |

Public site only shows `status = 'published'` (`lib/listings/queries.ts`).

#### Other catalog content

| Type | Source | Local counts |
|------|--------|--------------|
| Services | DB table `services` | 6 published |
| Insights / blog | DB table `insight_posts` | 3 published |
| Agents | DB table `agents` | 6 published |
| Reviews | DB table `reviews` | 7 published |
| Site marketing keys | DB table `site_content` | 10 keys: `about`, `areas`, `company`, `contact`, `forms`, `home`, `list_with_us`, `nav`, `taxonomy`, `viewing` |

Runtime getters fall back to code defaults if a row is missing (`lib/site-content/queries.ts`, `lib/content/queries.ts`). Seed catalogs under `scripts/seed-data/` are **not** used at runtime (`lib/properties.ts` header comment).

---

### B4. Design system as implemented

**Tokens** — `app/globals.css` lines 3–54:

| Token | Value |
|-------|-------|
| `--primary` | `#63aaf0` |
| `--primary-dark` | `#3492b8` |
| `--accent-deep` | `#144e6e` |
| `--secondary` | `#494f3b` |
| `--ink` | `#2a2e32` |
| `--footer` | `#485354` |
| `--background` / `--surface` / `--surface-alt` | `#fafafa` / `#ffffff` / `#f3f3f2` |
| `--heart` | `#ff385c` (favorites convention) |

Tailwind v4 maps these via `@theme inline` in the same file. There is no separate `tailwind.config.js`.

**Fonts** — Marcellus (Google) as `--font-marcellus` / `--font-display` in `app/layout.tsx`; body uses system sans via `--font-sans`.

**Icons** — Flaticon UIcons CDN in root layout.

**Public vs CMS visual consistency:** Admin has no separate stylesheet. `app/admin/layout.tsx` only wraps Suspense; `AdminShell` uses the same token classes (`bg-background`, `text-primary`, `border-neutral-light`). Drift risk is low for color/type; admin is denser (tables, multi-step forms) but same brand tokens.

---

## PART C — CMS / admin portal

### C1. Full admin site map

**Access layers**

| Layer | Check | Evidence |
|-------|-------|----------|
| Middleware | Logged-in Supabase user for `/admin/*` except login | `middleware.ts` L15–32 — **does not check `profiles.role`** |
| `(app)` layout | Requires auth user; loads profile for display | `app/admin/(app)/layout.tsx` |
| Server actions | `requireStaff()` / `requireAdmin()` against `profiles.role` | `lib/admin/auth.ts` |

If Supabase env vars are missing, middleware **skips** the auth gate entirely (`middleware.ts` L7–13) — intentional for local bootstrap; dangerous if a production deploy ships without env.

| Path | Purpose | Role (effective) |
|------|---------|------------------|
| `/admin` | Redirect → listings | any authenticated |
| `/admin/login/` | Sign-in | public |
| `/admin/listings/` | List / filter listings | staff actions |
| `/admin/listings/new/` | Create (+ `?from=` submission prefill) | staff |
| `/admin/listings/[id]/edit/` | Edit | staff |
| `/admin/requests/` | Inbox | staff |
| `/admin/requests/bookings/[id]/` | Booking detail / status | staff |
| `/admin/requests/submissions/[id]/` | Submission detail / status / create listing | staff |
| `/admin/content/` | Content hub | shell |
| `/admin/content/insights/` (+ new/edit) | Blog CRUD | staff |
| `/admin/content/services/` (+ new/edit) | Services CRUD | staff |
| `/admin/content/agents/` (+ new/edit) | Agents CRUD | staff |
| `/admin/content/reviews/` (+ new/edit) | Reviews CRUD | staff |
| `/admin/content/site/company/` | Company + contact | staff |
| `/admin/content/site/about/` | About page | staff |
| `/admin/content/site/list-with-us/` | List-with-us marketing | staff |
| `/admin/content/site/home/` | Home / CTA / intros | staff |
| `/admin/content/site/taxonomy/` | Amenities, kinds, tabs | staff |
| `/admin/content/site/areas/` | Area catalog | staff |
| `/admin/content/site/viewing/` | Viewing fee constants | staff |
| `/admin/content/site/forms/` | Form microcopy | staff |
| `/admin/content/site/nav/` | Header / footer nav | staff |
| `/admin/settings/` | Account / Team / Notifications | Account: staff; Team & Notifications: **admin** UI + actions |

Nav definition: `components/admin/admin-shell.tsx`.

---

### C2. Listings management

**Wizard steps** (`components/admin/listing-editor.tsx`):  
1. Type (mode, category, title, area, internal address)  
2. Details (beds/baths, land title/plot, commercial floor area, etc.)  
3. Photos (Storage `listing-images`, cover, room tags, reorder)  
4. Amenities + highlights  
5. Pricing / description  
6. Review (publish or draft)

**Five-image publish rule**

| Layer | Enforced? | Evidence |
|-------|-----------|----------|
| Shared constant | `MIN_LISTING_IMAGES = 5` | `lib/listing-validation.ts` L3 |
| UI | Continue past photos + publish blockers | `listing-editor.tsx` |
| Server | `assertCanPublish` on publish | `lib/listings/actions.ts` |

Draft save is allowed with fewer than five photos. Publish additionally requires cover, title, area, and category-specific fields on the **server** (beds/baths, land plot + encumbrances, commercial floor area, sale title status). UI publish blockers are a **subset** of server rules — save can fail with a server error the UI did not preview.

**Preview:** Review step renders the real public `PropertyDetailPage` with a mapped draft property — same component as live detail (`listing-editor.tsx` imports).

**What staff cannot do today (observed gaps)**

- Bulk edit / bulk publish  
- Duplicate a listing  
- Archive from the editor (status `archived` exists in DB/types/filters; no Archive control in the wizard)  
- Delete a listing (no delete action; content entities have delete, listings do not)

---

### C3. Requests inbox

#### Viewing bookings

Statuses: `requested | confirmed | completed | expired | declined` (`lib/requests/types.ts`).

UI actions: Confirm, Mark completed, Decline, Reset to requested (`components/admin/booking-detail.tsx`). No dedicated “Mark expired” button.

**Expiry:** On confirm, server sets `expires_at = now + viewing.passDays` from CMS `site_content.viewing` (`lib/requests/actions.ts`). Default is 14 days (`lib/viewing-bookings/types.ts`, `catalog-defaults.ts`). Admin UI copy still hardcodes “14-day” in places even if CMS `passDays` changes — verify copy vs CMS when changing fees.

#### Property submissions

Statuses: `new | contacted | visited | listed | declined`.

“Create listing” CTA appears when status is `visited` or `listed` (`submission-detail.tsx`). Prefill mapper: `lib/requests/submission-to-listing.ts` → `/admin/listings/new/?from=…`. Helper text may still mention “contacted” as unlock in one place — logic is `visited|listed`.

---

### C4. Settings

| Tab | What it does | Role gate |
|-----|--------------|-----------|
| Account | Display name, change password, sign out | All staff — `requireStaff` |
| Team | Invite by email+role, change role, remove | **Admin UI** hides tab; actions use `requireAdmin` (`lib/settings/actions.ts`) |
| Notifications | Notify email + WhatsApp digits | **Admin** UI + `requireAdmin` |

**Notify config at send-time (Next.js API routes):**  
`getNotifyConfig()` reads `notification_settings` first, then falls back to env (`lib/settings/notify-config.ts`). Viewing and property-submission Next routes use this.

**Caveat:** Optional Cloudflare Pages Functions under `functions/api/` resolve notify env **only** (no DB). Client WhatsApp fallbacks also use `NEXT_PUBLIC_WHATSAPP_NUMBER` / hardcoded default digits in `client-submit.ts`.

---

### C5. Content management

#### Catalog (CRUD in CMS)

| Entity | Editable in CMS? | Table |
|--------|------------------|-------|
| Insights | Yes | `insight_posts` |
| Services | Yes | `services` |
| Agents | Yes | `agents` |
| Reviews | Yes | `reviews` |

#### Site content keys (JSON in `site_content`)

All ten keys are editable under `/admin/content/site/*` and seeded via `pnpm seed:site`.

| Key | Officer-facing editor |
|-----|----------------------|
| `company` / `contact` | Company & contact |
| `about` | About page |
| `list_with_us` | List with us marketing |
| `home` | Home & marketing |
| `taxonomy` | Labels & kinds (amenities, types, tabs) |
| `areas` | Area catalog |
| `viewing` | Viewing fees |
| `forms` | Form microcopy |
| `nav` | Navigation |

**Still code-shaped (not CMS fields):** page layout/structure, Flaticon amenity *icons* (labels are CMS), listing “things to know” generators (fee numbers come from CMS viewing config), dual Cloudflare stub listing API, seed scripts.

---

### C6. Authentication & access control

| Topic | Actual behavior |
|-------|-----------------|
| Provider | Supabase Auth, email/password (`components/admin/login-form.tsx`) |
| Session | Cookie SSR via `@supabase/ssr`; middleware refreshes session |
| Roles | `profiles.role`: `admin` \| `staff` |
| Real enforcement | Server actions check role; RLS `is_staff()` / admin policies on tables |
| UI-only gaps | Middleware admits **any** logged-in user into the CMS shell; non-staff users see chrome but data actions fail with “Staff access required” |
| Team/Notifications | Hidden in UI for staff **and** blocked by `requireAdmin` on actions — real access control for those mutations |

**Accounts in local DB (roles only, no PII):** 2 profiles — **1 admin**, **1 staff**. Local bootstrap script defaults a staff user (`scripts/setup-local-supabase.sh`); production account inventory is not in the repo.

---

## PART D — Data & infrastructure

### D1. Database schema (as migrated)

Migrations: `supabase/migrations/001_cms_foundation.sql` … `005_site_content.sql`.

| Table | Role |
|-------|------|
| `profiles` | Staff identity + role (`admin`/`staff`) |
| `listings` | Inventory; status draft/published/archived; categories house/apartment/land/commercial |
| `listing_images` | Images for listings; cover + room tags |
| `viewing_bookings` | Public insert; staff read/update; `listing_ids uuid[]` (no FK) |
| `property_submissions` | Lead intake; public insert |
| `insight_posts` | Blog |
| `services` | Service pages + enquiry config JSON |
| `agents` | Team profiles |
| `reviews` | Testimonials |
| `notification_settings` | Notify email + WhatsApp; admin write |
| `site_content` | Keyed JSON marketing / taxonomy / forms / nav |

Storage bucket: `listing-images` (public read, staff write) — `001_cms_foundation.sql`.

**Notable drifts**

- Public TypeScript `Property.category` is `property | land`; DB uses `house|apartment|land|commercial` with mapping in `lib/listings/map.ts`.  
- App `TitleStatus` includes `kibanja`; DB CHECK on listings omits `kibanja` (`001` L92).  
- Comments in older viewing-booking types still say “no admin UI”; admin inbox exists.

---

### D2. Integrations

| Integration | Implementation | Evidence |
|-------------|----------------|----------|
| Supabase Auth / DB / Storage | Primary for CMS + public reads | `lib/supabase/*`, migrations |
| Resend email | Real `POST https://api.resend.com/emails` when key + to-address present | `lib/viewing-bookings/email.ts`, `lib/property-submissions/email.ts` |
| WhatsApp | `wa.me` deep links only — no Meta/Twilio send API | `templates.ts` `buildWhatsAppUrl` |
| Bitly | Optional URL shortener for WhatsApp listing links | `lib/viewing-bookings/shorten.ts` |
| Cloudflare Pages Functions | Optional parallel path under `functions/api/`; listings function is a **stub** (logs, no DB) | `functions/api/listings.ts` |

**Email delivery cannot be confirmed from static code alone.** Code clearly calls Resend when env is set; whether messages arrive depends on Resend domain verification and live keys — not verified in this report.

---

### D3. Environment & deployment

Variables documented in `.env.example`:

| Group | Variables | Purpose |
|-------|-----------|---------|
| Site | `NEXT_PUBLIC_SITE_URL`, `SITE_URL` | Absolute URLs, invites |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | DB/auth/storage |
| Email | `NOTIFY_EMAIL_TO`, `NOTIFY_EMAIL_FROM`, `RESEND_API_KEY` | Manager emails |
| WhatsApp | `NEXT_PUBLIC_WHATSAPP_NUMBER` (+ aliases in resolve helpers) | wa.me CTAs |
| Bitly | `BITLY_ACCESS_TOKEN` | Optional shorten |
| API overrides | `NEXT_PUBLIC_BOOKINGS_API_URL`, `NEXT_PUBLIC_SUBMISSIONS_API_URL`, `NEXT_PUBLIC_LISTINGS_API_URL` | Point clients elsewhere |

**Runtime shape:** Standard Next.js (`next.config.ts` — **not** `output: 'export'`), `trailingSlash: true`, Node-capable host required for App Router server actions and middleware. Scripts: `dev`, `build`, `start`, `seed:listings`, `seed:content`, `seed:site`.

**Local-only assumptions to watch in production**

- Auth `site_url` in `supabase/config.toml` points at `127.0.0.1:3000` for local  
- Invite redirect fallback `http://localhost:3000` in settings actions  
- Middleware open if Supabase env missing  
- Prefer fail-closed lead APIs (no client localStorage success masking)  

---

## PART E — Gaps, risks & recommendations

### E1. What’s not built or incomplete

| Item | Evidence |
|------|----------|
| Contact / service enquiry **admin inbox** | Wired — `/admin/requests/?tab=contact|services` + detail pages |
| Multi-listing viewing cart / public viewing list page | No route; UI books one listing |
| Listing archive UI | Status in schema; no editor control |
| Listing delete | No action |
| Bulk listing operations / duplicate | Absent |
| Cloudflare `functions/api/listings.ts` | Stub — does not persist |
| CMS copy vs CMS `passDays` in booking detail | Hardcoded “14-day” wording risk |
| Middleware role gate | Login-only; staff check is action-level |

### E2. Risks

1. **Open public INSERT** on lead tables with `WITH CHECK (true)` — spam/abuse; APIs have rate limit + honeypot (Turnstile optional). Hardening is PR4.  
2. **CORS `*`** on public APIs.  
3. **Authz at the edge** — any Supabase user can open admin UI; rely on action/RLS for denial.  
4. **Publish validation mismatch** — UI blockers thinner than server; staff may hit late errors.  
5. **Concurrent edit** — last save wins; image replace deletes-then-inserts (`lib/listings/actions.ts`) — race can drop images.  
6. **Service role in API routes** — correct pattern if keys stay server-only; catastrophic if leaked to client.

### E3. Recommended next steps (priority)

1. **Apply `008` on live Supabase (mdbx)** if not yet run — removes anon INSERT on lead tables.  
2. **Confirm Resend + WhatsApp** on production notify settings.  
3. **Replace demo seed listings** with real inventory (see `docs/ops-debt-closure.md`).  
4. **Enforce staff role in middleware or `(app)` layout** so non-staff accounts never see CMS chrome.  
5. **Align UI publish blockers with server rules**; optional Archive control polish.  
6. **Production checklist** — Node host for Next, migrations through `008`, Resend domain, WhatsApp number, Supabase Auth site URL, no empty-env middleware bypass.

~~Completed in-repo:~~ fail-closed leads, Requests inbox (all four types), public `/areas/` guides, featured CMS toggle, Storage lead-fallback removed.

---

## Appendix — Evidence index

| Topic | Primary paths |
|-------|----------------|
| Public home | `app/page.tsx` |
| Listing data | `lib/properties.ts`, `lib/listings/queries.ts` |
| Viewing pipeline | `components/viewing-booking-form.tsx`, `app/api/viewing-bookings/route.ts`, `lib/viewing-bookings/*` |
| List-with-us pipeline | `components/list-with-us-form.tsx`, `app/api/property-submissions/route.ts` |
| Contact form | `components/contact-section.tsx` → `/api/contact-enquiries` |
| Admin auth | `middleware.ts`, `lib/admin/auth.ts` |
| Publish rules | `lib/listing-validation.ts`, `lib/listings/actions.ts` |
| Site CMS | `lib/site-content/*`, `app/admin/(app)/content/site/*` |
| Schema | `supabase/migrations/001`–`008` |
| Design tokens | `app/globals.css` L3–54 |
| Env template | `.env.example` |

---

*End of report. No application code was modified while producing this document.*

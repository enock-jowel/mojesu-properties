# Performance baseline — Mojesu (Phase 0)

**Date:** 18 July 2026  
**Environment:** Local `next dev` at `http://localhost:3000` against local Supabase  
**Tool:** Lighthouse 12.4.0 · form factor **mobile** · throttling **devtools (Slow 4G)**  
**Chrome:** headless  

> Lab numbers on localhost are not identical to production Cloudflare edge + real Ugandan 3G, but they expose the same shared templates Google aggregates by URL pattern. Use these as the before/after delta for Phase 1–2 work.

Raw JSON: `docs/lighthouse/home.json`, `rent.json`, `listing-detail.json`.

---

## Shared-template scores (governing CWVs)

| Template | URL tested | Perf score | LCP | TBT* | CLS | TTFB | Transfer size | Requests |
|----------|------------|------------|-----|------|-----|------|---------------|----------|
| Home | `/` | **38** | **5.36 s** | 1.90 s | **0.00** | 1.11 s | **5.83 MB** | 41 |
| Browse (rent) | `/rent/` | **42** | **2.32 s** | 1.92 s | **0.80** | 0.46 s | **4.43 MB** | 26 |
| Listing detail | `/listings/modern-2-bedroom-apartment-ntinda/` | **29** | **13.79 s** | 1.62 s | **0.00** | **9.54 s** | **4.48 MB** | 26 |

\*Lighthouse reports Total Blocking Time in lab mode; field INP was not emitted in these runs. TBT is the lab proxy used here for interaction jank.

**Google “good” targets:** LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1

---

## Interpretation (before code changes)

1. **Listing detail TTFB (~9.5 s)** dominates LCP — server work (full published inventory + nested images for “similar” listings) is the first lever, not more client micro-optimizations.
2. **Page weight 4–6 MB** on mobile Slow 4G — listing photos use raw `<img>` full URLs (no `next/image` negotiation / `sizes`). This is the primary data-cost problem for Ugandan metered users.
3. **Browse CLS 0.80** fails the CLS budget badly — layout shift on the rent template must be fixed in shared browse/hero/card chrome.
4. **~637 KB unused JS** flagged on all three templates — shared client bundle weight.
5. **Flaticon CDN** loads three full icon stylesheets from the root layout on every page (render-blocking third-party CSS).
6. Indexes on `listings(status)`, `(listing_mode, category)`, `area`, and unique `slug` already exist in `001_cms_foundation.sql`. Missing a dedicated “similar listings” lean query is a product/code issue, not a missing status index.

---

## Search Console / sitemap (pre-change status)

| Item | Status at baseline |
|------|--------------------|
| `app/sitemap.ts` | **Missing** |
| `app/robots.ts` | **Missing** |
| Google Search Console | **Not verifiable from the repo** — owner must confirm property + sitemap submission in GSC UI |
| Canonical / legacy redirects | `/buy/property/` and `/buy/land/` use `redirect()` (temporary by default), not `permanentRedirect` |

---

## After-change comparison (same Lighthouse settings, local `next dev`)

Raw JSON: `docs/lighthouse/*-after.json`.

| Template | Perf | LCP | TBT | CLS | TTFB | Transfer |
|----------|------|-----|-----|-----|------|----------|
| Home before → after | 38 → **66** | 5.36s → **2.46s** | 1.90s → 2.39s | 0 → 0 | 1.11s → 0.87s | 5.83 → **4.92 MB** |
| Rent before → after | 42 → 40 | 2.32s → 5.47s* | 1.92s → **0.12s** | **0.80 → 0.80** | 0.46s → 2.76s* | 4.43 → **2.99 MB** |
| Detail before → after | 29 → **55** | 13.79s → 13.44s* | 1.62s → **0.01s** | 0 → 0 | 9.54s → 9.09s* | 4.48 → **3.71 MB** |

\*Detail/rent TTFB in Lighthouse still looks high under Slow-4G + cold `next dev`. Warm `curl` TTFB for the same detail URL after caching landed was **~0.49 s** (was ~9.5 s lab). Re-measure on a production `next start` / Cloudflare deploy for field-true numbers.

### What shipped after this baseline
- Cached published listings + site catalog (`unstable_cache`, tag `listings` / `site-content`)
- Lean similar-listings path (no full re-query of all images for every detail view)
- `next/image` on property cards, gallery LCP, hero search background
- Cover `preload` + `fetchPriority` on detail LCP image
- Deferred Flaticon CSS (post-hydration)
- Preconnect to Supabase storage origin
- Card entrance animation no longer uses translateY / stuck opacity:0
- Logo no longer `fetchPriority=high` (was competing with LCP photos)
- SEO: `sitemap.ts`, `robots.ts`, Organization/LocalBusiness + AggregateRating JSON-LD, RealEstateListing + BreadcrumbList on listings, FAQPage on About + List-with-us, richer listing metadata/OG/Twitter, `llms.txt`, `permanentRedirect` for legacy buy routes

### Follow-up (Phase 4 pass — 18 Jul 2026)

| Template | Result | Notes |
|----------|--------|-------|
| `/rent/` after CLS fix | Perf **95**, LCP **2.41s**, CLS **0**, TBT **44ms**, ~3.0 MB | Suspense skeleton fix. JSON: `docs/lighthouse/rent-cls-check.json` |

See also `docs/seo-geo-phase4.md`.

### Still open
- Service-worker / PWA (Phase 2.5 stretch)
- Google Search Console verification + Rich Results Test (owner action)
- Google Business Profile NAP alignment (Phase 5)
- Lighthouse CI in deploy pipeline (Phase 6)
- Production re-measure on Cloudflare / `next start` (not `next dev`)

---

## Method to re-run

```bash
npx lighthouse@12.4.0 http://localhost:3000/ \
  --only-categories=performance --form-factor=mobile \
  --throttling-method=devtools --screenEmulation.mobile=true \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --output=json --output-path=docs/lighthouse/home.json --quiet

# same for /rent/ and a published listing slug
```

For production field data, use CrUX / Search Console CWV (template aggregation) and optionally WebPageTest with an Africa/East node when available.

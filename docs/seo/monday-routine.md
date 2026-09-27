# Monday SEO routine — mojesuproperties.com

Goal: non-branded search traffic from Kampala renters, buyers, landlords and
land buyers. One focused batch per week, shipped on a branch, approved by a human.

## Human gate (non-negotiable)

- Work happens on `seo/week-YYYY-MM-DD` → Vercel preview → human approves → merge.
- CMS content edits are **proposed** in the weekly notes; a human pastes them.
- Never invent prices, yields, market stats, legal claims, reviews or rankings.
  Anything unverified is listed under **Needs human verification**.

## 1. Opportunity scan (30 min)

- [ ] GSC → Performance → last 28 days vs previous. Filter out queries containing `mojesu`.
- [ ] Note queries at positions **8–20** with impressions ≥ 20 → quick-win list.
- [ ] Note pages with CTR < 2% at positions ≤ 10 → title/description rewrite list.
- [ ] GSC → Pages → any new "Crawled – not indexed" or "Duplicate without canonical".
- [ ] Check new listings added this week: do their titles read `N-Bedroom Type for Rent in Area`?
- [ ] Pick **one** content opportunity (see `content-template.md`).

## 2. Content implementation

- [ ] Title ≤ 60 chars total. Pages under the root template: write ≤ 51 (the site appends ` — Mojesu`).
- [ ] Meta description ≤ 155 chars, facts only, ends with an action.
- [ ] One H1 per page containing the primary phrase.
- [ ] New insight follows the template: lead → H2 sections → internal links → FAQ block last.
- [ ] Apply this week's rows from `internal-link-map.md`.

## 3. Technical checks

- [ ] `pnpm build` passes; home first-load JS stays ≈ 190 KB.
- [ ] Rich Results Test on 1 listing, 1 service, 1 insight (RealEstateListing / Service / Article + FAQPage + BreadcrumbList).
- [ ] `/sitemap.xml` includes every new public URL; no admin or filtered URLs.
- [ ] Lighthouse mobile (slow 4G) on home + 1 listing: LCP < 2.5 s, CLS < 0.1.

## 4. Quality + tracking

- [ ] Every claim in new copy is either on the listing record or cited.
- [ ] Add a row per change to `tracking-log.csv` (date, URL, change, target query, baseline position/clicks).
- [ ] Re-check last month's rows: position/clicks after 14 and 28 days.
- [ ] Post the preview link + summary for approval.

## Standing guardrails

- Area landing pages were intentionally removed. Do not recreate them without explicit approval.
- Browse filters (`?location=`) canonicalise to their parent — never put them in the sitemap.
- Keep structured data truthful: no `aggregateRating` unless it comes from real reviews.

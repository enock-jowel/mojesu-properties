# Indexing & ranking plan — mojesuproperties.com

_Last updated: 2026-10-03 (branch `seo/week-2026-10-05`)_

## Honest expectations

- **Branded searches** ("Mojesu", "Mojesu Properties", "Mojesu Properties Kampala") should reach
  page one once Google has indexed the home page — there is little competition for the name.
  A verified Google Business Profile makes this much more reliable (knowledge panel / map pack).
- **Non-branded searches** ("houses for rent in Kampala", "land for sale in Kira") are contested by
  older portals (Jiji, Lamudi-style aggregators, big agencies). Nobody can guarantee page one for
  every page. What decides it: being indexed, being the most useful page for the query, links from
  other sites, Google Business Profile strength (reviews), and time. The domain was registered
  **2026-09-21** — it is about two weeks old, so expect months, not days.
- Long-tail, hyper-local queries ("3 bedroom house for rent in Kira", "50x100 plot Namugongo") are
  the realistic first page-one wins.

## Current index status

| Item | Status |
| --- | --- |
| Search Console property | `sc-domain:mojesuproperties.com`, verified by DNS TXT (owner: enockjowel1231@gmail.com) |
| Sitemap | `/sitemap.xml` submitted 2026-09-26 · **72 URLs** (9 hub pages, 19 area guides, 35 listings, 6 services, 3 insights) |
| Search Console API access | **None in the repo** (no service account / OAuth). Real indexed counts, coverage reasons and query positions must be read in the GSC UI — see the steps below. |
| Live technical audit (2026-10-03) | 72/72 URLs return 200, indexable (no `noindex`), self-referencing canonical matching the sitemap (trailing slash), one H1, titles ≤ 60, descriptions ≤ 155, valid JSON-LD, **0 orphan pages**, every listing reachable in ≤ 2 clicks from home (home → rent/buy/land → listing). Unknown listing slugs return a real 404 + `noindex` (no soft-404s). |
| Fixed this week | `www.` served a duplicate copy (200) → now 308 to apex in one hop · no share image on hub/area pages → default OG image · Organization schema street address contained opening hours and two phone numbers in one string → cleaned; inaccurate city-centre map pin removed · added WebSite schema (brand name in results) · rent/buy/land hubs had ~190–280 words → now ~400–500 with data-driven intro, area links and FAQ + CollectionPage/ItemList/BreadcrumbList/FAQPage schema · services/insights hubs got CollectionPage + BreadcrumbList · IndexNow (Bing/Yandex) set up. |

### Read the real numbers in Search Console (5 minutes)

1. https://search.google.com/search-console → property `mojesuproperties.com`.
2. **Indexing → Pages**: note "Indexed" vs "Not indexed" and each reason
   ("Discovered – currently not indexed" is normal for a new site; "Duplicate without user-selected
   canonical" or "Alternate page with proper canonical" for `www.` should disappear after this deploy).
3. **Indexing → Sitemaps**: confirm `/sitemap.xml` shows "Success" and **72 discovered URLs**.
   If it still shows the old count, click it → "Resubmit".
4. **URL Inspection** → paste each URL below → **Request indexing** (quota ≈ 10/day, do the top ones first):
   `/`, `/rent/`, `/buy/`, `/land/`, `/areas/`, `/services/`, `/areas/kira/`, `/areas/ntinda/`,
   `/areas/naalya/`, `/services/property-management/`, then the newest listings.
5. **Performance → Search results**, last 28 days: copy clicks/impressions/position per page into
   `tracking-log.csv` (`baseline_position` column).
6. Optional (lets the agent pull this automatically next week): Google Cloud → create a service
   account → enable "Search Console API" → in GSC Settings → Users and permissions → add the service
   account email as **Restricted** user → save the JSON key **outside the repo** and tell the agent
   the path. Never commit it.

### Bing / IndexNow

- Key file: `public/80743294eee489d4b0e61525f88d0e9e.txt`. After each production deploy that adds or
  changes pages: `pnpm indexnow` (pings all sitemap URLs) or `pnpm indexnow <url> …`.
- Also add the site in **Bing Webmaster Tools** (https://www.bing.com/webmasters → "Import from Google
  Search Console") — Bing powers ChatGPT search and Copilot answers.

## Per-page target queries

Positions: "—" = not known yet (no GSC API data). Fill from GSC Performance after step 5.

| Page | Realistic target query | Secondary queries | Current position |
| --- | --- | --- | --- |
| `/` | mojesu properties (branded) | houses and land for rent and sale in kampala | — |
| `/rent/` | houses for rent in kampala | apartments for rent kampala, rentals kampala | — |
| `/buy/` | houses for sale in kampala | homes for sale kampala | — |
| `/land/` | land for sale in kampala | plots for sale kampala, land for sale wakiso | — |
| `/areas/` | best areas to live in kampala | kampala neighbourhoods guide | — |
| `/areas/<slug>/` (19) | houses for rent in <area> | land for sale in <area>, <area> kampala | — |
| `/listings/<slug>/` (35) | <n> bedroom <type> for rent in <area> / <size> plot for sale <area> | listing title words | — |
| `/services/` | real estate services kampala | real estate company kampala | — |
| `/services/property-management/` | property management kampala | property managers kampala | — |
| `/services/valuation/` | property valuation kampala | land valuation uganda | — |
| `/services/surveying/` | land surveying kampala | land title verification uganda | — |
| `/services/agent-search/` | house hunting agent kampala | rental agent kampala | — |
| `/services/development/` | property development consultants kampala | — | — |
| `/services/facilities/` | facilities management kampala | — | — |
| `/insights/` | kampala property guide | — | — |
| `/insights/kibanja-vs-freehold-kampala/` | kibanja vs freehold | kibanja meaning uganda | — |
| `/insights/kampala-rental-yields-mid-2026/` | rental yields kampala | — | — |
| `/insights/naalya-area-guide-families/` | living in naalya | naalya kampala | — |
| `/about/` | mojesu properties about / real estate agents kampala | — | — |
| `/list-with-us/` | list my house for rent kampala | sell my land kampala | — |

## Off-site actions only the owner can do (priority order)

1. **Google Business Profile** (biggest single lever for local + branded):
   - https://business.google.com → add business **"Mojesu Properties"** → primary category exactly
     **"Real estate agency"** (secondary: "Property management company", "Real estate consultant").
   - Address: the real office at Naalya, Namugongo Road — drop the pin precisely on the office.
   - Phone **+256 780 827 159** (same as the site's click-to-call), website `https://mojesuproperties.com/`,
     hours Mon–Fri 9:00–18:00, Sat 9:00–14:00 (as stated on the site).
   - Complete verification (video or postcard), add 10+ real photos (office, team, properties), a short
     description, service areas (Kampala, Wakiso, Mukono) and services.
   - Then update the site: in Admin → Company, set the **Maps link** to the new GBP share link
     (it currently points to a generic "Kampala Road" search, which conflicts with the Naalya address)
     and send the agent the office coordinates so `geo` can be added back to the schema.
2. **Reviews**: ask every recent client (tenants, buyers, landlords) for an honest Google review via
   the GBP "Ask for reviews" link. Aim for a steady trickle (e.g. 2–4 a month), reply to every one.
   Never buy or script reviews.
3. **Request indexing in Search Console** for the top URLs (steps above) and resubmit the sitemap.
4. **Consistent NAP citations** (same name, address, phone everywhere) in Ugandan directories:
   Yellow Pages Uganda, Uganda Business Directory, Bing Places (import from GBP), Apple Business Connect,
   Facebook Page, LinkedIn Company page. Post selected listings on Jiji.ug / property portals with a
   link back.
5. **Social profiles in `sameAs`**: only TikTok and YouTube are listed now. Create/claim Facebook,
   Instagram, LinkedIn and X under the same brand, then add them in Admin → Company → socials (the
   schema picks them up automatically).
6. **Backlinks from real partners**: developers, landlords, surveyors, banks/SACCOs (mortgage partners),
   relocation agents, NGO/embassy housing desks, local news features. One relevant link from a Ugandan
   site is worth more than many low-quality ones. Never buy links.
7. **Content cadence**: one genuinely useful insight article every 1–2 weeks (e.g. "How to verify a land
   title in Uganda", area cost-of-living notes) using `content-template.md`, plus keep listings fresh —
   new and updated listings are the strongest freshness signal.

## Needs human verification / data gaps

- **Title status is empty on every listing.** The `/buy/` meta description and browse intro say homes
  show "title status (freehold, mailo, leasehold…)"; the data does not support that yet. Fill
  `titleStatus` on all sale and land listings in the CMS (it is meant to be required on sales), or ask
  the agent to soften that copy.
- Listing `commercial-plot-kira-road` is titled "commercial plot" but its land type is set to
  "Plot (residential)" — check the land type in the CMS.
- `aggregateRating` (4.9 from 7 reviews) in the Organization schema comes from the reviews feed. Google
  does not show stars for a business's own reviews on its own site, so this won't produce stars; keep it
  only if it matches the public Google reviews.
- Insight articles have no FAQ block yet, so they have no FAQPage schema — add 3–4 Q&As per article in
  the CMS (see `internal-link-map.md`).
- `/services/` and `/insights/` intro text is CMS-managed and short (~150 words) — expand it in Admin
  with factual detail.

## Realistic timeline

| When | What to expect |
| --- | --- |
| 1–2 weeks | Most hub pages and area guides indexed after "Request indexing"; branded searches show the home page. |
| 2–6 weeks | GBP verified → map listing for "Mojesu" and "real estate agency Naalya"; long-tail listing/area queries start getting impressions. |
| 2–4 months | Area guides and listings reach page one for low-competition local queries (e.g. "houses for rent in Najjera"), if reviews and a few local links come in. |
| 4–9 months | Competitive head terms ("houses for rent in Kampala", "land for sale in Kampala") — possible page two → one with steady reviews, links and fresh listings. Not guaranteed. |

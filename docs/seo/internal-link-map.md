# Internal link map — Kampala neighbourhoods

Built from **live published data** (listings, services, insights) on 2026-09-26.
Regenerate the area table whenever listings change materially.

How to add a link inside an insight (CMS → Insights → edit): write
`[anchor text](/path/)` in any lead, paragraph or list item. Internal paths
render as normal site links; the brackets never show to readers.

## Rules

1. Every insight links to **at least 2 listing/browse URLs and 1 service**.
2. Anchor text = what the searcher would type (`2-bedroom apartments in Ntinda`),
   never `click here`.
3. Link the **first** natural mention only; max ~1 link per 80 words.
4. Browse URLs with `?location=` are for readers (they canonicalise to the
   parent page). Ranking value flows through **area guides (`/areas/<slug>/`),
   listing pages, services and insights** — for a neighbourhood mention, link
   the area guide first.
5. `location` values are exact and case-sensitive: `Kira`, `Outer%20Kira`.

## Hub pages (always valid targets)

| Intent | URL |
| --- | --- |
| Homes for rent, Kampala | `/rent/` |
| Homes for sale, Kampala | `/buy/` |
| Land for sale | `/land/` |
| Commercial to rent | `/rent/?use=commercial` |
| Commercial for sale | `/buy/?use=commercial` |
| Neighbourhood guides | `/areas/` (each area: `/areas/kira/`, `/areas/outer-kira/` …) |
| All services | `/services/` |
| All guides | `/insights/` |

## Neighbourhood table

| Area | Listings | Browse links | Listing pages worth linking | Best service / insight |
| --- | --- | --- | --- | --- |
| Kira | 6 (houses rent/sale, warehouse, 2 plots) | `/rent/?location=Kira` · `/buy/?location=Kira` · `/land/?location=Kira` | `/listings/spacious-3-bedroom-house-kira/` · `/listings/4-bedroom-bungalow-kira-rent/` · `/listings/residential-plot-kira-50x100/` | rental-yields insight · `/services/surveying/` |
| Ntinda | 5 (2 apartments rent, retail, mixed-use, plot) | `/rent/?location=Ntinda` · `/buy/?location=Ntinda` · `/land/?location=Ntinda` | `/listings/modern-2-bedroom-apartment-ntinda/` · `/listings/self-contained-2bed-ntinda/` · `/listings/commercial-plot-ntinda-100x100/` | rental-yields insight · `/services/property-management/` |
| Najjera | 3 (apartment, maisonette, plot) | `/rent/?location=Najjera` · `/land/?location=Najjera` | `/listings/bright-1-bedroom-apartment-najjera/` · `/listings/2-bedroom-maisonette-najjera/` · `/listings/residential-plot-najjera-50x100/` | rental-yields insight · `/services/agent-search/` |
| Naalya | 3 (townhouse, apartment, mall unit) | `/rent/?location=Naalya` | `/listings/family-3-bedroom-townhouse-naalya/` · `/listings/3-bedroom-apartment-naalya/` · `/listings/retail-mall-unit-naalya-rent/` | Naalya insight · `/services/agent-search/` |
| Nakasero | 3 (offices rent/sale, plot) | `/rent/?location=Nakasero` · `/buy/?location=Nakasero` | `/listings/office-suite-nakasero/` · `/listings/commercial-plot-nakasero/` | `/services/facilities/` · `/services/valuation/` |
| Bukoto | 2 (studio, bedsitter) | `/rent/?location=Bukoto` | `/listings/cozy-studio-bukoto/` · `/listings/bedsitter-bukoto/` | `/services/agent-search/` |
| Kololo | 2 (furnished apartment, coworking) | `/rent/?location=Kololo` | `/listings/furnished-2-bedroom-apartment-kololo/` · `/listings/coworking-office-kololo-rent/` | `/services/agent-search/` |
| Bugolobi | 2 (retail shop, serviced office) | `/rent/?location=Bugolobi` | `/listings/retail-shop-bugolobi-rent/` · `/listings/serviced-office-bugolobi-rent/` | `/services/facilities/` |
| Wakiso | 2 (warehouse, 5-acre farm land) | `/buy/?location=Wakiso` · `/land/?location=Wakiso` | `/listings/agricultural-wakiso-5acres/` | Kibanja insight · `/services/surveying/` |
| Muyenga | 1 (5-bed house sale) | `/buy/?location=Muyenga` | `/listings/5-bedroom-hilltop-mansion-muyenga/` | `/services/valuation/` |
| Naguru | 1 (3-bed apartment sale) | `/buy/?location=Naguru` | `/listings/3-bedroom-apartment-naguru-sale/` | `/services/valuation/` |
| Lubowa | 1 (townhouse sale) | `/buy/?location=Lubowa` | `/listings/townhouse-lubowa-sale/` | `/services/valuation/` |
| Mukono | 1 (farm land) | `/land/?location=Mukono` | `/listings/agricultural-land-mukono/` | Kibanja insight · `/services/surveying/` |
| Gayaza | 1 (100x100 plot) | `/land/?location=Gayaza` | `/listings/residential-plot-gayaza-100x100/` | Kibanja insight · `/services/development/` |
| Namugongo | 1 (plot) | `/land/?location=Namugongo` | `/listings/residential-plot-namugongo/` | Kibanja insight · `/services/development/` |
| Outer Kira | 1 (plot) | `/land/?location=Outer%20Kira` | `/listings/residential-plot-outer-kira/` | Kibanja insight · `/services/surveying/` |

## Staged link edits for existing insights (human applies in CMS)

Nothing below changes a claim — it only turns existing words into links.

### `kampala-rental-yields-mid-2026` — currently 0 links

- "Ntinda, Kira, And Najjera At A Glance" paragraph:
  - `[Ntinda](/areas/ntinda/) remains liquid for 2–3 bedroom apartments…`
  - `[Kira](/areas/kira/) offers more house-style stock…`
  - `[Najjera](/areas/najjera/) continues to draw families…`
- "Account For Real Operating Costs" paragraph — append:
  `If you would rather not run this yourself, see [property management in Kampala](/services/property-management/).`
- "Start With Comparable Leases" paragraph — append:
  `A [professional valuation](/services/valuation/) helps when comparables are thin.`

### `kibanja-vs-freehold-kampala` — currently 0 links

- "What Kibanja Buyers Must Verify" list item 2:
  `[Boundary survey](/services/surveying/) against what you were shown`
- Lead: `…how carefully you must [verify rights before you pay](/services/surveying/).`
- "Final Thoughts" — append:
  `Browse [land for sale around Kampala](/land/) with title status labelled on every plot.`

### `naalya-area-guide-families` — currently 0 links

- Lead: `[Naalya](/areas/naalya/) keeps earning a place on family shortlists…`
- "How To Use Viewings" paragraph:
  `Book two or three [homes in Naalya](/rent/?location=Naalya) in one corridor on the same day.`
- "What Families Optimise For" list item 3:
  `Housing stock with outdoor or parking space — e.g. this [3-bedroom townhouse in Naalya](/listings/family-3-bedroom-townhouse-naalya/)`
- "Final Thoughts" — append:
  `Short on time? An [agent-assisted search](/services/agent-search/) can shortlist and book viewings for you.`

## Built-in links to area guides

- Every listing page shows "{Area} guide" next to the location (when a guide exists).
- Browse results filtered by location show "{Area} guide".
- Listing BreadcrumbList schema: Home › Rent/Buy › **Area guide** › Listing.
- Header (desktop ≥1024px, mobile menu) and footer link to `/areas/`.

## Reverse links (pages that should point *to* insights)

These need a small UI slot (not built yet — ask before adding):

- Kira / Ntinda / Najjera area guides → rental-yields insight
- Naalya area guide → Naalya insight

- `/services/property-management/` → rental-yields insight
- `/services/surveying/` → Kibanja vs freehold insight
- Naalya listing pages → Naalya insight

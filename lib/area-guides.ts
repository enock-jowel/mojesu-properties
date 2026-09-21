/**
 * Editorial area guides — indexable local SEO content (Phase 5).
 * Names match `AREA_CATALOG` / CMS areas.catalog. Slugs are stable URL keys.
 */
import type { AreaTier } from '@/lib/areas'

export type AreaGuide = {
  slug: string
  name: string
  tier: AreaTier
  /** First 1–2 sentences: direct answer for GEO */
  summary: string
  /** Longer local context */
  body: string[]
  /** Typical searcher intents we serve here */
  highlights: string[]
}

export type TierGuide = {
  tier: AreaTier
  slug: string
  title: string
  summary: string
  body: string[]
}

export function areaSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const TIER_GUIDES: TierGuide[] = [
  {
    tier: 'prime',
    slug: 'prime',
    title: 'Prime Kampala neighbourhoods',
    summary:
      'Prime Kampala areas — Kololo, Nakasero, Naguru, Muyenga, Munyonyo, and Lubowa — concentrate high-demand homes, embassies, and established compounds with stronger resale liquidity.',
    body: [
      'Buyers and corporate tenants usually start here when they need security, short commutes to the city centre, and finishes that match expatriate or executive housing standards. Rents and sale prices sit at the top of the Kampala range, so title status and viewing logistics matter early.',
      'Mojesu lists verified rentals and sales across these corridors with tenure labelled on sale listings (freehold, mailo, leasehold, and more). Use the guides below to jump into a specific neighbourhood, or browse the full prime filter on Rent and Buy.',
    ],
  },
  {
    tier: 'mid',
    slug: 'mid-market',
    title: 'Mid-market Kampala neighbourhoods',
    summary:
      'Mid-market Kampala — Ntinda, Bukoto, Kisaasi, Kira, Najjera, Naalya, Bugolobi, and Namugongo — balances commute access, school catchments, and more attainable rents and purchase prices than prime addresses.',
    body: [
      'These neighbourhoods dominate family rentals and first-time purchases. Apartments and townhouses move quickly when priced to local comps; land on the outer edges of Kira and Namugongo still attracts build-to-live buyers.',
      'Filter Mojesu mid-market listings by town, beds, and budget, or open a neighbourhood guide for local context before you book a viewing.',
    ],
  },
  {
    tier: 'emerging',
    slug: 'emerging',
    title: 'Emerging Kampala & Greater Kampala corridors',
    summary:
      'Emerging corridors — Outer Kira, Wakiso, Mukono, Gayaza, and Kikoni — offer larger plots and lower entry prices, with longer travel times into the CBD and faster change in infrastructure.',
    body: [
      'Investors and owner-builders look here for land banking and staged development. Title diligence and road/power access should be confirmed on every site visit — Mojesu states plot and tenure details on each land listing.',
      'Start with a corridor guide below, then browse Land or Buy filtered to that emerging tier.',
    ],
  },
]

export const AREA_GUIDES: AreaGuide[] = [
  {
    slug: 'kololo',
    name: 'Kololo',
    tier: 'prime',
    summary:
      'Kololo is one of Kampala’s most established residential hills — embassy compounds, mature trees, and premium houses and apartments within a short drive of the city centre.',
    body: [
      'Demand stays high for secure gated homes and well-finished flats. Sale listings here almost always need clear title status before serious buyers proceed; Mojesu shows tenure on every sale card and detail page.',
      'Expect stronger prices than mid-market corridors, with tenants often including NGOs, diplomats, and senior professionals. Book viewings early in the week — prime inventory turns over quickly when priced correctly.',
    ],
    highlights: ['Embassy belt', 'Premium rentals', 'Strong resale demand'],
  },
  {
    slug: 'nakasero',
    name: 'Nakasero',
    tier: 'prime',
    summary:
      'Nakasero sits beside Kampala’s CBD — apartments and townhouses suited to professionals who want walkable or short-drive access to offices, hotels, and government offices.',
    body: [
      'Stock mixes older blocks with newer boutique residences. Parking, generator backup, and building management quality separate average flats from premium ones.',
      'Use Mojesu filters for Nakasero rentals or sales, then confirm building rules and utilities during the viewing pass.',
    ],
    highlights: ['CBD adjacency', 'Apartment stock', 'Corporate tenants'],
  },
  {
    slug: 'naguru',
    name: 'Naguru',
    tier: 'prime',
    summary:
      'Naguru offers elevated residential streets between Kololo and Ntinda — popular for families seeking quieter compounds without leaving the prime belt.',
    body: [
      'You will find a mix of maisonettes, apartments, and the occasional plot. Access to the Northern Bypass and city centre keeps commute times competitive.',
      'Compare Naguru with Bukoto and Ntinda on Mojesu when balancing budget against finish level.',
    ],
    highlights: ['Family compounds', 'Hillside addresses', 'Bypass access'],
  },
  {
    slug: 'muyenga',
    name: 'Muyenga',
    tier: 'prime',
    summary:
      'Muyenga is known for hillside views toward the lake, larger residential plots, and a mix of ambassadorial and executive homes.',
    body: [
      'Roads can be steep; drainage and parking matter on site visits. Title and plot boundaries should be checked carefully on sale and land deals.',
      'Mojesu agents routinely run Muyenga viewings alongside Munyonyo and Lubowa when clients want prime south-side living.',
    ],
    highlights: ['Hill views', 'Larger homes', 'South Kampala'],
  },
  {
    slug: 'munyonyo',
    name: 'Munyonyo',
    tier: 'prime',
    summary:
      'Munyonyo combines lakeside leisure, resorts, and gated residential pockets popular with buyers who want space outside the densest hills.',
    body: [
      'Expect longer drives into the CBD than Kololo or Nakasero, offset by compound size and recreational access. New builds and renovated villas dominate enquiries.',
      'Filter Mojesu for Munyonyo sales and rentals, and confirm flood history and access roads during the visit.',
    ],
    highlights: ['Lakeside living', 'Gated estates', 'Weekend leisure'],
  },
  {
    slug: 'lubowa',
    name: 'Lubowa',
    tier: 'prime',
    summary:
      'Lubowa, along the Entebbe Road corridor, attracts buyers seeking modern estates, international-school catchments, and airport-side convenience.',
    body: [
      'Master-planned communities and freestanding houses are common. Traffic on Entebbe Road shapes daily commute planning — viewings should factor peak hours.',
      'Browse Lubowa listings on Mojesu alongside Munyonyo when comparing south-west prime options.',
    ],
    highlights: ['Entebbe Road', 'Estate living', 'School catchments'],
  },
  {
    slug: 'ntinda',
    name: 'Ntinda',
    tier: 'mid',
    summary:
      'Ntinda is a core mid-market hub — apartments, townhouses, and shops with strong rental demand from young professionals and small families.',
    body: [
      'Inventory turns relatively fast at realistic rents. Noise, parking, and compound security are the usual trade-offs versus quieter hills.',
      'Ntinda is often the first filter on Mojesu popular-rentals rows; pair it with Najjera or Kira when expanding the search radius.',
    ],
    highlights: ['High rental demand', 'Apartment stock', 'Retail amenities'],
  },
  {
    slug: 'bukoto',
    name: 'Bukoto',
    tier: 'mid',
    summary:
      'Bukoto sits between Naguru and Kisaasi — a practical mid-market choice for buyers and renters who want prime-adjacent access without prime pricing.',
    body: [
      'Housing ranges from walk-ups to newer gated clusters. Title clarity on sales remains essential even at mid-market price points.',
      'Use Mojesu to compare Bukoto against Ntinda and Kisaasi on the same budget band.',
    ],
    highlights: ['Prime-adjacent', 'Mixed stock', 'Family rentals'],
  },
  {
    slug: 'kisaasi',
    name: 'Kisaasi',
    tier: 'mid',
    summary:
      'Kisaasi has grown into a dense mid-market residential zone with apartments, rentals for students and young workers, and improving local retail.',
    body: [
      'Expect more vertical living than in Lubowa or Muyenga. Check water (NWSC/tank) and metering arrangements carefully on rentals.',
      'Mojesu listings tag amenities so you can filter for parking, fibre readiness, and compound features before you book.',
    ],
    highlights: ['Dense rentals', 'Young professionals', 'Vertical living'],
  },
  {
    slug: 'kira',
    name: 'Kira',
    tier: 'mid',
    summary:
      'Kira Municipality covers a large mid-market footprint east of Kampala — houses, apartments, and plots serving households who want more space per shilling.',
    body: [
      'Travel times into the city vary widely by estate. Outer Kira (listed separately) is more emerging; central Kira behaves like classic mid-market.',
      'Browse Kira on Mojesu Rent and Buy, or open Land when you are comparing build sites.',
    ],
    highlights: ['Space per budget', 'Houses & flats', 'East corridor'],
  },
  {
    slug: 'najjera',
    name: 'Najjera',
    tier: 'mid',
    summary:
      'Najjera is a high-volume rental corridor — apartments and maisonettes popular with professionals commuting toward the city and Namugongo.',
    body: [
      'New blocks appear often; verify finish quality, parking ratios, and service charges on site. Many Mojesu mid-market rental searches include Najjera by default.',
      'Pair Najjera with Naalya and Kira when mapping a week of viewings.',
    ],
    highlights: ['Rental volume', 'New apartments', 'Commuter belt'],
  },
  {
    slug: 'naalya',
    name: 'Naalya',
    tier: 'mid',
    summary:
      'Naalya offers estate-style mid-market living with malls and arterial road access — a frequent shortlist for families renting or buying.',
    body: [
      'Housing estates and apartments dominate. Confirm estate rules, service fees, and school runs during viewings.',
      'Filter Mojesu for Naalya and compare against Namugongo for similar budgets.',
    ],
    highlights: ['Estate living', 'Family focus', 'Mall access'],
  },
  {
    slug: 'bugolobi',
    name: 'Bugolobi',
    tier: 'mid',
    summary:
      'Bugolobi sits near industrial and commercial pockets — practical for professionals who want mid-market housing with faster links toward the east and the city.',
    body: [
      'Stock includes apartments and townhouses; street noise and truck traffic vary block by block, so time-of-day visits help.',
      'Mojesu can filter Bugolobi rentals and sales alongside Nakawa-adjacent searches.',
    ],
    highlights: ['East access', 'Mixed use nearby', 'Professional renters'],
  },
  {
    slug: 'namugongo',
    name: 'Namugongo',
    tier: 'mid',
    summary:
      'Namugongo blends residential growth with pilgrimage and commercial activity — mid-market homes and plots for households expanding eastward.',
    body: [
      'Expect a mix of finished houses and land for self-build. Road quality and last-mile access should be checked in the rains.',
      'Open Namugongo guides then jump into Mojesu Land or Buy filters for live inventory.',
    ],
    highlights: ['East growth', 'Self-build plots', 'Family houses'],
  },
  {
    slug: 'outer-kira',
    name: 'Outer Kira',
    tier: 'emerging',
    summary:
      'Outer Kira is the emerging edge of the Kira corridor — larger plots, newer roads in places, and prices that still undercut central mid-market estates.',
    body: [
      'Infrastructure is uneven; confirm power, water, and all-weather access on every land visit. Title process listings are common — Mojesu labels tenure clearly.',
      'Use this guide with the Emerging tier browse when comparing Outer Kira to Wakiso and Gayaza.',
    ],
    highlights: ['Larger plots', 'Lower entry price', 'Title diligence'],
  },
  {
    slug: 'wakiso',
    name: 'Wakiso',
    tier: 'emerging',
    summary:
      'Wakiso District surrounds much of Kampala — a wide emerging market for land, satellite towns, and longer-commute housing.',
    body: [
      'Specific trading centres differ sharply; always pin the exact town or road (e.g. toward Kakiri, Matugga, or Entebbe-adjacent belts) before comparing prices.',
      'Mojesu land and house listings that sit in Wakiso are tagged by local area name so you can filter precisely.',
    ],
    highlights: ['District-scale search', 'Land banking', 'Satellite towns'],
  },
  {
    slug: 'mukono',
    name: 'Mukono',
    tier: 'emerging',
    summary:
      'Mukono, east of Kampala along Jinja Road, is an emerging corridor for plots and houses as the city expands outward.',
    body: [
      'Travel time to the CBD is the main trade-off. Buyers often prioritise road frontage, school options, and clear title over finish level.',
      'Browse Mukono on Mojesu Land and Buy, and schedule viewings with buffer for highway traffic.',
    ],
    highlights: ['Jinja Road', 'Outward expansion', 'Plot focus'],
  },
  {
    slug: 'gayaza',
    name: 'Gayaza',
    tier: 'emerging',
    summary:
      'Gayaza Road corridor remains a classic emerging residential belt — plots, bungalows, and incremental self-build for households moving north of the city.',
    body: [
      'Verify flood-prone pockets and road grading. Many deals are land-first with phased construction.',
      'Mojesu lists Gayaza inventory under emerging tier filters alongside Wakiso towns.',
    ],
    highlights: ['North corridor', 'Self-build', 'Phased development'],
  },
  {
    slug: 'kikoni',
    name: 'Kikoni',
    tier: 'emerging',
    summary:
      'Kikoni, near Makerere, mixes student and young-professional rentals with denser walk-up housing — an emerging micro-market inside the wider city fabric.',
    body: [
      'Expect smaller units, shared compounds, and price sensitivity. Security and utility metering should be confirmed on every rental viewing.',
      'Filter Mojesu Kikoni rentals when the brief is budget-conscious and campus-adjacent.',
    ],
    highlights: ['Campus-adjacent', 'Budget rentals', 'Dense living'],
  },
]

const bySlug = new Map(AREA_GUIDES.map((g) => [g.slug, g]))
const byName = new Map(AREA_GUIDES.map((g) => [g.name.toLowerCase(), g]))
const tierBySlug = new Map(TIER_GUIDES.map((g) => [g.slug, g]))

export function getAreaGuideBySlug(slug: string): AreaGuide | undefined {
  return bySlug.get(slug)
}

export function getAreaGuideByName(name: string): AreaGuide | undefined {
  return byName.get(name.toLowerCase())
}

export function getTierGuideBySlug(slug: string): TierGuide | undefined {
  return tierBySlug.get(slug)
}

export function getTierGuide(tier: AreaTier): TierGuide | undefined {
  return TIER_GUIDES.find((g) => g.tier === tier)
}

export function areasInTier(tier: AreaTier): AreaGuide[] {
  return AREA_GUIDES.filter((g) => g.tier === tier)
}

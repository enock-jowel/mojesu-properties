/**
 * Editorial area guides — indexable local SEO content (Phase 5).
 * Names match `AREA_CATALOG` / CMS areas.catalog. Slugs are stable URL keys.
 */
import type { AreaTier } from '@/lib/areas'

export type GuideFaq = { question: string; answer: string }

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
  /** Rendered on the guide and emitted as FAQPage JSON-LD. Keep prices out — they go stale. */
  faqs: GuideFaq[]
}

export type TierGuide = {
  tier: AreaTier
  slug: string
  title: string
  summary: string
  body: string[]
  faqs: GuideFaq[]
}

export const AREAS_INDEX_FAQS: GuideFaq[] = [
  {
    question: 'Which Kampala neighbourhoods are best for families?',
    answer:
      'Families renting or buying in Kampala often shortlist Naguru, Ntinda, Naalya, Najjera, Kira, and Lubowa for compound space, schools, and estate-style living. Prime hills like Kololo and Muyenga suit larger budgets, while Namugongo and Gayaza offer more land for the money.',
  },
  {
    question: 'What is the difference between prime, mid-market, and emerging areas?',
    answer:
      'Prime areas (such as Kololo, Nakasero, and Muyenga) are established, close to the city centre, and priced at the top of the market. Mid-market areas (such as Ntinda, Kira, and Bugolobi) balance commute and cost. Emerging corridors (such as Mukono, Gayaza, and Wakiso) offer larger plots and lower entry prices with longer travel times.',
  },
  {
    question: 'Which areas are most affordable for renting near Kampala city centre?',
    answer:
      'Kikoni, Kisaasi, and Najjera tend to have the most budget-friendly rentals within reach of the city, with smaller units and denser apartment blocks. Compare live asking rents on Mojesu Rent listings, filtered by area and bedrooms, since prices change with supply.',
  },
  {
    question: 'Where should I look to buy land around Kampala?',
    answer:
      'Most land buyers look east and north of the city — Outer Kira, Namugongo, Mukono, Gayaza, and wider Wakiso — where plots are larger and cheaper than in central neighbourhoods. Always confirm the title at the Ministry of Lands zonal office and walk the boundaries with a surveyor before paying.',
  },
  {
    question: 'Are Mojesu listings verified?',
    answer:
      'Yes. Mojesu lists verified rentals and sales across Kampala, with tenure (freehold, mailo, leasehold, and more) labelled on every sale listing. You can book a viewing online and confirm it with our team on WhatsApp.',
  },
]

const titleCheckFaq: GuideFaq = {
  question: 'How do I check a land title before buying?',
  answer:
    'Ask the seller for a copy of the title, then run an official search at the Ministry of Lands zonal office covering the area to confirm the registered owner and any caveats or mortgages. Have a licensed surveyor confirm the boundaries on site, and use a lawyer for the sale agreement and transfer.',
}

export { areaSlug } from '@/lib/area-links'

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
    faqs: [
      {
        question: 'Which are the prime residential areas in Kampala?',
        answer:
          'Kololo, Nakasero, Naguru, Muyenga, Munyonyo, and Lubowa are Kampala’s main prime residential areas, known for embassies, gated compounds, larger homes, and short or scenic commutes.',
      },
      {
        question: 'Who rents homes in prime Kampala areas?',
        answer:
          'Tenants are typically diplomats, NGO and corporate staff, and senior professionals who need security, reliable utilities, and quick access to offices and international schools. Many leases are corporate-backed.',
      },
      {
        question: 'What should I check before renting in a prime area?',
        answer:
          'Confirm security arrangements, generator or solar backup, water storage, parking, and what the rent includes (service charge, garbage collection, compound staff). Visit at rush hour to judge the real commute.',
      },
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
    faqs: [
      {
        question: 'Which Kampala areas are mid-market?',
        answer:
          'Ntinda, Bukoto, Kisaasi, Kira, Najjera, Naalya, Bugolobi, and Namugongo are the main mid-market neighbourhoods — popular with young professionals, families, and first-time buyers.',
      },
      {
        question: 'Are mid-market areas good for families?',
        answer:
          'Yes. Naalya, Najjera, Kira, and Ntinda in particular offer estates, maisonettes, and townhouses near schools, supermarkets, and malls, at lower rents than prime hills.',
      },
      {
        question: 'What should renters check in mid-market apartments?',
        answer:
          'Check water supply (NWSC connection and tank size), electricity metering (prepaid Yaka meters per unit are best), parking, security, and any monthly service charge before you pay a deposit.',
      },
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
    faqs: [
      {
        question: 'Is it a good idea to buy land in emerging areas around Kampala?',
        answer:
          'Emerging corridors like Outer Kira, Mukono, Gayaza, and Wakiso give you more land for your budget and room for value growth as roads and services extend outward. The trade-offs are longer commutes and the need for careful title checks.',
      },
      {
        question: 'What is the difference between mailo, freehold, leasehold, and kibanja?',
        answer:
          'Freehold and mailo land are held in perpetuity and registered with a title. Leasehold is held for a fixed term (often 49 or 99 years) from a landlord such as a district land board or kingdom. A kibanja is a recognised occupancy on someone else’s mailo land — it is not a title, so buyers need the registered owner’s consent.',
      },
      titleCheckFaq,
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
    faqs: [
      {
        question: 'Is Kololo a good place to live in Kampala?',
        answer:
          'Kololo is one of Kampala’s most sought-after addresses: leafy streets, embassies, restaurants around Acacia Mall and Kisementi, and a short drive to the city centre. It suits diplomats, executives, and families with a premium budget.',
      },
      {
        question: 'How far is Kololo from Kampala city centre?',
        answer:
          'Kololo is about 2–3 km from the city centre — usually a 10–20 minute drive depending on traffic.',
      },
      {
        question: 'What kind of homes are available in Kololo?',
        answer:
          'Expect standalone houses on large compounds, serviced apartments, and newer high-spec apartment blocks. Most rentals target corporate and diplomatic tenants; sales are fewer and move fast when titles are clean.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Nakasero residential or commercial?',
        answer:
          'Both. Lower Nakasero around the market is busy and commercial, while the upper hill has quieter residential streets, hotels, embassies, and apartments within minutes of offices and Parliament.',
      },
      {
        question: 'Who should consider living in Nakasero?',
        answer:
          'Professionals who work in the city centre and want to cut commute time — Nakasero sits right next to the CBD, so many residents can walk or take a very short drive to work.',
      },
      {
        question: 'What should I check when renting a Nakasero apartment?',
        answer:
          'Check parking allocation, generator backup, lift maintenance, water storage, and building management. Older blocks vary a lot, so compare finishes and service charges across two or three viewings.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Naguru good for families?',
        answer:
          'Yes. Naguru has quieter residential streets, family compounds, and maisonettes, with schools, supermarkets, and restaurants a short drive away in Kololo, Bukoto, and Ntinda.',
      },
      {
        question: 'How far is Naguru from the city centre?',
        answer:
          'Naguru is about 4 km from central Kampala — typically a 15–25 minute drive, depending on traffic.',
      },
      {
        question: 'How does Naguru compare with Kololo?',
        answer:
          'Naguru offers a similar hillside, prime-belt feel to Kololo, with generally quieter streets and slightly more space for the budget. Kololo is closer to the CBD and has more embassies and nightlife.',
      },
    ],
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
    faqs: [
      {
        question: 'What is Muyenga known for?',
        answer:
          'Muyenga — sometimes called Tank Hill — is known for views over Lake Victoria and the city, large residential plots, and executive homes, with Kabalagala and Kansanga’s restaurants and nightlife at the foot of the hill.',
      },
      {
        question: 'How far is Muyenga from Kampala city centre?',
        answer:
          'Muyenga is about 6 km south-east of the city centre — roughly a 20–30 minute drive, longer at peak hours.',
      },
      {
        question: 'What should I check when viewing a home in Muyenga?',
        answer:
          'Roads on the hill can be steep and narrow, so check access in the rain, drainage, parking, and water pressure. On sales, confirm the title and plot boundaries carefully.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Munyonyo a good place to live?',
        answer:
          'Munyonyo suits buyers who want space and lakeside living — gated estates, villas, and resorts such as Speke Resort on the shores of Lake Victoria — and who are comfortable with a longer drive into town.',
      },
      {
        question: 'How far is Munyonyo from the city centre?',
        answer:
          'Munyonyo is about 12 km south of central Kampala — usually a 30–45 minute drive depending on traffic along Ggaba or Salaama Road.',
      },
      {
        question: 'What should I check before buying in Munyonyo?',
        answer:
          'Check the access road condition, drainage and any flooding history close to the lake, and the title status. Also compare estate rules and security arrangements between gated communities.',
      },
    ],
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
    faqs: [
      {
        question: 'Why do families choose Lubowa?',
        answer:
          'Lubowa offers modern gated estates and family houses close to the International School of Uganda, with good access to Entebbe and the airport via Entebbe Road and the Kampala–Entebbe Expressway.',
      },
      {
        question: 'How far is Lubowa from Kampala city centre?',
        answer:
          'Lubowa is about 12 km south-west of the city centre along Entebbe Road — often 30–50 minutes at peak times, much quicker off-peak.',
      },
      {
        question: 'Is Lubowa convenient for Entebbe Airport?',
        answer:
          'Yes. Lubowa sits on the Kampala–Entebbe corridor, so it is one of the most convenient prime areas for frequent flyers and people working in Entebbe.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Ntinda a good place to rent?',
        answer:
          'Ntinda is one of Kampala’s busiest mid-market rental areas, with plenty of apartments, supermarkets, restaurants, banks, and transport. It suits young professionals and small families who want amenities on the doorstep.',
      },
      {
        question: 'How far is Ntinda from Kampala city centre?',
        answer:
          'Ntinda is about 7 km north-east of the city centre — typically a 20–40 minute drive depending on traffic.',
      },
      {
        question: 'What are the downsides of living in Ntinda?',
        answer:
          'The trading centre gets congested and noisy, and parking can be tight in older blocks. Streets a little away from the main road are usually quieter for similar rents.',
      },
    ],
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
    faqs: [
      {
        question: 'Where is Bukoto?',
        answer:
          'Bukoto lies north of the city centre between Naguru, Kamwokya, Ntinda, and Kisaasi — close to the prime belt but typically cheaper than Kololo or Naguru.',
      },
      {
        question: 'Is Bukoto good for families?',
        answer:
          'Yes. Bukoto has a mix of apartments and gated townhouse clusters, with schools, supermarkets, and the restaurants of Kisementi and Ntinda nearby.',
      },
      {
        question: 'How far is Bukoto from the city centre?',
        answer:
          'Bukoto is about 5 km from central Kampala — usually a 15–30 minute drive.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Kisaasi affordable to rent?',
        answer:
          'Kisaasi is one of the more affordable mid-market areas north of the city, with many one- and two-bedroom apartments aimed at young professionals and students. Check Mojesu Rent listings for current asking rents.',
      },
      {
        question: 'How far is Kisaasi from Kampala city centre?',
        answer:
          'Kisaasi is about 8 km north of the city centre, with access to the Northern Bypass — typically 25–45 minutes into town depending on traffic.',
      },
      {
        question: 'What should I check when renting in Kisaasi?',
        answer:
          'Confirm water supply and tank capacity, whether each unit has its own prepaid electricity meter, parking, and compound security. Newer blocks usually have better finishes for similar rent.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Kira part of Kampala?',
        answer:
          'Kira is a separate municipality in Wakiso District, bordering Kampala to the north-east. It is one of Uganda’s fastest-growing urban areas and includes neighbourhoods such as Najjera, Kiwatule, Naalya, and Bulindo.',
      },
      {
        question: 'Is Kira good for families?',
        answer:
          'Yes. Kira offers more space for the budget than central Kampala — standalone houses, compounds, and plots — with schools and shopping in nearby Najjera and Naalya.',
      },
      {
        question: 'How long is the commute from Kira to Kampala?',
        answer:
          'Kira town is about 14 km from the city centre. Depending on the exact estate and traffic, the drive can take 30–60 minutes at peak times.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Najjera a good place to rent?',
        answer:
          'Najjera has a large supply of newer apartments and maisonettes at mid-market rents, popular with professionals and young families. With so much new stock, you can compare several options in a single day of viewings.',
      },
      {
        question: 'How far is Najjera from Kampala city centre?',
        answer:
          'Najjera is about 11 km north-east of the city centre, in Kira Municipality — roughly 30–50 minutes into town at peak hours.',
      },
      {
        question: 'What should I check in a new Najjera apartment?',
        answer:
          'Inspect finishing quality, water supply and tank size, parking per unit, individual electricity meters, and the monthly service charge. Ask how long the building has been occupied and how repairs are handled.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Naalya good for families?',
        answer:
          'Yes. Naalya is known for planned housing estates, family homes, and apartments, with shopping at Metroplex Mall and access along the Northern Bypass and the road to Namugongo.',
      },
      {
        question: 'How far is Naalya from Kampala city centre?',
        answer:
          'Naalya is about 11 km east of the city centre — usually a 30–50 minute drive depending on traffic.',
      },
      {
        question: 'What should I ask about Naalya estate homes?',
        answer:
          'Ask about estate rules, security, monthly estate or service fees, water supply, and title status on sales. Check the school run at peak time if you have children.',
      },
    ],
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
    faqs: [
      {
        question: 'Is Bugolobi a good place to live?',
        answer:
          'Bugolobi is a practical, well-connected mid-market area east of the city centre, with apartments, townhouses, and shopping at Village Mall. It suits professionals working in the city, Nakawa, or the industrial area.',
      },
      {
        question: 'How far is Bugolobi from Kampala city centre?',
        answer:
          'Bugolobi is about 5 km east of the city centre — typically a 15–30 minute drive.',
      },
      {
        question: 'What should I check when viewing in Bugolobi?',
        answer:
          'Noise and truck traffic vary by street because of nearby industrial and commercial activity, so visit at different times of day. Also check parking and water supply in older apartment blocks.',
      },
    ],
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
    faqs: [
      {
        question: 'What is Namugongo known for?',
        answer:
          'Namugongo is home to the Uganda Martyrs Shrine, which draws huge crowds of pilgrims every year around Martyrs Day on 3 June. It is also a fast-growing residential area with family houses and plots for self-build.',
      },
      {
        question: 'How far is Namugongo from Kampala city centre?',
        answer:
          'Namugongo is about 14 km east of the city centre — roughly 40–60 minutes at peak times. Expect heavy traffic around the shrine in late May and early June.',
      },
      {
        question: 'Is Namugongo good for buying land?',
        answer:
          'Namugongo is a popular choice for build-to-live buyers who want more land than central areas allow. Check road access in the rainy season, utilities on the plot, and the title before committing.',
      },
    ],
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
    faqs: [
      {
        question: 'Where is Outer Kira?',
        answer:
          'Outer Kira refers to the less-developed edges of Kira Municipality, beyond the established estates of Kira town, Najjera, and Naalya — where plots are larger and prices lower.',
      },
      {
        question: 'Is Outer Kira good for buying land?',
        answer:
          'It is a popular area for land banking and self-build because plots cost less than in central Kira. Confirm power, water, and all-weather road access on every visit, as infrastructure is uneven.',
      },
      titleCheckFaq,
    ],
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
    faqs: [
      {
        question: 'Is Wakiso part of Kampala?',
        answer:
          'No. Wakiso is a separate district that surrounds Kampala on almost every side. It includes fast-growing towns such as Nansana, Kira, Entebbe, and Wakiso town itself.',
      },
      {
        question: 'Why buy land in Wakiso District?',
        answer:
          'Wakiso offers a wide range of plot sizes and prices within commuting distance of Kampala, making it popular for land banking, family homes, and staged development.',
      },
      {
        question: 'What should I check when buying land in Wakiso?',
        answer:
          'Pin down the exact village or road, since prices vary widely across the district. Confirm the title at the Ministry of Lands zonal office, involve the local council (LC1) in boundary checks, and hire a licensed surveyor.',
      },
    ],
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
    faqs: [
      {
        question: 'How far is Mukono from Kampala?',
        answer:
          'Mukono town is about 21 km east of Kampala along Jinja Road — typically 45–90 minutes into the city depending on traffic.',
      },
      {
        question: 'Is Mukono a good place to buy land or a house?',
        answer:
          'Mukono is popular for plots and family houses at lower prices than Kampala, with Uganda Christian University, schools, and a busy town centre. The commute is the main trade-off.',
      },
      {
        question: 'Who rents homes in Mukono?',
        answer:
          'Renters include university staff and students, families, and people working in Mukono or along the Jinja Road corridor who want more space for their budget.',
      },
    ],
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
    faqs: [
      {
        question: 'How far is Gayaza from Kampala?',
        answer:
          'Gayaza is about 16 km north of Kampala along Gayaza Road — often 45–75 minutes into the city at peak times.',
      },
      {
        question: 'Is Gayaza good for building a family home?',
        answer:
          'Many families buy land along the Gayaza Road corridor to build in phases, drawn by larger plots, lower prices, and well-known schools such as Gayaza High School.',
      },
      {
        question: 'What should I check before buying land in Gayaza?',
        answer:
          'Check for flood-prone low ground, the condition of access roads, and power and water connections, and confirm the title and boundaries with a surveyor.',
      },
    ],
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
    faqs: [
      {
        question: 'Where is Kikoni?',
        answer:
          'Kikoni sits right next to Makerere University, north-west of the city centre, between Makerere, Nakulabye, and Wandegeya.',
      },
      {
        question: 'Is Kikoni good for students?',
        answer:
          'Yes. Kikoni is one of the most popular areas for Makerere students and young professionals, with hostels, single rooms, and small apartments within walking distance of campus.',
      },
      {
        question: 'What should I check when renting in Kikoni?',
        answer:
          'Confirm security (gates, guards, lighting), how water and electricity are metered and shared, and exactly what the rent covers. Units are small and demand peaks at the start of each semester.',
      },
    ],
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

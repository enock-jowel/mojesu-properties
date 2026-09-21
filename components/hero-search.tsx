'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Building2,
  ChevronDown,
  Factory,
  Home,
  KeyRound,
  LandPlot,
  MapPin,
  Search,
  Shapes,
  X,
} from 'lucide-react'
import { type AreaTier } from '@/lib/areas'
import {
  DEFAULT_HERO_CRITERIA,
  filterByHeroCriteria,
  heroCriteriaToHref,
  type HeroSearchCriteria,
  type HeroSubTab,
} from '@/lib/hero-search-criteria'
import { type Property, type TitleStatus } from '@/lib/properties'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { SiteLogo } from '@/components/site-logo'
import {
  useAreasCatalog,
  useTaxonomy,
  useTypeOptions,
} from '@/components/site-catalog-provider'
import { areasGroupedFrom } from '@/lib/site-content/catalog-helpers'
import type { TaxonomyContent } from '@/lib/site-content/catalog-types'

function isMobileSearchViewport() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(max-width: 767px)').matches
}

export type MainTab = 'rent' | 'buy' | 'land'
export type SubTab = HeroSubTab

type OpenSegment = 'where' | 'type' | 'budget' | 'title' | null
type MobilePanel =
  | 'intent'
  | 'category'
  | 'where'
  | 'type'
  | 'budget'
  | 'title'
  | null
type Currency = 'UGX' | 'USD'

/** Approximate USD→UGX mid-market rate — clearly labeled as approx in UI */
const USD_TO_UGX_APPROX = 3700

const TITLE_STATUS_KEYS: TitleStatus[] = [
  'freehold',
  'leasehold',
  'mailo',
  'customary',
  'kibanja',
]

type PriceBand = {
  id: string
  labelUgx: string
  labelUsd: string
  minUgx: number
  maxUgx: number | null
}

const SALE_BANDS: PriceBand[] = [
  {
    id: 'under-300m',
    labelUgx: 'Under UGX 300M',
    labelUsd: 'Under ~$81K',
    minUgx: 0,
    maxUgx: 300_000_000,
  },
  {
    id: '300-740m',
    labelUgx: 'UGX 300M – 740M',
    labelUsd: '~$81K – $200K',
    minUgx: 300_000_000,
    maxUgx: 740_000_000,
  },
  {
    id: '740m-1.5b',
    labelUgx: 'UGX 740M – 1.5B',
    labelUsd: '~$200K – $405K',
    minUgx: 740_000_000,
    maxUgx: 1_500_000_000,
  },
  {
    id: '1.5b-plus',
    labelUgx: 'UGX 1.5B+',
    labelUsd: '~$405K+',
    minUgx: 1_500_000_000,
    maxUgx: null,
  },
]

const RENT_BANDS: PriceBand[] = [
  {
    id: 'under-500k',
    labelUgx: 'Under UGX 500K/mo',
    labelUsd: 'Under ~$135/mo',
    minUgx: 0,
    maxUgx: 500_000,
  },
  {
    id: '500k-1.5m',
    labelUgx: 'UGX 500K – 1.5M/mo',
    labelUsd: '~$135 – $405/mo',
    minUgx: 500_000,
    maxUgx: 1_500_000,
  },
  {
    id: '1.5-4m',
    labelUgx: 'UGX 1.5M – 4M/mo',
    labelUsd: '~$405 – $1.1K/mo',
    minUgx: 1_500_000,
    maxUgx: 4_000_000,
  },
  {
    id: '4m-plus',
    labelUgx: 'UGX 4M+/mo',
    labelUsd: '~$1.1K+/mo',
    minUgx: 4_000_000,
    maxUgx: null,
  },
]

function subTabsFor(
  main: MainTab,
  heroSubTabs: TaxonomyContent['heroSubTabs'],
): { id: SubTab; label: string }[] {
  if (main === 'land') {
    // Land uses a flat Type list (tenure + plots) — one category tab
    return [{ id: 'residential', label: heroSubTabs.allLand }]
  }
  return [
    { id: 'residential', label: heroSubTabs.residential },
    { id: 'commercial', label: heroSubTabs.commercial },
    { id: 'industrial', label: heroSubTabs.industrial },
    { id: 'mixed-use', label: heroSubTabs['mixed-use'] },
  ]
}

function defaultSubTab(): SubTab {
  return 'residential'
}

export function HeroSearch({
  backgroundSrc = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=75',
  backgroundAlt = 'Residential property in Kampala',
  variant = 'hero',
  initialMainTab,
  initialSubTab,
  initialArea = '',
  initialAreaTier = '',
  initialType = '',
  initialTitleStatuses = [],
  properties = [],
}: {
  /** @deprecated Areas now come from AREA_CATALOG; prop kept for call-site compat */
  areas?: string[]
  backgroundSrc?: string
  backgroundAlt?: string
  /** `hero` = landing full-bleed; `embedded` = browse / explore pages */
  variant?: 'hero' | 'embedded'
  initialMainTab?: MainTab
  initialSubTab?: SubTab
  initialArea?: string
  initialAreaTier?: AreaTier | ''
  initialType?: string
  initialTitleStatuses?: TitleStatus[]
  /** Published catalog for mobile filter match counts */
  properties?: Property[]
}) {
  const router = useRouter()
  const areas = useAreasCatalog()
  const taxonomy = useTaxonomy()
  const grouped = useMemo(() => areasGroupedFrom(areas), [areas])
  const titleOptions = useMemo(
    () =>
      TITLE_STATUS_KEYS.map((value) => ({
        value,
        label: taxonomy.titleStatus[value] || value,
      })),
    [taxonomy.titleStatus],
  )
  const embedded = variant === 'embedded'

  const [activeMainTab, setActiveMainTab] = useState<MainTab>(
    initialMainTab ?? DEFAULT_HERO_CRITERIA.mainTab,
  )
  const [activeSubTab, setActiveSubTab] = useState<SubTab>(
    initialSubTab ?? DEFAULT_HERO_CRITERIA.subTab,
  )

  const [area, setArea] = useState(initialArea)
  const [areaTier, setAreaTier] = useState<AreaTier | ''>(initialAreaTier)
  const [listingType, setListingType] = useState(initialType)
  const [bandId, setBandId] = useState('')
  const [customRange, setCustomRange] = useState(false)
  const [customMin, setCustomMin] = useState('')
  const [customMax, setCustomMax] = useState('')
  const [currency, setCurrency] = useState<Currency>('UGX')
  const [titleStatuses, setTitleStatuses] =
    useState<TitleStatus[]>(initialTitleStatuses)

  const [openSegment, setOpenSegment] = useState<OpenSegment>(null)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null)
  const [areaQuery, setAreaQuery] = useState('')
  /** Lazy-loaded on the landing hero so the home RSC payload stays small. */
  const [lazyCatalog, setLazyCatalog] = useState<Property[]>([])
  const mobileCatalog = properties.length > 0 ? properties : lazyCatalog

  useEffect(() => {
    if (properties.length > 0 || variant === 'embedded') return
    let cancelled = false
    const load = () => {
      fetch('/api/public/properties/')
        .then((r) => (r.ok ? r.json() : []))
        .then((data: Property[]) => {
          if (!cancelled && Array.isArray(data)) setLazyCatalog(data)
        })
        .catch(() => {})
    }
    const ric = window.requestIdleCallback?.(load, { timeout: 2500 })
    if (ric == null) {
      const t = window.setTimeout(load, 1200)
      return () => {
        cancelled = true
        window.clearTimeout(t)
      }
    }
    return () => {
      cancelled = true
      window.cancelIdleCallback?.(ric)
    }
  }, [properties.length, variant])

  const pillRef = useRef<HTMLDivElement>(null)
  const areaSearchRef = useRef<HTMLInputElement>(null)
  const skipMainTabReset = useRef(true)
  const skipSubTabReset = useRef(true)

  // Title tenure is a Buy-property filter; Land encodes tenure in Type options
  const showTitleSegment = activeMainTab === 'buy'
  const bands = activeMainTab === 'rent' ? RENT_BANDS : SALE_BANDS
  const typeOptions = useTypeOptions(activeMainTab, activeSubTab)
  const subTabs = subTabsFor(activeMainTab, taxonomy.heroSubTabs)
  const showSubTabs = activeMainTab !== 'land'

  const areaDisplay = area || 'Search by area'
  const typeDisplay =
    typeOptions.find((t) => t.value === listingType)?.label || 'Any type'
  const selectedBand = bands.find((b) => b.id === bandId)
  const budgetDisplay = customRange
    ? 'Custom range'
    : selectedBand
      ? currency === 'UGX'
        ? selectedBand.labelUgx
        : selectedBand.labelUsd
      : 'Max price'
  const titleDisplay =
    titleStatuses.length === 0
      ? 'Any title'
      : titleStatuses.length === 1
        ? taxonomy.titleStatus[titleStatuses[0]] || titleStatuses[0]
        : `${titleStatuses.length} selected`

  const filteredGrouped = useMemo(() => {
    const q = areaQuery.trim().toLowerCase()
    const filterTier = (list: typeof grouped.prime) =>
      q ? list.filter((a) => a.name.toLowerCase().includes(q)) : list
    return {
      prime: filterTier(grouped.prime),
      mid: filterTier(grouped.mid),
      emerging: filterTier(grouped.emerging),
    }
  }, [grouped, areaQuery])

  const hasAreaMatches =
    filteredGrouped.prime.length +
      filteredGrouped.mid.length +
      filteredGrouped.emerging.length >
    0

  const criteria = useMemo((): HeroSearchCriteria => {
    const { min, max } = (() => {
      if (customRange) {
        const minRaw = customMin ? Number(customMin) : 0
        const maxRaw = customMax ? Number(customMax) : 0
        const toUgx = (n: number) =>
          currency === 'USD' ? Math.round(n * USD_TO_UGX_APPROX) : n
        return {
          min: minRaw > 0 ? toUgx(minRaw) : undefined,
          max: maxRaw > 0 ? toUgx(maxRaw) : undefined,
        }
      }
      const band = bands.find((b) => b.id === bandId)
      if (!band) return { min: undefined, max: undefined }
      return {
        min: band.minUgx > 0 ? band.minUgx : undefined,
        max: band.maxUgx ?? undefined,
      }
    })()

    return {
      mainTab: activeMainTab,
      subTab: activeSubTab,
      area,
      areaTier,
      listingType,
      minPriceUgx: min,
      maxPriceUgx: max,
      titleStatuses,
    }
  }, [
    activeMainTab,
    activeSubTab,
    area,
    areaTier,
    listingType,
    bandId,
    customRange,
    customMin,
    customMax,
    currency,
    titleStatuses,
    bands,
  ])

  useEffect(() => {
    if (skipMainTabReset.current) {
      skipMainTabReset.current = false
      return
    }
    setActiveSubTab(defaultSubTab())
    setListingType('')
    setBandId('')
    setCustomRange(false)
    setCustomMin('')
    setCustomMax('')
    setTitleStatuses([])
    setAreaQuery('')
    setOpenSegment(null)
  }, [activeMainTab])

  useEffect(() => {
    if (skipSubTabReset.current) {
      skipSubTabReset.current = false
      return
    }
    setListingType('')
    setOpenSegment(null)
  }, [activeSubTab])

  useEffect(() => {
    if (openSegment === 'where') {
      setAreaQuery('')
      requestAnimationFrame(() => areaSearchRef.current?.focus())
    }
  }, [openSegment])

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!pillRef.current?.contains(e.target as Node)) {
        setOpenSegment(null)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  useEffect(() => {
    if (!mobileSheetOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileSheetOpen])

  function selectArea(name: string, tier: AreaTier | '') {
    setArea(name)
    setAreaTier(tier)
    setAreaQuery('')
    setOpenSegment(null)
    if (mobileSheetOpen) setMobilePanel(null)
  }

  function openMobileSheet(panel: MobilePanel = 'where') {
    setMobileSheetOpen(true)
    setMobilePanel(panel)
  }

  function closeMobileSheet() {
    setMobileSheetOpen(false)
    setMobilePanel(null)
    setAreaQuery('')
  }

  function toggleMobilePanel(panel: MobilePanel) {
    setMobilePanel((prev) => (prev === panel ? null : panel))
  }

  function toggleTitle(status: TitleStatus) {
    setTitleStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    )
  }

  function submitSearch() {
    closeMobileSheet()
    setOpenSegment(null)
    router.push(heroCriteriaToHref(criteria))
  }

  const intentLabel = taxonomy.heroMainTabs[activeMainTab]
  const categoryLabel =
    subTabs.find((t) => t.id === activeSubTab)?.label ?? 'Category'

  /** Mobile-only: count listings for a criteria variant */
  const mobileCount = (overrides: Partial<HeroSearchCriteria>) =>
    filterByHeroCriteria(mobileCatalog, { ...criteria, ...overrides }).length

  const mobileMatchTotal = useMemo(
    () => filterByHeroCriteria(mobileCatalog, criteria).length,
    [mobileCatalog, criteria],
  )

  const segmentBtn =
    'flex h-full w-full flex-col items-start justify-center px-5 py-3.5 text-left transition-colors hover:bg-surface-alt sm:px-6'

  /** Shared shell for filter option cards — capped + scrollable */
  const optionsCard =
    'absolute z-50 overflow-hidden rounded-2xl border border-neutral-light bg-surface shadow-xl shadow-accent-deep/20'
  const optionsScroll =
    'max-h-[min(280px,42vh)] overflow-y-auto overscroll-contain'

  const tabIdle = embedded
    ? 'text-neutral-muted hover:bg-surface-alt hover:text-ink'
    : 'text-white hover:bg-white/10'
  const subTabIdle = embedded
    ? 'text-neutral-muted hover:bg-surface-alt hover:text-ink'
    : 'text-white hover:bg-white/10'
  const tabRail = embedded
    ? 'bg-surface-alt'
    : 'bg-accent-deep/25 backdrop-blur-md'
  const subTabRail = embedded
    ? 'bg-surface-alt'
    : 'bg-accent-deep/20 backdrop-blur-md'

  // When the mobile sheet is open, lift this section above the sticky type-pill
  // bar (sibling z-30) so pills sit under the popup instead of overlaying it.
  const sectionZ = mobileSheetOpen ? 'z-[130]' : 'z-30'

  return (
    <section
      className={
        embedded
          ? `relative ${sectionZ} w-full overflow-visible border-b border-neutral-light bg-background`
          : `relative ${sectionZ} h-[210px] w-full overflow-visible sm:h-[300px] lg:h-[340px]`
      }
    >
      {!embedded ? (
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src={backgroundSrc || ''}
            alt={backgroundAlt || ''}
            fill
            priority
            fetchPriority="high"
            quality={70}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-deep/20 to-accent-deep/45"
            aria-hidden="true"
          />
        </div>
      ) : null}

      <div
        className={
          embedded
            ? 'relative z-10 site-container flex flex-col items-center py-5 sm:py-6'
            : 'relative z-10 site-container flex h-full flex-col items-center justify-end pb-5 sm:pb-7'
        }
      >
        {/* Primary tabs — on mobile, open branded search sheet */}
        <div
          role="tablist"
          aria-label="Search intent"
          className={`mb-2 flex max-w-full gap-1.5 overflow-x-auto rounded-full p-1 ${tabRail}`}
        >
          {(
            [
              {
                id: 'rent' as const,
                label: taxonomy.heroMainTabs.rent,
                Icon: KeyRound,
              },
              {
                id: 'buy' as const,
                label: taxonomy.heroMainTabs.buy,
                Icon: Home,
              },
              {
                id: 'land' as const,
                label: taxonomy.heroMainTabs.land,
                Icon: LandPlot,
              },
            ] as const
          ).map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeMainTab === id}
              onClick={() => {
                setActiveMainTab(id)
                if (isMobileSearchViewport()) openMobileSheet('intent')
              }}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
                activeMainTab === id
                  ? 'bg-primary text-white shadow-sm'
                  : tabIdle
              }`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Secondary tabs — Rent / Buy categories only */}
        {showSubTabs ? (
          <div
            role="tablist"
            aria-label="Use class"
            className={`mb-3 flex max-w-full gap-1 overflow-x-auto rounded-full p-1 ${subTabRail}`}
          >
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeSubTab === tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id)
                  if (isMobileSearchViewport()) openMobileSheet('category')
                }}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors sm:text-sm ${
                  activeSubTab === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : subTabIdle
                }`}
              >
                {tab.id === 'commercial' ? (
                  <Building2 className="h-3 w-3" aria-hidden="true" />
                ) : tab.id === 'industrial' ? (
                  <Factory className="h-3 w-3" aria-hidden="true" />
                ) : tab.id === 'mixed-use' ? (
                  <Shapes className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Home className="h-3 w-3" aria-hidden="true" />
                )}
                {tab.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-3" aria-hidden="true" />
        )}

        {/* Desktop pill */}
        <div
          ref={pillRef}
          className="relative z-40 hidden w-full max-w-[980px] md:block"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitSearch()
            }}
            className="relative flex items-stretch rounded-full border border-neutral-light bg-surface shadow-xl shadow-accent-deep/20"
          >
            {/* WHERE */}
            <div className="relative min-w-0 flex-[1.1]">
              <button
                type="button"
                aria-expanded={openSegment === 'where'}
                onClick={() =>
                  setOpenSegment((s) => (s === 'where' ? null : 'where'))
                }
                className={`${segmentBtn} rounded-l-full`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink">
                  Where
                </span>
                <span
                  className={`mt-0.5 flex w-full items-center gap-1 truncate text-[14px] font-medium ${
                    area ? 'text-ink' : 'text-neutral-muted'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  <span className="truncate">{areaDisplay}</span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-muted" />
                </span>
              </button>
              {openSegment === 'where' && (
                <div
                  className={`${optionsCard} left-0 top-[calc(100%+10px)] w-[min(360px,90vw)]`}
                  role="listbox"
                  aria-label="Areas"
                >
                  <div className="border-b border-neutral-light p-2.5">
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-muted" />
                      <input
                        ref={areaSearchRef}
                        type="search"
                        value={areaQuery}
                        onChange={(e) => setAreaQuery(e.target.value)}
                        placeholder={areas.areaSearchPlaceholder}
                        className="w-full rounded-xl border border-neutral-light bg-surface-alt py-2.5 pl-9 pr-3 text-sm text-ink outline-none placeholder:text-neutral-muted focus:border-primary"
                      />
                    </div>
                  </div>
                  <div className={optionsScroll}>
                    <button
                      type="button"
                      onClick={() => selectArea('', '')}
                      className="w-full px-4 py-2.5 text-left text-sm font-medium text-neutral-muted hover:bg-surface-alt"
                    >
                      All areas
                    </button>
                    {hasAreaMatches ? (
                      (['prime', 'mid', 'emerging'] as AreaTier[]).map(
                        (tier) =>
                          filteredGrouped[tier].length > 0 ? (
                            <div key={tier}>
                              <p className="sticky top-0 z-[1] bg-surface-alt px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
                                {areas.tierLabels[tier]}
                              </p>
                              {filteredGrouped[tier].map((opt) => (
                                <button
                                  key={opt.name}
                                  type="button"
                                  onClick={() =>
                                    selectArea(opt.name, opt.tier)
                                  }
                                  className={`flex w-full px-4 py-2 text-left text-sm font-medium hover:bg-surface-alt ${
                                    area === opt.name
                                      ? 'text-primary'
                                      : 'text-ink'
                                  }`}
                                >
                                  {opt.name}
                                </button>
                              ))}
                            </div>
                          ) : null,
                      )
                    ) : (
                      <p className="px-4 py-6 text-center text-sm text-neutral-muted">
                        No areas match “{areaQuery.trim()}”
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="my-3.5 w-px shrink-0 bg-neutral-light" aria-hidden="true" />

            {/* TYPE */}
            <div className="relative min-w-0 flex-1">
              <button
                type="button"
                aria-expanded={openSegment === 'type'}
                onClick={() =>
                  setOpenSegment((s) => (s === 'type' ? null : 'type'))
                }
                className={segmentBtn}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink">
                  Type
                </span>
                <span
                  className={`mt-0.5 flex w-full items-center gap-1 truncate text-[14px] font-medium ${
                    listingType ? 'text-ink' : 'text-neutral-muted'
                  }`}
                >
                  <span className="truncate">{typeDisplay}</span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-muted" />
                </span>
              </button>
              {openSegment === 'type' && (
                <ul
                  className={`${optionsCard} ${optionsScroll} left-0 right-0 top-[calc(100%+10px)] py-2`}
                  role="listbox"
                  aria-label="Listing type"
                >
                  <li>
                    <button
                      type="button"
                      className="flex w-full px-4 py-2.5 text-left text-sm font-medium text-neutral-muted hover:bg-surface-alt"
                      onClick={() => {
                        setListingType('')
                        setOpenSegment(null)
                      }}
                    >
                      Any type
                    </button>
                  </li>
                  {typeOptions.map((opt) => (
                    <li key={opt.value}>
                      <button
                        type="button"
                        className={`flex w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-surface-alt ${
                          listingType === opt.value ? 'text-primary' : 'text-ink'
                        }`}
                        onClick={() => {
                          setListingType(opt.value)
                          setOpenSegment(null)
                        }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="my-3.5 w-px shrink-0 bg-neutral-light" aria-hidden="true" />

            {/* BUDGET */}
            <div
              className={`relative min-w-0 ${showTitleSegment ? 'flex-[1.15]' : 'flex-[1.2] pr-14'}`}
            >
              <button
                type="button"
                aria-expanded={openSegment === 'budget'}
                onClick={() =>
                  setOpenSegment((s) => (s === 'budget' ? null : 'budget'))
                }
                className={segmentBtn}
              >
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink">
                  Budget
                </span>
                <span
                  className={`mt-0.5 flex w-full items-center gap-1 truncate text-[14px] font-medium ${
                    bandId || customRange ? 'text-ink' : 'text-neutral-muted'
                  }`}
                >
                  <span className="truncate">{budgetDisplay}</span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-muted" />
                </span>
              </button>
              {openSegment === 'budget' && (
                <div
                  className={`${optionsCard} left-0 top-[calc(100%+10px)] w-[min(340px,92vw)]`}
                  role="dialog"
                  aria-label="Budget"
                >
                  <div className="border-b border-neutral-light p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-muted">
                        Currency
                      </p>
                      <div className="flex rounded-full border border-neutral-light p-0.5">
                        {(['UGX', 'USD'] as Currency[]).map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setCurrency(c)}
                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                              currency === c
                                ? 'bg-primary text-white'
                                : 'text-neutral-muted'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                    {currency === 'USD' ? (
                      <p className="mt-2 text-[11px] text-neutral-muted">
                        Approx. 1 USD ≈ {USD_TO_UGX_APPROX.toLocaleString()} UGX
                      </p>
                    ) : null}
                  </div>
                  <div className={`${optionsScroll} flex flex-col gap-1.5 p-3`}>
                    {bands.map((band) => (
                      <button
                        key={band.id}
                        type="button"
                        onClick={() => {
                          setBandId(band.id)
                          setCustomRange(false)
                          setOpenSegment(null)
                        }}
                        className={`rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors ${
                          bandId === band.id && !customRange
                            ? 'bg-primary/15 text-ink'
                            : 'bg-surface-alt text-ink hover:bg-neutral-light/60'
                        }`}
                      >
                        {currency === 'UGX' ? band.labelUgx : band.labelUsd}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setCustomRange(true)
                        setBandId('')
                      }}
                      className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                        customRange
                          ? 'bg-primary/15 text-ink'
                          : 'border border-dashed border-neutral-light text-neutral-muted'
                      }`}
                    >
                      Custom range…
                    </button>
                    {customRange ? (
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder={`Min ${currency}`}
                          value={customMin}
                          onChange={(e) => setCustomMin(e.target.value)}
                          className="rounded-xl border border-neutral-light bg-surface-alt px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder={`Max ${currency}`}
                          value={customMax}
                          onChange={(e) => setCustomMax(e.target.value)}
                          className="rounded-xl border border-neutral-light bg-surface-alt px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>

            {/* TITLE — Buy / Land only */}
            {showTitleSegment && (
              <>
                <div
                  className="my-3.5 w-px shrink-0 bg-neutral-light"
                  aria-hidden="true"
                />
                <div className="relative min-w-0 flex-1 pr-14">
                  <button
                    type="button"
                    aria-expanded={openSegment === 'title'}
                    onClick={() =>
                      setOpenSegment((s) => (s === 'title' ? null : 'title'))
                    }
                    className={segmentBtn}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wide text-ink">
                      Title
                    </span>
                    <span
                      className={`mt-0.5 flex w-full items-center gap-1 truncate text-[14px] font-medium ${
                        titleStatuses.length ? 'text-ink' : 'text-neutral-muted'
                      }`}
                    >
                      <span className="truncate">{titleDisplay}</span>
                      <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 text-neutral-muted" />
                    </span>
                  </button>
                  {openSegment === 'title' && (
                    <div
                      className={`${optionsCard} right-0 top-[calc(100%+10px)] w-[240px]`}
                      role="listbox"
                      aria-label="Title status"
                      aria-multiselectable="true"
                    >
                      <p className="border-b border-neutral-light px-3 py-2 text-[11px] text-neutral-muted">
                        Multi-select tenure types
                      </p>
                      <div className={`${optionsScroll} flex flex-col gap-1.5 p-3`}>
                        {titleOptions.map((opt) => {
                          const on = titleStatuses.includes(opt.value)
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => toggleTitle(opt.value)}
                              className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                                on
                                  ? 'bg-primary/15 text-ink'
                                  : 'bg-surface-alt text-ink'
                              }`}
                            >
                              {opt.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="submit"
              aria-label="Search listings"
              className="absolute right-1.5 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary-dark"
            >
              <Search className="h-4 w-4 shrink-0" />
            </button>
          </form>
        </div>

        {/* Mobile collapsed bar — opens branded search popup */}
        <button
          type="button"
          onClick={() => openMobileSheet('where')}
          className="flex w-full max-w-[520px] items-center gap-2 rounded-full border border-primary/20 bg-surface px-2.5 py-1.5 text-left shadow-lg shadow-primary/10 md:hidden"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Search className="h-3.5 w-3.5" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block truncate text-[13px] font-bold text-ink">
              {area || 'Where to?'}
            </span>
            <span className="block truncate text-[10px] text-neutral-muted">
              {intentLabel} · {typeDisplay} · {budgetDisplay}
              {showTitleSegment ? ` · ${titleDisplay}` : ''}
            </span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-primary" />
        </button>
      </div>

      {/* Mobile half-panel — top-aligned; compact app-sized controls */}
      {mobileSheetOpen ? (
        <div
          className="fixed inset-x-0 bottom-0 top-[72px] z-[120] flex flex-col justify-start pt-2 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-search-title"
        >
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 bg-accent-deep/45"
            onClick={closeMobileSheet}
          />

          <div className="relative mx-3 flex h-[min(48dvh,calc(100%-0.5rem))] max-h-[48dvh] flex-col overflow-hidden rounded-2xl bg-surface shadow-[0_12px_36px_rgba(20,78,110,0.22)] animate-card-in">
            {/* Compact brand header */}
            <div className="shrink-0 bg-gradient-to-r from-pill-soft via-pill-soft-mid to-pill-soft-cool px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-1.5">
                  <SiteLogo
                    markClassName="h-6 w-6"
                    wordmarkClassName="text-sm font-extrabold tracking-tight text-ink"
                  />
                  <span
                    id="mobile-search-title"
                    className="truncate text-xs font-bold text-neutral-muted"
                  >
                    Search
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Close search"
                  onClick={closeMobileSheet}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-light/80 bg-surface/90 text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal filter chips — compact */}
            <div className="shrink-0 border-b border-neutral-light px-2 py-1.5">
              <div className="allow-x-scroll -mx-0.5 flex gap-1 overflow-x-auto px-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {(
                  [
                    {
                      id: 'intent' as const,
                      label: 'Looking to',
                      value: intentLabel,
                      show: true,
                    },
                    {
                      id: 'category' as const,
                      label: 'Category',
                      value: categoryLabel,
                      show: showSubTabs,
                    },
                    {
                      id: 'where' as const,
                      label: 'Where',
                      value: area || 'Any area',
                      show: true,
                    },
                    {
                      id: 'type' as const,
                      label: 'Type',
                      value: typeDisplay,
                      show: true,
                    },
                    {
                      id: 'budget' as const,
                      label: 'Budget',
                      value: budgetDisplay,
                      show: true,
                    },
                    {
                      id: 'title' as const,
                      label: 'Title',
                      value: titleDisplay,
                      show: showTitleSegment,
                    },
                  ] as const
                )
                  .filter((chip) => chip.show)
                  .map((chip) => {
                    const active = mobilePanel === chip.id
                    return (
                      <button
                        key={chip.id}
                        type="button"
                        onClick={() => toggleMobilePanel(chip.id)}
                        className={`inline-flex min-w-[4.25rem] max-w-[7rem] shrink-0 flex-col justify-center rounded-lg border px-2 py-1 text-left transition-colors ${
                          active
                            ? 'border-primary bg-primary text-white'
                            : 'border-neutral-light bg-surface-alt text-ink'
                        }`}
                      >
                        <span
                          className={`text-[8px] font-bold uppercase leading-none tracking-wide ${
                            active ? 'text-white/80' : 'text-neutral-muted'
                          }`}
                        >
                          {chip.label}
                        </span>
                        <span className="mt-0.5 truncate text-[11px] font-bold leading-none">
                          {chip.value}
                        </span>
                      </button>
                    )
                  })}
              </div>
            </div>

            {/* Vertical options — compact list rows */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-1.5">
              {!mobilePanel ? (
                <p className="px-1 py-3 text-center text-[11px] text-neutral-muted">
                  Tap a filter above to choose
                </p>
              ) : null}

              {mobilePanel === 'intent' ? (
                <div className="flex flex-col gap-0.5">
                  {(
                    [
                      {
                        id: 'rent' as const,
                        label: taxonomy.heroMainTabs.rent,
                        Icon: KeyRound,
                      },
                      {
                        id: 'buy' as const,
                        label: taxonomy.heroMainTabs.buy,
                        Icon: Home,
                      },
                      {
                        id: 'land' as const,
                        label: taxonomy.heroMainTabs.land,
                        Icon: LandPlot,
                      },
                    ] as const
                  ).map(({ id, label, Icon }) => {
                    const count = mobileCount({
                      mainTab: id,
                      listingType: '',
                      titleStatuses: [],
                      subTab: id === 'land' ? 'residential' : activeSubTab,
                    })
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          setActiveMainTab(id)
                          setMobilePanel(null)
                        }}
                        className={`flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-left text-[12px] font-semibold ${
                          activeMainTab === id
                            ? 'border-primary bg-primary/12 text-ink'
                            : 'border-neutral-light bg-surface-alt text-ink'
                        }`}
                      >
                        <Icon
                          className="h-3 w-3 shrink-0 text-primary"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                        <span className="tabular-nums text-[10px] font-bold text-neutral-muted">
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {mobilePanel === 'category' && showSubTabs ? (
                <div className="flex flex-col gap-0.5">
                  {subTabs.map((tab) => {
                    const count = mobileCount({
                      subTab: tab.id,
                      listingType: '',
                    })
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveSubTab(tab.id)
                          setMobilePanel(null)
                        }}
                        className={`flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-left text-[12px] font-semibold ${
                          activeSubTab === tab.id
                            ? 'border-primary bg-primary/12 text-ink'
                            : 'border-neutral-light bg-surface-alt text-ink'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {tab.label}
                        </span>
                        <span className="tabular-nums text-[10px] font-bold text-neutral-muted">
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {mobilePanel === 'where' ? (
                <div className="overflow-hidden rounded-xl border border-neutral-light">
                  <div className="relative border-b border-neutral-light p-1.5">
                    <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-muted" />
                    <input
                      type="search"
                      value={areaQuery}
                      onChange={(e) => setAreaQuery(e.target.value)}
                      placeholder={areas.areaSearchPlaceholder}
                      autoFocus
                      className="h-7 w-full rounded-lg border border-neutral-light bg-surface-alt py-0 pl-8 pr-2.5 text-[12px] text-ink outline-none focus:border-primary"
                    />
                  </div>
                  <div className="max-h-full">
                    <button
                      type="button"
                      onClick={() => selectArea('', '')}
                      className={`flex h-7 w-full items-center gap-1.5 px-2.5 text-left text-[12px] font-semibold ${
                        !area
                          ? 'bg-primary/10 text-primary'
                          : 'text-neutral-muted'
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">All areas</span>
                      <span className="tabular-nums text-[10px] font-bold text-neutral-muted">
                        {mobileCount({ area: '', areaTier: '' })}
                      </span>
                    </button>
                    {hasAreaMatches ? (
                      (['prime', 'mid', 'emerging'] as AreaTier[]).map(
                        (tier) =>
                          filteredGrouped[tier].length > 0 ? (
                            <div key={tier}>
                              <p className="sticky top-0 bg-surface-alt px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-neutral-muted">
                                {areas.tierLabels[tier]}
                              </p>
                              {filteredGrouped[tier].map((opt) => (
                                <button
                                  key={opt.name}
                                  type="button"
                                  onClick={() =>
                                    selectArea(opt.name, opt.tier)
                                  }
                                  className={`flex h-7 w-full items-center gap-1.5 px-2.5 text-left text-[12px] font-semibold ${
                                    area === opt.name
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-ink'
                                  }`}
                                >
                                  <span className="min-w-0 flex-1 truncate">
                                    {opt.name}
                                  </span>
                                  <span className="tabular-nums text-[10px] font-bold text-neutral-muted">
                                    {mobileCount({
                                      area: opt.name,
                                      areaTier: opt.tier,
                                    })}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : null,
                      )
                    ) : (
                      <p className="px-3 py-4 text-center text-xs text-neutral-muted">
                        No areas match “{areaQuery.trim()}”
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              {mobilePanel === 'type' ? (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setListingType('')
                      setMobilePanel(null)
                    }}
                    className={`flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-left text-[12px] font-semibold ${
                      !listingType
                        ? 'border-primary bg-primary/12 text-ink'
                        : 'border-neutral-light bg-surface-alt text-ink'
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">Any type</span>
                    <span className="tabular-nums text-[10px] font-bold text-neutral-muted">
                      {mobileCount({ listingType: '' })}
                    </span>
                  </button>
                  {typeOptions.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        setListingType(o.value)
                        setMobilePanel(null)
                      }}
                      className={`flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-left text-[12px] font-semibold ${
                        listingType === o.value
                          ? 'border-primary bg-primary/12 text-ink'
                          : 'border-neutral-light bg-surface-alt text-ink'
                      }`}
                    >
                      <span className="min-w-0 flex-1 truncate">{o.label}</span>
                      <span className="tabular-nums text-[10px] font-bold text-neutral-muted">
                        {mobileCount({ listingType: o.value })}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              {mobilePanel === 'budget' ? (
                <div className="flex flex-col gap-0.5">
                  <div className="mb-1 flex w-fit rounded-full border border-neutral-light p-0.5">
                    {(['UGX', 'USD'] as Currency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCurrency(c)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          currency === c
                            ? 'bg-primary text-white'
                            : 'text-neutral-muted'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  {bands.map((band) => {
                    const count = mobileCount({
                      minPriceUgx: band.minUgx > 0 ? band.minUgx : undefined,
                      maxPriceUgx: band.maxUgx ?? undefined,
                    })
                    return (
                      <button
                        key={band.id}
                        type="button"
                        onClick={() => {
                          setBandId(band.id)
                          setCustomRange(false)
                          setMobilePanel(null)
                        }}
                        className={`flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-left text-[12px] font-semibold ${
                          bandId === band.id && !customRange
                            ? 'border-primary bg-primary/12 text-ink'
                            : 'border-neutral-light bg-surface-alt text-ink'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {currency === 'UGX' ? band.labelUgx : band.labelUsd}
                        </span>
                        <span className="tabular-nums text-[10px] font-bold text-neutral-muted">
                          {count}
                        </span>
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setCustomRange(true)
                      setBandId('')
                    }}
                    className={`flex h-7 items-center rounded-lg border border-dashed px-2.5 text-left text-[12px] font-semibold ${
                      customRange
                        ? 'border-primary bg-primary/12 text-ink'
                        : 'border-neutral-light text-neutral-muted'
                    }`}
                  >
                    Custom range…
                  </button>
                  {customRange ? (
                    <div className="mt-1 grid grid-cols-2 gap-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={`Min ${currency}`}
                        value={customMin}
                        onChange={(e) => setCustomMin(e.target.value)}
                        className="h-7 rounded-lg border border-neutral-light bg-surface-alt px-2 text-[12px] outline-none focus:border-primary"
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        placeholder={`Max ${currency}`}
                        value={customMax}
                        onChange={(e) => setCustomMax(e.target.value)}
                        className="h-7 rounded-lg border border-neutral-light bg-surface-alt px-2 text-[12px] outline-none focus:border-primary"
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {mobilePanel === 'title' && showTitleSegment ? (
                <div className="flex flex-col gap-0.5">
                  {titleOptions.map((opt) => {
                    const on = titleStatuses.includes(opt.value)
                    const count = mobileCount({ titleStatuses: [opt.value] })
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleTitle(opt.value)}
                        className={`flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-left text-[12px] font-semibold ${
                          on
                            ? 'border-primary bg-primary/12 text-ink'
                            : 'border-neutral-light bg-surface-alt text-ink'
                        }`}
                      >
                        <span className="min-w-0 flex-1 truncate">
                          {opt.label}
                        </span>
                        <span className="tabular-nums text-[10px] font-bold text-neutral-muted">
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-neutral-light px-3 py-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setArea('')
                    setAreaTier('')
                    setListingType('')
                    setBandId('')
                    setCustomRange(false)
                    setCustomMin('')
                    setCustomMax('')
                    setTitleStatuses([])
                    setAreaQuery('')
                    setMobilePanel(null)
                  }}
                  className="text-xs font-bold text-neutral-muted"
                >
                  Clear
                </button>
                <ArrowPillButton type="button" onClick={submitSearch} size="sm">
                  Search
                  {mobileCatalog.length > 0 ? ` · ${mobileMatchTotal}` : ''}
                </ArrowPillButton>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

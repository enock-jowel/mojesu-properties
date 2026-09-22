'use client'

import { useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  filterProperties,
  type LandKind,
  type Property,
  type TitleStatus,
  type UseClass,
} from '@/lib/properties'
import { type AreaTier } from '@/lib/areas'
import { getAreaGuideByName, getTierGuide } from '@/lib/area-guides'
import {
  LAND_TITLE_TYPE_VALUES,
  type HeroSubTab,
  type ListingTypeOption,
} from '@/lib/listing-kinds'
import { HeroSearch, type MainTab } from '@/components/hero-search'
import { PropertyCard } from '@/components/property-card'
import { RoofMark } from '@/components/roof-mark'
import {
  useAreasCatalog,
  useTaxonomy,
} from '@/components/site-catalog-provider'
import {
  areaTierFrom,
  typeOptionsFromTaxonomy,
} from '@/lib/site-content/catalog-helpers'
import { useFavorites } from '@/lib/favorites'
import Link from 'next/link'

type BrowseMode = 'rent' | 'buy' | 'land'

const TITLES: Record<BrowseMode, string> = {
  rent: 'For rent',
  buy: 'For sale',
  land: 'Land',
}

function resolvePropertyUseClass(use: string | null): UseClass | 'all' {
  if (!use) return 'all'
  if (
    use === 'commercial' ||
    use === 'industrial' ||
    use === 'mixed-use' ||
    use === 'residential' ||
    use === 'agricultural'
  ) {
    return use
  }
  return 'all'
}

function resolveSubTab(use: string | null, mode: BrowseMode): HeroSubTab {
  if (mode === 'land') return 'residential'
  if (
    use === 'commercial' ||
    use === 'industrial' ||
    use === 'mixed-use' ||
    use === 'residential'
  ) {
    return use
  }
  return 'residential'
}

function Pill({
  active,
  children,
  onClick,
  compact = false,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
  /** Mobile-only denser height — desktop keeps the original pill size */
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full font-bold transition-colors ${
        compact
          ? 'px-2.5 py-1 text-[12px] leading-none'
          : 'px-3.5 py-2 text-sm'
      } ${
        active
          ? 'bg-primary text-white'
          : 'border border-neutral-light bg-surface text-neutral-muted hover:border-primary/40 hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

/**
 * Explore / browse page — landing search filter + one category-specific pill row.
 */
export function ListingsBrowse({
  mode,
  properties,
}: {
  mode: BrowseMode
  properties: Property[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const taxonomy = useTaxonomy()
  const areas = useAreasCatalog()

  const location = params.get('location') || ''
  const use = params.get('use')
  const type = params.get('type') || ''
  const priceMin = params.get('priceMin')
  const priceMax = params.get('priceMax')
  const titleStatusParam = params.get('titleStatus')
  const tier = params.get('tier') as AreaTier | null
  const featured = params.get('featured') === '1'

  const { favorites, toggleFav } = useFavorites()

  const setParams = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === '') next.delete(key)
      else next.set(key, value)
    }
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }

  const filtered = useMemo(() => {
    const titleFromParam = titleStatusParam
      ? (titleStatusParam.split(',').filter(Boolean) as TitleStatus[])
      : []

    if (mode === 'land') {
      const isTitleType = Boolean(type) && LAND_TITLE_TYPE_VALUES.has(type)
      const titles =
        titleFromParam.length > 0
          ? titleFromParam
          : isTitleType
            ? ([type] as TitleStatus[])
            : undefined

      return filterProperties(properties, {
        listingMode: 'sale',
        category: 'land',
        useClass: 'all',
        area: location || 'all',
        areaTier: tier || 'all',
        landKind: type && !isTitleType ? (type as LandKind) : 'all',
        titleStatus: titles?.length ? titles : 'all',
        isFeatured: featured || undefined,
        minPriceUgx: priceMin ? Number(priceMin) : 0,
        maxPriceUgx: priceMax ? Number(priceMax) : 0,
      })
    }

    return filterProperties(properties, {
      listingMode: mode === 'rent' ? 'rent' : 'sale',
      category: 'property',
      useClass: resolvePropertyUseClass(use),
      area: location || 'all',
      areaTier: tier || 'all',
      kind: type || 'all',
      titleStatus: titleFromParam.length ? titleFromParam : 'all',
      isFeatured: featured || undefined,
      minPriceUgx: priceMin ? Number(priceMin) : 0,
      maxPriceUgx: priceMax ? Number(priceMax) : 0,
    })
  }, [
    properties,
    mode,
    location,
    use,
    type,
    priceMin,
    priceMax,
    titleStatusParam,
    tier,
    featured,
  ])

  const categoryPills: ListingTypeOption[] = typeOptionsFromTaxonomy(
    mode,
    resolveSubTab(use, mode),
    taxonomy,
  )
  const titleStatuses = titleStatusParam
    ? (titleStatusParam.split(',').filter(Boolean) as TitleStatus[])
    : []

  /** Base filters without type — used to decide which type pills have inventory */
  const availableTypePills = useMemo(() => {
    const titleFromParam = titleStatusParam
      ? (titleStatusParam.split(',').filter(Boolean) as TitleStatus[])
      : []

    return categoryPills.filter((pill) => {
      // Keep the active type visible even if the facet count is temporarily 0
      if (type === pill.value) return true

      if (mode === 'land') {
        const isTitleType = LAND_TITLE_TYPE_VALUES.has(pill.value)
        const titles =
          titleFromParam.length > 0
            ? titleFromParam
            : isTitleType
              ? ([pill.value] as TitleStatus[])
              : undefined
        return (
          filterProperties(properties, {
            listingMode: 'sale',
            category: 'land',
            useClass: 'all',
            area: location || 'all',
            areaTier: tier || 'all',
            landKind: !isTitleType ? (pill.value as LandKind) : 'all',
            titleStatus: titles?.length ? titles : 'all',
            isFeatured: featured || undefined,
            minPriceUgx: priceMin ? Number(priceMin) : 0,
            maxPriceUgx: priceMax ? Number(priceMax) : 0,
          }).length > 0
        )
      }

      return (
        filterProperties(properties, {
          listingMode: mode === 'rent' ? 'rent' : 'sale',
          category: 'property',
          useClass: resolvePropertyUseClass(use),
          area: location || 'all',
          areaTier: tier || 'all',
          kind: pill.value,
          titleStatus: titleFromParam.length ? titleFromParam : 'all',
          isFeatured: featured || undefined,
          minPriceUgx: priceMin ? Number(priceMin) : 0,
          maxPriceUgx: priceMax ? Number(priceMax) : 0,
        }).length > 0
      )
    })
  }, [
    categoryPills,
    properties,
    mode,
    location,
    use,
    type,
    priceMin,
    priceMax,
    titleStatusParam,
    tier,
    featured,
  ])

  function renderTypePills(
    pills: ListingTypeOption[],
    compact: boolean,
  ) {
    return (
      <>
        <Pill
          compact={compact}
          active={!type}
          onClick={() => setParams({ type: null, titleStatus: null })}
        >
          All
        </Pill>
        {pills.map((pill) => (
          <Pill
            key={pill.value}
            compact={compact}
            active={type === pill.value}
            onClick={() =>
              setParams({
                type: type === pill.value ? null : pill.value,
                titleStatus: null,
              })
            }
          >
            {pill.label}
          </Pill>
        ))}
      </>
    )
  }

  return (
    <section className="pb-14">
      <HeroSearch
        key={`${mode}-${use ?? 'all'}-${location}-${type}`}
        variant="embedded"
        initialMainTab={mode as MainTab}
        initialSubTab={resolveSubTab(use, mode)}
        initialArea={location}
        initialAreaTier={
          (tier ||
            (location ? areaTierFrom(location, areas) : undefined) ||
            '') as AreaTier | ''
        }
        initialType={type}
        initialTitleStatuses={titleStatuses}
        properties={properties}
      />

      {/* Type pills below hero — mobile: only types with matches + compact height.
          z-20 stays under the mobile search popup (hero lifts to z-[130] when open). */}
      <div className="sticky top-[72px] z-20 border-b border-neutral-light bg-background/95 backdrop-blur-md md:z-30">
        <div className="allow-x-scroll site-container flex max-w-full gap-1.5 overflow-x-auto py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {renderTypePills(availableTypePills, true)}
        </div>
        <div className="site-container hidden gap-2 overflow-x-auto py-3 md:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {renderTypePills(categoryPills, false)}
        </div>
      </div>

      <div className="site-container pt-8">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          {TITLES[mode]}
          {location ? ` in ${location}` : ''}
        </h1>
        <p className="mt-1 text-[15px] text-neutral-muted">
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
          {location ? ` in ${location}` : ' across Kampala'}
          {tier ? ` · ${areas.tierLabels[tier] || tier}` : ''}
          {(() => {
            const guide =
              (location && getAreaGuideByName(location)) ||
              (tier && getTierGuide(tier)) ||
              null
            if (!guide) return null
            const href =
              'name' in guide
                ? `/areas/${guide.slug}/`
                : `/areas/tier/${guide.slug}/`
            return (
              <>
                {' · '}
                <Link
                  href={href}
                  className="font-semibold text-primary-dark underline-offset-2 hover:underline"
                >
                  Area guide
                </Link>
              </>
            )
          })()}
        </p>
        {tier || location ? (
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-neutral-muted sm:text-[15px]">
            {tier
              ? `${areas.tierLabels[tier] || tier} Kampala areas — ${areas.tierBlurbs[tier] || 'local neighbourhoods our clients search most'}. `
              : ''}
            {location
              ? `Mojesu lists verified ${mode === 'land' ? 'plots' : mode === 'rent' ? 'rentals' : 'homes for sale'} in ${location} with clear pricing and, on sales, title status shown up front.`
              : `Filter by neighbourhood, price, and property type — then book a viewing online.`}
          </p>
        ) : (
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-neutral-muted sm:text-[15px]">
            {mode === 'rent'
              ? 'Verified Kampala rentals with filters for area, beds, and budget. Book a Mojesu viewing when you are ready — typically arranged within a few business days.'
              : mode === 'buy'
                ? 'Homes for sale with title status labelled (freehold, mailo, leasehold, and more) so you know the tenure type before you enquire.'
                : 'Residential and commercial plots around Kampala and nearby districts, with tenure and plot details stated on each listing.'}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-neutral-muted">
            <RoofMark className="mx-auto mb-3.5 h-9 w-9 text-neutral-muted" />
            <h2 className="text-2xl font-extrabold text-ink">
              No listings match that search
            </h2>
            <p className="mt-1.5">Try a different area, type, or budget.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filtered.map((item, i) => (
              <PropertyCard
                key={item.id}
                item={item}
                index={i}
                isFav={favorites.has(item.id)}
                onToggleFav={toggleFav}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

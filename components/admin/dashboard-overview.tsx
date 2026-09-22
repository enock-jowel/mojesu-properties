'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  Building2,
  CalendarRange,
  CircleDollarSign,
  Inbox,
  TrendingUp,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CountRow, DashboardSnapshot, GapBlock } from '@/lib/dashboard/types'

const CHART = {
  primary: '#63aaf0',
  primaryDark: '#3492b8',
  accent: '#144e6e',
  mid: '#7eb8d4',
  soft: '#a8d4ef',
  muted: '#94a3b8',
  grid: '#e8eef3',
  ink: '#0f172a',
}

const STATUS_COLORS = [CHART.primary, '#f59e0b', CHART.muted]
const CATEGORY_COLORS = [CHART.primary, CHART.primaryDark, CHART.accent, CHART.mid]
const BOOKING_COLORS = [
  CHART.primary,
  '#22c55e',
  CHART.accent,
  CHART.muted,
  '#f43f5e',
]
const SOURCE_COLORS = [CHART.primaryDark, CHART.primary, CHART.accent, CHART.mid]

function formatUgx(n: number): string {
  if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `UGX ${(n / 1_000).toFixed(0)}K`
  return `UGX ${n.toLocaleString('en-US')}`
}

function formatWhen(iso: string | null): string {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function weekLabel(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name?: string; value?: number; color?: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-neutral-light/80 bg-background/95 px-3 py-2 shadow-lg backdrop-blur">
      {label ? (
        <p className="mb-1 text-[11px] font-semibold text-neutral-muted">{label}</p>
      ) : null}
      {payload.map((p) => (
        <p key={String(p.name)} className="text-sm font-bold text-ink">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full"
            style={{ background: p.color || CHART.primary }}
          />
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

function GapCard({ gap }: { gap: GapBlock }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-light/90 bg-gradient-to-br from-surface-alt/80 to-background px-4 py-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-muted">
        Data not yet tracked
      </p>
      <p className="mt-1.5 text-sm font-bold text-ink">{gap.title}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-neutral-muted">
        {gap.reason}
      </p>
      <ul className="mt-2.5 list-disc space-y-1 pl-4 text-[12px] leading-snug text-neutral-muted">
        {gap.needs.map((n) => (
          <li key={n}>{n}</li>
        ))}
      </ul>
    </div>
  )
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-neutral-light/70 bg-background shadow-[0_1px_0_rgba(20,78,110,0.04)] ${className}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-neutral-light/60 px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-[12px] text-neutral-muted">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  href,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  href?: string
  hint?: string
  icon: typeof Building2
  accent: string
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
        {href ? (
          <ArrowUpRight className="h-4 w-4 text-neutral-muted opacity-0 transition-opacity group-hover:opacity-100" />
        ) : null}
      </div>
      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.12em] text-neutral-muted">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink tabular-nums sm:text-[1.75rem]">
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-neutral-muted">
          {hint}
        </p>
      ) : null}
    </>
  )

  const className =
    'group relative block overflow-hidden rounded-2xl border border-neutral-light/70 bg-background p-4 shadow-[0_1px_0_rgba(20,78,110,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md'

  if (href) {
    return (
      <Link href={href} className={className}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-80"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
        />
        {body}
      </Link>
    )
  }
  return (
    <div className={className}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-80"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      {body}
    </div>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-xl bg-pill-soft/40 text-sm text-neutral-muted">
      {label}
    </div>
  )
}

function DonutChart({
  rows,
  colors,
}: {
  rows: CountRow[]
  colors: string[]
}) {
  const data = rows.filter((r) => r.count > 0)
  if (!data.length) return <EmptyChart label="No data yet" />
  const total = data.reduce((s, r) => s + r.count, 0)

  return (
    <div className="relative h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="label"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.key}
                fill={colors[i % colors.length]}
                className="outline-none"
              />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-[11px] font-semibold text-neutral-muted">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
        <div className="text-center">
          <p className="text-2xl font-extrabold tabular-nums text-ink">{total}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
            Total
          </p>
        </div>
      </div>
    </div>
  )
}

export function DashboardOverview({ data }: { data: DashboardSnapshot }) {
  const router = useRouter()

  const trendData = data.listings.createdTrend.map((p) => ({
    week: weekLabel(p.label),
    listings: p.count,
  }))

  const categoryData = data.listings.byCategory.map((r) => ({
    name: r.label.replace(' (residential)', ''),
    count: r.count,
    href: r.href,
  }))

  const areaData = [...data.listings.topAreas]
    .reverse()
    .map((r) => ({
      name: r.label.length > 14 ? `${r.label.slice(0, 12)}…` : r.label,
      full: r.label,
      count: r.count,
    }))

  const modeData = data.listings.byMode.map((r) => ({
    name: r.label,
    count: r.count,
  }))

  const submissionStatusData = data.leads.submissionStatus.map((r) => ({
    name: r.label,
    count: r.count,
  }))

  const sourceData = data.leads.sources.map((r) => ({
    name: r.label.replace(' form', '').replace(' bookings', ''),
    count: r.count,
    href: r.href,
  }))

  const topBookedData = [...data.viewings.topProperties]
    .reverse()
    .map((p) => ({
      name:
        p.title.length > 18 ? `${p.title.slice(0, 16)}…` : p.title,
      full: p.title,
      count: p.bookingCount,
    }))

  return (
    <div className="-mx-1 space-y-5 sm:space-y-6">
      {/* Hero band */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-[#e8f4fc] via-background to-pill-soft-mid/60 px-4 py-5 sm:px-6 sm:py-6">
        <div
          className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl"
          style={{ background: CHART.primary }}
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full opacity-25 blur-3xl"
          style={{ background: CHART.accent }}
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary-dark">
              Live analytics
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Platform overview
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-neutral-muted">
              Real-time snapshot from Supabase · cached ~
              {Math.round(data.cacheSeconds / 60)} min · updated{' '}
              {formatWhen(data.generatedAt)}
            </p>
          </div>

          <form
            className="flex flex-wrap items-end gap-2 rounded-2xl border border-white/70 bg-background/70 p-3 shadow-sm backdrop-blur"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const from = String(fd.get('from') || '')
              const to = String(fd.get('to') || '')
              const qs = new URLSearchParams()
              if (from) qs.set('from', from)
              if (to) qs.set('to', to)
              const q = qs.toString()
              router.push(q ? `/admin/dashboard/?${q}` : '/admin/dashboard/')
            }}
          >
            <label className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
              From
              <input
                type="date"
                name="from"
                defaultValue={data.leads.dateFrom || ''}
                className="mt-1 block rounded-lg border border-neutral-light bg-background px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-primary"
              />
            </label>
            <label className="text-[10px] font-bold uppercase tracking-wide text-neutral-muted">
              To
              <input
                type="date"
                name="to"
                defaultValue={data.leads.dateTo || ''}
                className="mt-1 block rounded-lg border border-neutral-light bg-background px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-primary"
              />
            </label>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent-deep px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-dark"
            >
              <CalendarRange className="h-3.5 w-3.5" />
              Filter leads
            </button>
          </form>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="Active listings"
          value={data.summary.activeListings}
          href="/admin/listings/?status=published"
          icon={Building2}
          accent={CHART.primary}
        />
        <MetricCard
          label="Tracked leads"
          value={data.summary.totalLeadsTracked}
          href="/admin/requests/"
          hint="Viewings, list-with-us, contact, services"
          icon={Inbox}
          accent={CHART.primaryDark}
        />
        <MetricCard
          label="Viewing bookings"
          value={data.summary.viewingBookingsTotal}
          href="/admin/requests/?tab=bookings"
          icon={TrendingUp}
          accent={CHART.accent}
        />
        <MetricCard
          label="Est. pass revenue"
          value={
            data.summary.estimatedPassRevenueUgx != null
              ? formatUgx(data.summary.estimatedPassRevenueUgx)
              : '—'
          }
          href="/admin/requests/?tab=bookings"
          hint={data.summary.revenueNote || undefined}
          icon={CircleDollarSign}
          accent="#0d9488"
        />
      </div>

      {/* Listings analytics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          className="lg:col-span-2"
          title="New listings trend"
          subtitle={`${data.listings.newThisWeek} this week · ${data.listings.newThisMonth} this month`}
        >
          {trendData.every((d) => d.listings === 0) ? (
            <EmptyChart label="No listings created in the recent window" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="listingsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={CHART.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: CHART.muted, fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="listings"
                    name="Listings"
                    stroke={CHART.primary}
                    strokeWidth={2.5}
                    fill="url(#listingsFill)"
                    activeDot={{ r: 5, strokeWidth: 0, fill: CHART.accent }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Inventory status" subtitle="Published · draft · archived">
          <DonutChart rows={data.listings.byStatus} colors={STATUS_COLORS} />
          <div className="mt-1 grid grid-cols-2 gap-2">
            <Link
              href="/admin/listings/?status=draft"
              className="rounded-xl bg-pill-soft px-3 py-2 text-center transition-colors hover:bg-pill-soft-mid"
            >
              <p className="text-[10px] font-bold uppercase text-neutral-muted">Draft</p>
              <p className="text-lg font-extrabold tabular-nums text-ink">
                {data.summary.draftListings}
              </p>
            </Link>
            <Link
              href="/admin/listings/?status=archived"
              className="rounded-xl bg-pill-soft px-3 py-2 text-center transition-colors hover:bg-pill-soft-mid"
            >
              <p className="text-[10px] font-bold uppercase text-neutral-muted">
                Archived
              </p>
              <p className="text-lg font-extrabold tabular-nums text-ink">
                {data.summary.archivedListings}
              </p>
            </Link>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          title="Active by category"
          subtitle={data.listings.categorySchemaNote}
        >
          {categoryData.every((d) => d.count === 0) ? (
            <EmptyChart label="No published listings yet" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: CHART.muted, fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Listings" radius={[8, 8, 0, 0]} maxBarSize={48}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Top areas" subtitle="Published inventory by neighbourhood">
          {areaData.length === 0 ? (
            <EmptyChart label="No area data yet" />
          ) : (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={areaData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 6" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    tick={{ fill: CHART.ink, fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null
                      const row = payload[0].payload as {
                        full: string
                        count: number
                      }
                      return (
                        <ChartTooltip
                          active
                          payload={[
                            {
                              name: row.full,
                              value: row.count,
                              color: CHART.primary,
                            },
                          ]}
                        />
                      )
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Listings"
                    fill={CHART.primary}
                    radius={[0, 8, 8, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Sale vs rent" subtitle={data.listings.modeSchemaNote}>
          {modeData.every((d) => d.count === 0) ? (
            <EmptyChart label="No published listings" />
          ) : (
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modeData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: CHART.muted, fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Listings" radius={[8, 8, 0, 0]} maxBarSize={56}>
                    <Cell fill={CHART.accent} />
                    <Cell fill={CHART.primary} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel
          className="lg:col-span-2"
          title="Incomplete drafts"
          subtitle={data.listings.incompleteNote}
          action={
            <Link
              href="/admin/listings/?status=draft"
              className="text-xs font-bold text-primary hover:text-primary-dark"
            >
              View drafts →
            </Link>
          }
        >
          {data.listings.incomplete.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-muted">
              All drafts meet the 5-image publish threshold.
            </p>
          ) : (
            <ul className="divide-y divide-neutral-light/70">
              {data.listings.incomplete.map((row) => (
                <li key={row.id}>
                  <Link
                    href={row.href}
                    className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-pill-soft/50"
                  >
                    <span className="truncate text-sm font-semibold text-ink">
                      {row.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                      {row.imageCount}/5 photos
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Leads */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel
          title="Lead sources"
          subtitle={
            data.leads.dateFrom || data.leads.dateTo
              ? `${data.leads.dateFrom || '…'} → ${data.leads.dateTo || '…'}`
              : 'Tracked sources only'
          }
        >
          {sourceData.every((d) => d.count === 0) ? (
            <EmptyChart label="No leads in range" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {sourceData.map((_, i) => (
                      <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(v) => (
                      <span className="text-[11px] font-semibold text-neutral-muted">
                        {v}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {data.leads.sources.map((r) => (
              <li key={r.key}>
                <Link
                  href={r.href || '/admin/requests/'}
                  className="text-xs font-bold text-primary hover:text-primary-dark"
                >
                  {r.label} ({r.count})
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          className="lg:col-span-2"
          title="Submission funnel"
          subtitle="List-with-us status breakdown"
          action={
            <Link
              href="/admin/requests/?tab=submissions"
              className="text-xs font-bold text-primary hover:text-primary-dark"
            >
              Inbox →
            </Link>
          }
        >
          {submissionStatusData.every((d) => d.count === 0) ? (
            <EmptyChart label="No submissions in range" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={submissionStatusData}
                  margin={{ top: 8, right: 8, left: -12, bottom: 0 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: CHART.muted, fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Submissions"
                    fill={CHART.primaryDark}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {data.leads.gaps.map((g) => (
          <GapCard key={g.title} gap={g} />
        ))}
      </div>

      {/* Viewings */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Booking status" subtitle="Viewing pass pipeline">
          <DonutChart rows={data.viewings.byStatus} colors={BOOKING_COLORS} />
        </Panel>

        <Panel
          className="lg:col-span-2"
          title="Most booked properties"
          subtitle={`${data.viewings.bookedThisWeek} this week · ${data.viewings.bookedThisMonth} this month · est. ${formatUgx(data.viewings.estimatedRevenueUgx)}`}
        >
          {topBookedData.length === 0 ? (
            <EmptyChart label="No bookings yet" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topBookedData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid stroke={CHART.grid} strokeDasharray="3 6" horizontal={false} />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fill: CHART.muted, fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: CHART.ink, fontSize: 10, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.[0]) return null
                      const row = payload[0].payload as {
                        full: string
                        count: number
                      }
                      return (
                        <ChartTooltip
                          active
                          payload={[
                            {
                              name: row.full,
                              value: row.count,
                              color: CHART.accent,
                            },
                          ]}
                        />
                      )
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Bookings"
                    fill={CHART.accent}
                    radius={[0, 8, 8, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      {/* Staff */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Recent listing activity" subtitle="Inferred from create / update stamps">
          {data.staff.recentActions.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-muted">
              No recent listing activity.
            </p>
          ) : (
            <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
              {data.staff.recentActions.map((a) => (
                <li key={`${a.listingId}-${a.at}-${a.action}`}>
                  <Link
                    href={a.href}
                    className="flex items-start justify-between gap-3 rounded-xl border border-neutral-light/60 bg-pill-soft/30 px-3 py-2.5 transition-colors hover:border-primary/30 hover:bg-pill-soft"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{a.title}</p>
                      <p className="mt-0.5 text-[12px] text-neutral-muted">
                        <span className="font-semibold capitalize text-accent-deep">
                          {a.action}
                        </span>{' '}
                        · {a.actorName}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] tabular-nums text-neutral-muted">
                      {formatWhen(a.at)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Team access"
          subtitle={`${data.staff.adminCount} admin · ${data.staff.staffCount} staff · ${data.staff.authUserCount ?? '—'} auth`}
          action={
            <Link
              href="/admin/settings/"
              className="text-xs font-bold text-primary hover:text-primary-dark"
            >
              Settings →
            </Link>
          }
        >
          <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
            {data.staff.logins.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-light/60 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">
                    {u.fullName || u.email || 'Staff'}
                  </p>
                  <p className="text-[11px] text-neutral-muted">{u.email}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      u.role === 'admin'
                        ? 'bg-pill-soft text-accent-deep'
                        : 'bg-surface-alt text-neutral-muted'
                    }`}
                  >
                    {u.role}
                  </span>
                  <p className="mt-1 text-[11px] tabular-nums text-neutral-muted">
                    {formatWhen(u.lastSignInAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {data.staff.authUserNote ? (
            <p className="mt-3 text-[12px] text-neutral-muted">
              {data.staff.authUserNote}
            </p>
          ) : null}
        </Panel>
      </div>

      <div className="grid gap-3">
        {data.staff.gaps.map((g) => (
          <GapCard key={g.title} gap={g} />
        ))}
      </div>

      <Panel title="Site performance" subtitle="Not collected in-app yet">
        <div className="grid gap-3 lg:grid-cols-2">
          {data.performance.gaps.map((g) => (
            <GapCard key={g.title} gap={g} />
          ))}
        </div>
      </Panel>
    </div>
  )
}

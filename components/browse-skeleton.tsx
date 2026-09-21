/**
 * Matches ListingsBrowse geometry so Suspense → content does not spike CLS.
 * HeroSearch embedded ≈ search chrome height; grid reserves card aspect boxes.
 */
export function BrowseSkeleton() {
  return (
    <section className="pb-14" aria-busy="true" aria-label="Loading listings">
      <div className="border-b border-neutral-light bg-background">
        <div className="site-container flex flex-col items-center py-5 sm:py-6">
          <div className="h-10 w-full max-w-xl rounded-full bg-surface-alt" />
          <div className="mt-3 h-14 w-full max-w-3xl rounded-2xl bg-surface-alt" />
        </div>
      </div>
      <div className="sticky top-[72px] z-20 border-b border-neutral-light bg-background/95">
        <div className="site-container flex gap-2 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 shrink-0 rounded-full bg-surface-alt"
            />
          ))}
        </div>
      </div>
      <div className="site-container pt-8">
        <div className="h-10 w-48 rounded-lg bg-surface-alt" />
        <div className="mt-2 h-4 w-32 rounded bg-surface-alt" />
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="w-full">
              <div className="aspect-[1/0.92] rounded-2xl bg-surface-alt" />
              <div className="mt-3 h-4 w-3/4 rounded bg-surface-alt" />
              <div className="mt-2 h-3 w-1/2 rounded bg-surface-alt" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

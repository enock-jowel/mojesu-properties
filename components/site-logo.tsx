import Image from 'next/image'

/**
 * Brand lockup — final logo mark + “Mojesu” wordmark.
 */
export function SiteLogo({
  markClassName = 'h-9 w-9',
  wordmarkClassName = 'text-2xl font-extrabold tracking-tight text-ink',
  priority = false,
}: {
  markClassName?: string
  wordmarkClassName?: string
  priority?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/images/mojesu-logo-mark-88.png"
        alt=""
        width={88}
        height={88}
        sizes="44px"
        quality={70}
        className={`shrink-0 object-contain ${markClassName}`}
        /* Never priority — steals LCP from hero/listing photos on 3G */
        priority={false}
        loading={priority ? 'eager' : 'lazy'}
      />
      <span className={wordmarkClassName}>Mojesu</span>
    </span>
  )
}

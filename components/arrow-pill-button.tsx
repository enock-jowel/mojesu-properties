import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type ArrowPillVariant = 'primary' | 'dark' | 'glass' | 'light' | 'onPrimary'

const VARIANT: Record<
  ArrowPillVariant,
  { shell: string; arrow: string; arrowIcon: string }
> = {
  /** Solid Mojesu blue */
  primary: {
    shell: 'bg-primary text-white hover:bg-primary-dark',
    arrow: 'bg-white text-primary',
    arrowIcon: 'text-primary',
  },
  /** Same brand fill — used by header / contact CTAs */
  dark: {
    shell: 'bg-primary text-white hover:bg-primary-dark',
    arrow: 'bg-white text-primary',
    arrowIcon: 'text-primary',
  },
  /** Translucent — matches Services cards on photo overlays */
  glass: {
    shell:
      'bg-white/15 text-white ring-1 ring-inset ring-white/35 backdrop-blur-sm hover:bg-white/25',
    arrow: 'bg-primary text-white',
    arrowIcon: 'text-white',
  },
  /** White pill — on dark/primary surfaces (CTA strip) */
  light: {
    shell: 'bg-white text-primary hover:bg-surface-alt',
    arrow: 'bg-primary text-white',
    arrowIcon: 'text-white',
  },
  /** White pill with brand arrow — on accent strip */
  onPrimary: {
    shell: 'bg-white text-primary hover:bg-surface-alt',
    arrow: 'bg-primary text-white',
    arrowIcon: 'text-white',
  },
}

const SIZE = {
  sm: {
    shell: 'py-0.5 pl-2.5 pr-0.5 text-[11px] font-semibold',
    arrow: 'h-6 w-6',
    icon: 'h-3 w-3 stroke-[2.5]',
  },
  md: {
    shell: 'py-1 pl-3.5 pr-1 text-[13px] font-semibold sm:text-sm',
    arrow: 'h-8 w-8',
    icon: 'h-3.5 w-3.5 stroke-[2.5]',
  },
  lg: {
    shell: 'py-1.5 pl-4 pr-1.5 text-sm font-bold',
    arrow: 'h-9 w-9',
    icon: 'h-4 w-4 stroke-[2.5]',
  },
} as const

type Size = keyof typeof SIZE

type CommonProps = {
  children: React.ReactNode
  variant?: ArrowPillVariant
  size?: Size
  className?: string
  /** Arrow slides L→R revealing the label in a smooth loop */
  attention?: boolean
}

/** Always content-width — never stretch to the parent. */
function shellClass(
  variant: ArrowPillVariant,
  size: Size,
  className?: string,
) {
  return [
    'group inline-flex w-fit max-w-full items-center gap-0 overflow-hidden rounded-full transition-colors',
    SIZE[size].shell,
    VARIANT[variant].shell,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')
}

function ArrowDisc({
  variant,
  size,
  className,
}: {
  variant: ArrowPillVariant
  size: Size
  className?: string
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-45 ${SIZE[size].arrow} ${VARIANT[variant].arrow} ${className ?? ''}`}
    >
      <ArrowUpRight
        className={`${SIZE[size].icon} ${VARIANT[variant].arrowIcon}`}
        aria-hidden
      />
    </span>
  )
}

function PillContent({
  children,
  variant,
  size,
  attention,
}: {
  children: React.ReactNode
  variant: ArrowPillVariant
  size: Size
  attention: boolean
}) {
  if (!attention) {
    return (
      <>
        <span className="pr-1.5">{children}</span>
        <ArrowDisc variant={variant} size={size} className="ml-1.5" />
      </>
    )
  }

  return (
    <span className="cta-reveal-track">
      <span className="cta-reveal-label">{children}</span>
      <span className="cta-reveal-spacer ml-1.5" aria-hidden>
        <ArrowDisc variant={variant} size={size} />
      </span>
      <span className="cta-reveal-arrow" aria-hidden>
        <ArrowDisc variant={variant} size={size} />
      </span>
    </span>
  )
}

export function ArrowPillButton({
  children,
  variant = 'primary',
  size = 'md',
  className,
  attention = false,
  type = 'button',
  disabled,
  onClick,
}: CommonProps & {
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
}) {
  const reveal = attention && !disabled
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      data-size={size}
      className={`${shellClass(variant, size, className)} disabled:opacity-60 ${
        reveal ? 'cta-reveal' : ''
      }`}
    >
      <PillContent variant={variant} size={size} attention={reveal}>
        {children}
      </PillContent>
    </button>
  )
}

export function ArrowPillLink({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className,
  attention = false,
  target,
  rel,
}: CommonProps & {
  href: string
  target?: string
  rel?: string
}) {
  const isHash = href.startsWith('#')
  const classes = `${shellClass(variant, size, className)} ${
    attention ? 'cta-reveal' : ''
  }`
  const content = (
    <PillContent variant={variant} size={size} attention={attention}>
      {children}
    </PillContent>
  )

  if (isHash || href.startsWith('http') || href.startsWith('tel:')) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        data-size={size}
        className={classes}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} data-size={size} className={classes}>
      {content}
    </Link>
  )
}

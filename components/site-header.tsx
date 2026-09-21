'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { SiteLogo } from './site-logo'
import { ArrowPillLink } from '@/components/arrow-pill-button'
import { useNavCopy } from '@/components/site-catalog-provider'

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const nav = useNavCopy()

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-light bg-background/85 backdrop-blur-md">
      <div className="site-container flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Mojesu home"
        >
          <SiteLogo
            markClassName="h-10 w-10 sm:h-11 sm:w-11"
            wordmarkClassName="text-xl font-extrabold tracking-tight text-ink sm:text-2xl"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.header.map((item) => (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="text-[15px] font-semibold text-neutral-muted transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <ArrowPillLink href={nav.headerCta.href} variant="dark" size="sm">
              {nav.headerCta.label}
            </ArrowPillLink>
          </div>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex p-2 text-ink md:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="site-container flex flex-col border-b border-neutral-light bg-surface pb-4 shadow-lg md:hidden">
          {nav.header.map((item) => (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-neutral-light py-3 text-[15px] font-semibold text-neutral-muted last:border-none"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-3 flex justify-center" onClick={() => setOpen(false)}>
            <ArrowPillLink href={nav.headerCta.href} variant="dark" size="md">
              {nav.headerCta.label}
            </ArrowPillLink>
          </div>
        </nav>
      )}
    </header>
  )
}

import Link from 'next/link'
import { SiteLogo } from './site-logo'
import { getCompanyContent, getNavContent } from '@/lib/site-content/queries'
import { phoneHref } from '@/lib/site-content/phone'

function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <p className="text-[15px] font-semibold text-white">{title}</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={`${l.label}-${l.href}`}>
            <a
              href={l.href}
              className="text-[14px] text-white/85 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export async function SiteFooter() {
  const [company, nav] = await Promise.all([
    getCompanyContent(),
    getNavContent(),
  ])

  return (
    <footer className="w-full bg-footer text-white">
      <div className="site-container py-12 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-12 sm:gap-14">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:gap-[60px]">
            <div className="flex w-full flex-col gap-8 lg:w-[35%] lg:pr-5">
              <div>
                <Link href="/" className="inline-flex" aria-label="Mojesu home">
                  <SiteLogo
                    markClassName="h-10 w-10 rounded-md bg-surface"
                    wordmarkClassName="text-xl font-extrabold tracking-tight text-white sm:text-2xl"
                  />
                </Link>
                <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/80">
                  {company.footerBlurb}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {company.socials.map(({ label, href, iconClass }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-ink shadow-[4px_4px_10px_rgba(0,0,0,0.08)] transition-transform hover:scale-105"
                  >
                    <i className={`${iconClass} text-[15px] leading-none`} />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-10 sm:gap-8 sm:grid-cols-3">
              <FooterLinkColumn
                title={nav.footerMenuTitle}
                links={nav.footerMenu}
              />
              <FooterLinkColumn
                title={nav.footerCompanyTitle}
                links={nav.footerCompany}
              />

              <div className="col-span-2 sm:col-span-1">
                <p className="text-[15px] font-semibold text-white">
                  {nav.footerContactTitle}
                </p>
                <ul className="mt-4 flex flex-col gap-3">
                  <li>
                    <a
                      href={`mailto:${company.email}`}
                      className="flex items-center gap-2 text-[14px] text-white/90 transition-colors hover:text-white"
                    >
                      <i className="fi fi-sr-envelope text-[14px] leading-none" />
                      {company.email}
                    </a>
                  </li>
                  <li>
                    <a
                      href={phoneHref(company.phoneTel)}
                      className="flex items-center gap-2 text-[14px] text-white/90 transition-colors hover:text-white"
                    >
                      <i className="fi fi-sr-phone-call text-[14px] leading-none" />
                      {company.phoneDisplay}
                    </a>
                  </li>
                  <li className="flex items-start gap-2 text-[14px] text-white/90">
                    <i className="fi fi-sr-marker mt-0.5 text-[14px] leading-none" />
                    <span>{company.addressShort}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[13px] text-white/80">
              © {new Date().getFullYear()} Mojesu. All rights reserved.
            </p>
            <p className="text-[13px] text-white/80">{nav.legalName}</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowPillButton } from '@/components/arrow-pill-button'
import { fieldClass, Label } from '@/components/admin/content-chrome'
import { TextArea, SiteCard, TextField } from '@/components/admin/site-field'
import { saveSiteContent } from '@/lib/site-content/actions'
import type { CompanyContent, ContactContent } from '@/lib/site-content/types'
import { showToast } from '@/lib/toast'

export function CompanyContactEditor({
  initialCompany,
  initialContact,
}: {
  initialCompany: CompanyContent
  initialContact: ContactContent
}) {
  const router = useRouter()
  const [company, setCompany] = useState(initialCompany)
  const [contact, setContact] = useState(initialContact)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    const phoneTel = company.phoneTel.replace(/\D/g, '')
    if (!company.email.includes('@') || phoneTel.length < 10) {
      setError('Enter a valid email and phone (digits with country code).')
      return
    }
    startTransition(async () => {
      const c = await saveSiteContent('company', {
        ...company,
        phoneTel,
      })
      if (!c.ok) {
        setError(c.error)
        return
      }
      const t = await saveSiteContent('contact', contact)
      if (!t.ok) {
        setError(t.error)
        return
      }
      showToast('Company & contact saved')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Company & contact</h1>
        <p className="mt-1 text-sm text-neutral-muted">
          One source for phone, email, address, and socials — used in the footer
          and contact section.
        </p>
      </div>

      <SiteCard title="Contact details">
        <TextField
          label="Email"
          type="email"
          value={company.email}
          onChange={(v) => setCompany({ ...company, email: v })}
          required
        />
        <TextField
          label="Phone (display)"
          value={company.phoneDisplay}
          onChange={(v) => setCompany({ ...company, phoneDisplay: v })}
          hint="Shown on the site, e.g. +256 780 827 159"
          required
        />
        <TextField
          label="Phone (tel digits)"
          value={company.phoneTel}
          onChange={(v) => setCompany({ ...company, phoneTel: v })}
          hint="Digits only with country code, e.g. 256780827159"
          required
        />
        <TextArea
          label="Full address"
          value={company.address}
          onChange={(v) => setCompany({ ...company, address: v })}
        />
        <TextField
          label="Short address (footer)"
          value={company.addressShort}
          onChange={(v) => setCompany({ ...company, addressShort: v })}
        />
        <TextField
          label="Google Maps link"
          type="url"
          value={company.mapsHref}
          onChange={(v) => setCompany({ ...company, mapsHref: v })}
        />
        <TextArea
          label="Footer company blurb"
          value={company.footerBlurb}
          onChange={(v) => setCompany({ ...company, footerBlurb: v })}
          rows={4}
        />
      </SiteCard>

      <SiteCard title="Social links">
        {company.socials.map((s, i) => (
          <div
            key={i}
            className="grid gap-2 rounded-xl border border-neutral-light/60 p-3 sm:grid-cols-3"
          >
            <div>
              <Label>Label</Label>
              <input
                className={fieldClass}
                value={s.label}
                onChange={(e) => {
                  const socials = [...company.socials]
                  socials[i] = { ...s, label: e.target.value }
                  setCompany({ ...company, socials })
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>URL</Label>
              <input
                className={fieldClass}
                value={s.href}
                onChange={(e) => {
                  const socials = [...company.socials]
                  socials[i] = { ...s, href: e.target.value }
                  setCompany({ ...company, socials })
                }}
              />
            </div>
          </div>
        ))}
      </SiteCard>

      <SiteCard title="Contact section copy">
        <TextField
          label="Eyebrow"
          value={contact.eyebrow}
          onChange={(v) => setContact({ ...contact, eyebrow: v })}
        />
        <TextField
          label="Title (before accent)"
          value={contact.titleBefore}
          onChange={(v) => setContact({ ...contact, titleBefore: v })}
        />
        <TextField
          label="Title accent"
          value={contact.titleAccent}
          onChange={(v) => setContact({ ...contact, titleAccent: v })}
        />
        <TextArea
          label="Supporting body"
          value={contact.body}
          onChange={(v) => setContact({ ...contact, body: v })}
        />
        <TextField
          label="Background image URL"
          type="url"
          value={contact.backgroundImage}
          onChange={(v) => setContact({ ...contact, backgroundImage: v })}
        />
        <TextField
          label="Card title"
          value={contact.cardTitle}
          onChange={(v) => setContact({ ...contact, cardTitle: v })}
        />
        <TextArea
          label="Card body"
          value={contact.cardBody}
          onChange={(v) => setContact({ ...contact, cardBody: v })}
        />
      </SiteCard>

      {error ? (
        <p className="text-sm font-semibold text-red-600">{error}</p>
      ) : null}

      <ArrowPillButton type="button" disabled={pending} onClick={save}>
        {pending ? 'Saving…' : 'Save company & contact'}
      </ArrowPillButton>
    </div>
  )
}

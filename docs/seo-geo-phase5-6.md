# Phase 5–6 — Local SEO + monitoring

Built on Phase 0–4 (`performance-baseline.md`, `seo-geo-phase4.md`).

## Phase 5 — Local & geo SEO (GBP deferred)

Google Business Profile is **not set up yet**. When you create it, match NAP
exactly to CMS **Company** content and Organization JSON-LD (`name`, `address`,
`telephone` / `phoneDisplay`, `email`).

| Item | What shipped |
|------|----------------|
| Area guides | Removed (Sep 2026): `/areas/` pages, home Explore-by-area strip, nav links and sitemap entries deleted. Old CMS nav links to `/areas` are stripped at read time. |
| LocalBusiness | `geo` (Kampala CBD approx), `areaServed` Kampala / Wakiso / Mukono |

### Owner follow-up (GBP)

1. Create Google Business Profile for Mojesu Properties International Ltd
2. Copy address + phone from Admin → Site content → Company (no drift)
3. Add the GBP URL to company socials / `sameAs` when available

## Phase 6 — Monitoring & maintenance

| Item | What shipped |
|------|----------------|
| Lighthouse CI | `.github/workflows/lighthouse.yml` + `.lighthouserc.cjs` (home, rent, areas). Needs repo secrets: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `NEXT_PUBLIC_SITE_URL` |
| Image budget | `pnpm check:images` — flags published listings with more than 12 gallery images (`--strict` fails CI). Override with `LISTING_IMAGE_BUDGET` |
| Ops checklist | See below |

### Monthly / quarterly checklist (owner)

- [ ] Search Console → Core Web Vitals (group by **template**, not single URLs)
- [ ] Re-run Phase 0 lab baseline on production (`docs/performance-baseline.md` method)
- [ ] `pnpm check:images` after large listing imports
- [ ] Spot-check Rich Results for Organization / RealEstateListing on a live listing
- [ ] When GBP exists: verify NAP vs CMS company row

### Local LHCI smoke

```bash
pnpm build && pnpm start
# other terminal:
npx @lhci/cli@0.14.x autorun --config=./.lighthouserc.cjs
```

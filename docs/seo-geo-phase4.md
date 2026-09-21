# Phase 4 — GEO / AI Overview (shipped)

Built on top of Phase 0–3.2 work documented in `performance-baseline.md`.

## Shipped in this pass

| Item | What changed |
|------|----------------|
| Browse CLS | Suspense fallback was a tiny “Loading…” → full layout (CLS ~0.80). Replaced with `BrowseSkeleton` matching hero + pills + card grid on `/rent/`, `/buy/`, `/land/`. |
| Gallery weight | Mobile gallery only mounts images within ±1 of the active slide; `quality` caps on card/gallery `next/image`. |
| Answer-first services | “In short” block at top of service detail (`heroDescription` + `whatWeDo.body`). |
| Answer-first insights | Lead blocks styled as “Direct answer”; first `<p>` auto-promoted to lead when missing. |
| Freshness | Listing detail shows **Updated** from `updated_at`; JSON-LD `dateModified`; insights label **Updated**; Article JSON-LD with `datePublished` / `dateModified`. |
| E-E-A-T / trust | Sale listings: explicit title-status callout (not badge-only). Agents section: Kampala expertise + title-tenure sentence. Browse pages: written local intros (not filter-only shells). |
| Browse SEO copy | Dedicated metadata on rent/buy/land; H1 includes area when filtered. |

## Owner / ops

Phase 5–6 engineering is in `docs/seo-geo-phase5-6.md`. Still owner-owned:

- Google Business Profile (deferred) — NAP must match CMS Company + Organization schema
- Search Console CWV + Rich Results on production
- Wire GitHub secrets for Lighthouse CI workflow
- Re-run lab baseline on production / Cloudflare after deploy

## Re-check CLS

```bash
npx lighthouse@12.4.0 http://localhost:3000/rent/ \
  --only-categories=performance --form-factor=mobile \
  --throttling-method=devtools --screenEmulation.mobile=true \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --output=json --output-path=docs/lighthouse/rent-cls-check.json --quiet
```

Expect CLS near **0** if the Suspense skeleton fix holds.

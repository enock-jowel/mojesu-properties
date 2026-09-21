# Ops checklist — debt closure (no UI changes)

## Done in code / git
- Contact + service enquiry APIs wired (same pattern as viewings)
- Rate limit + origin check + honeypot on lead POSTs (no visible CAPTCHA)
- Fake localStorage `ok:true` removed from viewing + list-with-us clients
- Favorites persist in `localStorage` via `useFavorites`
- Domain strings → `mojesuproperties.com`
- `foundation.mdc` updated for real architecture
- CF/D1/empty API stubs documented or deprecated
- Supabase image transform in `sizedImageUrl` (smaller card payloads)
- Listing archive already supported via admin status (`draft|published|archived`)
- Viewing-list cart deferred (needs UI — README only)
- Git restored: https://github.com/kibalamavictor/mojesu-properties

## You must finish (free, external)
1. **Supabase migration** — SQL Editor → paste & run `supabase/migrations/007_lead_enquiries.sql`
2. **Resend** — verify `jowelnionzima@gmail.com` (signup started), create API key, then:
   `./node_modules/.bin/vercel env add RESEND_API_KEY` for production,preview,development
   Password for Resend signup is in `.env.resend.local` (gitignored)
3. Redeploy: `pnpm vercel:preview`

Without (1), contact/service inserts fail until tables exist.
Without (2), leads still save to DB but notify email is skipped (same as before for viewings).

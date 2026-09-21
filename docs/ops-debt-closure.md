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
- Git remote: https://github.com/enock-jowel/mojesu-properties

## You must finish (free, external)
1. **Supabase migration** — SQL Editor → paste & run `supabase/migrations/007_lead_enquiries.sql`
2. **Resend** — confirm email first (`Just signed up? Confirm your email…` on login), then create API key:
   `./node_modules/.bin/vercel env add RESEND_API_KEY` for production,preview,development
   Password for Resend signup is in `.env.resend.local` (gitignored)
3. Redeploy: `pnpm vercel:preview`

### Vercel deploy blocked (2026-09-21)
Deploys whose git commit author is not a Vercel collaborator are **BLOCKED**
(“commit author doesn’t have permission…”). Wrong authors seen: `mojesu@local`,
`jowelnionzima@gmail.com`. Vercel account for this project is
**enockjowel1231@gmail.com** — always commit with that email:
`git -c user.email=enockjowel1231@gmail.com -c user.name='Enock Jowel' …`
(do not change global git config).

Without (1), contact/service inserts use Storage fallback (`lib/api/lead-fallback.ts`) until tables exist.
Without (2), leads still save but notify email is skipped (same as viewings).

# Mojesu Properties

Kampala property listings website + staff CMS.

| | |
|--|--|
| **Live** | https://mojesuproperties.com |
| **Email** | hello@mojesuproperties.com |
| **Repo** | https://github.com/enock-jowel/mojesu-properties |

## New engineer — start here

1. **[`docs/HANDOFF.md`](docs/HANDOFF.md)** — single source of truth: stack, every third-party account, env catalogue, runbooks.
2. Copy [`.env.example`](.env.example) → `.env.local` (fill from owner vault — never commit secrets).
3. Optional private password sheet: copy `docs/credentials.private.example.md` → `docs/credentials.private.md` (gitignored).
4. `pnpm install` → `pnpm dev`

## Quick commands

```bash
pnpm dev                 # local site
pnpm build && pnpm start # production build locally
pnpm vercel:preview      # sync Vercel env + deploy production (uses .env.preview.local)
pnpm seed:listings       # demo catalog only — not real inventory
```

## Architecture (one paragraph)

**Next.js 15** (App Router) on **Vercel**, data/auth/storage on **Supabase** (`mdbxvcjyawgtzpingquq`). Public pages ISR (~60s). Listing reads only via `lib/properties.ts`. Lead forms POST to App Router APIs, insert with the **service role**, notify via **Resend**, WhatsApp via **wa.me** only. Staff CMS at `/admin` (role-gated).

Constraints: [`.cursor/rules/foundation.mdc`](.cursor/rules/foundation.mdc)

## Docs

See [`docs/README.md`](docs/README.md).

## Deploy author

Vercel blocks deploys when the git commit author is not a collaborator. Use:

```bash
git -c user.email=enockjowel1231@gmail.com -c user.name='Enock Jowel' commit …
```

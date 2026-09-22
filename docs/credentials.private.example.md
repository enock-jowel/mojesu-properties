# Private credentials vault (DO NOT COMMIT)

1. Copy this file to **`credentials.private.md`** in this folder.
2. Fill every row with real passwords / recovery codes.
3. `credentials.private.md` is gitignored — share only via 1Password / Bitwarden / encrypted channel.

| Service | Login / email | Password / secret | Recovery / 2FA | Notes |
|---------|---------------|-------------------|----------------|-------|
| GitHub (`enock-jowel`) | | | | |
| Vercel (`enockjowel1231@gmail.com`) | | | | Team: enockjowel1231-7456 |
| Supabase (mdbx `mdbxvcjyawgtzpingquq`) | | | | Dashboard owner |
| Supabase Auth staff | | | | List each staff email |
| Resend (`jowelnionzima@gmail.com`) | | | | API key also in Vercel |
| Zoho Mail admin (`jowelnionzima@gmail.com`) | | | | |
| Zoho mailbox `hello@mojesuproperties.com` | | | | |
| Domain registrar *(name: ______)* | | | | DNS for mojesuproperties.com |
| Cloudflare (if used) | | | | Workers / DNS |
| Google Cloud (Places) | | | | API key |
| Google Business Profile | | | | When created |
| Bitly | | | | Optional |
| WhatsApp business phone | `256780827159` | *(device PIN / SIM)* | | Not Cloud API |
| TikTok `@mojesu.properties` | | | | |
| YouTube `@Mojesupropertiesuganda3292` | | | | |
| Local `.env.admin.local` | `enockjowel1231@gmail.com` | | | |
| Local `.env.staff.local` | `hello@mojesu.com` | | | |
| Local `.env.preview-staff.local` | `admin@mojesu.com` | | | |

## Vercel project env checklist

Confirm these exist on **`mojesu-preview`** (Production + Preview + Development):

- [ ] `NEXT_PUBLIC_SUPABASE_URL` → `https://mdbxvcjyawgtzpingquq.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `NOTIFY_EMAIL_TO` / `NOTIFY_EMAIL_FROM`
- [ ] `NEXT_PUBLIC_SITE_URL` / `SITE_URL` → `https://mojesuproperties.com`
- [ ] `NEXT_PUBLIC_WHATSAPP_NUMBER`

## Supabase Auth URL config

Dashboard → Authentication → URL configuration:

- Site URL: `https://mojesuproperties.com`
- Redirect URLs: include `https://mojesuproperties.com/**` and local `http://localhost:3000/**`

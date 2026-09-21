#!/usr/bin/env bash
# Local Supabase bootstrap for Mojesu CMS Phase 1.
# Writes keys to .env.local without printing secrets.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOG=/tmp/mojesu-supabase-setup.log
: >"$LOG"

redact() {
  # Strip JWT-like tokens and service keys from any line before logging to stdout
  sed -E \
    -e 's/(eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)/[REDACTED_JWT]/g' \
    -e 's/(service_role|anon key|SECRET|KEY)[[:space:]]*[:=][[:space:]]*[^[:space:]]+/\1=[REDACTED]/gI'
}

echo "==> Stopping any previous local stack (no backup)…"
supabase stop --no-backup >>"$LOG" 2>&1 || true

echo "==> Starting local Supabase (images may take a while)…"
# Prefer sequential pulls to reduce Docker Hub/ECR stall
export COMPOSE_PARALLEL_LIMIT="${COMPOSE_PARALLEL_LIMIT:-1}"

if ! supabase start >>"$LOG" 2>&1; then
  echo "supabase start failed. Last log lines:"
  redact <"$LOG" | tail -40
  exit 1
fi

echo "==> Local Supabase is up."

# Capture status as env assignments without echoing values
STATUS_ENV="$(supabase status -o env 2>>"$LOG")"
API_URL="$(printf '%s\n' "$STATUS_ENV" | sed -n 's/^API_URL=//p' | tr -d '"')"
ANON_KEY="$(printf '%s\n' "$STATUS_ENV" | sed -n 's/^ANON_KEY=//p' | tr -d '"')"
SERVICE_KEY="$(printf '%s\n' "$STATUS_ENV" | sed -n 's/^SERVICE_ROLE_KEY=//p' | tr -d '"')"

if [[ -z "$API_URL" || -z "$ANON_KEY" || -z "$SERVICE_KEY" ]]; then
  echo "Failed to read keys from supabase status."
  redact <"$LOG" | tail -20
  exit 1
fi

ENV_LOCAL="$ROOT/.env.local"
touch "$ENV_LOCAL"

upsert_env() {
  local key="$1" value="$2" file="$3"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    # macOS/BSD sed
    sed -i '' "s|^${key}=.*|${key}=${value}|" "$file"
  else
    printf '\n%s=%s\n' "$key" "$value" >>"$file"
  fi
}

upsert_env "NEXT_PUBLIC_SUPABASE_URL" "$API_URL" "$ENV_LOCAL"
upsert_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ANON_KEY" "$ENV_LOCAL"
upsert_env "SUPABASE_SERVICE_ROLE_KEY" "$SERVICE_KEY" "$ENV_LOCAL"

echo "==> Wrote Supabase keys to .env.local (values not printed)."
echo "    NEXT_PUBLIC_SUPABASE_URL length: ${#API_URL}"
echo "    NEXT_PUBLIC_SUPABASE_ANON_KEY length: ${#ANON_KEY}"
echo "    SUPABASE_SERVICE_ROLE_KEY length: ${#SERVICE_KEY}"

echo "==> Applying 001_cms_foundation.sql…"
# db reset applies migrations; for already-running local use db execute
if ! supabase db reset --yes >>"$LOG" 2>&1; then
  echo "db reset failed; trying direct SQL apply…"
  if ! supabase db execute --file supabase/migrations/001_cms_foundation.sql >>"$LOG" 2>&1; then
    echo "Migration apply failed:"
    redact <"$LOG" | tail -40
    exit 1
  fi
fi
echo "==> Migration applied."

STAFF_EMAIL="${STAFF_EMAIL:-hello@mojesuproperties.com}"
STAFF_PASSWORD="${STAFF_PASSWORD:-}"

if [[ -z "$STAFF_PASSWORD" ]]; then
  # Generate a strong local-only password; written only to a gitignored file
  STAFF_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 24)"
fi

CREDS_FILE="$ROOT/.env.staff.local"
umask 077
cat >"$CREDS_FILE" <<EOF
# Local staff credentials (gitignored). Do not commit.
STAFF_EMAIL=${STAFF_EMAIL}
STAFF_PASSWORD=${STAFF_PASSWORD}
EOF

echo "==> Creating invite-only staff user (${STAFF_EMAIL})…"
# Use GoTrue admin API via service role — no public signup
# Local auth URL is API_URL/auth/v1
CREATE_RESP="$(curl -sS -o /tmp/mojesu-staff-create.json -w '%{http_code}' \
  -X POST "${API_URL}/auth/v1/admin/users" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${STAFF_EMAIL}\",\"password\":\"${STAFF_PASSWORD}\",\"email_confirm\":true,\"app_metadata\":{\"provider\":\"email\",\"providers\":[\"email\"]}}")"

if [[ "$CREATE_RESP" != "200" && "$CREATE_RESP" != "201" ]]; then
  # If user already exists, treat as ok
  if rg -q 'already.*(registered|exists)|User already' /tmp/mojesu-staff-create.json 2>/dev/null; then
    echo "==> Staff user already exists; continuing."
  else
    echo "Staff user create failed (HTTP ${CREATE_RESP}). Body redacted lengths only."
    wc -c /tmp/mojesu-staff-create.json
    exit 1
  fi
else
  echo "==> Staff user created (password saved to .env.staff.local — not printed)."
fi

# Ensure profiles.role = staff (trigger should create row; force-update for safety)
echo "==> Ensuring profiles.role = staff…"
DB_CONTAINER="$(docker ps --format '{{.Names}}' | rg 'supabase_db_' | head -1 || true)"
if [[ -n "$DB_CONTAINER" ]]; then
  docker exec "$DB_CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 -c \
    "update public.profiles set role = 'staff' where id = (select id from auth.users where email = '${STAFF_EMAIL}');" \
    >>"$LOG" 2>&1 || true
fi

echo "==> Seeding listings…"
# Use tsx binary directly to avoid pnpm ignored-build gate on esbuild
node ./node_modules/tsx/dist/cli.mjs scripts/seed-listings.ts >>"$LOG" 2>&1 || {
  echo "Seed failed:"
  redact <"$LOG" | tail -40
  exit 1
}

echo "==> Done."
echo "    Login: /admin/login/ as ${STAFF_EMAIL}"
echo "    Password: see .env.staff.local (gitignored)"
echo "    Full log: ${LOG} (secrets redacted if you use redact)"

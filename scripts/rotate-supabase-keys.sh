#!/usr/bin/env bash
# Swap Supabase API keys everywhere without printing them.
# 1. Copy the new sb_secret_… key to the macOS clipboard (Supabase → Settings → API Keys),
#    or export it as SUPABASE_NEW_SECRET.
# 2. bash scripts/rotate-supabase-keys.sh sb_publishable_…
# Updates local .env files (backups in .tmp/env-backup) and Vercel env vars
# (sensitive for production/preview, encrypted for development). Redeploy afterwards.
set -euo pipefail
cd "$(dirname "$0")/.."

PUB="${1:-}"
SECRET="${SUPABASE_NEW_SECRET:-$(pbpaste | tr -d '\r\n ')}"
REF="mdbxvcjyawgtzpingquq"
PROJECT="$(node -p "require('./.vercel/project.json').projectId")"
TEAM="$(node -p "require('./.vercel/project.json').orgId")"
VERCEL=./node_modules/.bin/vercel

[[ "$PUB" == sb_publishable_* ]] || { echo "Pass the sb_publishable_ key as the first argument."; exit 1; }
[[ "$SECRET" == sb_secret_* ]] || { echo "No sb_secret_ key in SUPABASE_NEW_SECRET or the clipboard."; exit 1; }

code() { curl -s -o /dev/null -w '%{http_code}' "https://$REF.supabase.co/rest/v1/$1?select=id&limit=1" -H "apikey: $2"; }
[[ "$(code profiles "$SECRET")" == 200 ]] || { echo "Secret key rejected by Supabase."; exit 1; }
[[ "$(code listings "$PUB")" == 200 ]] || { echo "Publishable key rejected by Supabase."; exit 1; }
echo "Both keys accepted by Supabase."

umask 077
mkdir -p .tmp/env-backup
for f in .env.local .env.mdbx.local .env.preview.local; do
  [[ -f "$f" ]] || continue
  cp "$f" ".tmp/env-backup/$f"
  sed -i '' \
    -e "s|^SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$SECRET|" \
    -e "s|^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$PUB|" "$f"
  echo "Updated $f"
done

API="/v10/projects/$PROJECT/env"
ids="$($VERCEL api "$API?teamId=$TEAM" --raw 2>/dev/null | node -e '
  let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
    for (const e of JSON.parse(s).envs)
      if (["SUPABASE_SERVICE_ROLE_KEY","NEXT_PUBLIC_SUPABASE_ANON_KEY"].includes(e.key)) console.log(e.id)
  })')"
for id in $ids; do
  $VERCEL api "$API/$id?teamId=$TEAM" -X DELETE --dangerously-skip-permissions --silent
done
echo "Removed old Vercel entries: $(echo $ids | wc -w | tr -d ' ')"

add() { # key value type targets-json
  printf '{"key":"%s","value":"%s","type":"%s","target":%s}' "$1" "$2" "$3" "$4" |
    $VERCEL api "$API?teamId=$TEAM" -X POST --input - --silent
}
add SUPABASE_SERVICE_ROLE_KEY "$SECRET" sensitive '["production","preview"]'
add SUPABASE_SERVICE_ROLE_KEY "$SECRET" encrypted '["development"]'
add NEXT_PUBLIC_SUPABASE_ANON_KEY "$PUB" encrypted '["production","preview","development"]'
echo "Vercel env vars set. Redeploy production to apply."

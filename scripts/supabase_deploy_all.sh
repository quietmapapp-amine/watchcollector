#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SUPABASE_REF="bdkmcauinpwvzbmgxzfl"
SEED_FILE_REL="supabase/seed/seed_badges_and_tags.sql"
CONFIG_FILE="$PROJECT_ROOT/supabase/config.toml"

# Functions list (all created so far)
FUNCS=(
  "prices-snapshot"
  "send-alerts"
  "generate-pdf"
  "ocr-invoice"
  "ai-photo-match"
  "price-comparator"
  "auction-calendar"
  "investment-sim"
  "collection-score"
  "widget-highlight"
)

echo "🧭 Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# 0) Preflight
command -v supabase >/dev/null 2>&1 || { echo "❌ Supabase CLI not found. Install: brew install supabase/tap/supabase"; exit 1; }

# 1) Auth & link
if ! supabase projects list >/dev/null 2>&1; then
  [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]] && { echo "❌ Set SUPABASE_ACCESS_TOKEN in your shell."; exit 1; }
fi

if [[ ! -f "$CONFIG_FILE" ]] || ! grep -q "$SUPABASE_REF" "$CONFIG_FILE"; then
  echo "🔗 Linking project $SUPABASE_REF"
  supabase link --project-ref "$SUPABASE_REF"
fi

# 2) DB migrations + seed
echo "📦 Applying migrations (supabase db push)…"
supabase db push
if [[ -f "$SEED_FILE_REL" ]]; then
  echo "🌱 Seeding ($SEED_FILE_REL)…"
  supabase db seed --file "$SEED_FILE_REL"
fi

# 3) Secrets injection for Functions (from current shell env)
# Required
[[ -z "${SUPABASE_URL:-}" ]] && { echo "❌ SUPABASE_URL not set in shell"; exit 1; }
[[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]] && { echo "❌ SUPABASE_SERVICE_ROLE_KEY not set in shell"; exit 1; }

echo "🔐 Pushing core secrets to functions…"
supabase functions secrets set SUPABASE_URL="$SUPABASE_URL"
supabase functions secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# Optional third-party (set only if present)
[[ -n "${ONESIGNAL_APP_ID:-}" ]] && supabase functions secrets set ONESIGNAL_APP_ID="$ONESIGNAL_APP_ID"
[[ -n "${ONESIGNAL_API_KEY:-}" ]] && supabase functions secrets set ONESIGNAL_API_KEY="$ONESIGNAL_API_KEY"
[[ -n "${RESEND_API_KEY:-}" ]] && supabase functions secrets set RESEND_API_KEY="$RESEND_API_KEY"
[[ -n "${GOOGLE_VISION_API_KEY:-}" ]] && supabase functions secrets set GOOGLE_VISION_API_KEY="$GOOGLE_VISION_API_KEY"

# 4) Deploy all functions
echo "🚀 Deploying edge functions…"
for fn in "${FUNCS[@]}"; do
  echo "  → $fn"
  supabase functions deploy "$fn"
done

echo "🎉 Done. All DB changes applied and functions deployed."

#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SQL="$PROJECT_ROOT/supabase/sql/reconcile_remote.sql"

if [[ ! -f "$SQL" ]]; then
  echo "❌ SQL not found: $SQL" >&2
  exit 1
fi

: "${SUPABASE_DB_URL:?Set SUPABASE_DB_URL to your remote Postgres URL (from Supabase Dashboard > Database > Connection string)}"

echo "🔗 Connecting to remote…"
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$SQL"

echo "✅ Reconciliation done."

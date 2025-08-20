#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MIGR="$ROOT/supabase/migrations"

if [[ ! -d "$MIGR" ]]; then
  echo "❌ Migrations folder not found: $MIGR" >&2
  exit 1
fi

echo "🔎 Scanning for 'CREATE POLICY IF NOT EXISTS' in $MIGR"
echo

matches=$(grep -RniE 'create[[:space:]]+policy[[:space:]]+if[[:space:]]+not[[:space:]]+exists' "$MIGR" || true)

if [[ -z "$matches" ]]; then
  echo "✅ No offending statements found."
  exit 0
fi

echo "⚠️ Offending occurrences:"
echo "$matches" | sed 's/^/ - /'
echo
echo "💡 Fix by replacing with: DROP POLICY IF EXISTS <name> ON <table>; CREATE POLICY <name> ..."

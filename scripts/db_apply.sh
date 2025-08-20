#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEED_FILE_REL="supabase/seed/seed_badges_and_tags.sql"
MIGR_DIR_REL="supabase/migrations"
SUPABASE_REF="bdkmcauinpwvzbmgxzfl"   # from user's project URL
CONFIG_FILE="$PROJECT_ROOT/supabase/config.toml"

echo "🧭 Project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# --- Preflight checks ---
command -v supabase >/dev/null 2>&1 || {
  echo "❌ Supabase CLI introuvable. Installe-le :"
  echo "   macOS:  brew install supabase/tap/supabase"
  echo "   curl :  curl -fsSL https://supabase.com/docs/guides/cli/getting-started | sh"
  exit 1
}

if [[ ! -d "$MIGR_DIR_REL" ]]; then
  echo "❌ Dossier migrations introuvable: $MIGR_DIR_REL"
  exit 1
fi

if [[ ! -f "$SEED_FILE_REL" ]]; then
  echo "❌ Fichier seed introuvable: $SEED_FILE_REL"
  exit 1
fi

# --- Auth & Link ---
# Supabase Cloud needs an access token in env (no prompt mode).
if ! supabase projects list >/dev/null 2>&1; then
  if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
    echo "❌ SUPABASE_ACCESS_TOKEN manquant."
    echo "   Récupère-le depuis https://supabase.com/dashboard/account/tokens puis :"
    echo "   export SUPABASE_ACCESS_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxx"
    exit 1
  fi
fi

# Ensure project is linked (config.toml must exist and match project ref)
if [[ ! -f "$CONFIG_FILE" ]] || ! grep -q "$SUPABASE_REF" "$CONFIG_FILE"; then
  echo "🔗 Linking Supabase project ref: $SUPABASE_REF"
  supabase link --project-ref "$SUPABASE_REF"
fi

echo "✅ Projet lié à Supabase."

# --- Apply migrations ---
echo "📦 Applying migrations (supabase db push)…"
supabase db push
echo "✅ Migrations appliquées."

# --- Run seed ---
echo "🌱 Seeding data from $SEED_FILE_REL …"
supabase db seed --file "$SEED_FILE_REL"
echo "✅ Seed exécuté."

echo "🎉 Terminé. Vérifie tes tables dans le Dashboard Supabase."

#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PBX="$(ls "$ROOT"/ios/*.xcodeproj/project.pbxproj 2>/dev/null | head -n1 || true)"
TEAM="${APPLE_TEAM_ID:-}"
BUNDLE_ID="${APP_IDENTIFIER:-}"

if [ -z "$PBX" ] || [ ! -f "$PBX" ]; then
  echo "🔴 project.pbxproj not found under ios/"; exit 1
fi
if [ -z "$TEAM" ] || [ -z "$BUNDLE_ID" ]; then
  echo "🔴 APPLE_TEAM_ID or APP_IDENTIFIER missing from .env"; exit 1
fi

# Enforce Automatic signing, team and bundle id
sed -i '' 's/CODE_SIGN_STYLE = Manual;/CODE_SIGN_STYLE = Automatic;/g' "$PBX"
if grep -q "DEVELOPMENT_TEAM =" "$PBX"; then
  sed -i '' "s/DEVELOPMENT_TEAM = [A-Z0-9]*/DEVELOPMENT_TEAM = $TEAM/" "$PBX"
fi
sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = [^;]*/PRODUCT_BUNDLE_IDENTIFIER = $BUNDLE_ID/" "$PBX"

echo "✅ Signing set to Automatic, TEAM=$TEAM, BUNDLE_ID=$BUNDLE_ID"

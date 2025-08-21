#!/usr/bin/env bash
set -euo pipefail
RED=$'\e[31m'; GRN=$'\e[32m'; YLW=$'\e[33m'; NC=$'\e[0m'
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS="$ROOT/ios"

echo "🔎 Checking Xcode Command Line Tools…"
if ! command -v xcodebuild >/dev/null 2>&1; then
  echo "${RED}🔴 xcodebuild introuvable. Ouvre Xcode une fois ou installe les CLT: xcode-select --install${NC}"
  exit 1
fi

# Try to ensure a valid developer dir (no sudo here; just print instructions if needed)
DEV_DIR="$(xcode-select -p 2>/dev/null || true)"
if [[ -z "${DEV_DIR:-}" || ! -d "$DEV_DIR" ]]; then
  echo "${YLW}⚠️ CLT non sélectionnés. Si besoin: sudo xcode-select -s /Applications/Xcode.app${NC}"
fi

if [[ ! -d "$IOS" ]]; then
  echo "${RED}🔴 Dossier ios/ manquant dans le repo.${NC}"; exit 1
fi

# Find workspace/project
WS="$(find "$IOS" -maxdepth 1 -name "*.xcworkspace" -type d 2>/dev/null | head -n1 || true)"
PJ="$(find "$IOS" -maxdepth 1 -name "*.xcodeproj" -type d 2>/dev/null | head -n1 || true)"
if [[ -z "${WS:-}" && -z "${PJ:-}" ]]; then
  echo "${RED}🔴 Aucun .xcworkspace ni .xcodeproj trouvé sous ios/.${NC}"; exit 1
fi
echo "📁 Workspace: ${WS:--}"
echo "📁 Project:   ${PJ:--}"

# Share schemes: copy from xcuserdata to xcshareddata
share_from_to () {
  local container="$1"  # .xcodeproj or .xcworkspace path
  local from="$container/xcuserdata"
  local to="$container/xcshareddata/xcschemes"
  mkdir -p "$to"
  if [[ -d "$from" ]]; then
    while IFS= read -r -d '' SC; do
      base="$(basename "$SC")"
      cp -f "$SC" "$to/$base"
      echo "✅ Shared: ${container##*/} → $base"
    done < <(find "$from" -name "*.xcscheme" -print0)
  fi
}

[[ -n "${PJ:-}" ]] && share_from_to "$PJ"
[[ -n "${WS:-}" ]] && share_from_to "$WS"

# Re-list schemes using xcodebuild
echo "🧪 Listing schemes via xcodebuild…"
if [[ -n "${WS:-}" ]]; then
  LIST_JSON="$(cd "$IOS" && xcodebuild -list -json -workspace "$(basename "$WS")" 2>/dev/null || true)"
else
  LIST_JSON="$(cd "$IOS" && xcodebuild -list -json -project "$(basename "$PJ")" 2>/dev/null || true)"
fi

SCHEME=""
if [[ -n "$LIST_JSON" ]]; then
  # Parse with Python to be safe
  SCHEME="$(python3 - <<'PY' "$LIST_JSON"
import sys, json
data=json.loads(sys.argv[1])
schemes=data.get("schemes") or []
# Prefer a non-Pods scheme
pref = next((s for s in schemes if "pods" not in s.lower()), None)
print(pref or (schemes[0] if schemes else ""))
PY
)"
fi

# Fallback: read shared xcschemes filenames if xcodebuild json failed
if [[ -z "$SCHEME" ]]; then
  CANDIDATE="$(ls "$PJ"/xcshareddata/xcschemes/*.xcscheme 2>/dev/null | head -n1 || true)"
  [[ -z "$CANDIDATE" && -n "${WS:-}" ]] && CANDIDATE="$(ls "$WS"/xcshareddata/xcschemes/*.xcscheme 2>/dev/null | head -n1 || true)"
  if [[ -n "$CANDIDATE" ]]; then
    SCHEME="$(basename "$CANDIDATE" .xcscheme)"
  fi
fi

if [[ -z "$SCHEME" ]]; then
  echo "${RED}🔴 Aucun schéma détecté. Ouvre Xcode → Product > Scheme > Manage Schemes… → coche "Shared", puis relance ce script.${NC}"
  exit 1
fi

# Update .env SCHEME=…
ENV="$ROOT/.env"
touch "$ENV"
TMP="$ENV.tmp"
awk -vOFS='=' -vVAL="$SCHEME" '
BEGIN{done=0}
{
  if ($1=="SCHEME"){print "SCHEME",VAL; done=1}
  else print $0
}
END{
  if (!done) print "SCHEME",VAL
}' "$ENV" > "$TMP" && mv "$TMP" "$ENV"

echo "${GRN}✅ Scheme détecté et écrit dans .env: SCHEME=$SCHEME${NC}"
echo "Next:"
echo "  ruby scripts/preflight.rb"
echo "  make release"
exit 0

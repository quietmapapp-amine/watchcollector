#!/usr/bin/env bash
set -euo pipefail
RED=$'\e[31m'; GRN=$'\e[32m'; YLW=$'\e[33m'; NC=$'\e[0m'
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PBXPROJ="$(ls "$ROOT"/ios/*.xcodeproj/project.pbxproj 2>/dev/null | head -n1 || true)"
if [[ -z "${PBXPROJ:-}" || ! -f "$PBXPROJ" ]]; then
  echo "${RED}🔴 project.pbxproj introuvable (ios/*.xcodeproj)${NC}"; exit 1
fi

IMAGES_DIR="$(find "$ROOT/ios" -type d -name "Images.xcassets" -print -quit)"
if [[ -z "${IMAGES_DIR:-}" ]]; then
  echo "${RED}🔴 Aucun dossier Images.xcassets trouvé sous ios/. Crée-le puis réessaie.${NC}"; exit 1
fi

APPICON_DIR="$(find "$IMAGES_DIR" -type d -name "AppIcon.appiconset" -print -quit)"
if [[ -z "${APPICON_DIR:-}" ]]; then
  echo "${RED}🔴 AppIcon.appiconset manquant.${NC}"
  echo "   ➜ Dézippe ton pack d'icônes dans : ${IMAGES_DIR}/AppIcon.appiconset"
  exit 1
fi

echo "📁 AppIcon set: ${APPICON_DIR#$ROOT/}"

CONTENTS_JSON="${APPICON_DIR}/Contents.json"
if [[ ! -f "$CONTENTS_JSON" ]]; then
  echo "${YLW}⚠️ Contents.json manquant — création d'un squelette.${NC}"
  cat > "$CONTENTS_JSON" <<'JSON'
{ "images": [], "info": { "version": 1, "author": "xcode" } }
JSON
fi

# Ensure 120x120 exists
NEEDED="$APPICON_DIR/Icon-60@2x.png"
MADE_120="no"
if [[ ! -f "$NEEDED" ]]; then
  echo "${YLW}⚠️ 120x120 absent, tentative de génération…${NC}"
  SRC=""
  if [[ -f "$APPICON_DIR/Icon-60@3x.png" ]]; then SRC="$APPICON_DIR/Icon-60@3x.png"; fi
  if [[ -z "$SRC" && -f "$APPICON_DIR/ItunesArtwork-1024.png" ]]; then SRC="$APPICON_DIR/ItunesArtwork-1024.png"; fi
  if [[ -z "$SRC" ]]; then
    echo "${RED}🔴 Impossible de générer 120x120 (ni 60@3x ni 1024 marketing).${NC}"
    echo "   ➜ Ajoute un fichier source et relance."
    exit 1
  fi
  if ! command -v sips >/dev/null 2>&1; then
    echo "${RED}🔴 L'outil macOS 'sips' est requis pour redimensionner les icônes.${NC}"; exit 1
  fi
  sips -s format png -z 120 120 "$SRC" --out "$NEEDED" >/dev/null
  MADE_120="yes"
fi

# Ensure JSON entry for 120x120 exists
if ! grep -q '"size": "60x60".*"scale": "2x".*"filename": "Icon-60@2x.png"' "$CONTENTS_JSON"; then
  # Append entry safely
  TMP="$CONTENTS_JSON.tmp"
  python3 - <<'PY' "$CONTENTS_JSON" > "$TMP"
import json,sys
p=sys.argv[1]
data=json.load(open(p))
imgs=data.get("images",[])
entry={"idiom":"iphone","size":"60x60","scale":"2x","filename":"Icon-60@2x.png"}
if not any(i.get("idiom")==entry["idiom"] and i.get("size")==entry["size"] and i.get("scale")==entry["scale"] for i in imgs):
    imgs.append(entry)
data["images"]=imgs
json.dump(data,open(p,"w"),indent=2)
print(p)
PY
  mv "$TMP" "$CONTENTS_JSON" 2>/dev/null || true
fi

# Ensure CFBundleIconName = AppIcon in all Info.plist
while IFS= read -r -d '' PLIST; do
  if /usr/libexec/PlistBuddy -c "Print :CFBundleIconName" "$PLIST" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleIconName AppIcon" "$PLIST" || true
  else
    /usr/libexec/PlistBuddy -c "Add :CFBundleIconName string AppIcon" "$PLIST" || true
  fi
done < <(find "$ROOT/ios" -name "Info.plist" -print0)

# Enforce AppIcon in project settings
sed -i '' 's/ASSETCATALOG_COMPILER_APPICON_NAME = [^;]*/ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon/g' "$PBXPROJ" || true
# If INCLUDE_ALL_APPICON_ASSETS exists, set YES
if grep -q "ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS" "$PBXPROJ"; then
  sed -i '' 's/ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = [^;]*/ASSETCATALOG_COMPILER_INCLUDE_ALL_APPICON_ASSETS = YES/g' "$PBXPROJ" || true
fi

echo
echo "${GRN}✅ Vérifications terminées.${NC}"
echo "• 120x120 présent: $( [[ -f "$NEEDED" ]] && echo oui || echo non ) (généré=${MADE_120})"
echo "• CFBundleIconName = AppIcon (tous les Info.plist)"
echo "• Xcode build setting: ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon"
echo
echo "Prochaines étapes :"
echo "  1) Ouvrir Xcode → Target WatchCollector → General → App Icons = AppIcon"
echo "  2) Product → Clean Build Folder"
echo "  3) Product → Archive → Distribute (ou: make release)"
echo

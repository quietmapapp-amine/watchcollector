#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PBX="$(ls "$ROOT"/ios/*.xcodeproj/project.pbxproj | head -n1 || true)"
if [ -z "${PBX:-}" ] || [ ! -f "$PBX" ]; then
  echo "🔴 project.pbxproj not found"; exit 1
fi

echo "🔧 Disabling Mac Catalyst and enforcing iOS-only…"
sed -i '' 's/SUPPORTS_MACCATALYST = YES;/SUPPORTS_MACCATALYST = NO;/g' "$PBX"
# Normalize targeted device families (iPhone,iPad)
if grep -q 'TARGETED_DEVICE_FAMILY' "$PBX"; then
  sed -i '' 's/TARGETED_DEVICE_FAMILY = [^;]*/TARGETED_DEVICE_FAMILY = "1,2"/g' "$PBX"
else
  echo "ℹ️ No TARGETED_DEVICE_FAMILY found; Xcode default will apply."
fi
# App icon name if present
if grep -q 'ASSETCATALOG_COMPILER_APPICON_NAME' "$PBX"; then
  sed -i '' 's/ASSETCATALOG_COMPILER_APPICON_NAME = [^;]*/ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon/g' "$PBX"
fi

# Strip Mac-only Info.plist key
while IFS= read -r -d '' PLIST; do
  if /usr/libexec/PlistBuddy -c "Print :LSApplicationCategoryType" "$PLIST" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c "Delete :LSApplicationCategoryType" "$PLIST" || true
    echo "🧽 Removed LSApplicationCategoryType in ${PLIST#$ROOT/}"
  fi
done < <(find "$ROOT/ios" -name "Info.plist" -print0)

echo "✅ iOS-only enforced."
echo "Next:"
echo "  - In Xcode select destination: Any iOS Device (arm64)"
echo "  - Product → Archive → Upload"

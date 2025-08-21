#!/usr/bin/env bash
set -euo pipefail
RED=$'\e[31m'; GRN=$'\e[32m'; YLW=$'\e[33m'; NC=$'\e[0m'
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PBX="$(ls "$ROOT"/ios/*.xcodeproj/project.pbxproj 2>/dev/null | head -n1 || true)"
PODFILE="$ROOT/ios/Podfile"

if [ -z "$PBX" ] || [ ! -f "$PBX" ]; then
  echo "${RED}🔴 project.pbxproj introuvable sous ios/.${NC}"; exit 1
fi

# 1) Backup
cp "$PBX" "${PBX}.bak.$(date +%Y%m%d%H%M%S)"

# 2) Neutralize Expo shell scripts
if grep -q "expo-configure-project.sh" "$PBX"; then
  sed -i '' 's@/usr/bin/env bash.*expo-configure-project\.sh.*@echo \"[Expo] configure skipped for no-Expo build\"@g' "$PBX" || true
  echo "🧯 Neutralisé: expo-configure-project.sh"
fi

# 3) Remove ExpoModulesProvider.swift from sources, build files & file refs
if grep -q "ExpoModulesProvider.swift" "$PBX"; then
  # Lines in PBXSourcesBuildPhase
  sed -i '' '/ExpoModulesProvider\.swift/d' "$PBX"
  # Build files and file refs (any line referencing the swift path)
  sed -i '' '/path = .*ExpoModulesProvider\.swift/d' "$PBX"
  sed -i '' '/ExpoModulesProvider\.swift in Sources/d' "$PBX"
  echo "🧹 Supprimé: références à ExpoModulesProvider.swift"
fi

# 4) Disable User Script Sandboxing on app target
if grep -q "ENABLE_USER_SCRIPT_SANDBOXING" "$PBX"; then
  sed -i '' 's/ENABLE_USER_SCRIPT_SANDBOXING = YES;/ENABLE_USER_SCRIPT_SANDBOXING = NO;/g' "$PBX" || true
else
  # Best effort: add in all buildSettings blocks of native target
  sed -i '' 's/\(buildSettings = {\)/\1\
        ENABLE_USER_SCRIPT_SANDBOXING = NO;/' "$PBX" || true
fi
echo "🔐 ENABLE_USER_SCRIPT_SANDBOXING = NO"

# 5) Podfile: comment Expo pods & macros (use_expo_modules!, pods starting with Expo)
if [ -f "$PODFILE" ]; then
  if grep -q "use_expo_modules!" "$PODFILE"; then
    sed -i '' 's/^(\s*)use_expo_modules!/# use_expo_modules!/g' "$PODFILE"
    echo "📝 Podfile: use_expo_modules! commenté"
  fi
  # Comment any line like: pod 'Expo…'
  if grep -q "pod 'Expo" "$PODFILE"; then
    sed -i '' "s/^\(\s*\)pod 'Expo/\# \0/g" "$PODFILE"
    echo "📝 Podfile: pods Expo commentés"
  fi
else
  echo "ℹ️ Podfile absent; aucune modif côté Pods."
fi

echo
echo "${GRN}✅ Purge iOS Expo terminée.${NC}"
echo "Next:"
echo "  1) bash scripts/pods_refresh.sh   (réinstalle les Pods proprement)"
echo "  2) open ios/WatchCollector.xcworkspace"
echo "  3) Xcode → Product → Clean Build Folder"
echo "  4) Archive → Upload"
echo

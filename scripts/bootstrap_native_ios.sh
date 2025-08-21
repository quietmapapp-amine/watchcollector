#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "📦 WatchCollector native iOS bootstrap (no Expo)"
if [ -d "ios" ]; then
  echo "✅ ios/ already exists. Nothing to bootstrap."
  exit 0
fi

TMP=".rn-tmp"
rm -rf "$TMP"
mkdir -p "$TMP"
pushd "$TMP" >/dev/null

echo "➡️ Running RN init in $TMP (this is local-only, no Expo)..."
npx --yes react-native init WatchCollector --version 0.74.3

popd >/dev/null

echo "➡️ Copying ios/ into repository..."
rsync -a "$TMP/WatchCollector/ios/" "ios/"

echo "🧹 Cleaning temp..."
rm -rf "$TMP"

PODFILE="ios/Podfile"
if [ -f "$PODFILE" ]; then
  if ! grep -q "platform :ios" "$PODFILE"; then
    sed -i '' '1s/^/platform :ios, '\''13.0'\''\n/' "$PODFILE"
  else
    sed -i '' 's/platform :ios, .*/platform :ios, '\''13.0'\''/' "$PODFILE"
  fi
fi

PBX="ios/WatchCollector.xcodeproj/project.pbxproj"
if [ -f "$PBX" ]; then
  # Replace default RN bundle id with our APP_IDENTIFIER
  sed -i '' "s/PRODUCT_BUNDLE_IDENTIFIER = [^;]*;/PRODUCT_BUNDLE_IDENTIFIER = com.unishopllc.watchcollector;/" "$PBX"
fi

INFO="ios/WatchCollector/Info.plist"
if [ -f "$INFO" ] && ! /usr/libexec/PlistBuddy -c "Print :ITSAppUsesNonExemptEncryption" "$INFO" >/dev/null 2>&1; then
  /usr/libexec/PlistBuddy -c "Add :ITSAppUsesNonExemptEncryption bool false" "$INFO" || true
fi

ENV_FILE=".env"
touch "$ENV_FILE"
# Rewrite or append keys while preserving the rest
awk -vOFS='=' '
BEGIN{keys["SCHEME"]=1; keys["XCWORKSPACE_PATH"]=1; keys["XCODEPROJ_PATH"]=1}
{
  if ($1=="SCHEME") {print "SCHEME","WatchCollector"; seen["SCHEME"]=1}
  else if ($1=="XCWORKSPACE_PATH") {print "XCWORKSPACE_PATH","ios/WatchCollector.xcworkspace"; seen["XCWORKSPACE_PATH"]=1}
  else if ($1=="XCODEPROJ_PATH") {print "XCODEPROJ_PATH","ios/WatchCollector.xcodeproj"; seen["XCODEPROJ_PATH"]=1}
  else print $0
}
END{
  if (!seen["SCHEME"]) print "SCHEME","WatchCollector";
  if (!seen["XCWORKSPACE_PATH"]) print "XCWORKSPACE_PATH","ios/WatchCollector.xcworkspace";
  if (!seen["XCODEPROJ_PATH"]) print "XCODEPROJ_PATH","ios/WatchCollector.xcodeproj";
}' "$ENV_FILE" > "$ENV_FILE.tmp" && mv "$ENV_FILE.tmp" "$ENV_FILE"

echo "✅ iOS native project created."
echo "Next:"
echo "  1) cd \"$ROOT\""
echo "  2) gem install bundler && bundle install"
echo "  3) make setup-ios"
echo "  4) open ios/WatchCollector.xcworkspace (set Team to 36UJXYW4LH if needed)"
echo "  5) make release"

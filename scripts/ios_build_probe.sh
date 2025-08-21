#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

WS="${XCWORKSPACE_PATH:-ios/WatchCollector.xcworkspace}"
PJ="${XCODEPROJ_PATH:-ios/WatchCollector.xcodeproj}"
SCHEME="${SCHEME:-WatchCollector}"
TEAM="${APPLE_TEAM_ID:-}"
BUNDLE_ID="${APP_IDENTIFIER:-}"

if [ -f "$WS" ]; then
  SRC="-workspace \"$WS\""
elif [ -f "$PJ" ]; then
  SRC="-project \"$PJ\""
else
  echo "🔴 No workspace or project found under ios/"; exit 1
fi

mkdir -p "$ROOT/build"
LOG="$ROOT/build/ios_build_probe.log"
ARCHIVE="$ROOT/build/WatchCollector.xcarchive"

echo "➡️  Probe archive with:"
echo "   xcodebuild clean archive $SRC -scheme \"$SCHEME\" -configuration Release -sdk iphoneos -destination generic/platform=iOS -archivePath \"$ARCHIVE\""
echo

set +e
CMD="set -o pipefail && xcodebuild clean archive $SRC -scheme \"$SCHEME\" -configuration Release -sdk iphoneos -destination generic/platform=iOS -archivePath \"$ARCHIVE\" CODE_SIGN_STYLE=Automatic DEVELOPMENT_TEAM=\"$TEAM\" PRODUCT_BUNDLE_IDENTIFIER=\"$BUNDLE_ID\" | tee \"$LOG\""
bash -lc "$CMD"
RC=$?
set -e

echo
echo "⛏️  Parsing errors/warnings:"
grep -E "(error: |fatal error: |Undefined symbols|Provisioning profile|No profiles|code signing|bundle identifier|CFBundleIconName|AppIcon|missing|Command.*failed)" -n "$LOG" || echo "(no obvious matches)"
echo
echo "🗂  Full log at: $LOG"
exit $RC

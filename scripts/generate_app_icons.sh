#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ASSETS_DIR="$ROOT/ios/WatchCollector/Images.xcassets"
APPICON_DIR="$ASSETS_DIR/AppIcon.appiconset"
PLIST="$ROOT/ios/WatchCollector/Info.plist"
PBXPROJ="$(ls "$ROOT"/ios/*.xcodeproj/project.pbxproj | head -n1 || true)"
SRC="${1:-$ROOT/assets/appicon.png}"

mkdir -p "$ROOT/assets" "$APPICON_DIR"

# Provide a fallback 1024x1024 if no src
if [ ! -f "$SRC" ]; then
  echo "⚠️  Source icon not found at $SRC. Creating fallback at assets/appicon_fallback.png"
  FALLBACK="$ROOT/assets/appicon_fallback.png"
  # Minimal 1024x1024 PNG (solid color) via base64
  echo "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAIAAADTED8xAAAAGXRFWHRTb2Z0d2FyZQBwYWludC5uZXQgNC4yLjExQqdlNQAABYFJREFUeF7t1zENgkAQBVBp//9q5cQq3Jm2kqkWmVwYy2cYbqf4oNnIhD0g3v2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABw5m7Qz1H7bB2/7cU5n0Hj3uHf1w8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgHcEJk0+8i4nYwAAAABJRU5ErkJggg==" | base64 --decode > "$FALLBACK"
  SRC="$FALLBACK"
fi

if ! command -v sips >/dev/null 2>&1; then
  echo "🔴 macOS 'sips' tool not found. Run on macOS."
  exit 1
fi

cd "$APPICON_DIR"

# Helper to make one icon
make_icon () {
  local size="$1" name="$2"
  sips -s format png -z "$size" "$size" "$SRC" --out "$name" >/dev/null
}

# iPhone
make_icon 40  "Icon-20@2x.png"     # 20pt @2x notification
make_icon 60  "Icon-20@3x.png"     # 20pt @3x notification
make_icon 58  "Icon-29@2x.png"     # 29pt @2x settings
make_icon 87  "Icon-29@3x.png"     # 29pt @3x settings
make_icon 80  "Icon-40@2x.png"     # 40pt @2x spotlight
make_icon 120 "Icon-40@3x.png"     # 40pt @3x spotlight
make_icon 120 "Icon-60@2x.png"     # 60pt @2x app (== 120x120 REQUIRED)
make_icon 180 "Icon-60@3x.png"     # 60pt @3x app

# iPad
make_icon 20  "Icon-20~ipad.png"   # 20pt @1x notification
make_icon 40  "Icon-20@2x~ipad.png"
make_icon 29  "Icon-29~ipad.png"   # settings
make_icon 58  "Icon-29@2x~ipad.png"
make_icon 40  "Icon-40~ipad.png"   # spotlight
make_icon 80  "Icon-40@2x~ipad.png"
make_icon 76  "Icon-76~ipad.png"   # app
make_icon 152 "Icon-76@2x~ipad.png"
make_icon 167 "Icon-83.5@2x~ipad.png"  # iPad Pro
# marketing (not in app bundle but required in asset catalog)
cp "$SRC" "ItunesArtwork-1024.png" 2>/dev/null || true
sips -s format png -z 1024 1024 "$SRC" --out "ItunesArtwork-1024.png" >/dev/null

# Contents.json
cat > Contents.json <<'JSON'
{
  "images": [
    { "idiom": "iphone", "size": "20x20", "scale": "2x", "filename": "Icon-20@2x.png" },
    { "idiom": "iphone", "size": "20x20", "scale": "3x", "filename": "Icon-20@3x.png" },
    { "idiom": "iphone", "size": "29x29", "scale": "2x", "filename": "Icon-29@2x.png" },
    { "idiom": "iphone", "size": "29x29", "scale": "3x", "filename": "Icon-29@3x.png" },
    { "idiom": "iphone", "size": "40x40", "scale": "2x", "filename": "Icon-40@2x.png" },
    { "idiom": "iphone", "size": "40x40", "scale": "3x", "filename": "Icon-40@3x.png" },
    { "idiom": "iphone", "size": "60x60", "scale": "2x", "filename": "Icon-60@2x.png" },
    { "idiom": "iphone", "size": "60x60", "scale": "3x", "filename": "Icon-60@3x.png" },

    { "idiom": "ipad", "size": "20x20", "scale": "1x", "filename": "Icon-20~ipad.png" },
    { "idiom": "ipad", "size": "20x20", "scale": "2x", "filename": "Icon-20@2x~ipad.png" },
    { "idiom": "ipad", "size": "29x29", "scale": "1x", "filename": "Icon-29~ipad.png" },
    { "idiom": "ipad", "size": "29x29", "scale": "2x", "filename": "Icon-29@2x~ipad.png" },
    { "idiom": "ipad", "size": "40x40", "scale": "1x", "filename": "Icon-40~ipad.png" },
    { "idiom": "ipad", "size": "40x40", "scale": "2x", "filename": "Icon-40@2x~ipad.png" },
    { "idiom": "ipad", "size": "76x76", "scale": "1x", "filename": "Icon-76~ipad.png" },
    { "idiom": "ipad", "size": "76x76", "scale": "2x", "filename": "Icon-76@2x~ipad.png" },
    { "idiom": "ipad", "size": "83.5x83.5", "scale": "2x", "filename": "Icon-83.5@2x~ipad.png" },

    { "idiom": "ios-marketing", "size": "1024x1024", "scale": "1x", "filename": "ItunesArtwork-1024.png" }
  ],
  "info": { "version": 1, "author": "xcode" }
}
JSON

# Ensure AppIcon is selected in project settings
if [ -n "$PBXPROJ" ] && [ -f "$PBXPROJ" ]; then
  sed -i '' 's/ASSETCATALOG_COMPILER_APPICON_NAME = [^;]*/ASSETCATALOG_COMPILER_APPICON_NAME = AppIcon/g' "$PBXPROJ" || true
fi

# Ensure CFBundleIconName in Info.plist
if [ -f "$PLIST" ]; then
  if /usr/libexec/PlistBuddy -c "Print :CFBundleIconName" "$PLIST" >/dev/null 2>&1; then
    /usr/libexec/PlistBuddy -c "Set :CFBundleIconName AppIcon" "$PLIST" || true
  else
    /usr/libexec/PlistBuddy -c "Add :CFBundleIconName string AppIcon" "$PLIST" || true
  fi
fi

echo "✅ AppIcon generated and wired."
echo "• Source: $SRC"
echo "• Catalog: ${APPICON_DIR#$ROOT/}"
echo "Next:"
echo "  - Open Xcode → target WatchCollector → General → App Icons: should show 'AppIcon'"
echo "  - Product → Clean Build Folder, then Archive & Upload"

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

IOS_DIR="$ROOT/ios"
if [ ! -d "$IOS_DIR" ]; then
  echo "🔴 Dossier ios/ introuvable. Abandon."; exit 1
fi
if [ ! -f "$IOS_DIR/Podfile" ]; then
  echo "🔴 ios/Podfile introuvable. Ouvre Xcode une fois (ou génère le projet iOS) puis relance."
  exit 1
fi

echo "ⓘ Ruby: $(ruby -v || true)"
echo "ⓘ Bundler: $(bundle -v || echo 'absent')"

echo "➡️  Installation/MAJ Bundler…"
gem install bundler --no-document || true

echo "➡️  Installation/MAJ des gems (fastlane + cocoapods)…"
bundle install

echo "➡️  Vérification cocoapods dans le bundle…"
if bundle exec pod --version >/dev/null 2>&1; then
  POD_CMD="bundle exec pod"
  echo "✅ Pods via Bundler: $($POD_CMD --version)"
else
  echo "⚠️  Cocoapods non dispo via Bundler. Essai avec Homebrew…"
  if command -v brew >/dev/null 2>&1; then
    brew list cocoapods >/dev/null 2>&1 || brew install cocoapods
    POD_CMD="pod"
    echo "✅ Pods via Homebrew: $($POD_CMD --version)"
  else
    echo "🔴 Ni Bundler ni Homebrew ne fournissent 'pod'. Installe Homebrew (https://brew.sh) puis 'brew install cocoapods'."
    exit 1
  fi
fi

echo "➡️  Mise à jour des specs…"
$POD_CMD repo update

echo "➡️  Installation des Pods (ios/)…"
$POD_CMD install --project-directory=ios

echo "✅ Pods installés."
echo "Next:"
echo "  1) open ios/WatchCollector.xcworkspace"
echo "  2) Xcode: Product → Clean Build Folder → Archive → Upload"

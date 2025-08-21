#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "$ROOT/ios/Podfile" ]; then
  echo "🧹 pod deintegrate"; (cd "$ROOT/ios" && (bundle exec pod deintegrate || pod deintegrate || true))
  echo "📦 pod install --repo-update"; (cd "$ROOT/ios" && (bundle exec pod install --repo-update || pod install --repo-update))
  echo "✅ Pods refreshed."
else
  echo "ℹ️ No ios/Podfile found."
fi

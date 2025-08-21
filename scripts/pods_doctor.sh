#!/usr/bin/env bash
set -euo pipefail
echo "Ruby: $(ruby -v)"
echo "Bundler: $(bundle -v || true)"
echo "Checking cocoapods in bundle…"
if bundle show cocoapods >/dev/null 2>&1; then
  echo "✅ cocoapods gem is in the bundle"
else
  echo "🔴 cocoapods not in bundle. Run: gem install bundler && bundle install"
  exit 1
fi
echo "pod --version (bundle exec)…"
bundle exec pod --version || (echo "🔴 'pod' not runnable via bundler"; exit 1)
echo "✅ Pods doctor OK"

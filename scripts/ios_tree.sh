#!/usr/bin/env bash
set -euo pipefail
echo "ios/ content:"
ls -la ios || true
echo
echo "Workspaces:"; ls -la ios/*.xcworkspace 2>/dev/null || true
echo "Projects:";   ls -la ios/*.xcodeproj 2>/dev/null || true

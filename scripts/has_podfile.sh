#!/usr/bin/env bash
set -euo pipefail
test -f ios/Podfile && echo "ios/Podfile: OK" || (echo "ios/Podfile: MISSING"; exit 1)

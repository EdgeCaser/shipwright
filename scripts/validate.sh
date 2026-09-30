#!/usr/bin/env bash
# Compatibility entrypoint; Node keeps validation identical on all platforms.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
exec node "$root/scripts/validate-repository.mjs"

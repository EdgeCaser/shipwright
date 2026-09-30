#!/usr/bin/env bash
# Compatibility wrapper for the non-destructive cross-platform installer.
set -euo pipefail
if [[ "${1:-}" == "--install" ]]; then
  [[ -n "${2:-}" ]] || { echo "Usage: bash scripts/sync.sh --install <project>"; exit 1; }
  root="$(cd "$(dirname "$0")/.." && pwd)"
  exec node "$root/scripts/install.mjs" "$2" --apply
fi
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  echo "Install: bash scripts/sync.sh --install <project>"
  echo "Check: bash shipwright-sync.sh; apply: bash shipwright-sync.sh --yes"
  exit 0
fi
[[ -f .shipwright-source ]] || { echo "Missing .shipwright-source; run install first."; exit 1; }
IFS= read -r root < .shipwright-source
root="${root%$'\r'}"
if [[ "${1:-}" == "--yes" ]]; then
  exec node "$root/scripts/install.mjs" "$PWD" --apply
fi
[[ -z "${1:-}" ]] || { echo "Unknown option: $1"; exit 1; }
node "$root/scripts/install.mjs" "$PWD"
echo "Review the changes above; run bash shipwright-sync.sh --yes to apply."

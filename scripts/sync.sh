#!/bin/bash
# Shipwright Sync — checks a destination project against the Shipwright source
# and offers to update any out-of-date files.
#
# Usage:
#   First install (run from shipwright repo):
#     bash scripts/sync.sh --install /path/to/destination
#
#   Check for updates (run from destination):
#     bash shipwright-sync.sh
#
#   Auto-update all without prompting:
#     bash shipwright-sync.sh --yes

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# ─── Mapping: shipwright dir → destination dir ────────────────────────────────
# Each entry is "source_dir:dest_dir" relative to their respective roots.
MAPPINGS=(
  "skills:.claude/skills"
  "skills:.codex/skills"
  "agents:.claude/agents"
  "commands:.claude/commands"
  "output-styles:.claude/output-styles"
  "docs:.claude/docs"
  "evals:.claude/evals"
  "scripts:.claude/scripts"
  "scripts:.codex/scripts"
  "schemas:schemas"
  "benchmarks/scenarios:benchmarks/scenarios"
  "benchmarks/fixtures:benchmarks/fixtures"
)

OVERLAY_MAPPINGS=(
  ".codex/skills:.codex/skills"
)

# Root-level files copied directly to the destination root (not inside a subdir).
# Add entries here for any file that must live at the project root in every install.
ROOT_FILES=(
  "AGENTS.md"
)

CONFIG_FILE=".shipwright-source"
IGNORE_FILE=".shipwright-ignore"
SELF_NAME="shipwright-sync.sh"

# ─── Helpers ──────────────────────────────────────────────────────────────────

die()  { echo -e "${RED}Error:${NC} $1" >&2; exit 1; }
info() { echo -e "${CYAN}$1${NC}"; }
ok()   { echo -e "  ${GREEN}OK${NC} $1"; }
stale(){ echo -e "  ${YELLOW}STALE${NC} $1"; }
new()  { echo -e "  ${RED}NEW${NC} $1"; }
gone() { echo -e "  ${YELLOW}REMOVED${NC} $1"; }
custom() { echo -e "  ${CYAN}CUSTOM${NC} $1"; }

all_mappings() {
  printf '%s\n' "${MAPPINGS[@]}" "${OVERLAY_MAPPINGS[@]}"
}

is_ignored() {
  local file="$1" dest="$2"
  [ -f "$dest/$IGNORE_FILE" ] || return 1
  while IFS= read -r pattern; do
    pattern="$(echo "$pattern" | sed 's/#.*//' | xargs)"
    [ -z "$pattern" ] && continue
    if [[ "$file" == $pattern ]]; then
      return 0
    fi
  done < "$dest/$IGNORE_FILE"
  return 1
}

prompt_yn() {
  local msg="$1" default="${2:-n}"
  if [ "$AUTO_YES" = "1" ]; then return 0; fi
  while true; do
    echo -en "$msg [y/n] "
    read -r ans
    case "$(echo "$ans" | tr '[:upper:]' '[:lower:]')" in
      y|yes) return 0 ;;
      n|no)  return 1 ;;
      "")    [ "$default" = "y" ] && return 0 || return 1 ;;
    esac
  done
}

source_exists_for_dest_rel() {
  local src="$1" dest_dir="$2" rel="$3"
  local mapping src_dir mapped_dest

  while IFS= read -r mapping; do
    src_dir="${mapping%%:*}"
    mapped_dest="${mapping##*:}"

    if [ "$mapped_dest" = "$dest_dir" ] && [ -f "$src/$src_dir/$rel" ]; then
      return 0
    fi
  done < <(all_mappings)

  return 1
}

AUTO_YES=0

# ─── Install mode ─────────────────────────────────────────────────────────────

do_install() {
  local dest="$1"
  local src
  src="$(cd "$(dirname "$0")/.." && pwd)"

  [ -d "$src/skills" ] || die "Cannot find shipwright repo at $src"
  [ -d "$dest" ]       || die "Destination directory does not exist: $dest"

  info "Installing Shipwright into $dest"
  echo "  Source: $src"
  echo ""

  # Write source path config
  echo "$src" > "$dest/$CONFIG_FILE"
  ok "Wrote $CONFIG_FILE → $src"

  # Copy the sync script itself
  cp "$src/scripts/sync.sh" "$dest/$SELF_NAME"
  ok "Copied $SELF_NAME"

  # Copy root-level files
  for f in "${ROOT_FILES[@]}"; do
    if [ -f "$src/$f" ]; then
      cp "$src/$f" "$dest/$f"
      ok "Copied $f"
    fi
  done

  # Copy all mapped directories
  while IFS= read -r mapping; do
    local src_dir="${mapping%%:*}"
    local dest_dir="${mapping##*:}"

    if [ -d "$src/$src_dir" ]; then
      mkdir -p "$dest/$dest_dir"
      cp -r "$src/$src_dir/"* "$dest/$dest_dir/" 2>/dev/null || true
      local count
      count=$(find "$src/$src_dir" -type f | wc -l | tr -d ' ')
      ok "Copied $src_dir/ → $dest_dir/ ($count files)"
    fi
  done < <(all_mappings)

  echo ""
  echo -e "${GREEN}${BOLD}Install complete.${NC}"
  echo "  Run ${BOLD}bash $SELF_NAME${NC} from $dest to check for updates."
}

# ─── Sync/check mode ─────────────────────────────────────────────────────────

do_sync() {
  local dest
  dest="$(pwd)"

  [ -f "$dest/$CONFIG_FILE" ] || die "No $CONFIG_FILE found. Run install first:\n  bash /path/to/shipwright/scripts/sync.sh --install $(pwd)"

  local src
  src="$(cat "$dest/$CONFIG_FILE")"

  [ -d "$src/skills" ] || die "Shipwright source not found at: $src\n  Update $CONFIG_FILE if the repo moved."

  # Check shipwright version
  local src_version=""
  if [ -f "$src/manifest.json" ]; then
    src_version=$(grep -oE '"version":\s*"[^"]+"' "$src/manifest.json" | head -1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
  fi

  echo -e "${BOLD}=== Shipwright Sync ===${NC}"
  echo "  Source:  $src${src_version:+ (v$src_version)}"
  echo "  Target:  $dest"
  echo ""

  local stale_files=()
  local new_files=()
  local removed_files=()
  local ok_count=0
  local custom_count=0

  while IFS= read -r mapping; do
    local src_dir="${mapping%%:*}"
    local dest_dir="${mapping##*:}"

    info "Checking $src_dir/ ..."

    if [ ! -d "$src/$src_dir" ]; then
      echo "  (source dir missing, skipping)"
      continue
    fi

    # Find all source files
    while IFS= read -r src_file; do
      local rel="${src_file#$src/$src_dir/}"
      local dest_file="$dest/$dest_dir/$rel"

      if is_ignored "$dest_dir/$rel" "$dest"; then
        custom "$rel (locally customized, skipping)"
        custom_count=$((custom_count + 1))
      elif [ ! -f "$dest_file" ]; then
        new "$rel (exists in source, missing in target)"
        new_files+=("$src/$src_dir/$rel|$dest/$dest_dir/$rel")
      elif ! diff -q "$src_file" "$dest_file" > /dev/null 2>&1; then
        stale "$rel"
        stale_files+=("$src/$src_dir/$rel|$dest/$dest_dir/$rel")
      else
        ok_count=$((ok_count + 1))
      fi
    done < <(find "$src/$src_dir" -type f)

    # Find files in destination that no longer exist in source
    if [ -d "$dest/$dest_dir" ]; then
      while IFS= read -r dest_file; do
        local rel="${dest_file#$dest/$dest_dir/}"
        if ! source_exists_for_dest_rel "$src" "$dest_dir" "$rel"; then
          if is_ignored "$dest_dir/$rel" "$dest"; then
            custom "$rel (locally customized, keeping despite source removal)"
            custom_count=$((custom_count + 1))
          else
            gone "$rel (in target but removed from source)"
            removed_files+=("$dest_file")
          fi
        fi
      done < <(find "$dest/$dest_dir" -type f)
    fi

    echo ""
  done < <(all_mappings)

  # Check if the sync script itself is outdated
  if [ -f "$src/scripts/sync.sh" ] && [ -f "$dest/$SELF_NAME" ]; then
    if ! diff -q "$src/scripts/sync.sh" "$dest/$SELF_NAME" > /dev/null 2>&1; then
      stale "$SELF_NAME (the sync script itself)"
      stale_files+=("$src/scripts/sync.sh|$dest/$SELF_NAME")
    fi
  fi

  # Check root-level files
  for f in "${ROOT_FILES[@]}"; do
    if [ ! -f "$src/$f" ]; then
      continue
    fi
    if is_ignored "$f" "$dest"; then
      custom "$f (locally customized, skipping)"
      custom_count=$((custom_count + 1))
    elif [ ! -f "$dest/$f" ]; then
      new "$f (exists in source, missing in target)"
      new_files+=("$src/$f|$dest/$f")
    elif ! diff -q "$src/$f" "$dest/$f" > /dev/null 2>&1; then
      stale "$f"
      stale_files+=("$src/$f|$dest/$f")
    else
      ok_count=$((ok_count + 1))
    fi
  done

  # ─── Summary ──────────────────────────────────────────────────────────────

  echo -e "${BOLD}=== Summary ===${NC}"
  echo -e "  ${GREEN}Up to date:${NC} $ok_count files"
  echo -e "  ${YELLOW}Changed:${NC}    ${#stale_files[@]} files"
  echo -e "  ${RED}New:${NC}        ${#new_files[@]} files"
  echo -e "  ${YELLOW}Removed:${NC}   ${#removed_files[@]} files"
  echo -e "  ${CYAN}Custom:${NC}     $custom_count files"
  echo ""

  local total_actionable=$(( ${#stale_files[@]} + ${#new_files[@]} + ${#removed_files[@]} ))

  if [ "$total_actionable" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}Everything is up to date.${NC}"
    return 0
  fi

  # ─── Offer updates ────────────────────────────────────────────────────────

  if prompt_yn "Update all $total_actionable file(s)?"; then
    # Update changed files
    if [ "${#stale_files[@]}" -gt 0 ]; then
      for entry in "${stale_files[@]}"; do
        local from="${entry%%|*}"
        local to="${entry##*|}"
        mkdir -p "$(dirname "$to")"
        cp "$from" "$to"
        echo -e "  ${GREEN}Updated${NC} $to"
      done
    fi

    # Copy new files
    if [ "${#new_files[@]}" -gt 0 ]; then
      for entry in "${new_files[@]}"; do
        local from="${entry%%|*}"
        local to="${entry##*|}"
        mkdir -p "$(dirname "$to")"
        cp "$from" "$to"
        echo -e "  ${GREEN}Added${NC} $to"
      done
    fi

    # Remove deleted files
    if [ "${#removed_files[@]}" -gt 0 ]; then
      for file in "${removed_files[@]}"; do
        rm "$file"
        echo -e "  ${GREEN}Removed${NC} $file"
      done
    fi

    echo ""
    echo -e "${GREEN}${BOLD}Sync complete.${NC}"
  else
    # Offer one-by-one
    echo ""
    if prompt_yn "Update files individually instead?"; then
      if [ "${#stale_files[@]}" -gt 0 ]; then
        for entry in "${stale_files[@]}"; do
          local from="${entry%%|*}"
          local to="${entry##*|}"
          echo ""
          echo -e "${BOLD}Changed:${NC} ${to#$dest/}"
          diff --color=auto "$to" "$from" 2>/dev/null | head -30
          if prompt_yn "  Update this file?"; then
            cp "$from" "$to"
            echo -e "  ${GREEN}Updated${NC}"
          else
            echo "  Skipped"
          fi
        done
      fi

      if [ "${#new_files[@]}" -gt 0 ]; then
        for entry in "${new_files[@]}"; do
          local from="${entry%%|*}"
          local to="${entry##*|}"
          echo ""
          echo -e "${BOLD}New:${NC} ${to#$dest/}"
          if prompt_yn "  Add this file?"; then
            mkdir -p "$(dirname "$to")"
            cp "$from" "$to"
            echo -e "  ${GREEN}Added${NC}"
          else
            echo "  Skipped"
          fi
        done
      fi

      if [ "${#removed_files[@]}" -gt 0 ]; then
        for file in "${removed_files[@]}"; do
          echo ""
          echo -e "${BOLD}Removed from source:${NC} ${file#$dest/}"
          if prompt_yn "  Delete this file?"; then
            rm "$file"
            echo -e "  ${GREEN}Removed${NC}"
          else
            echo "  Skipped"
          fi
        done
      fi
    else
      echo "No changes made."
    fi
  fi
}

# ─── Main ─────────────────────────────────────────────────────────────────────

case "${1:-}" in
  --install)
    [ -n "${2:-}" ] || die "Usage: bash scripts/sync.sh --install /path/to/destination"
    do_install "$2"
    ;;
  --yes)
    AUTO_YES=1
    do_sync
    ;;
  --help|-h)
    echo "Shipwright Sync"
    echo ""
    echo "Install into a project:"
    echo "  bash scripts/sync.sh --install /path/to/destination"
    echo ""
    echo "Check for updates (run from destination):"
    echo "  bash shipwright-sync.sh"
    echo ""
    echo "Auto-update without prompting:"
    echo "  bash shipwright-sync.sh --yes"
    echo ""
    echo "Skip locally customized files:"
    echo "  Create .shipwright-ignore with one path per line (relative to project root)."
    echo "  Example: .claude/skills/strategy/pricing-strategy/SKILL.md"
    echo "  Ignored files show as CUSTOM in sync output and are never overwritten."
    ;;
  "")
    do_sync
    ;;
  *)
    die "Unknown option: $1\n  Run with --help for usage."
    ;;
esac

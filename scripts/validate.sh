#!/usr/bin/env bash
#
# validate.sh — Verify Shipwright repo consistency
#
# Checks manifest.json against the actual directory structure, documentation,
# and plugin manifests. Exits 0 if everything is consistent, 1 otherwise.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MANIFEST="$REPO_ROOT/manifest.json"
ERRORS=0

red()   { printf '\033[0;31m%s\033[0m\n' "$1"; }
green() { printf '\033[0;32m%s\033[0m\n' "$1"; }
warn()  { printf '\033[0;33m%s\033[0m\n' "$1"; }

error() {
  red "  FAIL: $1"
  ERRORS=$((ERRORS + 1))
}

pass() {
  green "  OK: $1"
}

section() {
  echo ""
  echo "=== $1 ==="
}

# ─── Prereqs ───────────────────────────────────────────────

if ! command -v jq &>/dev/null; then
  red "jq is required but not installed. Install it with: apt install jq"
  exit 1
fi

if [[ ! -f "$MANIFEST" ]]; then
  red "manifest.json not found at $MANIFEST"
  exit 1
fi

# ─── 1. Skill paths ───────────────────────────────────────

section "1. Skills — manifest vs. disk"

# Check every manifest skill exists on disk
for category in $(jq -r '.skills | keys[]' "$MANIFEST"); do
  for skill in $(jq -r ".skills[\"$category\"][]" "$MANIFEST"); do
    skill_dir="$REPO_ROOT/skills/$category/$skill"
    skill_file="$skill_dir/SKILL.md"
    if [[ -f "$skill_file" ]]; then
      pass "$category/$skill"
    else
      error "Manifest lists skill '$category/$skill' but $skill_file does not exist"
    fi
  done
done

# Check every disk skill is in the manifest
for category_dir in "$REPO_ROOT"/skills/*/; do
  category="$(basename "$category_dir")"
  for skill_dir in "$category_dir"*/; do
    [[ -d "$skill_dir" ]] || continue
    skill="$(basename "$skill_dir")"
    if jq -e ".skills[\"$category\"] | index(\"$skill\")" "$MANIFEST" &>/dev/null; then
      : # already checked above
    else
      error "Skill '$category/$skill' exists on disk but is not in manifest.json"
    fi
  done
done

# ─── 2. Agent paths ───────────────────────────────────────

section "2. Agents — manifest vs. disk"

for agent in $(jq -r '.agents[]' "$MANIFEST"); do
  agent_file="$REPO_ROOT/agents/$agent.md"
  if [[ -f "$agent_file" ]]; then
    pass "$agent"
  else
    error "Manifest lists agent '$agent' but $agent_file does not exist"
  fi
done

# Reverse check
for agent_file in "$REPO_ROOT"/agents/*.md; do
  agent="$(basename "$agent_file" .md)"
  if jq -e ".agents | index(\"$agent\")" "$MANIFEST" &>/dev/null; then
    :
  else
    error "Agent '$agent' exists on disk but is not in manifest.json"
  fi
done

# ─── 3. Command paths ─────────────────────────────────────

section "3. Commands — manifest vs. disk"

for cmd in $(jq -r '.commands[]' "$MANIFEST"); do
  cmd_file="$REPO_ROOT/commands/$cmd.md"
  if [[ -f "$cmd_file" ]]; then
    pass "$cmd"
  else
    error "Manifest lists command '$cmd' but $cmd_file does not exist"
  fi
done

# Reverse check
for cmd_file in "$REPO_ROOT"/commands/*.md; do
  cmd="$(basename "$cmd_file" .md)"
  if jq -e ".commands | index(\"$cmd\")" "$MANIFEST" &>/dev/null; then
    :
  else
    error "Command '$cmd' exists on disk but is not in manifest.json"
  fi
done

# ─── 4. Routing — skill references must exist ─────────────

section "4. Routing — skill references"

for route in $(jq -r '.routing | keys[]' "$MANIFEST"); do
  for skill in $(jq -r ".routing[\"$route\"].skills[]" "$MANIFEST"); do
    # Find the skill in any category
    found=false
    for category in $(jq -r '.skills | keys[]' "$MANIFEST"); do
      if jq -e ".skills[\"$category\"] | index(\"$skill\")" "$MANIFEST" &>/dev/null; then
        found=true
        break
      fi
    done
    if $found; then
      pass "Route '$route' → skill '$skill'"
    else
      error "Route '$route' references skill '$skill' which is not in the manifest"
    fi
  done
done

# ─── 5. Orchestrator routing table — skill names ──────────

section "5. Orchestrator — skill name validation"

ORCH_FILE="$REPO_ROOT/agents/orchestrator.md"
if [[ -f "$ORCH_FILE" ]]; then
  # Extract skill names from the "Key Skills" column of the routing table
  # Format: | ... | skill1, skill2, skill3 |
  grep -oP '(?<=\| )[a-z][a-z0-9-]+(?:, [a-z][a-z0-9-]+)*(?= \|$)' "$ORCH_FILE" 2>/dev/null | \
    tr ',' '\n' | sed 's/^ *//;s/ *$//' | sort -u | while read -r skill; do
      [[ -z "$skill" ]] && continue
      # Check if this skill exists in any category on disk
      found=false
      for category_dir in "$REPO_ROOT"/skills/*/; do
        if [[ -d "$category_dir$skill" ]]; then
          found=true
          break
        fi
      done
      if $found; then
        pass "Orchestrator skill ref: $skill"
      else
        error "Orchestrator references skill '$skill' but no matching directory exists"
      fi
    done
fi

# ─── 6. Version sync ──────────────────────────────────────

section "6. Version sync"

MANIFEST_VER=$(jq -r '.version' "$MANIFEST")
PLUGIN_VER=$(jq -r '.version' "$REPO_ROOT/.claude-plugin/plugin.json" 2>/dev/null || echo "MISSING")
MARKETPLACE_VER=$(jq -r '.plugins[0].version' "$REPO_ROOT/.claude-plugin/marketplace.json" 2>/dev/null || echo "MISSING")

if [[ "$MANIFEST_VER" == "$PLUGIN_VER" ]]; then
  pass "manifest.json ($MANIFEST_VER) == plugin.json ($PLUGIN_VER)"
else
  error "Version mismatch: manifest.json=$MANIFEST_VER, plugin.json=$PLUGIN_VER"
fi

if [[ "$MANIFEST_VER" == "$MARKETPLACE_VER" ]]; then
  pass "manifest.json ($MANIFEST_VER) == marketplace.json ($MARKETPLACE_VER)"
else
  error "Version mismatch: manifest.json=$MANIFEST_VER, marketplace.json=$MARKETPLACE_VER"
fi

# ─── 7. Count consistency ─────────────────────────────────

section "7. Count consistency"

# Count skills from manifest
MANIFEST_SKILL_COUNT=$(jq '[.skills[] | length] | add' "$MANIFEST")

# Count skills on disk
DISK_SKILL_COUNT=0
for category_dir in "$REPO_ROOT"/skills/*/; do
  for skill_dir in "$category_dir"*/; do
    [[ -d "$skill_dir" ]] && DISK_SKILL_COUNT=$((DISK_SKILL_COUNT + 1))
  done
done

MANIFEST_AGENT_COUNT=$(jq '.agents | length' "$MANIFEST")
DISK_AGENT_COUNT=$(ls -1 "$REPO_ROOT"/agents/*.md 2>/dev/null | wc -l)

MANIFEST_CMD_COUNT=$(jq '.commands | length' "$MANIFEST")
DISK_CMD_COUNT=$(ls -1 "$REPO_ROOT"/commands/*.md 2>/dev/null | wc -l)

if [[ "$MANIFEST_SKILL_COUNT" == "$DISK_SKILL_COUNT" ]]; then
  pass "Skill count: manifest=$MANIFEST_SKILL_COUNT, disk=$DISK_SKILL_COUNT"
else
  error "Skill count mismatch: manifest=$MANIFEST_SKILL_COUNT, disk=$DISK_SKILL_COUNT"
fi

if [[ "$MANIFEST_AGENT_COUNT" == "$DISK_AGENT_COUNT" ]]; then
  pass "Agent count: manifest=$MANIFEST_AGENT_COUNT, disk=$DISK_AGENT_COUNT"
else
  error "Agent count mismatch: manifest=$MANIFEST_AGENT_COUNT, disk=$DISK_AGENT_COUNT"
fi

if [[ "$MANIFEST_CMD_COUNT" == "$DISK_CMD_COUNT" ]]; then
  pass "Command count: manifest=$MANIFEST_CMD_COUNT, disk=$DISK_CMD_COUNT"
else
  error "Command count mismatch: manifest=$MANIFEST_CMD_COUNT, disk=$DISK_CMD_COUNT"
fi

# ─── 8. Internal markdown links ───────────────────────────

section "8. Internal markdown links"

# Check links in key documentation files
for doc in README.md skills-map.md docs/using-workflows.md docs/installing-in-other-tools.md docs/connecting-your-tools.md; do
  doc_path="$REPO_ROOT/$doc"
  [[ -f "$doc_path" ]] || continue

  # Extract markdown links that reference local paths (not http/mailto/anchor)
  grep -oP '\[.*?\]\((?!https?://|mailto:|#)([^)]+)\)' "$doc_path" 2>/dev/null | \
    grep -oP '\(([^)]+)\)' | tr -d '()' | while read -r link; do
      # Strip anchor fragments
      link_path="${link%%#*}"
      [[ -z "$link_path" ]] && continue

      # Resolve relative to repo root (docs are referenced from root)
      if [[ -e "$REPO_ROOT/$link_path" ]]; then
        pass "$doc → $link_path"
      else
        # Try relative to the doc's directory
        doc_dir="$(dirname "$doc_path")"
        if [[ -e "$doc_dir/$link_path" ]]; then
          pass "$doc → $link_path (relative)"
        else
          error "Broken link in $doc: '$link_path' does not exist"
        fi
      fi
    done
done

# ─── Summary ──────────────────────────────────────────────

echo ""
echo "==============================="
if [[ $ERRORS -eq 0 ]]; then
  green "All checks passed!"
  exit 0
else
  red "$ERRORS error(s) found."
  exit 1
fi

#!/bin/bash
# Shipwright validation script
# Checks for drift between README, skills-map, orchestrator, and actual files.
# Run from the repo root: bash scripts/validate.sh

set -uo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

errors=0
warnings=0

pass() { echo -e "  ${GREEN}PASS${NC} $1"; }
fail() { echo -e "  ${RED}FAIL${NC} $1"; errors=$((errors + 1)); }
warn() { echo -e "  ${YELLOW}WARN${NC} $1"; warnings=$((warnings + 1)); }

echo "=== Shipwright Validation ==="
echo ""

# ─── 1. Count checks ───────────────────────────────────────────────────────────

echo "Checking counts..."

skill_count=$(find skills -name "SKILL.md" | wc -l | tr -d ' ')
agent_count=$(find agents -name "*.md" | wc -l | tr -d ' ')
command_count=$(find commands -name "*.md" | wc -l | tr -d ' ')

# Extract counts from tagline (e.g. "42 skills, 6 specialist agents, 15 chained workflows...")
tagline=$(grep -E '[0-9]+ skills,' README.md | head -1 || echo "")
readme_skills=$(echo "$tagline" | grep -oE '[0-9]+ skills' | grep -oE '[0-9]+' || echo "")
readme_agents=$(echo "$tagline" | grep -oE '[0-9]+ [a-z]* ?agents' | grep -oE '[0-9]+' || echo "")
readme_workflows=$(echo "$tagline" | grep -oE '[0-9]+ [a-z]* ?workflows' | grep -oE '[0-9]+' || echo "")

if [ "$skill_count" = "$readme_skills" ]; then
  pass "Skill count: $skill_count matches README ($readme_skills)"
else
  fail "Skill count: found $skill_count SKILL.md files, README claims $readme_skills"
fi

if [ "$agent_count" = "$readme_agents" ]; then
  pass "Agent count: $agent_count matches README ($readme_agents)"
else
  fail "Agent count: found $agent_count agent files, README claims $readme_agents"
fi

if [ "$command_count" = "$readme_workflows" ]; then
  pass "Workflow count: $command_count matches README ($readme_workflows)"
else
  fail "Workflow count: found $command_count command files, README claims $readme_workflows"
fi

# Check plugin.json counts
if [ -f ".claude-plugin/plugin.json" ]; then
  plugin_skills=$(grep -oE '[0-9]+ skills' .claude-plugin/plugin.json | head -1 | grep -oE '[0-9]+' || echo "")
  if [ -n "$plugin_skills" ] && [ "$skill_count" != "$plugin_skills" ]; then
    fail "plugin.json claims $plugin_skills skills, found $skill_count"
  else
    pass "plugin.json skill count matches"
  fi
fi

# Check marketplace.json counts
if [ -f ".claude-plugin/marketplace.json" ]; then
  mkt_skills=$(grep -oE '[0-9]+ skills' .claude-plugin/marketplace.json | head -1 | grep -oE '[0-9]+' || echo "")
  if [ -n "$mkt_skills" ] && [ "$skill_count" != "$mkt_skills" ]; then
    fail "marketplace.json claims $mkt_skills skills, found $skill_count"
  else
    pass "marketplace.json skill count matches"
  fi
fi

echo ""

# ─── 2. Skills-map directory references ─────────────────────────────────────────

echo "Checking skills-map.md directory references..."

grep -o 'skills/[a-z_-]*/[a-z_-]*/' skills-map.md | sort -u | while read -r dir; do
  if [ -d "$dir" ]; then
    pass "Directory exists: $dir"
  else
    fail "Referenced in skills-map.md but missing: $dir"
  fi
done

echo ""

# ─── 3. Orchestrator skill name checks ──────────────────────────────────────────

echo "Checking orchestrator.md for known naming issues..."

# Specific check: journey-mapping vs customer-journey-mapping
if grep -q 'journey-mapping' agents/orchestrator.md; then
  # Check if it's the correct full name or the shortened mismatch
  if grep -q '[^-]journey-mapping' agents/orchestrator.md && ! grep -q 'customer-journey-mapping' agents/orchestrator.md; then
    fail "Orchestrator uses 'journey-mapping' instead of 'customer-journey-mapping'"
  else
    pass "Journey mapping reference uses correct name"
  fi
else
  pass "No journey-mapping reference issues"
fi

echo ""

# ─── 4. Command file consistency ────────────────────────────────────────────────

echo "Checking command files match README..."

# Extract /command references from README workflow table
grep -o '/[a-z-]*' README.md | sed 's/^\///' | sort -u | while read -r cmd; do
  # Skip non-command references
  case "$cmd" in
    start|discover|write-prd|plan-launch|sprint|strategy|pricing|customer-review|tech-handoff|personas|competitive|metrics|okrs|retro|narrative)
      if [ -f "commands/${cmd}.md" ]; then
        pass "Command file exists: commands/${cmd}.md"
      else
        fail "README references /$cmd but commands/${cmd}.md not found"
      fi
      ;;
  esac
done

echo ""

# ─── 5. Skill frontmatter checks ────────────────────────────────────────────────

echo "Checking skill frontmatter..."

missing_fm=0
find skills -name "SKILL.md" | sort | while read -r file; do
  first_line=$(head -1 "$file")
  if [ "$first_line" != "---" ]; then
    fail "Missing frontmatter: $file"
  fi
done

total_with_fm=$(find skills -name "SKILL.md" -exec head -1 {} \; | grep -c '^---' || true)
if [ "$total_with_fm" = "$skill_count" ]; then
  pass "All $skill_count skills have YAML frontmatter"
fi

echo ""

# ─── 6. Agent frontmatter checks ────────────────────────────────────────────────

echo "Checking agent frontmatter..."

find agents -name "*.md" | sort | while read -r file; do
  first_line=$(head -1 "$file")
  if [ "$first_line" != "---" ]; then
    fail "Missing frontmatter: $(basename "$file")"
  else
    pass "Frontmatter present: $(basename "$file")"
  fi
done

echo ""

# ─── 7. Command frontmatter checks ──────────────────────────────────────────────

echo "Checking command frontmatter..."

find commands -name "*.md" | sort | while read -r file; do
  first_line=$(head -1 "$file")
  if [ "$first_line" != "---" ]; then
    warn "Missing frontmatter: $(basename "$file")"
  else
    pass "Frontmatter present: $(basename "$file")"
  fi
done

echo ""

# ─── 8. Cross-reference: every skill dir appears in skills-map ───────────────────

echo "Checking all skills appear in skills-map.md..."

find skills -name "SKILL.md" | while read -r file; do
  skill_dir=$(dirname "$file")
  skill_name=$(basename "$skill_dir")
  if grep -q "$skill_name" skills-map.md; then
    pass "In skills-map: $skill_name"
  else
    fail "Skill exists but not in skills-map.md: $skill_name"
  fi
done

echo ""

# ─── 9. Skills-map workflow count vs command files ────────────────────────────────

echo "Checking skills-map workflow count..."

sm_workflow_count=$(grep -c '^| `/[a-z]' skills-map.md || true)
if [ "$sm_workflow_count" = "$command_count" ] || [ "$sm_workflow_count" = "$((command_count - 1))" ]; then
  pass "Skills-map workflow entries ($sm_workflow_count) align with command files ($command_count)"
else
  warn "Skills-map has $sm_workflow_count workflow entries but there are $command_count command files"
fi

echo ""

# ─── 10. Evals directory checks ──────────────────────────────────────────────────

echo "Checking evals directory..."

if [ -d "evals" ]; then
  pass "evals/ directory exists"
  
  for eval_file in pass-fail rubric prd strategy design-review; do
    if [ -f "evals/${eval_file}.md" ]; then
      pass "Eval rubric exists: evals/${eval_file}.md"
    else
      fail "Missing eval rubric: evals/${eval_file}.md"
    fi
  done
  
  if [ -f "evals/README.md" ]; then
    pass "Eval README exists"
  else
    warn "Missing evals/README.md"
  fi
else
  fail "evals/ directory not found"
fi

echo ""

# ─── 11. Golden outputs checks ──────────────────────────────────────────────────

echo "Checking golden outputs..."

if [ -d "examples/golden-outputs" ]; then
  pass "examples/golden-outputs/ directory exists"
  
  for output_file in prd strategy design-review ab-analysis; do
    if [ -f "examples/golden-outputs/${output_file}.md" ]; then
      pass "Golden output exists: examples/golden-outputs/${output_file}.md"
    else
      fail "Missing golden output: examples/golden-outputs/${output_file}.md"
    fi
  done
  
  if [ -f "examples/golden-outputs/README.md" ]; then
    pass "Golden outputs README exists"
  else
    warn "Missing examples/golden-outputs/README.md"
  fi
else
  fail "examples/golden-outputs/ directory not found"
fi

echo ""

# ─── 12. Docs directory checks ──────────────────────────────────────────────────

echo "Checking docs..."

for doc_file in connecting-your-tools installing-in-other-tools using-workflows failure-modes recovery-playbooks output-standard composition-model; do
  if [ -f "docs/${doc_file}.md" ]; then
    pass "Doc exists: docs/${doc_file}.md"
  else
    fail "Missing doc: docs/${doc_file}.md"
  fi
done

echo ""

# ─── 13. Output signature checks on core skills ─────────────────────────────────

echo "Checking Shipwright signature sections in core skills..."

for core_skill in \
  "skills/execution/prd-development/SKILL.md" \
  "skills/strategy/product-strategy-session/SKILL.md" \
  "skills/technical/design-review/SKILL.md" \
  "skills/measurement/ab-test-analysis/SKILL.md"; do
  if grep -q 'Shipwright Signature' "$core_skill"; then
    pass "Signature section present: $core_skill"
  else
    fail "Missing signature section in core skill: $core_skill"
  fi
done

echo ""

# ─── Summary ────────────────────────────────────────────────────────────────────

echo "=== Summary ==="
if [ "$errors" -gt 0 ]; then
  echo -e "${RED}$errors error(s)${NC}, $warnings warning(s)"
  exit 1
elif [ "$warnings" -gt 0 ]; then
  echo -e "${GREEN}0 errors${NC}, ${YELLOW}$warnings warning(s)${NC}"
  exit 0
else
  echo -e "${GREEN}All checks passed.${NC}"
  exit 0
fi

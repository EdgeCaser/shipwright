#!/usr/bin/env bash
# Rerun failed scenarios from overnight replication batches.
# Runs sequentially (original first, then swap) to avoid quota competition.

set -euo pipefail
cd "$(dirname "$0")/.."

RESULTS_DIR="benchmarks/results/conflict-harness"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "=== Phase 1: Original orientation failures (7 scenarios) ==="
echo "Started at $(date)"

node scripts/run-conflict-batch.mjs \
  --scenario event-automation-boundary \
  --scenario netflix-qwikster \
  --scenario prd-hidden-scope-creep \
  --scenario pricing-partial-data \
  --scenario supermicro-export-controls \
  --scenario yahoo-microsoft \
  --scenario zillow-offers \
  --out "${RESULTS_DIR}/rerun-original-${TIMESTAMP}.md"

echo ""
echo "Phase 1 complete at $(date). Pausing 30s before swap batch..."
sleep 30

echo "=== Phase 2: Swap orientation failures (8 scenarios) ==="
echo "Started at $(date)"

node scripts/run-conflict-batch.mjs \
  --swap-sides \
  --scenario blockbuster-total-access \
  --scenario board-update-ambiguity \
  --scenario netflix-qwikster \
  --scenario prd-hidden-scope-creep \
  --scenario pricing-partial-data \
  --scenario supermicro-export-controls \
  --scenario yahoo-microsoft \
  --scenario zillow-offers \
  --out "${RESULTS_DIR}/rerun-swap-${TIMESTAMP}.md"

echo ""
echo "=== Both phases complete at $(date) ==="
echo "Results:"
echo "  Original: ${RESULTS_DIR}/rerun-original-${TIMESTAMP}.md"
echo "  Swap:     ${RESULTS_DIR}/rerun-swap-${TIMESTAMP}.md"

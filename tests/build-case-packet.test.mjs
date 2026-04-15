import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import {
  buildCasePacket,
  buildCasePacketFromScenario,
  parseCliArgs,
  validateConflictDocument,
} from '../scripts/build-case-packet.mjs';
import { loadBenchmarkScenario } from '../scripts/run-benchmarks.mjs';

test('buildCasePacketFromScenario creates a valid case packet from a benchmark scenario', async () => {
  const scenario = await loadBenchmarkScenario('benchmarks/scenarios/prd-hidden-scope-creep.json');
  const packet = buildCasePacketFromScenario(scenario);
  const validation = validateConflictDocument(packet, 'case');

  assert.equal(packet.scenario_id, 'prd-hidden-scope-creep');
  assert.equal(packet.artifact_type, 'prd');
  assert.equal(packet.tool_policy, 'none');
  assert.deepEqual(packet.rubric.dimensions, [
    'claim quality',
    'evidence discipline',
    'responsiveness to critique',
    'internal consistency',
    'decision usefulness',
  ]);
  assert.equal(validation.errors.length, 0);
});

test('buildCasePacket loads a scenario by id', async () => {
  const packet = await buildCasePacket({
    scenario: 'event-automation-boundary',
  });

  assert.equal(packet.scenario_id, 'event-automation-boundary');
  assert.match(packet.prompt, /Phase 1 PRD/);
});

test('validateConflictDocument reports missing required fields', () => {
  const validation = validateConflictDocument(
    {
      scenario_id: 'missing-fields',
      prompt: 'Hello',
    },
    'case',
  );

  assert.ok(validation.errors.some((error) => error.path === '$.artifact_type'));
  assert.ok(validation.errors.some((error) => error.path === '$.rubric'));
});

test('parseCliArgs validates supported flags', () => {
  assert.deepEqual(
    parseCliArgs([
      '--scenario',
      'prd-hidden-scope-creep',
      '--out',
      '/tmp/case.json',
      '--max-rounds',
      '4',
      '--tool-policy',
      'none',
    ]),
    {
      scenario: 'prd-hidden-scope-creep',
      scenarioDir: path.resolve('benchmarks', 'scenarios'),
      outPath: '/tmp/case.json',
      maxRounds: 4,
      toolPolicy: 'none',
      format: 'json',
    },
  );
});

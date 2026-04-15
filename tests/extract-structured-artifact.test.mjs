import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import {
  extractStructuredArtifact,
  getStructuredArtifactOutputPath,
  validateStructuredArtifact,
} from '../scripts/extract-structured-artifact.mjs';

function buildMarkdownWithArtifact(artifact) {
  return `
# Artifact

Body copy here.

<!-- shipwright:artifact
${JSON.stringify(artifact, null, 2)}
-->
  `.trim();
}

function createValidPrdArtifact() {
  return {
    schema_version: '2.0.0',
    artifact_type: 'prd',
    mode: 'fast',
    depth: 'standard',
    metadata: {
      title: 'Self-serve SSO PRD',
      status: 'draft',
      authors: ['PM'],
      updated_at: '2026-04-02',
    },
    decision_frame: {
      recommendation: 'Ship SSO first',
      tradeoff: 'Narrower scope vs broader coverage',
      confidence: 'medium',
      owner: 'PM',
      decision_date: '2026-04-02',
    },
    unknowns: ['Unknown admin demand'],
    pass_fail_readiness: {
      status: 'PASS',
      reason: 'Core sections are present.',
    },
    evidence: [
      {
        evidence_id: 'ev-1',
        kind: 'research',
        source_ref: 'customer-interviews',
        confidence: 'high',
        supports: ['decision_frame.recommendation', 'problem-1', 'metric-activation'],
      },
    ],
    payload: {
      problem_statement: {
        problem_id: 'problem-1',
        text: 'Admins churn when SSO is missing.',
      },
      customer_evidence_ids: ['ev-1'],
      success_metrics: [
        {
          metric_id: 'metric-activation',
          name: 'Activation Rate',
          segment: 'mid-market',
          unit: '%',
          timeframe: 'quarterly',
          baseline: 12,
          target: 20,
          evidence_ids: ['ev-1'],
        },
      ],
      scope: {
        in: ['SAML login'],
        out: ['SCIM provisioning'],
      },
      open_questions: ['Which IdPs matter most?'],
      target_segment: 'mid-market',
    },
  };
}

test('extractStructuredArtifact returns parsed artifact and line number', { concurrency: false }, () => {
  const artifact = createValidPrdArtifact();
  const result = extractStructuredArtifact(buildMarkdownWithArtifact(artifact));

  assert.deepEqual(result.artifact, artifact);
  assert.equal(result.error, null);
  assert.ok(result.startLine >= 1);
});

test('extractStructuredArtifact reports JSON parse errors cleanly', { concurrency: false }, () => {
  const result = extractStructuredArtifact(`
# Artifact

<!-- shipwright:artifact
{ "artifact_type": "prd", }
-->
  `.trim());

  assert.equal(result.artifact, null);
  assert.ok(result.error);
});

test('validateStructuredArtifact accepts a valid PRD envelope', { concurrency: false }, () => {
  const result = validateStructuredArtifact(createValidPrdArtifact());
  assert.equal(result.artifactType, 'prd');
  assert.equal(result.errors.length, 0);
});

test('validateStructuredArtifact rejects missing required fields', { concurrency: false }, () => {
  const artifact = createValidPrdArtifact();
  delete artifact.decision_frame.owner;

  const result = validateStructuredArtifact(artifact);
  assert.ok(result.errors.some((error) => error.path === '$.decision_frame.owner'));
});

test('getStructuredArtifactOutputPath swaps markdown extension for json', { concurrency: false }, () => {
  const output = getStructuredArtifactOutputPath('/tmp/example/prd.md');
  assert.equal(output, path.resolve('/tmp/example/prd.json'));
});

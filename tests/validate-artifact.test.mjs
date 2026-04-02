import assert from 'node:assert/strict';
import test from 'node:test';

import {
  IssueType,
  Severity,
  validateArtifact,
} from '../scripts/validate-artifact.mjs';

// ---------------------------------------------------------------------------
// Citation anchor section
// ---------------------------------------------------------------------------

test('validateArtifact returns no issues when document has a Sources section', { concurrency: false }, () => {
  const text = `
# Market Analysis

The market is worth $4.5B and grew by 37% last year.

## Sources

- https://example.com/market-report-2026
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.length, 0, 'Sources section should suppress citation checks');
});

test('validateArtifact returns no issues when document has a References section', { concurrency: false }, () => {
  const text = `
# Analysis

Revenue reached $2.1B in FY25.

## References

[1] Annual Report 2025
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.length, 0);
});

test('validateArtifact returns no issues when document has an Evidence section', { concurrency: false }, () => {
  const text = `
# Competitive Brief

Competitor grew 200% year-over-year.

## Evidence

- Source: industry report
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.length, 0);
});

// ---------------------------------------------------------------------------
// Dollar figure checks
// ---------------------------------------------------------------------------

test('validateArtifact flags dollar figure in prose without citation', { concurrency: false }, () => {
  const text = `
# Market Analysis

The market is worth $4.5 billion and has been growing rapidly.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.ok(
    issues.some((i) => i.type === IssueType.UNSUPPORTED_DOLLAR),
    'should flag unsupported dollar figure',
  );
  const issue = issues.find((i) => i.type === IssueType.UNSUPPORTED_DOLLAR);
  assert.equal(issue.severity, Severity.WARNING);
  assert.ok(issue.lineNumber >= 1);
});

test('validateArtifact does not flag dollar figure when URL is in the paragraph', { concurrency: false }, () => {
  const text = `
# Analysis

The market is worth $4.5 billion according to https://example.com/report.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(
    issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length,
    0,
    'URL citation should suppress the flag',
  );
});

test('validateArtifact does not flag dollar figure when "According to" is present', { concurrency: false }, () => {
  const text = `
# Analysis

According to Gartner, the market reached $6.7B in 2025.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length, 0);
});

test('validateArtifact does not flag dollar figures in table rows', { concurrency: false }, () => {
  const text = `
# Pricing Comparison

| Plan | Price |
|------|-------|
| Starter | $29/month |
| Pro | $99/month |
| Enterprise | $499/month |
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(
    issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length,
    0,
    'table rows are exempt from citation checks',
  );
});

test('validateArtifact does not flag dollar figures in headings', { concurrency: false }, () => {
  const text = `
## Revenue Target: $50M ARR
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length, 0);
});

test('validateArtifact does not flag dollar figures in list items without claim context', { concurrency: false }, () => {
  const text = `
# Pricing

- Starter: $29/month
- Pro: $99/month
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length, 0);
});

test('validateArtifact does not flag dollar figures with footnote reference', { concurrency: false }, () => {
  const text = `
# Analysis

The market grew to $3.2B in FY25 [1].
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_DOLLAR).length, 0);
});

// ---------------------------------------------------------------------------
// Numeric claim checks
// ---------------------------------------------------------------------------

test('validateArtifact flags percentage claim in prose without citation', { concurrency: false }, () => {
  const text = `
# Market Dynamics

The segment accounts for 37% of total revenue and has grown substantially.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.ok(
    issues.some((i) => i.type === IssueType.UNSUPPORTED_NUMERIC),
    'percentage claim should be flagged',
  );
});

test('validateArtifact flags large-number claim without citation', { concurrency: false }, () => {
  const text = `
# TAM Analysis

The total addressable market is estimated at 2.5 billion users globally.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.ok(
    issues.some((i) => i.type === IssueType.UNSUPPORTED_NUMERIC),
    'large number claim should be flagged',
  );
});

test('validateArtifact does not flag numeric claims in code blocks', { concurrency: false }, () => {
  const text = `
# Example

\`\`\`
growth_rate = 0.37  # 37%
\`\`\`
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_NUMERIC).length, 0);
});

test('validateArtifact does not flag numeric claim with URL citation', { concurrency: false }, () => {
  const text = `
# Analysis

The growth rate was 43% in Q3 per https://example.com/quarterly-results.
  `.trim();

  const { issues } = validateArtifact(text);
  assert.equal(issues.filter((i) => i.type === IssueType.UNSUPPORTED_NUMERIC).length, 0);
});

// ---------------------------------------------------------------------------
// Missing section checks
// ---------------------------------------------------------------------------

test('validateArtifact flags missing explicit section', { concurrency: false }, () => {
  const text = `
# Analysis

Some content here.
  `.trim();

  const { issues } = validateArtifact(text, { expectSections: ['Sources'] });
  assert.ok(
    issues.some((i) => i.type === IssueType.MISSING_SECTION && i.message.includes('Sources')),
  );
  const issue = issues.find((i) => i.type === IssueType.MISSING_SECTION);
  assert.equal(issue.severity, Severity.WARNING);
});

test('validateArtifact does not flag when expected section is present', { concurrency: false }, () => {
  const text = `
# Analysis

## Sources

- Evidence 1
  `.trim();

  const { issues } = validateArtifact(text, { expectSections: ['Sources'] });
  assert.equal(issues.filter((i) => i.type === IssueType.MISSING_SECTION).length, 0);
});

test('validateArtifact checks multiple expected sections independently', { concurrency: false }, () => {
  const text = `
# PRD

## Background

Some background.

## Goals

Some goals.
  `.trim();

  const { issues } = validateArtifact(text, {
    expectSections: ['Background', 'Goals', 'Success Metrics'],
  });

  const missingSections = issues.filter((i) => i.type === IssueType.MISSING_SECTION);
  assert.equal(missingSections.length, 1);
  assert.ok(missingSections[0].message.includes('Success Metrics'));
});

test('validateArtifact section check is case-insensitive', { concurrency: false }, () => {
  const text = `
# Doc

## sources

- link here
  `.trim();

  const { issues } = validateArtifact(text, { expectSections: ['Sources'] });
  assert.equal(issues.filter((i) => i.type === IssueType.MISSING_SECTION).length, 0);
});

// ---------------------------------------------------------------------------
// checkCitations: false
// ---------------------------------------------------------------------------

test('validateArtifact skips citation checks when checkCitations is false', { concurrency: false }, () => {
  const text = `
# Analysis

Revenue was $5.2B and growth was 42%.
  `.trim();

  const { issues } = validateArtifact(text, { checkCitations: false });
  assert.equal(
    issues.filter(
      (i) => i.type === IssueType.UNSUPPORTED_DOLLAR || i.type === IssueType.UNSUPPORTED_NUMERIC,
    ).length,
    0,
  );
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

test('validateArtifact handles empty input gracefully', { concurrency: false }, () => {
  const { issues, summary } = validateArtifact('');
  assert.equal(issues.length, 0);
  assert.ok(summary.length > 0);
});

test('validateArtifact handles null input gracefully', { concurrency: false }, () => {
  const { issues } = validateArtifact(null);
  assert.equal(issues.length, 0);
});

test('validateArtifact summary reflects issue count', { concurrency: false }, () => {
  const text = `
# Report

Revenue grew to $4.5B over the period, representing 38% market share.
  `.trim();

  const { issues, summary } = validateArtifact(text);
  assert.ok(issues.length > 0);
  assert.match(summary, /\d+\s+issue/);
});

test('validateArtifact returns "No issues found." summary for clean document with Sources', { concurrency: false }, () => {
  const text = `
# Report

Revenue grew to $4.5B.

## Sources

- https://example.com/annual-report
  `.trim();

  const { summary } = validateArtifact(text);
  assert.equal(summary, 'No issues found.');
});

test('validateArtifact issue includes line number and excerpt', { concurrency: false }, () => {
  const text = `
# Report

The market is worth $12 billion and continues to grow.
  `.trim();

  const { issues } = validateArtifact(text);
  const issue = issues.find((i) => i.type === IssueType.UNSUPPORTED_DOLLAR || i.type === IssueType.UNSUPPORTED_NUMERIC);
  if (issue) {
    assert.ok(Number.isFinite(issue.lineNumber) && issue.lineNumber >= 1);
    assert.ok(typeof issue.excerpt === 'string');
  }
});

function buildStructuredMarkdown(artifact) {
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

function createRelatedStrategyArtifact(overrides = {}) {
  return {
    schema_version: '2.0.0',
    artifact_type: 'strategy',
    mode: 'rigorous',
    depth: 'standard',
    metadata: {
      title: 'Mid-market strategy',
      status: 'approved',
      authors: ['PM'],
      updated_at: '2026-04-02',
    },
    decision_frame: {
      recommendation: 'Focus on mid-market',
      tradeoff: 'Focus vs optionality',
      confidence: 'high',
      owner: 'PM',
      decision_date: '2026-04-02',
    },
    unknowns: [],
    pass_fail_readiness: {
      status: 'PASS',
      reason: 'Strategy approved.',
    },
    evidence: [
      {
        evidence_id: 'ev-strategy-1',
        kind: 'research',
        source_ref: 'market-review',
        confidence: 'high',
        supports: ['decision_frame.recommendation', 'bet-1'],
      },
    ],
    payload: {
      vision: 'Win mid-market IT teams.',
      context: {
        current_state: {
          product_stage: 'growth',
        },
      },
      primary_segment: 'mid-market',
      bets: [
        {
          bet_id: 'bet-1',
          name: 'SSO wedge',
          thesis: 'SSO will unlock expansion.',
          assumptions: ['Admins care about SSO'],
          investment_level: 'major',
          success_metric: {
            metric_id: 'metric-activation',
            name: 'Activation Rate',
            segment: 'mid-market',
            unit: '%',
            timeframe: 'quarterly',
            baseline: 18,
            target: 28,
          },
          kill_criteria: 'If activation stays flat after launch.',
          evidence_ids: ['ev-strategy-1'],
        },
      ],
      boundaries: {
        not_doing: ['Enterprise services motion'],
      },
      review_cadence: {
        weekly: 'Check pipeline',
        monthly: 'Review progress',
        quarterly: 'Revisit bets',
      },
      ...overrides.payload,
    },
    ...overrides,
  };
}

function createChallengeReportArtifact() {
  return {
    schema_version: '2.0.0',
    artifact_type: 'challenge-report',
    mode: 'rigorous',
    depth: 'standard',
    metadata: {
      title: 'Challenge report',
      status: 'approved',
      authors: ['Red-team'],
      updated_at: '2026-04-02',
    },
    decision_frame: {
      recommendation: 'Defend before shipping',
      tradeoff: 'More revision time vs stronger handoff',
      confidence: 'high',
      owner: 'PM',
      decision_date: '2026-04-02',
    },
    unknowns: [],
    pass_fail_readiness: {
      status: 'PASS',
      reason: 'Review completed.',
    },
    evidence: [
      {
        evidence_id: 'ev-challenge-1',
        kind: 'document',
        source_ref: 'prd-review',
        confidence: 'high',
        supports: ['decision_frame.recommendation', 'finding-1'],
      },
    ],
    payload: {
      reviewed_artifact: {
        title: 'Self-serve SSO PRD',
        artifact_type: 'prd',
      },
      depth: 'standard',
      findings: [
        {
          finding_id: 'finding-1',
          claim: 'Enterprise growth is immediate.',
          vector: 'Evidence Integrity',
          severity: 'critical',
          rationale: 'The evidence only supports mid-market demand.',
          resolution_condition: 'Downgrade to hypothesis or add enterprise evidence.',
          evidence_ids: ['ev-challenge-1'],
        },
      ],
      verdict: 'DEFEND',
      action_plan: ['Revise evidence claims'],
    },
  };
}

test('validateArtifact warns when structured artifact is expected but absent', { concurrency: false }, () => {
  const text = `
# PRD

No structured payload here.
  `.trim();

  const { issues } = validateArtifact(text, { expectStructured: true });
  assert.ok(issues.some((issue) => issue.type === IssueType.MISSING_STRUCTURED_ARTIFACT));
});

test('validateArtifact errors on invalid structured schema', { concurrency: false }, () => {
  const artifact = createValidPrdArtifact();
  delete artifact.decision_frame.owner;

  const { issues } = validateArtifact(buildStructuredMarkdown(artifact), {
    expectStructured: true,
    artifactType: 'prd',
  });

  assert.ok(issues.some((issue) => issue.type === IssueType.INVALID_STRUCTURED_ARTIFACT));
  assert.ok(issues.some((issue) => issue.severity === Severity.ERROR));
});

test('validateArtifact errors when required evidence linkage is missing', { concurrency: false }, () => {
  const artifact = createValidPrdArtifact();
  artifact.evidence = [];
  artifact.payload.customer_evidence_ids = [];
  artifact.payload.success_metrics[0].evidence_ids = [];

  const { issues } = validateArtifact(buildStructuredMarkdown(artifact), {
    expectStructured: true,
    artifactType: 'prd',
  });

  assert.ok(issues.some((issue) => issue.type === IssueType.MISSING_EVIDENCE));
});

test('validateArtifact warns on metric contradiction against related artifact', { concurrency: false }, () => {
  const artifact = createValidPrdArtifact();
  const related = createRelatedStrategyArtifact();

  const { issues } = validateArtifact(buildStructuredMarkdown(artifact), {
    expectStructured: true,
    artifactType: 'prd',
    relatedArtifacts: [related],
  });

  assert.ok(issues.some((issue) => issue.type === IssueType.METRIC_CONTRADICTION));
});

test('validateArtifact warns on segment contradiction against related strategy', { concurrency: false }, () => {
  const artifact = createValidPrdArtifact();
  const related = createRelatedStrategyArtifact({
    payload: {
      primary_segment: 'enterprise',
    },
  });

  const { issues } = validateArtifact(buildStructuredMarkdown(artifact), {
    expectStructured: true,
    artifactType: 'prd',
    relatedArtifacts: [related],
  });

  assert.ok(issues.some((issue) => issue.type === IssueType.SEGMENT_CONTRADICTION));
});

test('validateArtifact errors when critical challenge finding has no resolution state', { concurrency: false }, () => {
  const artifact = createValidPrdArtifact();
  const challenge = createChallengeReportArtifact();

  const { issues } = validateArtifact(buildStructuredMarkdown(artifact), {
    expectStructured: true,
    artifactType: 'prd',
    relatedArtifacts: [challenge],
  });

  const issue = issues.find((entry) => entry.type === IssueType.CHALLENGE_FINDING_UNRESOLVED);
  assert.ok(issue);
  assert.equal(issue.severity, Severity.ERROR);
});

test('validateArtifact accepts resolved challenge finding state', { concurrency: false }, () => {
  const artifact = createValidPrdArtifact();
  artifact.challenge_resolution = [
    {
      finding_id: 'finding-1',
      state: 'resolved',
      note: 'Downgraded enterprise claim to hypothesis.',
    },
  ];

  const challenge = createChallengeReportArtifact();
  const { issues } = validateArtifact(buildStructuredMarkdown(artifact), {
    expectStructured: true,
    artifactType: 'prd',
    relatedArtifacts: [challenge],
  });

  assert.equal(
    issues.filter((entry) => entry.type === IssueType.CHALLENGE_FINDING_UNRESOLVED).length,
    0,
  );
});

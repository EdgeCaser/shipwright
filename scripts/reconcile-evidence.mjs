// A structural reconciliation aid. It cannot establish that a passage entails a
// claim, that a page is genuinely primary, or that every material claim was listed.

const INPUT_KINDS = new Set(['supplied', 'assumption', 'proposal', 'unknown']);
const SOURCE_KINDS = new Set(['primary-passage', 'generated-summary']);
const SUPPORT_STATES = new Set(['verified', 'unresolved']);
const TUPLE_FIELDS = ['provider', 'plan', 'feature', 'price', 'currency', 'unit', 'billingCadence'];

export const evidenceHelp = `Evidence reconciliation record (JSON):
{
  "inputs": [{"id":"case-size","kind":"unknown"}],
  "evidenceSources": [{"id":"rule","kind":"primary-passage","url":"https://example.org/rule",
    "retrievedAt":"2026-01-01T00:00:00Z","passage":"The rule depends on case size.",
    "context":"The rule depends on case size."}],
  "evidenceClaims": [{"id":"recommendation","artifactQuotes":["If the size is above the threshold, seek review."],
    "sourceIds":["rule"],"support":"verified",
    "applicability":{"requiredInputIds":["case-size"],"conditional":true}}]
}
Each input has an id and kind: supplied, assumption, proposal, or unknown. A
supplied input also needs a nonblank string, finite number, or boolean value.
Each source has an id and kind.
Primary passages need a URL, retrieval time, nonblank passage, and nonblank
context. Generated summaries may be retained as leads but cannot alone verify
a claim. Each claim has an id, exact excerpts from the final artifact in
artifactQuotes, sourceIds, and support: verified or unresolved.
When a source rule depends on case inputs or an incorporated definition, put
prerequisites:{requiredInputIds:[...],definitionSourceIds:[...]} on that source.
Verified claims must link those definitions and carry all required input IDs
through applicability. This checks declared dependencies, not whether an
author found every dependency in the original page.
Applicability claims list every known required input ID and say whether the
final conclusion is conditional. Unknown, assumed, or proposed inputs cannot
support an unconditional case-specific conclusion.
For competitor facts, a primary source may have competitorTuples with id,
provider, plan, feature, price, currency, unit, billingCadence, completeness
(complete or partial), and optional qualifier. The source supplies the URL and
retrievedAt for its tuples. A claim may carry competitorTuple with sourceTupleId
and the same factual fields and qualifier; each asserted field is compared with
the referenced source tuple. A source qualifier must appear in its retained
context and in an exact final-artifact excerpt.
Generic tuple example: source competitorTuples entry
{"id":"row","provider":"Provider","plan":"Plan","feature":"Feature",
 "price":10,"currency":"USD","unit":"seat/month",
 "billingCadence":"billed annually","completeness":"complete",
 "qualifier":"annual commitment"}.
A claim for that row uses competitorTuple with sourceTupleId "row", the same
factual fields and qualifier, and an artifactQuote containing "annual commitment".
Errors mean malformed records or explicit contradictions. Warnings mark
explicitly unresolved support; they do not by themselves fail artifact
readiness. Text inclusion and matching structured fields do not prove semantic
entailment, authentic primary authority, or complete claim/requirement coverage.
The primary-passage kind means fetched page text; it does not authenticate who
published that text. For multi-plan comparisons, use comparisonTuples with one
claim tuple per cited source row and comparison:{status:'established'|'unknown',
finalQuote:'exact final comparative excerpt',unknownFields:[...]}.
For each source row, renderedTuples has sourceTupleId and fieldQuotes: exact
excerpts from artifactQuotes for provider, plan, feature, price, currency,
unit, and billingCadence. Include a qualifier excerpt when present. An unknown
field needs an explicit artifact excerpt and unknown status. The finalQuote
may refer to table rows represented by those excerpts. These text anchors
cannot certify the comparison's meaning or prove a paraphrase is faithful.`;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function hasInputValue(value) {
  return hasText(value) || (typeof value === 'number' && Number.isFinite(value)) ||
    typeof value === 'boolean';
}

function validTupleField(field, value, allowUnknown = false) {
  if (value === null) return allowUnknown;
  if (field === 'price' && typeof value === 'number') return Number.isFinite(value);
  return hasText(value);
}

function validDate(value) {
  return hasText(value) && Number.isFinite(Date.parse(value));
}

function sameValue(a, b) {
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

export function reconcileEvidence(record, options = {}) {
  const issues = [];
  const add = (code, id, severity, message) => issues.push({ code, id, severity, message });
  if (!isRecord(record)) {
    add('record-invalid', 'record', 'error', 'Evidence record must be an object.');
    return issues;
  }

  const lists = {};
  for (const name of ['inputs', 'evidenceSources', 'evidenceClaims']) {
    if (!Array.isArray(record[name])) {
      add('list-invalid', name, 'error', `${name} must be an array.`);
      lists[name] = [];
    } else {
      lists[name] = record[name];
    }
  }

  const inputs = new Map();
  for (const [index, input] of lists.inputs.entries()) {
    const id = hasText(input?.id) ? input.id : `inputs[${index}]`;
    if (!isRecord(input) || !hasText(input.id) || !INPUT_KINDS.has(input.kind)) {
      add('input-invalid', id, 'error', 'Input needs an id and valid kind.');
      continue;
    }
    if (inputs.has(id)) add('input-duplicate', id, 'error', 'Input id is duplicated.');
    else inputs.set(id, input);
    if (input.kind === 'supplied' && !hasInputValue(input.value)) {
      add('input-value-missing', id, 'error', 'Supplied input needs a nonblank string, finite number, or boolean.');
    }
  }

  const frozenInputs = Array.isArray(options.snapshot?.inputs)
    ? new Map(options.snapshot.inputs.filter((item) => hasText(item?.id)).map((item) => [item.id, item]))
    : null;
  if (frozenInputs) {
    for (const [id, input] of inputs) {
      const frozen = frozenInputs.get(id);
      if ((!frozen && input.kind === 'supplied') ||
          (frozen && (frozen.kind !== input.kind ||
            (input.kind === 'supplied' && !Object.is(frozen.value, input.value))))) {
        add('snapshot-input-mismatch', id, 'error', 'Evidence input differs from the frozen request snapshot.');
      }
    }
  }

  const sources = new Map();
  const tuples = new Map();
  for (const [index, source] of lists.evidenceSources.entries()) {
    const id = hasText(source?.id) ? source.id : `evidenceSources[${index}]`;
    if (!isRecord(source) || !hasText(source.id) || !SOURCE_KINDS.has(source.kind)) {
      add('source-invalid', id, 'error', 'Source needs an id and valid kind.');
      continue;
    }
    if (sources.has(id)) add('source-duplicate', id, 'error', 'Source id is duplicated.');
    else sources.set(id, source);
    if (source.kind === 'primary-passage') {
      if (!hasText(source.url) || !validDate(source.retrievedAt) ||
          !hasText(source.passage) || !hasText(source.context)) {
        add('primary-passage-incomplete', id, 'error',
          'Primary source needs URL, retrievedAt, passage, and context.');
      } else if (!source.context.replace(/\s+/g, ' ').includes(source.passage.replace(/\s+/g, ' '))) {
        add('passage-outside-context', id, 'error', 'Passage must occur in source context.');
      }
    }
    if (source.prerequisites !== undefined) {
      const prerequisites = source.prerequisites;
      if (!isRecord(prerequisites) || !Array.isArray(prerequisites.requiredInputIds) ||
          !Array.isArray(prerequisites.definitionSourceIds) ||
          prerequisites.requiredInputIds.some((value) => !hasText(value)) ||
          prerequisites.definitionSourceIds.some((value) => !hasText(value))) {
        add('source-prerequisites-invalid', id, 'error',
          'Source prerequisites need requiredInputIds and definitionSourceIds arrays.');
      }
    }
    if (source.competitorTuples !== undefined && !Array.isArray(source.competitorTuples)) {
      add('tuples-invalid', id, 'error', 'competitorTuples must be an array.');
      continue;
    }
    for (const [tupleIndex, tuple] of (source.competitorTuples || []).entries()) {
      const tupleId = hasText(tuple?.id) ? tuple.id : `${id}.competitorTuples[${tupleIndex}]`;
      if (source.kind !== 'primary-passage') {
        add('tuple-summary-source', tupleId, 'error', 'A generated summary cannot hold a verified source tuple.');
      }
      if (!isRecord(tuple) || !hasText(tuple.id) || !['complete', 'partial'].includes(tuple.completeness)) {
        add('tuple-invalid', tupleId, 'error', 'Source tuple needs an id and completeness.');
        continue;
      }
      if (tuples.has(tupleId)) add('tuple-duplicate', tupleId, 'error', 'Source tuple id is duplicated.');
      else tuples.set(tupleId, { tuple, sourceId: id });
      for (const field of TUPLE_FIELDS) {
        if (!(field in tuple) || !validTupleField(field, tuple[field], tuple.completeness === 'partial')) {
          add('tuple-field-invalid', tupleId, 'error', `Source tuple needs scalar ${field}; use null only for an unknown field in a partial tuple.`);
        }
      }
      if (hasText(tuple.qualifier) && hasText(source.context) &&
          !source.context.toLowerCase().includes(tuple.qualifier.trim().toLowerCase())) {
        add('tuple-qualifier-outside-context', tupleId, 'error',
          'Source tuple qualifier must occur in retained source context.');
      }
      if ('qualifier' in tuple && !hasText(tuple.qualifier)) {
        add('tuple-qualifier-invalid', tupleId, 'error', 'Source tuple qualifier must be a nonblank string when present.');
      }
    }
  }

  function collectPrerequisites(sourceId, visited = new Set()) {
    if (visited.has(sourceId)) return { inputs: new Set(), definitions: new Set() };
    visited.add(sourceId);
    const source = sources.get(sourceId);
    const declarations = source?.prerequisites;
    const required = {
      inputs: new Set(Array.isArray(declarations?.requiredInputIds) ? declarations.requiredInputIds : []),
      definitions: new Set(Array.isArray(declarations?.definitionSourceIds) ? declarations.definitionSourceIds : []),
    };
    for (const definitionId of required.definitions) {
      if (!sources.has(definitionId)) {
        add('definition-reference-missing', sourceId, 'error', `Unknown definition source id: ${definitionId}.`);
        continue;
      }
      if (sources.get(definitionId).kind !== 'primary-passage') {
        add('definition-not-primary', sourceId, 'error', `Definition source ${definitionId} must be a primary passage.`);
      }
      const nested = collectPrerequisites(definitionId, visited);
      for (const inputId of nested.inputs) required.inputs.add(inputId);
      for (const nestedId of nested.definitions) required.definitions.add(nestedId);
    }
    return required;
  }

  const claimIds = new Set();
  for (const [index, claim] of lists.evidenceClaims.entries()) {
    const id = hasText(claim?.id) ? claim.id : `evidenceClaims[${index}]`;
    if (!isRecord(claim) || !hasText(claim.id)) {
      add('claim-invalid', id, 'error', 'Claim needs an id.');
      continue;
    }
    if (claimIds.has(id)) add('claim-duplicate', id, 'error', 'Claim id is duplicated.');
    claimIds.add(id);
    if (!Array.isArray(claim.artifactQuotes) || claim.artifactQuotes.length === 0 ||
        claim.artifactQuotes.some((quote) => !hasText(quote))) {
      add('artifact-quotes-invalid', id, 'error', 'Claim needs nonblank exact final-artifact excerpts.');
    }
    if (!Array.isArray(claim.sourceIds) || claim.sourceIds.some((sourceId) => !hasText(sourceId))) {
      add('source-ids-invalid', id, 'error', 'sourceIds must be an array of source ids.');
    }
    if (!SUPPORT_STATES.has(claim.support)) {
      add('support-invalid', id, 'error', 'Claim support must be verified or unresolved.');
    }
    const sourceIds = Array.isArray(claim.sourceIds) ? claim.sourceIds.filter(hasText) : [];
    for (const sourceId of sourceIds) {
      if (!sources.has(sourceId)) add('source-reference-missing', id, 'error', `Unknown source id: ${sourceId}.`);
    }
    if (claim.support === 'verified' &&
        !sourceIds.some((sourceId) => sources.get(sourceId)?.kind === 'primary-passage')) {
      add('verified-without-primary', id, 'error', 'Verified claim needs a referenced primary passage; a generated summary is only a lead.');
    }
    if (claim.support === 'unresolved') {
      add('support-unresolved', id, 'warning', 'Claim support is explicitly unresolved.');
    }

    if (claim.support === 'verified') {
      const required = { inputs: new Set(), definitions: new Set() };
      for (const sourceId of sourceIds) {
        const sourceRequired = collectPrerequisites(sourceId);
        for (const inputId of sourceRequired.inputs) required.inputs.add(inputId);
        for (const definitionId of sourceRequired.definitions) required.definitions.add(definitionId);
      }
      for (const definitionId of required.definitions) {
        if (!sourceIds.includes(definitionId)) {
          add('source-definition-unlinked', id, 'error',
            `Verified claim must reference incorporated definition source ${definitionId}.`);
        }
      }
      for (const inputId of required.inputs) {
        if (!claim.applicability?.requiredInputIds?.includes(inputId)) {
          add('source-prerequisite-omitted', id, 'error',
            `Verified claim omits source-declared required case input ${inputId}.`);
        }
      }
    }

    if (claim.applicability !== undefined) {
      const applicability = claim.applicability;
      if (!isRecord(applicability) || !Array.isArray(applicability.requiredInputIds) ||
          applicability.requiredInputIds.length === 0 ||
          applicability.requiredInputIds.some((inputId) => !hasText(inputId)) ||
          typeof applicability.conditional !== 'boolean') {
        add('applicability-invalid', id, 'error', 'Applicability needs requiredInputIds and conditional boolean.');
      } else {
        const unresolved = [];
        for (const inputId of applicability.requiredInputIds) {
          const input = inputs.get(inputId);
          if (!input) add('input-reference-missing', id, 'error', `Unknown required input id: ${inputId}.`);
          else if (input.kind !== 'supplied' || !hasInputValue(input.value)) unresolved.push(inputId);
        }
        if (unresolved.length > 0) {
          add(applicability.conditional ? 'applicability-conditional' : 'applicability-unconditional',
            id, applicability.conditional ? 'warning' : 'error',
            `Required case inputs are unresolved: ${unresolved.join(', ')}.`);
        }
      }
    }

    const comparisonTuples = claim.comparisonTuples;
    if (comparisonTuples !== undefined &&
        (!Array.isArray(comparisonTuples) || comparisonTuples.length < 2)) {
      add('comparison-tuples-invalid', id, 'error', 'comparisonTuples needs at least two source-linked tuples.');
    }
    const reportedTuples = [
      ...(claim.competitorTuple !== undefined ? [claim.competitorTuple] : []),
      ...(Array.isArray(comparisonTuples) ? comparisonTuples : []),
    ];
    const comparisonSources = new Map();
    for (const reported of reportedTuples) {
      if (!isRecord(reported) || !hasText(reported.sourceTupleId)) {
        add('claim-tuple-invalid', id, 'error', 'Claim tuple needs sourceTupleId.');
        continue;
      }
      const sourceEntry = tuples.get(reported.sourceTupleId);
      if (!sourceEntry) {
        add('tuple-reference-missing', id, 'error', `Unknown source tuple id: ${reported.sourceTupleId}.`);
        continue;
      }
      if (!sourceIds.includes(sourceEntry.sourceId)) {
        add('tuple-source-unlinked', id, 'error', 'Claim must reference the source that holds its tuple.');
      }
      if (comparisonSources.has(reported.sourceTupleId)) {
        add('comparison-tuple-duplicate', id, 'error',
          `Source tuple ${reported.sourceTupleId} is repeated in the claim.`);
      }
      comparisonSources.set(reported.sourceTupleId, sourceEntry.tuple);
      for (const field of TUPLE_FIELDS) {
        if (!(field in reported) || !validTupleField(field, reported[field], true)) {
          add('claim-tuple-field-invalid', id, 'error', `Claim tuple needs scalar ${field}; use null for an unknown field.`);
        } else if (reported[field] !== null && sourceEntry.tuple[field] === null) {
          add('tuple-unsupported-value', id, 'error', `${field} is unknown in the source tuple but asserted in the claim.`);
        } else if (!sameValue(reported[field], sourceEntry.tuple[field])) {
          add('tuple-conflict', id, 'error', `${field} conflicts with source tuple ${reported.sourceTupleId}.`);
        }
      }
      if ('qualifier' in reported && !hasText(reported.qualifier)) {
        add('claim-qualifier-invalid', id, 'error', 'Claim tuple qualifier must be a nonblank string when present.');
      }
      if (hasText(sourceEntry.tuple.qualifier) &&
          (!hasText(reported.qualifier) || !sameValue(reported.qualifier, sourceEntry.tuple.qualifier))) {
        add('tuple-qualifier-lost', id, 'error', 'Claim tuple must preserve the source qualifier.');
      } else if (hasText(sourceEntry.tuple.qualifier) &&
          Array.isArray(claim.artifactQuotes) &&
          !claim.artifactQuotes.some((quote) => hasText(quote) &&
            quote.toLowerCase().includes(sourceEntry.tuple.qualifier.trim().toLowerCase()))) {
        add('tuple-qualifier-quote-missing', id, 'error',
          'Source qualifier must appear in an exact final-artifact excerpt.');
      }
      if (sourceEntry.tuple.completeness === 'partial') {
        add('tuple-partial', id, 'warning', 'Source tuple has explicitly unknown fields.');
      }
    }
    if (comparisonTuples !== undefined) {
      const comparison = claim.comparison;
      if (!isRecord(comparison) || !['established', 'unknown'].includes(comparison.status) ||
          !hasText(comparison.finalQuote) || !Array.isArray(comparison.unknownFields) ||
          comparison.unknownFields.some((field) => !TUPLE_FIELDS.includes(field)) ||
          !Array.isArray(comparison.renderedTuples)) {
        add('comparison-invalid', id, 'error',
          'Comparison needs status, exact finalQuote, unknownFields, and renderedTuples.');
      } else {
        if (!claim.artifactQuotes?.includes(comparison.finalQuote)) {
          add('comparison-final-quote-missing', id, 'error',
            'The final comparative excerpt must be listed in artifactQuotes.');
        }
        const artifactQuotes = Array.isArray(claim.artifactQuotes) ? claim.artifactQuotes : [];
        const renderedById = new Map(comparison.renderedTuples
          .filter((row) => hasText(row?.sourceTupleId))
          .map((row) => [row.sourceTupleId, row]));
        const sourceUnknownFields = new Set();
        for (const [tupleId, tuple] of comparisonSources) {
          const rendered = renderedById.get(tupleId);
          if (!isRecord(rendered?.fieldQuotes)) {
            add('comparison-rendered-row-missing', id, 'error',
              `Comparison needs rendered field excerpts for source tuple ${tupleId}.`);
            continue;
          }
          for (const field of TUPLE_FIELDS) {
            if (tuple[field] === null) sourceUnknownFields.add(field);
            const excerpt = rendered.fieldQuotes[field];
            if (!hasText(excerpt) || !artifactQuotes.some((quote) => quote.includes(excerpt))) {
              add('comparison-field-quote-missing', id, 'error',
                `Artifact excerpts need a ${field} anchor for source tuple ${tupleId}.`);
            }
          }
          if (hasText(tuple.qualifier) &&
              (!hasText(rendered.qualifierQuote) ||
                !artifactQuotes.some((quote) => quote.includes(rendered.qualifierQuote)))) {
            add('comparison-condition-quote-missing', id, 'error',
              'Artifact excerpts need an anchor for each source condition.');
          }
        }
        for (const field of sourceUnknownFields) {
          if (!comparison.unknownFields.includes(field)) {
            add('comparison-unknown-omitted', id, 'error',
              `Comparison must mark ${field} as unknown.`);
          }
        }
        for (const field of comparison.unknownFields) {
          if (!sourceUnknownFields.has(field)) {
            add('comparison-unknown-unbacked', id, 'error',
              `Comparison marks ${field} unknown although all cited rows provide it.`);
          }
        }
        if (sourceUnknownFields.size > 0 && comparison.status !== 'unknown') {
          add('comparison-status-overstated', id, 'error',
            'Unknown source dimensions require unknown comparison status.');
        }
        if (comparison.status === 'unknown' && sourceUnknownFields.size === 0 &&
            comparison.unknownFields.length === 0) {
          add('comparison-unknown-unexplained', id, 'error',
            'Unknown comparison status needs an identified unknown field.');
        }
      }
    }
  }
  return issues;
}

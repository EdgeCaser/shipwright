export const SCORE_DIMENSIONS = Object.freeze([
  'decision_usefulness',
  'evidence_discipline',
  'internal_consistency',
  'actionability',
]);

const MIN_REVIEWERS = 3;
const MIN_SCORE = 1;
const MAX_SCORE = 5;

export function computeBlindRatingFromRaters(raters, passKey) {
  const normalizedRaters = Array.isArray(raters) ? raters : [];
  if (normalizedRaters.length < MIN_REVIEWERS) {
    throw new Error(`Blind review requires at least ${MIN_REVIEWERS} raters.`);
  }

  let total = 0;
  for (const rater of normalizedRaters) {
    total += computeRaterAverage(rater, passKey);
  }

  return roundToOneDecimal((total / normalizedRaters.length / MAX_SCORE) * 100);
}

export function validateReviewResponseScoreBlock(scoreBlock, contextLabel) {
  if (!scoreBlock || typeof scoreBlock !== 'object' || Array.isArray(scoreBlock)) {
    throw new Error(`${contextLabel} must be an object.`);
  }

  for (const dimension of SCORE_DIMENSIONS) {
    const score = scoreBlock[dimension];
    if (!Number.isFinite(score) || score < MIN_SCORE || score > MAX_SCORE) {
      throw new Error(
        `${contextLabel} score for ${dimension} must be between ${MIN_SCORE} and ${MAX_SCORE}.`,
      );
    }
  }
}

function computeRaterAverage(rater, passKey) {
  const passScores = rater?.[passKey];
  const raterId = rater?.rater_id || 'unknown';
  validateReviewResponseScoreBlock(
    passScores,
    `Blind review scores for ${passKey} on rater "${raterId}"`,
  );

  let total = 0;
  for (const dimension of SCORE_DIMENSIONS) {
    total += passScores[dimension];
  }

  return total / SCORE_DIMENSIONS.length;
}

function roundToOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

// Helpers for the adaptive interview panel.
//
// The engine names competencies in snake_case (`implementation_reasoning`) and
// ships no display labels, so titles are derived. Only add an override when
// title-casing reads badly.

const LABEL_OVERRIDES = {
  testing_validation: 'Testing & validation',
  product_requirement_reasoning: 'Product reasoning',
};

export function formatCompetencyLabel(key) {
  if (!key) return 'Competency';
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key];
  const words = String(key).replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Competency scores are on their own scale (4 of 5), not 0-100, so tone comes
 * from the ratio rather than the raw number.
 */
export function getRatioTone(score, maxScore) {
  const value = Number(score);
  const max = Number(maxScore);
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) {
    return { text: 'text-text-muted', dot: 'bg-border-default' };
  }
  const ratio = value / max;
  if (ratio >= 0.75) return { text: 'text-success', dot: 'bg-success' };
  if (ratio >= 0.4) return { text: 'text-warning', dot: 'bg-warning' };
  return { text: 'text-error', dot: 'bg-error' };
}

/** Trims trailing zeros so 4.0 renders as "4" and 4.2 stays "4.2". */
export function formatScoreValue(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return '—';
  return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(1);
}

export function joinRationales(rationales) {
  return (rationales || []).filter(Boolean).join(' ');
}

/**
 * Rubric levels are out of 4 while the section score is out of 100. Rendering
 * the percentage alongside means a recruiter doesn't have to reconcile the two
 * scales themselves.
 */
export function formatPercent(score, maxScore) {
  const value = Number(score);
  const max = Number(maxScore);
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return null;
  return `${Math.round((value / max) * 100)}%`;
}

/**
 * Why a score was clamped.
 *
 * A capped 2/4 and a genuinely mediocre 2/4 look identical on screen, but they
 * mean different things — one is a judgement about the candidate, the other an
 * artifact of the scorer not being able to quote them.
 */
const CAP_LABELS = {
  missing_evidence_cap: 'Capped — no quotable evidence',
};

export function describeCaps(capsApplied) {
  const caps = (capsApplied || []).filter(Boolean);
  if (!caps.length) return null;
  return caps.map(cap => CAP_LABELS[cap] || `Capped — ${cap.replace(/_/g, ' ')}`).join(' · ');
}

/** "4m 12s" / "48s" — omitted entirely when no timing was captured. */
export function formatDuration(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total < 0) return null;
  if (total < 60) return `${Math.round(total)}s`;
  const minutes = Math.floor(total / 60);
  const remainder = Math.round(total % 60);
  return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

/**
 * Split a stored answer back into the turns the candidate actually typed.
 *
 * The engine appends a nudge reply to the existing answer rather than replacing
 * it (replacing it destroyed the original and scored the follow-up alone), using
 * this marker as the join. Splitting here lets the transcript interleave the
 * interviewer's follow-up prompt between the turns.
 */
export const ANSWER_TURN_SEPARATOR = '[follow-up]';

export function splitAnswerTurns(answer) {
  const text = (answer || '').trim();
  if (!text) return [];
  return text
    .split(ANSWER_TURN_SEPARATOR)
    .map(turn => turn.trim())
    .filter(Boolean);
}

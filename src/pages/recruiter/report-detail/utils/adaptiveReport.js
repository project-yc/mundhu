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

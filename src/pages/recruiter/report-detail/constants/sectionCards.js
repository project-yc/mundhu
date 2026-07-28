// Section card presentation, from Figma 543-6082.
//
// One card pattern for every section type: 113 tall, a 117px illustration block
// on the left, title + "Show details" on the right, score and signal beneath.
//
// Row widths fall out of flex-wrap rather than a fixed grid — every card takes
// a 33.33% basis and grows, so a trailing row of two fills the width:
//   3-up  →  (1097 - 2*12) / 3 = 357.67
//   2-up  →  (1097 - 12)   / 2 = 542.5

export const CARD_BASIS = 'basis-full sm:basis-[calc(50%-6px)] xl:basis-[calc(33.333%-8px)]';

export const SECTION_BADGES = {
  technical_task: 'Coding',
  coding: 'Coding',
  mcq: 'MCQs',
  free_text: 'Free text',
  ranking: 'Ranking',
  adaptive_interview: 'AI',
};

export const SECTION_TASK_NAMES = {
  technical_task: 'Coding Task',
  coding: 'Coding Task',
  mcq: 'MCQs Task',
  free_text: 'Free Text Task',
  ranking: 'Ranking Task',
  adaptive_interview: 'AI Adaptive Task',
};

/**
 * Figma prints a qualitative label under the score.
 *
 * `section_results` carries no `signal` field — the entries are
 * `{section_id, status, score, max_score, section_name, section_order,
 * content_type}` — so this is banded from the section percentage using the same
 * thresholds as the coding rubric table. It is a restatement of the number
 * above it, not an independent judgement.
 *
 * Reading `section.signal` (which never exists) previously made every card
 * print STRONG, including sections scoring zero.
 */
export const SIGNAL_LABELS = {
  green: 'STRONG',
  yellow: 'MODERATE',
  red: 'WEAK',
};

export function getSectionSignalLabel(percent) {
  if (!Number.isFinite(percent)) return null;
  if (percent >= 75) return SIGNAL_LABELS.green;
  if (percent >= 40) return SIGNAL_LABELS.yellow;
  return SIGNAL_LABELS.red;
}

export function getSectionSignalTone(percent) {
  if (!Number.isFinite(percent)) return 'text-text-muted';
  if (percent >= 75) return 'text-success';
  if (percent >= 40) return 'text-warning';
  return 'text-error';
}

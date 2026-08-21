// One way to turn a competency key into a human label.
//
// There were two, and both were wrong, differently. The builder's
// `formatFocusAreaLabel` title-cased every word ("Ai Collaboration", "Sql"); the
// report's `formatCompetencyLabel` capitalised only the first character ("Ai
// collaboration", "Ci cd"). So the same competency read differently depending on
// whether the recruiter was authoring the interview or reading its report, and
// neither rendering was right — these keys are full of acronyms.
//
// Both now delegate here. Keep this the only implementation.

// Acronyms that must not be title-cased. Lowercase key -> display form.
const ACRONYMS = {
  ai: 'AI',
  ml: 'ML',
  llm: 'LLM',
  api: 'API',
  sql: 'SQL',
  ci: 'CI',
  cd: 'CD',
  ux: 'UX',
  ui: 'UI',
  etl: 'ETL',
  rag: 'RAG',
  qa: 'QA',
  io: 'IO',
};

// Whole-key overrides, for labels that word-by-word formatting cannot reach.
const KEY_OVERRIDES = {
  ci_cd: 'CI/CD',
  ai_ml: 'AI/ML',
};

/**
 * "ai_collaboration" -> "AI collaboration", "ci_cd" -> "CI/CD".
 *
 * Sentence case, not title case: these appear in running prose and in table
 * cells where Title Case On Everything reads like a headline. Acronyms keep
 * their capitals wherever they fall.
 */
export function formatCompetencyLabel(key) {
  const raw = String(key || '').trim();
  if (!raw) return '';

  const override = KEY_OVERRIDES[raw.toLowerCase()];
  if (override) return override;

  const words = raw.split('_').filter(Boolean);
  if (!words.length) return '';

  return words
    .map((word, index) => {
      const acronym = ACRONYMS[word.toLowerCase()];
      if (acronym) return acronym;
      // Only the first word is capitalised; the rest stay lowercase.
      if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      return word.toLowerCase();
    })
    .join(' ');
}

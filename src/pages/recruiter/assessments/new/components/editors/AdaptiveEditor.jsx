import { IconMessageCircle, IconAlertTriangle } from '@tabler/icons-react';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';
import { ACTIONS } from '../../context/assessmentBuilderReducer';
import {
  ADAPTIVE_PRESET_OPTIONS,
  formatFocusAreaLabel,
} from '../AddSectionPanel/constants';

/**
 * Read-only summary of a configured adaptive interview.
 *
 * `AssessmentBuilderStep` dispatches on `item.type` across four editors and had
 * no arm for `'adaptive'`, so the right-hand panel rendered an empty `<div>` —
 * no message, no fallback. And because `ADD_SECTION` sets `activeQuestion` to
 * the new item, the recruiter hit that blank panel the instant they clicked Add:
 * configure the interview, drawer closes, right half of the builder goes white.
 * Clicking the section in the outline did the same thing afterwards.
 *
 * This is deliberately a SUMMARY, not a form. The drawer
 * (`SectionCreationDrawer` → `AdaptiveQuestionForm`) is the authoring surface
 * and owns the capacity arithmetic that keeps a config publishable — the
 * question ceiling is recomputed from the live focus-area list at submit, which
 * is what stops a recruiter building a config the server refuses with
 * `interview_misconfigured` on the candidate's first question. Duplicating that
 * math in a second editor is how the two drift apart. Until the drawer can be
 * reopened in edit mode, showing exactly what was saved and how to change it
 * beats both a white panel and a form that can quietly produce an invalid
 * interview.
 */
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-text-muted">{label}</p>
      <div className="text-[12.5px] leading-[18px] text-text-primary">{children}</div>
    </div>
  );
}

function Chips({ values }) {
  if (!values?.length) return <span className="text-text-muted">None</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center rounded-md border border-border-default bg-page px-2 py-0.5 text-[11.5px] text-text-secondary"
        >
          {formatFocusAreaLabel(value)}
        </span>
      ))}
    </div>
  );
}

function Lines({ values }) {
  if (!values?.length) return <span className="text-text-muted">None</span>;
  return (
    <ul className="flex list-disc flex-col gap-1 pl-4">
      {values.map((value, index) => (
        <li key={index} className="text-text-secondary">{value}</li>
      ))}
    </ul>
  );
}

export function AdaptiveEditor({ sectionId, item }) {
  const { dispatch } = useAssessmentBuilder();
  const config = item.adaptive_config || {};

  const preset = ADAPTIVE_PRESET_OPTIONS.find((option) => option.value === config.preset);
  const questionCount = config.question_count || {};
  const anchoredToTask = config.anchor?.type === 'coding_task';

  return (
    <div className="p-4">
      <div className="mx-auto flex max-w-[620px] flex-col gap-3">

        <div className="flex items-center gap-2">
          <IconMessageCircle size={15} className="text-brand" />
          <h2 className="text-[14px] font-semibold text-text-primary">Adaptive interview</h2>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border border-border-default bg-surface p-4">
          <Field label="Interview style">
            {preset ? (
              <>
                {preset.label}
                <span className="ml-2 text-text-muted">{preset.hint}</span>
              </>
            ) : (
              /* A preset withdrawn since this section was authored — publish
                 refuses it, and the drawer no longer offers it, so name it
                 rather than rendering a blank line. */
              <span className="text-warning">
                {config.preset ? `${config.preset} (no longer available)` : 'Not set'}
              </span>
            )}
          </Field>

          <Field label="Competencies scored">
            <Chips values={config.focus_areas} />
          </Field>

          <Field label="Questions">
            {questionCount.min ?? '?'}–{questionCount.max ?? '?'} questions
            <span className="ml-2 text-text-muted">
              adapts to the candidate&apos;s answers within this range
            </span>
          </Field>

          <Field label="Grounded on">
            {anchoredToTask
              ? 'The coding task submitted earlier in this assessment'
              : 'Nothing — questions stand on their own'}
          </Field>

          {config.role_title && (
            <Field label="Role described to the interviewer">{config.role_title}</Field>
          )}

          <Field label="Must ask about">
            <Lines values={config.must_ask_questions} />
          </Field>

          <Field label="Avoid">
            <Lines values={config.avoid_topics} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* The edit path. Without it a saved interview was a dead end: this
              panel is read-only, "+ Add question" is hidden for adaptive
              sections (a section may hold only one interview), so a config the
              server later refuses — a question count the focus areas cannot
              cover, a focus area no longer in the catalog — left the recruiter
              with an accurate error message and no control that could act on
              it. The only escape was deleting the section and re-authoring. */}
          <button
            type="button"
            onClick={() => dispatch({
              type: ACTIONS.OPEN_ADD_QUESTION_DRAWER,
              payload: { sectionId, sectionType: 'adaptive', editQuestionId: item.id },
            })}
            className="rounded-button bg-[var(--color-assessment-cta)] px-3 py-1.5 text-[12px] font-bold text-[var(--color-assessment-cta-text)] shadow-card transition-colors hover:bg-[var(--color-assessment-cta-hover)]"
          >
            Edit settings
          </button>

          <button
            type="button"
            onClick={() => {
              // Confirmed, unlike before. There is no undo, and re-creating the
              // interview means re-typing every must-ask line from memory — the
              // drawer already confirms before discarding the same configuration
              // on an accidental Escape, so one click here was inconsistent.
              const discard = window.confirm(
                'Remove this interview? Its focus areas, must-ask questions and other '
                + 'settings will be lost.',
              );
              if (!discard) return;
              dispatch({
                type: ACTIONS.REMOVE_QUESTION,
                payload: { sectionId, questionId: item.id },
              });
            }}
            className="rounded-button border border-border-default px-3 py-1.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-error hover:text-error"
          >
            Remove interview
          </button>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border-default bg-page p-3">
          <IconAlertTriangle size={14} className="mt-0.5 shrink-0 text-text-muted" />
          <p className="text-[12px] leading-[18px] text-text-secondary">
            Removing the interview leaves the section empty, and an adaptive section
            can only hold one — so delete the whole section rather than removing the
            interview if you no longer want it.
          </p>
        </div>
      </div>
    </div>
  );
}

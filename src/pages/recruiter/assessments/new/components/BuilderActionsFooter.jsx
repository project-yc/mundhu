import { useState } from 'react';
import { toast } from 'sonner';

import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { saveDraft } from '../api/assessmentBuilderApi';

/**
 * Save-as-draft and Review & Publish, always visible while building.
 *
 * These used to sit at the bottom of the section-type picker, so they were only
 * reachable in one right-panel state — clicking a question to look at it made
 * them disappear. They act on the whole assessment, so they belong to the step,
 * not to a panel.
 */
export function BuilderActionsFooter() {
  const { state, dispatch, ACTIONS } = useAssessmentBuilder();
  const [saving, setSaving] = useState(false);

  const hasSections = state.sections.length > 0;

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await saveDraft(state, { dispatch, ACTIONS });
      toast.success('Draft saved.');
    } catch (err) {
      toast.error('Failed to save draft', { description: err.message || 'Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleReview = () => {
    if (!hasSections) return;
    dispatch({ type: ACTIONS.SET_STEP, payload: 3 });
  };

  return (
    <div className="flex flex-shrink-0 items-center justify-end gap-[10px] border-t border-border-subtle bg-surface px-[44px] py-[14px]">
      <button
        type="button"
        onClick={handleSaveDraft}
        disabled={saving || !hasSections}
        className="h-[40px] rounded-button border border-border-default bg-surface px-[28px] text-[14px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save as draft'}
      </button>
      <button
        type="button"
        onClick={handleReview}
        disabled={!hasSections}
        title={hasSections ? undefined : 'Add a section first.'}
        className="h-[40px] rounded-button bg-[var(--color-assessment-cta)] px-[28px] text-[14px] font-bold text-[var(--color-assessment-cta-text)] shadow-card transition-colors hover:bg-[var(--color-assessment-cta-hover)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[var(--color-assessment-cta)]"
      >
        Review &amp; Publish
      </button>
    </div>
  );
}

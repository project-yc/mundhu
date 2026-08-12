import { useState } from 'react';
import { toast } from 'sonner';
import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { saveDraft } from '../api/assessmentBuilderApi';
import { SectionCreationDrawer } from './AddSectionPanel/SectionCreationDrawer';
import { SectionSelectionContent } from './AddSectionPanel/SectionSelectionContent';
import { useSectionCreationDrawer } from './AddSectionPanel/useSectionCreationDrawer';

export function AddSectionPanel() {
  const { dispatch, ACTIONS, state } = useAssessmentBuilder();
  const { drawer, form, actions } = useSectionCreationDrawer({ dispatch, ACTIONS, state });
  const [savingDraft, setSavingDraft] = useState(false);

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      await saveDraft(state, { dispatch, ACTIONS });
      localStorage.setItem('assessmentBuilderDraft', JSON.stringify(state));
      toast.success('Draft saved.');
    } catch (err) {
      toast.error('Failed to save draft', { description: err.message || 'Please try again.' });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleReview = () => {
    if (state.sections.length === 0) return;
    dispatch({ type: ACTIONS.SET_STEP, payload: 3 });
  };

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-surface pb-[31px] pl-[50px] pr-[44px] pt-[40px]">
      <SectionSelectionContent
        currentStep={state.currentStep}
        onAddSection={actions.addSection}
        onSaveDraft={handleSaveDraft}
        savingDraft={savingDraft}
        onReview={handleReview}
        canReview={state.sections.length > 0}
      />
      <SectionCreationDrawer drawer={drawer} form={form} actions={actions} />
    </div>
  );
}

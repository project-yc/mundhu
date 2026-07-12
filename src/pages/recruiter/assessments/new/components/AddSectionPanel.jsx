import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { SectionCreationDrawer } from './AddSectionPanel/SectionCreationDrawer';
import { SectionSelectionContent } from './AddSectionPanel/SectionSelectionContent';
import { useSectionCreationDrawer } from './AddSectionPanel/useSectionCreationDrawer';

export function AddSectionPanel() {
  const { dispatch, ACTIONS, state } = useAssessmentBuilder();
  const { drawer, form, actions } = useSectionCreationDrawer({ dispatch, ACTIONS, state });

  const handleSaveDraft = () => {
    localStorage.setItem('assessmentBuilderDraft', JSON.stringify(state));
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
        onReview={handleReview}
        canReview={state.sections.length > 0}
      />
      <SectionCreationDrawer drawer={drawer} form={form} actions={actions} />
    </div>
  );
}

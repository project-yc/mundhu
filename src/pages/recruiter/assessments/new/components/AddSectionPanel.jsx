import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { SectionCreationDrawer } from './AddSectionPanel/SectionCreationDrawer';
import { SectionSelectionContent } from './AddSectionPanel/SectionSelectionContent';
import { useSectionCreationDrawer } from './AddSectionPanel/useSectionCreationDrawer';

export function AddSectionPanel() {
  const { dispatch, ACTIONS, state } = useAssessmentBuilder();
  const { drawer, form, actions } = useSectionCreationDrawer({ dispatch, ACTIONS, state });

  return (
    <div className="relative flex min-h-full flex-col overflow-hidden bg-surface pb-[31px] pl-[50px] pr-[44px] pt-[40px]">
      <SectionSelectionContent
        currentStep={state.currentStep}
        onAddSection={actions.addSection}
      />
      <SectionCreationDrawer drawer={drawer} form={form} actions={actions} />
    </div>
  );
}

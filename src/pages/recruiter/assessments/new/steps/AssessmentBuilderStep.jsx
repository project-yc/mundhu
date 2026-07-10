import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { LeftPanel } from '../components/LeftPanel/LeftPanel';
import { AddSectionPanel } from '../components/AddSectionPanel';
import { CodingEditor } from '../components/editors/CodingEditor';
import { McqEditor } from '../components/editors/McqEditor';
import { FreeTextEditor } from '../components/editors/FreeTextEditor';
import { RankingEditor } from '../components/editors/RankingEditor';

function RightPanel() {
  const { state } = useAssessmentBuilder();
  const { sections, activeSection, activeQuestion } = state;

  // Show add-section panel
  if (activeSection === '__add_section__') {
    return (
      <div className="flex-1 overflow-y-auto">
        <AddSectionPanel />
      </div>
    );
  }

  // No sections
  if (sections.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto">
        <AddSectionPanel />
      </div>
    );
  }

  // No active section
  if (!activeSection) {
    return (
      <div className="flex items-center justify-center h-full text-[13px] text-text-muted">
        Select a section or question from the left panel.
      </div>
    );
  }

  const section = sections.find(s => s.id === activeSection);
  if (!section) return null;

  // No active question — show section settings note
  if (!activeQuestion) {
    return (
      <div className="flex-1 overflow-y-auto">
        <AddSectionPanel isEditing section={section} />
      </div>
    );
  }

  const item = section.items.find(i => i.id === activeQuestion);
  if (!item) return null;

  const itemIndex = section.items.findIndex(i => i.id === activeQuestion);

  const sharedProps = {
    sectionId: section.id,
    item,
    allItems: section.items,
    itemIndex,
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {item.type === 'coding' && <CodingEditor {...sharedProps} />}
      {item.type === 'mcq' && <McqEditor {...sharedProps} />}
      {item.type === 'free_text' && <FreeTextEditor {...sharedProps} />}
      {item.type === 'ranking' && <RankingEditor {...sharedProps} />}
    </div>
  );
}

export function AssessmentBuilderStep() {
  return (
    <div className="flex-1 flex overflow-hidden h-full">
      <LeftPanel />
      <RightPanel />
    </div>
  );
}

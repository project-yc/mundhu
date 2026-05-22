import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { LeftPanel } from '../components/LeftPanel/LeftPanel';
import { AddSectionPanel } from '../components/AddSectionPanel';
import { CodingEditor } from '../components/editors/CodingEditor';
import { McqEditor } from '../components/editors/McqEditor';
import { FreeTextEditor } from '../components/editors/FreeTextEditor';
import { RankingEditor } from '../components/editors/RankingEditor';

function EmptyState({ onAddSection }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <div className="w-14 h-14 rounded-2xl bg-surface-muted border border-border-default flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-text-muted" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <path d="M17.5 14v7M14 17.5h7" />
        </svg>
      </div>
      <p className="text-[15px] font-bold text-text-primary mb-1">No sections yet</p>
      <p className="text-[13px] text-text-secondary mb-5">
        Add your first section to start building the assessment.
      </p>
      <button
        onClick={onAddSection}
        className="px-4 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-lg transition-colors"
      >
        + Add section
      </button>
    </div>
  );
}

function RightPanel() {
  const { state, dispatch, ACTIONS } = useAssessmentBuilder();
  const { sections, activeSection, activeQuestion } = state;

  const handleAddSection = () => {
    dispatch({ type: ACTIONS.SET_ACTIVE, payload: { sectionId: '__add_section__', questionId: null } });
  };

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
      <div className="flex-1 flex items-center justify-center">
        <EmptyState onAddSection={handleAddSection} />
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

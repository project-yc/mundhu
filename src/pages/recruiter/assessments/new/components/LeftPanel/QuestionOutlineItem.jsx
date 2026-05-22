import { IconLock } from '@tabler/icons-react';
import { SECTION_TYPE_CONFIG } from '../../constants/sectionTypeConfig';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';

/**
 * A single question/item row inside a section in the left panel outline.
 */
export function QuestionOutlineItem({ sectionId, item, index, isActive }) {
  const { dispatch, ACTIONS } = useAssessmentBuilder();
  const isLocked = item.locked || item.published;

  const handleClick = () => {
    dispatch({ type: ACTIONS.SET_ACTIVE, payload: { sectionId, questionId: item.id } });
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-colors ${
        isActive
          ? 'bg-brand-tint-light text-brand-deep'
          : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
      }`}
    >
      {/* Lock or number badge */}
      <span className={`w-4 h-4 flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
        isLocked ? 'text-success' : 'text-text-muted'
      }`}>
        {isLocked ? <IconLock size={11} /> : index + 1}
      </span>
      <span className="text-[12px] truncate min-w-0">
        {item.type === 'coding'
          ? item.task_data?.name || 'Untitled task'
          : item.prompt?.slice(0, 40) || 'Untitled question'}
      </span>
    </button>
  );
}

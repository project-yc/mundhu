import { GripVertical, MoreVertical } from 'lucide-react';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';

function getQuestionLabel(item, index) {
  if (item.type === 'coding') {
    return item.task_data?.name || item.task_data?.title || 'Untitled coding task';
  }
  const prompt = item.prompt?.trim();
  return prompt || `Question ${index + 1}`;
}

function getPointValue(item) {
  if (Number.isFinite(Number(item.points))) return Number(item.points);
  return item.type === 'coding' ? 5 : 0;
}

export function QuestionOutlineItem({ sectionId, item, index, isActive }) {
  const { dispatch, ACTIONS } = useAssessmentBuilder();
  const points = getPointValue(item);

  const handleClick = () => {
    dispatch({ type: ACTIONS.SET_ACTIVE, payload: { sectionId, questionId: item.id } });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`grid w-full grid-cols-[minmax(0,1fr)_auto_16px] items-center gap-[6px] rounded-button py-[1px] pl-[8px] pr-[1px] text-left transition-colors ${
        isActive
          ? 'bg-brand-tint-light text-text-primary'
          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
      }`}
    >
      <span className="flex min-w-0 items-center gap-[6px]">
        {index === 1 && (
          <GripVertical className="h-[12px] w-[12px] flex-shrink-0 text-text-faint" strokeWidth={2} />
        )}
        <span className="min-w-0 truncate text-[12px] font-medium leading-[18px]">
          {getQuestionLabel(item, index)}
        </span>
      </span>

      {points > 0 && (
        <span className="rounded-full bg-warning-bg px-[7px] py-[2px] text-[9px] font-bold leading-none text-warning">
          {points} pts
        </span>
      )}

      <MoreVertical className="h-[14px] w-[14px] text-[var(--color-assessment-step-active)]" strokeWidth={2} />
    </button>
  );
}

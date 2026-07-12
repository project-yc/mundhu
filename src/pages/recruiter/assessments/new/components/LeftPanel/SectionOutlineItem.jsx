import { ChevronDown, Menu, Plus } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SECTION_TYPE_CONFIG } from '../../constants/sectionTypeConfig';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';
import mcqIcon from '../../../../../../assets/recruiter/icons/mcq.svg';
import rankingIcon from '../../../../../../assets/recruiter/icons/ranking.svg';
import freeTextIcon from '../../../../../../assets/recruiter/icons/free_text.svg';
import codingIcon from '../../../../../../assets/recruiter/icons/coding.svg';
import { QuestionOutlineItem } from './QuestionOutlineItem';

const TYPE_ICON = {
  mcq: mcqIcon,
  ranking: rankingIcon,
  free_text: freeTextIcon,
  coding: codingIcon,
};

function getPointValue(item) {
  if (Number.isFinite(Number(item.points))) return Number(item.points);
  return item.type === 'coding' ? 5 : 0;
}

function pluralize(count, singular) {
  return `${count} ${singular}${count === 1 ? '' : 's'}`;
}

export function SectionOutlineItem({ section, activeQuestion }) {
  const { dispatch, ACTIONS } = useAssessmentBuilder();
  const cfg = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG.mcq;
  const icon = TYPE_ICON[section.type] || TYPE_ICON.mcq;
  const items = section.items || [];
  const questionCount = items.length;
  const totalPoints = items.reduce((sum, item) => sum + getPointValue(item), 0);
  const timerMinutes = section.timer_minutes ?? cfg.defaultTimerMinutes;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.56 : 1,
  };

  const handleToggle = (event) => {
    event.stopPropagation();
    dispatch({ type: ACTIONS.TOGGLE_SECTION_EXPANDED, payload: { sectionId: section.id } });
  };

  const handleSectionClick = () => {
    const firstItem = items[0];
    dispatch({
      type: ACTIONS.SET_ACTIVE,
      payload: { sectionId: section.id, questionId: firstItem?.id ?? null },
    });
  };

  const handleSectionKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    handleSectionClick();
  };

  const handleAddQuestion = (event) => {
    event.stopPropagation();
    dispatch({
      type: ACTIONS.OPEN_ADD_QUESTION_DRAWER,
      payload: { sectionId: section.id, sectionType: section.type },
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      <div
        role="button"
        tabIndex={0}
        onClick={handleSectionClick}
        onKeyDown={handleSectionKeyDown}
        className="grid w-full grid-cols-[26px_minmax(0,1fr)_48px] items-start gap-[8px] text-left"
      >
        <img src={icon} alt="" className="mt-[1px] h-[26px] w-[26px] flex-shrink-0" />

        <span className="block min-w-0 pt-[1px]">
          <span className="block truncate text-[14px] font-bold leading-[17px] text-text-primary">
            {section.name || cfg.label}
          </span>
          <span className="mt-[2px] block truncate text-[12px] font-medium leading-[15px] text-text-faint">
            {pluralize(questionCount, 'question')} | {totalPoints} points | {timerMinutes} min
          </span>
        </span>

        <span className="flex items-center justify-end gap-[9px] pt-[5px] text-[var(--color-assessment-step-active)]">
          <span
            role="button"
            tabIndex={0}
            aria-label={section.expanded ? 'Collapse section' : 'Expand section'}
            onClick={handleToggle}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') handleToggle(event);
            }}
            className="rounded-button transition-opacity hover:opacity-70"
          >
            <ChevronDown
              className={`h-[16px] w-[16px] transition-transform ${section.expanded ? '' : '-rotate-90'}`}
              strokeWidth={2.2}
            />
          </span>
          <span
            {...attributes}
            {...listeners}
            role="button"
            tabIndex={0}
            aria-label="Reorder section"
            onClick={event => event.stopPropagation()}
            className="cursor-grab rounded-button transition-opacity hover:opacity-70 active:cursor-grabbing"
          >
            <Menu className="h-[16px] w-[16px]" strokeWidth={2.2} />
          </span>
        </span>
      </div>

      {section.expanded && (
        <div className="ml-[34px] mt-[10px] border-l border-border-subtle pl-[9px]">
          <div className="space-y-[10px]">
            {items.map((item, index) => (
              <QuestionOutlineItem
                key={item.id}
                sectionId={section.id}
                item={item}
                index={index}
                isActive={activeQuestion === item.id}
              />
            ))}
          </div>
          {section.type !== 'coding' && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="mt-[14px] flex h-[30px] items-center gap-[6px] rounded-button border border-brand px-[10px] text-[12px] font-medium leading-none text-brand transition-colors hover:bg-brand-tint-light"
            >
              <Plus className="h-[13px] w-[13px]" strokeWidth={2} />
              Add another question
            </button>
          )}
        </div>
      )}
    </div>
  );
}

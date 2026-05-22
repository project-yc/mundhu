import { IconChevronRight, IconClock, IconPlus } from '@tabler/icons-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SECTION_TYPE_CONFIG } from '../../constants/sectionTypeConfig';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';
import { makeMcqQuestion, makeFreeTextQuestion, makeRankingQuestion } from '../../context/assessmentBuilderReducer';
import { QuestionOutlineItem } from './QuestionOutlineItem';

/**
 * A single section row in the left panel outline, with collapsible question list.
 * Implements dnd-kit sortable handle.
 */
export function SectionOutlineItem({ section, activeQuestion }) {
  const { dispatch, ACTIONS } = useAssessmentBuilder();
  const cfg = SECTION_TYPE_CONFIG[section.type] || SECTION_TYPE_CONFIG.mcq;

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
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggle = () => {
    dispatch({ type: ACTIONS.TOGGLE_SECTION_EXPANDED, payload: { sectionId: section.id } });
  };

  const handleSectionClick = () => {
    if (!section.expanded) {
      dispatch({ type: ACTIONS.TOGGLE_SECTION_EXPANDED, payload: { sectionId: section.id } });
    }
    // Select first question if any
    const firstItem = section.items[0];
    if (firstItem) {
      dispatch({ type: ACTIONS.SET_ACTIVE, payload: { sectionId: section.id, questionId: firstItem.id } });
    } else {
      dispatch({ type: ACTIONS.SET_ACTIVE, payload: { sectionId: section.id, questionId: null } });
    }
  };

  const handleAddQuestion = (e) => {
    e.stopPropagation();
    let newQuestion;
    if (section.type === 'mcq') {
      newQuestion = makeMcqQuestion();
    } else if (section.type === 'free_text') {
      newQuestion = makeFreeTextQuestion();
    } else if (section.type === 'ranking') {
      newQuestion = makeRankingQuestion();
    } else {
      return; // coding sections can't add more questions
    }
    dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: section.id, question: newQuestion } });
  };

  return (
    <div ref={setNodeRef} style={style} className="select-none">
      {/* Section header row */}
      <button
        onClick={handleSectionClick}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors group"
      >
        {/* Drag handle */}
        <span
          {...attributes}
          {...listeners}
          onClick={e => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary p-0.5 -ml-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
            <circle cx="3" cy="3" r="1.5" /><circle cx="7" cy="3" r="1.5" />
            <circle cx="3" cy="7" r="1.5" /><circle cx="7" cy="7" r="1.5" />
            <circle cx="3" cy="11" r="1.5" /><circle cx="7" cy="11" r="1.5" />
          </svg>
        </span>

        {/* Chevron */}
        <span
          onClick={e => { e.stopPropagation(); handleToggle(); }}
          className="text-text-muted"
        >
          <IconChevronRight
            size={13}
            className={`transition-transform duration-150 ${section.expanded ? 'rotate-90' : ''}`}
          />
        </span>

        {/* Colored dot */}
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

        {/* Section name */}
        <span className="flex-1 text-[12px] font-semibold text-text-primary truncate text-left min-w-0">
          {section.name}
        </span>

        {/* Timer */}
        {section.timer_minutes && (
          <span className="flex items-center gap-0.5 text-[11px] text-text-muted flex-shrink-0">
            <IconClock size={11} />
            {section.timer_minutes}m
          </span>
        )}
      </button>

      {/* Expanded question list */}
      {section.expanded && (
        <div className="ml-6 space-y-0.5 mb-1">
          {section.items.map((item, idx) => (
            <QuestionOutlineItem
              key={item.id}
              sectionId={section.id}
              item={item}
              index={idx}
              isActive={activeQuestion === item.id}
            />
          ))}
          {/* Add question button (not for coding sections) */}
          {section.type !== 'coding' && (
            <button
              onClick={handleAddQuestion}
              className="flex items-center gap-1.5 w-full px-3 py-1.5 text-[11px] text-text-muted hover:text-brand hover:bg-brand-tint-light rounded-lg transition-colors"
            >
              <IconPlus size={11} />
              Add question
            </button>
          )}
        </div>
      )}
    </div>
  );
}

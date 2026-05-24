import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { IconPlus, IconClock, IconCoin } from '@tabler/icons-react';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';
import { SECTION_TYPE_CONFIG } from '../../constants/sectionTypeConfig';
import { SectionOutlineItem } from './SectionOutlineItem';

export function LeftPanel() {
  const { state, dispatch, ACTIONS } = useAssessmentBuilder();
  const { sections, name, duration_minutes, activeQuestion } = state;
  const [savedAsDraft, setSavedAsDraft] = useState(false);

  const handleSaveDraft = () => {
    // Persists local builder state to localStorage so the user can navigate away
    // and resume. Full server-side persistence happens in publishAssessmentFlow.
    localStorage.setItem('assessmentBuilderDraft', JSON.stringify(state));
    setSavedAsDraft(true);
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  // Stats for footer
  const stats = useMemo(() => {
    let totalQ = 0, totalPts = 0, totalMin = 0;
    sections.forEach(s => {
      totalMin += s.timer_minutes || 0;
      s.items.forEach(item => {
        totalQ++;
        totalPts += item.points || 0;
      });
    });
    return { totalQ, totalPts, totalMin };
  }, [sections]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex(s => s.id === active.id);
    const newIndex = sections.findIndex(s => s.id === over.id);
    dispatch({
      type: ACTIONS.REORDER_SECTIONS,
      payload: { sections: arrayMove(sections, oldIndex, newIndex) },
    });
  }

  const handleAddSection = () => {
    dispatch({ type: ACTIONS.SET_ACTIVE, payload: { sectionId: '__add_section__', questionId: null } });
  };

  return (
    <div className="w-[260px] flex-shrink-0 flex flex-col border-r border-border-default bg-surface overflow-hidden">

      {/* Header — pinned */}
      <div className="px-4 pt-4 pb-3 border-b border-border-default flex-shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-text-muted mb-1.5">Assessment</p>
        <input
          value={name}
          onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { name: e.target.value } })}
          className="w-full bg-transparent border-none outline-none text-[14px] font-semibold text-text-primary placeholder:text-text-muted"
          placeholder="Untitled assessment"
        />
        {/* Meta pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {duration_minutes && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-muted border border-border-default rounded-md text-[11px] text-text-secondary">
              <IconClock size={10} />
              {duration_minutes}m cap
            </span>
          )}
        </div>
      </div>

      {/* Section list — scrollable */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            {sections.map(section => (
              <SectionOutlineItem
                key={section.id}
                section={section}
                activeQuestion={activeQuestion}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Add section */}
        <button
          onClick={handleAddSection}
          className="flex items-center gap-2 w-full px-3 py-2 mt-1 text-[12px] font-semibold text-text-muted hover:text-brand hover:bg-brand-tint-light rounded-lg border border-dashed border-border-default hover:border-brand transition-all duration-150"
        >
          <IconPlus size={13} />
          Add section
        </button>
      </div>

      {/* Footer — pinned */}
      <div className="px-4 py-3 border-t border-border-default flex-shrink-0">
        <p className="text-[11px] text-text-muted leading-relaxed mb-3">
          {stats.totalQ} question{stats.totalQ !== 1 ? 's' : ''} · {stats.totalPts} pts · {stats.totalMin} min across {sections.length} section{sections.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={handleSaveDraft}
          disabled={sections.length === 0}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-border-strong hover:bg-surface-muted text-text-primary text-[12px] font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {savedAsDraft ? '✓ Draft saved' : 'Save as draft'}
        </button>
        {savedAsDraft && (
          <button
            onClick={() => dispatch({ type: ACTIONS.SET_STEP, payload: 3 })}
            className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-brand hover:bg-brand-hover text-on-brand text-[12px] font-bold rounded-lg transition-colors"
          >
            Review &amp; Publish
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}

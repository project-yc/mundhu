import { IconWriting } from '@tabler/icons-react';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';
import { QuestionFooter } from '../QuestionFooter';
import { SectionConfigCard } from '../SectionConfigCard';

export function FreeTextEditor({ sectionId, item, allItems, itemIndex }) {
  const { dispatch, ACTIONS, state } = useAssessmentBuilder();
  const section = state.sections.find(s => s.id === sectionId);

  const updateItem = (updates) => {
    dispatch({ type: ACTIONS.UPDATE_QUESTION, payload: { sectionId, questionId: item.id, updates } });
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-6 space-y-4">
      {/* Section config */}
      <SectionConfigCard timerMinutes={section?.timer_minutes} />

      {/* Card */}
      <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
        {/* Card header */}
        <div className="px-4 py-3 border-b border-border-default">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-widest">
            <IconWriting size={13} /> Free text · Q{itemIndex + 1} of {allItems.length}
          </span>
        </div>

        {/* Body */}
        <div className="px-4 pt-3 space-y-3">
          <textarea
            value={item.prompt}
            onChange={e => updateItem({ prompt: e.target.value })}
            placeholder="Type your question here…"
            rows={4}
            className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 resize-none"
          />
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Word limit
              </label>
              <input
                type="number"
                min={1}
                value={item.word_limit ?? ''}
                onChange={e => updateItem({ word_limit: e.target.value ? Number(e.target.value) : null })}
                placeholder="No limit"
                className="w-full px-3.5 py-2 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1">
                Grading hints
              </label>
              <input
                type="text"
                value={item.grading_hints ?? ''}
                onChange={e => updateItem({ grading_hints: e.target.value })}
                placeholder="e.g. mention O(n log n)…"
                className="w-full px-3.5 py-2 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <QuestionFooter
          points={item.points}
          onPointsChange={v => updateItem({ points: v })}
          onDuplicate={() => {/* TODO */}}
          onDelete={() => dispatch({ type: ACTIONS.REMOVE_QUESTION, payload: { sectionId, questionId: item.id } })}
        />
      </div>
    </div>
  );
}

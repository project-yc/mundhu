import { useState } from 'react';
import { IconCheckbox, IconPlus, IconTrash, IconCheck, IconArrowsShuffle, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';
import { QuestionFooter } from '../QuestionFooter';
import { SectionConfigCard } from '../SectionConfigCard';
import {
  publishMcqQuestion,
  createMcqQuestion,
  updateMcqQuestion,
} from '../../api/assessmentBuilderApi';

function OptionRow({ option, questionLocked, onToggle, onTextChange, onDelete }) {
  return (
    <div className="flex items-center gap-2 group">
      <button
        onClick={() => onToggle(option.id)}
        disabled={questionLocked}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          option.is_correct
            ? 'bg-success border-success text-white'
            : 'border-border-default hover:border-success'
        } disabled:opacity-50`}
      >
        {option.is_correct && <IconCheck size={11} />}
      </button>
      <input
        value={option.text}
        onChange={e => onTextChange(option.id, e.target.value)}
        disabled={questionLocked}
        placeholder="Option text…"
        className="flex-1 px-3 py-2 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 disabled:opacity-60"
      />
      {!questionLocked && (
        <button
          onClick={() => onDelete(option.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted hover:text-error hover:bg-error-bg rounded transition-all"
        >
          <IconTrash size={12} />
        </button>
      )}
    </div>
  );
}

export function McqEditor({ sectionId, item, allItems, itemIndex }) {
  const { dispatch, ACTIONS, state } = useAssessmentBuilder();
  const section = state.sections.find(s => s.id === sectionId);

  const updateItem = (updates) => {
    dispatch({ type: ACTIONS.UPDATE_QUESTION, payload: { sectionId, questionId: item.id, updates } });
  };

  const updateSection = (updates) => {
    dispatch({ type: ACTIONS.UPDATE_SECTION, payload: { sectionId, updates } });
  };

  const handleOptionToggle = (optionId) => {
    const updated = item.options.map(o => ({
      ...o,
      is_correct: item.selection_mode === 'single'
        ? o.id === optionId
        : o.id === optionId ? !o.is_correct : o.is_correct,
    }));
    updateItem({ options: updated });
  };

  const handleOptionText = (optionId, text) => {
    const updated = item.options.map(o => o.id === optionId ? { ...o, text } : o);
    updateItem({ options: updated });
  };

  const handleDeleteOption = (optionId) => {
    const updated = item.options.filter(o => o.id !== optionId);
    updateItem({ options: updated });
  };

  const handleAddOption = () => {
    const newOpt = { id: crypto.randomUUID(), text: '', is_correct: false };
    updateItem({ options: [...item.options, newOpt] });
  };

  const goToQuestion = (idx) => {
    const q = allItems[idx];
    if (q) dispatch({ type: ACTIONS.SET_ACTIVE, payload: { sectionId, questionId: q.id } });
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-6 space-y-4">
      {/* Section config */}
      <SectionConfigCard
        timerMinutes={section?.timer_minutes}
        onTimerChange={v => updateSection({ timer_minutes: v })}
      />

      {/* Card */}
      <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border-default">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-text-muted uppercase tracking-widest">
            <IconCheckbox size={13} /> MCQ · Q{itemIndex + 1} of {allItems.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => goToQuestion(itemIndex - 1)} disabled={itemIndex === 0} className="p-1 text-text-muted hover:text-text-primary rounded disabled:opacity-30">
              <IconChevronLeft size={15} />
            </button>
            <button onClick={() => goToQuestion(itemIndex + 1)} disabled={itemIndex === allItems.length - 1} className="p-1 text-text-muted hover:text-text-primary rounded disabled:opacity-30">
              <IconChevronRight size={15} />
            </button>
          </div>
        </div>

        {/* Selection mode */}
        <div className="px-4 pt-3">
          <div className="flex gap-2 mb-3">
            {['single', 'multi'].map(mode => (
              <button
                key={mode}
                onClick={() => updateItem({ selection_mode: mode })}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  item.selection_mode === mode
                    ? 'bg-brand text-on-brand'
                    : 'bg-surface-muted text-text-secondary hover:text-text-primary border border-border-default'
                }`}
              >
                {mode === 'single' ? 'Single answer' : 'Multi-select'}
              </button>
            ))}
          </div>

          {/* Prompt */}
          <textarea
            value={item.prompt}
            onChange={e => updateItem({ prompt: e.target.value })}
            placeholder="Type your question here…"
            rows={3}
            className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 resize-none"
          />

          {/* Options */}
          <div className="mt-3 space-y-2">
            {item.options.map(option => (
              <OptionRow
                key={option.id}
                option={option}
                questionLocked={false}
                onToggle={handleOptionToggle}
                onTextChange={handleOptionText}
                onDelete={handleDeleteOption}
              />
            ))}
            <button
              onClick={handleAddOption}
              className="flex items-center gap-1.5 text-[12px] text-text-muted hover:text-brand transition-colors pt-1"
            >
              <IconPlus size={12} /> Add option
            </button>
          </div>
        </div>

        {/* Footer */}
        <QuestionFooter
          points={item.points}
          onPointsChange={v => updateItem({ points: v })}
          onDuplicate={() => {/* TODO: duplicate */}}
          onDelete={() => dispatch({ type: ACTIONS.REMOVE_QUESTION, payload: { sectionId, questionId: item.id } })}
        >
          <label className="flex items-center gap-1.5 text-[12px] text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={item.shuffle_options}
              onChange={e => updateItem({ shuffle_options: e.target.checked })}
              className="rounded"
            />
            <IconArrowsShuffle size={12} />
            Shuffle
          </label>
        </QuestionFooter>
      </div>
    </div>
  );
}

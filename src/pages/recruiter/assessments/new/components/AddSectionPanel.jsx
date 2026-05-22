import { useState } from 'react';
import { IconTerminal2, IconCheckbox, IconWriting, IconSortAscending, IconArrowRight } from '@tabler/icons-react';
import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { SECTION_TYPE_CONFIG } from '../constants/sectionTypeConfig';

const TYPES = [
  { type: 'coding',    Icon: IconTerminal2,      label: 'Coding',    desc: 'Attach a hands-on coding task' },
  { type: 'mcq',       Icon: IconCheckbox,       label: 'MCQ',       desc: 'Multiple choice questions' },
  { type: 'free_text', Icon: IconWriting,        label: 'Free text', desc: 'Open-ended written answers' },
  { type: 'ranking',   Icon: IconSortAscending,  label: 'Ranking',   desc: 'Drag-to-rank items' },
];

const AI_OPTIONS = [
  { value: '', label: 'Inherit from assessment' },
  { value: 'full', label: 'Full agent' },
  { value: 'chat', label: 'Chat only' },
  { value: 'none', label: 'Disabled' },
];

export function AddSectionPanel() {
  const { dispatch, ACTIONS, state } = useAssessmentBuilder();

  const [selectedType, setSelectedType] = useState('mcq');
  const [sectionName, setSectionName] = useState('');
  const [timerMinutes, setTimerMinutes] = useState('');
  const [aiLevel, setAiLevel] = useState('');

  const handleAdd = () => {
    if (!sectionName.trim()) return;
    dispatch({
      type: ACTIONS.ADD_SECTION,
      payload: {
        name: sectionName.trim(),
        type: selectedType,
        timer_minutes: timerMinutes ? Number(timerMinutes) : null,
        ai_level_override: aiLevel || null,
      },
    });
    // Reset
    setSectionName('');
    setTimerMinutes('');
    setAiLevel('');
  };

  return (
    <div className="max-w-[640px] mx-auto px-6 py-8">
      <h2 className="text-[17px] font-bold text-text-primary mb-1">Add a section</h2>
      <p className="text-[13px] text-text-secondary mb-6">
        Pick a question type. You can mix types within the same assessment.
      </p>

      {/* Type picker grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {TYPES.map(({ type, Icon, label }) => {
          const cfg = SECTION_TYPE_CONFIG[type];
          const active = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-[1.5px] transition-all duration-150 ${
                active
                  ? 'border-brand bg-brand/5 shadow-sm'
                  : 'border-border-default bg-surface hover:border-border-strong hover:bg-surface-muted'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cfg.badge}`}>
                <Icon size={18} />
              </div>
              <span className={`text-[12px] font-semibold ${active ? 'text-brand-deep' : 'text-text-primary'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section settings */}
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
            Section name <span className="text-error normal-case">*</span>
          </label>
          <input
            value={sectionName}
            onChange={e => setSectionName(e.target.value)}
            placeholder={`${SECTION_TYPE_CONFIG[selectedType]?.label || 'Section'} name`}
            className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              Section timer (min)
            </label>
            <input
              type="number"
              min={1}
              max={480}
              value={timerMinutes}
              onChange={e => setTimerMinutes(e.target.value)}
              placeholder={String(SECTION_TYPE_CONFIG[selectedType]?.defaultTimerMinutes ?? '')}
              className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">
              AI level
            </label>
            <select
              value={aiLevel}
              onChange={e => setAiLevel(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
            >
              {AI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleAdd}
          disabled={!sectionName.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Add section
          <IconArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

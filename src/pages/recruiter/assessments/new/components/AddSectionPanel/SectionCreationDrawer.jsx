import {
  Check,
  ChevronDown,
  FileText,
  GripVertical,
  HelpCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  ADAPTIVE_PRESET_OPTIONS,
  ADAPTIVE_TIMER_OPTIONS,
  AI_LEVEL_OPTIONS,
  CODING_RUBRIC_DIMENSIONS,
  DEFAULT_CODING_TASK_INDEX,
  DIFFICULTY_OPTIONS,
  DRAWER_TYPE_LABELS,
  FILTER_ROLES,
  LANGUAGE_OPTIONS,
  POINT_OPTIONS,
  ROLE_FOCUS_AREAS,
  TIMER_OPTIONS,
  UNIVERSAL_FOCUS_AREAS,
  WORD_LIMIT_OPTIONS,
  formatFocusAreaLabel,
} from './constants';

function DrawerFooter({ onCancel, onSubmit, submitLabel = 'Add' }) {
  return (
    <div className="flex flex-shrink-0 justify-end gap-[10px] px-[28px] pb-[28px] pt-[10px]">
      <button
        type="button"
        onClick={onCancel}
        className="h-[42px] min-w-[96px] rounded-[8px] border border-border-default bg-surface px-[24px] text-[15px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="h-[42px] min-w-[82px] rounded-[8px] bg-[var(--color-assessment-cta)] px-[24px] text-[15px] font-bold text-[var(--color-assessment-cta-text)] shadow-card transition-colors hover:bg-[var(--color-assessment-cta-hover)]"
      >
        {submitLabel}
      </button>
    </div>
  );
}

function QuestionModeTabs() {
  return (
    <div className="grid h-[38px] grid-cols-2 rounded-full border border-border-default bg-surface-muted p-[3px]">
      <button type="button" className="rounded-full text-[14px] font-medium text-text-secondary">
        Upload file
      </button>
      <button type="button" className="rounded-full border border-border-default bg-surface text-[14px] font-semibold text-text-primary shadow-card">
        Enter manually
      </button>
    </div>
  );
}

function QuestionIntro() {
  return (
    <div className="mt-[24px]">
      <h3 className="text-[21px] font-bold leading-none text-text-primary">Questions &amp; Answers</h3>
      <p className="mt-[8px] text-[14px] leading-[20px] text-text-secondary">
        Add a Multiple Choice Question. You can mix types within the same assessment.
      </p>
    </div>
  );
}

function PointsSelect({ value, onChange, label = 'Total points' }) {
  return (
    <div>
      <label className="block text-[15px] font-semibold leading-none text-text-primary">{label}</label>
      <div className="relative mt-[10px]">
        <select
          value={value}
          onChange={event => onChange(Number(event.target.value))}
          className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[15px] font-medium text-text-primary outline-none"
        >
          {POINT_OPTIONS.map(optionValue => (
            <option key={optionValue} value={optionValue}>{String(optionValue).padStart(2, '0')}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
      </div>
    </div>
  );
}

function SectionDetailsStep({ drawerType, form, onCancel, onContinue }) {
  return (
    <>
      <div className="flex h-[56px] flex-shrink-0 items-center border-b border-border-subtle px-[22px]">
        <h2 className="text-[15px] font-medium leading-none text-text-secondary">
          Create <span className="font-bold text-text-primary">{DRAWER_TYPE_LABELS[drawerType]}</span> section
        </h2>
      </div>

      <div className="flex-1 px-[22px] pt-[30px]">
        <label className="block text-[15px] font-semibold leading-none text-text-primary">
          Section name
        </label>
        <div className="mt-[10px] flex h-[42px] items-center rounded-[8px] border border-border-default bg-surface px-[12px]">
          <FileText className="h-[16px] w-[16px] flex-shrink-0 text-text-muted" strokeWidth={1.8} />
          <input
            value={form.sectionName}
            onChange={event => form.setSectionName(event.target.value)}
            className="ml-[11px] min-w-0 flex-1 bg-transparent text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
            placeholder="e.g. Backend Engineer"
          />
        </div>

        {/* Adaptive asks for duration on the next step, where it also drives the
            question budget — asking twice would let the two disagree. */}
        {drawerType !== 'adaptive' && (
          <>
            <label className="mt-[16px] block text-[15px] font-semibold leading-none text-text-primary">
              Section Timer
            </label>
            <div className="relative mt-[10px]">
              <select
                value={form.sectionTimer}
                onChange={event => form.setSectionTimer(Number(event.target.value))}
                className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[15px] font-medium text-text-primary outline-none"
              >
                {TIMER_OPTIONS.map(minutes => (
                  <option key={minutes} value={minutes}>{minutes}m</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
            </div>
          </>
        )}

        {drawerType === 'coding' && (
          <>
            <label className="mt-[16px] block text-[15px] font-semibold leading-none text-text-primary">
              AI Level
            </label>
            <div className="relative mt-[10px]">
              <select
                value={form.aiLevel}
                onChange={event => form.setAiLevel(event.target.value)}
                className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[15px] font-medium text-text-primary outline-none"
              >
                {AI_LEVEL_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
            </div>

            <div className="mt-[16px]">
              <h3 className="text-[15px] font-semibold leading-none text-text-primary">
                Rubric weighting
              </h3>
              <p className="mt-[5px] text-[13px] leading-[17px] text-[#78879a]">
                How much each dimension counts toward the section score. Leave them equal
                to weight all four the same.
              </p>
            </div>

            <div className="mt-[9px] space-y-[4px]">
              {CODING_RUBRIC_DIMENSIONS.map(({ key, label }) => (
                <div key={key} className="flex h-[40px] items-center rounded-[7px] bg-[#f7f7f7] pl-[13px] pr-[5px]">
                  <span className="text-[15px] font-semibold leading-none text-text-primary">{label}</span>
                  <HelpCircle className="ml-[7px] h-[16px] w-[16px] flex-shrink-0 fill-[#ed7f1a] text-surface" strokeWidth={2.5} />
                  <div className="relative ml-auto">
                    <select
                      value={form.rubricPoints[key]}
                      onChange={event => form.setRubricPoints(current => ({ ...current, [key]: Number(event.target.value) }))}
                      className="h-[32px] w-[72px] appearance-none rounded-[8px] border border-border-default bg-surface pl-[10px] pr-[24px] text-[14px] font-semibold text-text-primary outline-none"
                    >
                      {[1, 2, 3, 4, 5].map(value => (
                        <option key={value} value={value}>{value}×</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-[8px] top-1/2 h-[14px] w-[14px] -translate-y-1/2 text-text-primary" strokeWidth={2} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-shrink-0 justify-end gap-[10px] px-[28px] pb-[28px]">
        <button
          type="button"
          onClick={onCancel}
          className="h-[42px] min-w-[96px] rounded-[8px] border border-border-default bg-surface px-[24px] text-[15px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="h-[42px] min-w-[112px] rounded-[8px] bg-[var(--color-assessment-cta)] px-[26px] text-[15px] font-bold text-[var(--color-assessment-cta-text)] shadow-card transition-colors hover:bg-[var(--color-assessment-cta-hover)]"
        >
          Continue
        </button>
      </div>
    </>
  );
}

function CodingQuestionForm({ form, onCancel, onSubmit }) {
  return (
    <>
      <div className="flex h-[56px] flex-shrink-0 items-center border-b border-border-subtle px-[22px]">
        <h2 className="text-[15px] font-medium leading-none text-text-secondary">
          Create <span className="font-bold text-text-primary">coding</span> section
        </h2>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto px-[22px] pt-[24px]">
        <div>
          <h3 className="text-[21px] font-bold leading-none text-text-primary">Questions &amp; Answers</h3>
          <p className="mt-[8px] text-[14px] leading-[20px] text-text-secondary">
            Add a Multiple Choice Question. You can mix types within the same assessment.
          </p>
        </div>

        <div className="mt-[22px] flex items-center gap-[8px]">
          <div className="relative flex h-[42px] flex-1 items-center rounded-[8px] border border-border-default bg-surface px-[12px]">
            <Search className="h-[16px] w-[16px] flex-shrink-0 text-text-primary" strokeWidth={1.9} />
            <input
              value={form.taskSearch}
              onChange={event => form.setTaskSearch(event.target.value)}
              className="ml-[10px] min-w-0 flex-1 bg-transparent text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
              placeholder="Search for library tasks..."
            />
            {form.taskSearch && (
              <button
                type="button"
                onClick={() => form.setTaskSearch('')}
                className="ml-[8px] flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-surface-muted text-text-primary"
                aria-label="Clear task search"
              >
                <X className="h-[15px] w-[15px]" strokeWidth={2.2} />
              </button>
            )}
          </div>
          <button
            type="button"
            className="h-[42px] flex-shrink-0 rounded-[8px] bg-[#11172f] px-[16px] text-[15px] font-semibold text-surface transition-opacity hover:opacity-90"
          >
            Create custom task
          </button>
        </div>

        <div className="mt-[8px] flex items-center">
          <div className="flex items-center gap-[8px]">
            {['All', 'Suggested', 'Trending tasks'].map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`h-[29px] rounded-[8px] px-[11px] text-[15px] font-semibold leading-none ${
                  index === 0 ? 'bg-surface-muted text-text-primary' : 'text-text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-[20px]">
            <button
              type="button"
              onClick={() => form.setCodingFilterOpen(value => !value)}
              className="flex items-center gap-[5px] text-[15px] font-semibold leading-none text-text-secondary"
            >
              Filter
              <SlidersHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
            <button
              type="button"
              className="flex items-center gap-[5px] text-[15px] font-semibold leading-none text-text-secondary"
            >
              Sort
              <SlidersHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="mt-[18px] space-y-[8px]">
          {form.libraryLoading && (
            <p className="py-[8px] text-[13px] text-text-muted">Loading library...</p>
          )}
          {form.libraryError && (
            <p className="py-[8px] text-[13px] text-error">{form.libraryError}</p>
          )}
          {!form.libraryLoading && form.codingTasks.map((task, index) => {
            const taskTitle = task.title || task.name || 'Untitled task';
            const language = task.language || task.primary_language || task.tags?.[0] || 'Python';
            const tags = task.tags?.filter(tag => tag !== language).slice(0, 2) || [];
            const selected = form.selectedTask?.id === task.id
              || (!form.selectedTask && index === DEFAULT_CODING_TASK_INDEX);
            return (
              <button
                key={task.id}
                type="button"
                onClick={() => form.setSelectedTask(task)}
                className={`grid h-[48px] w-full grid-cols-[44px_minmax(0,1fr)_106px] items-center gap-[10px] rounded-[8px] px-[8px] text-left transition-colors ${
                  selected ? 'bg-[#f7f7f7]' : 'bg-transparent hover:bg-surface-muted'
                }`}
              >
                <span className={`h-[34px] w-[34px] rounded-[7px] ${selected ? 'bg-surface' : 'bg-[#ededed]'}`} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold leading-[18px] text-text-primary">{taskTitle}</span>
                  <span className="mt-[3px] block truncate text-[13px] font-medium leading-none text-[#52657d]">
                    {[language, ...tags].filter(Boolean).join('  -  ')}
                  </span>
                </span>
                {selected && (
                  <span className="ml-auto flex h-[34px] w-[106px] items-center justify-center rounded-[8px] border border-border-default bg-surface text-[14px] font-semibold text-text-primary">
                    View details
                  </span>
                )}
              </button>
            );
          })}
          {!form.libraryLoading && form.codingTasks.length === 0 && (
            <p className="py-[8px] text-center text-[13px] text-text-muted">No tasks match your filters.</p>
          )}
        </div>

        <label className="mt-[22px] block text-[15px] font-semibold leading-none text-text-primary">
          Total Points
        </label>
        <div className="relative mt-[10px]">
          <select
            value={form.points}
            onChange={event => form.setPoints(Number(event.target.value))}
            className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[15px] font-medium text-text-primary outline-none"
          >
            {POINT_OPTIONS.map(value => (
              <option key={value} value={value}>{String(value).padStart(2, '0')}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
        </div>

        {form.codingFilterOpen && (
          <div className="absolute right-[18px] top-[132px] z-20 w-[320px] rounded-[12px] border border-border-default bg-surface px-[14px] pb-[14px] pt-[14px] shadow-modal">
            <div className="flex items-center justify-between border-b border-border-subtle pb-[12px]">
              <h4 className="text-[14px] font-medium leading-none text-text-primary">Filters</h4>
              <button
                type="button"
                onClick={() => form.setCodingFilterOpen(false)}
                className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-surface-muted text-text-primary"
                aria-label="Close filters"
              >
                <X className="h-[16px] w-[16px]" strokeWidth={2.2} />
              </button>
            </div>

            <div className="pt-[18px]">
              <p className="text-[14px] font-medium leading-none text-text-primary">Select the role</p>
              <div className="mt-[11px] flex flex-wrap gap-x-[7px] gap-y-[8px]">
                {FILTER_ROLES.map((role, index) => {
                  const active = form.codingFilters.role === role && index === 0;
                  return (
                    <button
                      key={`${role}-${index}`}
                      type="button"
                      onClick={() => form.setCodingFilters(current => ({ ...current, role }))}
                      className="flex h-[25px] items-center rounded-full border border-border-default bg-surface pl-[4px] pr-[10px] text-[13px] font-medium text-text-secondary"
                    >
                      <span className={`mr-[6px] h-[16px] w-[16px] rounded-full border ${active ? 'border-[5px] border-text-primary' : 'border-border-default'}`} />
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-[22px]">
              <p className="text-[14px] font-medium leading-none text-text-primary">Programming language</p>
              <div className="relative mt-[10px]">
                <select
                  value={form.codingFilters.language}
                  onChange={event => form.setCodingFilters(current => ({ ...current, language: event.target.value }))}
                  className="h-[35px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[11px] pr-[32px] text-[13px] font-medium text-text-primary outline-none"
                >
                  {LANGUAGE_OPTIONS.map(language => (
                    <option key={language || 'all'} value={language}>{language || 'e.g. python'}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-[12px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
              </div>
              <div className="mt-[9px] flex flex-wrap gap-[6px]">
                {['Coding assessment', 'Resume'].map(label => (
                  <span key={label} className="flex h-[28px] items-center rounded-full border border-[#8791ff] px-[12px] text-[13px] font-medium text-[#2236df]">
                    {label}
                    <X className="ml-[6px] h-[13px] w-[13px]" strokeWidth={2} />
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-[20px]">
              <p className="text-[14px] font-medium leading-none text-text-primary">Difficulty level</p>
              <div className="mt-[10px] grid h-[32px] grid-cols-4 rounded-full bg-surface-muted p-[3px]">
                {DIFFICULTY_OPTIONS.map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => form.setCodingFilters(current => ({ ...current, difficulty: option }))}
                    className={`rounded-full text-[13px] font-medium capitalize ${
                      form.codingFilters.difficulty === option
                        ? 'border border-border-default bg-surface text-text-primary shadow-card'
                        : 'text-text-secondary'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DrawerFooter onCancel={onCancel} onSubmit={onSubmit} />
    </>
  );
}

function FreeTextQuestionForm({ form, onCancel, onSubmit }) {
  return (
    <>
      <div className="flex h-[56px] flex-shrink-0 items-center border-b border-border-subtle px-[22px]">
        <h2 className="text-[15px] font-medium leading-none text-text-secondary">
          Create your <span className="font-bold text-text-primary">Free text</span> Question
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-[22px]">
        <QuestionModeTabs />
        <QuestionIntro />

        <label className="mt-[24px] block text-[15px] font-semibold leading-none text-text-primary">
          Ask your question
        </label>
        <input
          value={form.questionPrompt}
          onChange={event => form.setQuestionPrompt(event.target.value)}
          className="mt-[10px] h-[42px] w-full rounded-[8px] border border-border-default bg-surface px-[12px] text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
          placeholder="Type your question"
        />

        <label className="mt-[20px] block text-[15px] font-semibold leading-none text-text-primary">
          Answer
        </label>
        <textarea
          value={form.freeTextAnswer}
          onChange={event => form.setFreeTextAnswer(event.target.value)}
          className="mt-[10px] h-[86px] w-full resize-none rounded-[8px] border border-border-default bg-surface px-[12px] py-[10px] text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
          placeholder="Type answer here..."
        />

        <label className="mt-[20px] block text-[15px] font-semibold leading-none text-text-primary">
          Grading hints
        </label>
        <input
          value={form.gradingHints}
          onChange={event => form.setGradingHints(event.target.value)}
          className="mt-[10px] h-[42px] w-full rounded-[8px] border border-border-default bg-surface px-[12px] text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
          placeholder="eg. O (n log n)"
        />

        <div className="mt-[20px] grid grid-cols-2 gap-[22px]">
          <PointsSelect value={form.itemTimer} onChange={form.setItemTimer} label="Timer" />
          <PointsSelect value={form.points} onChange={form.setPoints} />
        </div>

        <label className="mt-[20px] block text-[15px] font-semibold leading-none text-text-primary">
          Word Limit
        </label>
        <div className="relative mt-[10px]">
          <select
            value={form.wordLimit}
            onChange={event => form.setWordLimit(Number(event.target.value))}
            className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[15px] font-medium text-text-primary outline-none"
          >
            {WORD_LIMIT_OPTIONS.map(value => (
              <option key={value} value={value}>{String(value).padStart(2, '0')}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
        </div>
      </div>

      <DrawerFooter onCancel={onCancel} onSubmit={onSubmit} />
    </>
  );
}

function RankingQuestionForm({ form, onCancel, onSubmit }) {
  return (
    <>
      <div className="flex h-[56px] flex-shrink-0 items-center border-b border-border-subtle px-[22px]">
        <h2 className="text-[15px] font-medium leading-none text-text-secondary">
          Create your <span className="font-bold text-text-primary">Ranking</span> Question
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-[22px]">
        <QuestionModeTabs />
        <QuestionIntro />

        <label className="mt-[24px] block text-[15px] font-semibold leading-none text-text-primary">
          Ranking
        </label>
        <div className="mt-[10px] rounded-[10px] bg-surface-muted px-[14px] py-[14px]">
          <textarea
            value={form.questionPrompt}
            onChange={event => form.setQuestionPrompt(event.target.value)}
            className="h-[70px] w-full resize-none rounded-[8px] border border-border-default bg-surface px-[12px] py-[10px] text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
            placeholder="Type your ranking prompt here"
          />

          <div className="mt-[10px] space-y-[8px]">
            {form.rankingItems.map(item => (
              <div key={item.id} className="grid grid-cols-[24px_minmax(0,1fr)_18px] items-center gap-[8px]">
                <GripVertical className="h-[16px] w-[16px] text-text-faint" strokeWidth={2} />
                <input
                  value={item.text}
                  onChange={event => form.updateRankingItem(item.id, event.target.value)}
                  className="h-[38px] min-w-0 rounded-[8px] border border-border-default bg-surface px-[11px] text-[14px] font-medium text-text-primary outline-none placeholder:text-text-muted"
                  placeholder="Item text..."
                />
                <button
                  type="button"
                  onClick={() => form.removeRankingItem(item.id)}
                  className="text-text-secondary transition-colors hover:text-error"
                  aria-label="Remove ranking item"
                >
                  <X className="h-[16px] w-[16px]" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={form.addRankingItem} className="mt-[14px] text-[14px] font-bold leading-none text-brand">
            Add item
          </button>
        </div>

        <label className="mt-[20px] block text-[15px] font-semibold leading-none text-text-primary">
          Grading hints
        </label>
        <input
          value={form.gradingHints}
          onChange={event => form.setGradingHints(event.target.value)}
          className="mt-[10px] h-[42px] w-full rounded-[8px] border border-border-default bg-surface px-[12px] text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
          placeholder="eg. O (n log n)"
        />

        <div className="mt-[20px] grid grid-cols-2 gap-[22px]">
          <PointsSelect value={form.itemTimer} onChange={form.setItemTimer} label="Timer" />
          <PointsSelect value={form.points} onChange={form.setPoints} />
        </div>
      </div>

      <DrawerFooter onCancel={onCancel} onSubmit={onSubmit} />
    </>
  );
}

function McqQuestionForm({ form, onCancel, onSubmit }) {
  return (
    <>
      <div className="flex h-[56px] flex-shrink-0 items-center border-b border-border-subtle px-[22px]">
        <h2 className="text-[15px] font-medium leading-none text-text-secondary">
          Create your <span className="font-bold text-text-primary">MCQ</span> Question
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-[22px]">
        <QuestionModeTabs />
        <QuestionIntro />

        <label className="mt-[24px] block text-[15px] font-semibold leading-none text-text-primary">
          Ask your question
        </label>
        <input
          value={form.questionPrompt}
          onChange={event => form.setQuestionPrompt(event.target.value)}
          className="mt-[10px] h-[42px] w-full rounded-[8px] border border-border-default bg-surface px-[12px] text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
          placeholder="Type your question"
        />

        <div className="mt-[20px] grid grid-cols-2 gap-[22px]">
          <div>
            <p className="text-[15px] font-semibold leading-none text-text-primary">Poll Type</p>
            <div className="mt-[15px] flex items-center gap-[18px]">
              <button
                type="button"
                onClick={() => form.handlePollTypeChange('single')}
                className={`flex items-center gap-[7px] text-[14px] font-medium ${form.pollType === 'single' ? 'text-text-primary' : 'text-text-secondary'}`}
              >
                <span className={`h-[16px] w-[16px] rounded-full border-[2px] ${form.pollType === 'single' ? 'border-text-primary bg-text-primary' : 'border-text-secondary bg-surface'}`} />
                Single answer
              </button>
              <button
                type="button"
                onClick={() => form.handlePollTypeChange('multi')}
                className={`flex items-center gap-[7px] text-[14px] font-medium ${form.pollType === 'multi' ? 'text-text-primary' : 'text-text-secondary'}`}
              >
                <span className={`flex h-[16px] w-[16px] items-center justify-center rounded-full border-[4px] ${form.pollType === 'multi' ? 'border-text-primary bg-surface' : 'border-text-secondary bg-surface'}`} />
                Multiple answer
              </button>
            </div>
          </div>

          <PointsSelect value={form.points} onChange={form.setPoints} label="Total Points" />
        </div>

        <div className="mt-[22px] rounded-[10px] bg-surface-muted px-[14px] py-[14px]">
          <p className="text-[15px] font-semibold leading-none text-text-primary">Options</p>
          <div className="mt-[10px] space-y-[8px]">
            {form.options.map((option, index) => (
              <div key={option.id} className="grid grid-cols-[16px_26px_minmax(0,1fr)_18px] items-center gap-[8px]">
                <GripVertical className="h-[15px] w-[15px] text-text-faint" strokeWidth={2} />
                <button
                  type="button"
                  onClick={() => form.toggleCorrectOption(option.id)}
                  className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-[2px] ${
                    option.is_correct
                      ? 'border-success bg-success text-surface'
                      : 'border-border-strong bg-surface text-transparent'
                  }`}
                  aria-label={`Mark option ${index + 1} correct`}
                >
                  <Check className="h-[12px] w-[12px]" strokeWidth={2.6} />
                </button>
                <input
                  value={option.text}
                  onChange={event => form.updateOption(option.id, event.target.value)}
                  className="h-[38px] min-w-0 rounded-[8px] border border-border-default bg-surface px-[11px] text-[14px] font-medium text-text-primary outline-none placeholder:text-text-muted"
                  placeholder={index === 0 ? 'Option 1' : 'Type optional description...'}
                />
                <button
                  type="button"
                  onClick={() => form.removeOption(option.id)}
                  className="text-text-secondary transition-colors hover:text-error"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <X className="h-[16px] w-[16px]" strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={form.addOption}
            className="mt-[14px] text-[14px] font-bold leading-none text-brand"
          >
            Add option
          </button>
        </div>

        <div className="mt-[18px] flex items-center justify-between">
          <p className="text-[14px] font-semibold text-text-primary">Would you like to rearrange the options?</p>
          <button
            type="button"
            onClick={() => form.setShuffleOptions(value => !value)}
            className={`flex h-[18px] w-[31px] items-center rounded-full p-[2px] transition-colors ${form.shuffleOptions ? 'bg-[var(--color-assessment-cta)]' : 'bg-text-primary'}`}
            aria-pressed={form.shuffleOptions}
            aria-label="Rearrange options"
          >
            <span className={`h-[14px] w-[14px] rounded-full bg-surface transition-transform ${form.shuffleOptions ? 'translate-x-[13px]' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <DrawerFooter onCancel={onCancel} onSubmit={onSubmit} />
    </>
  );
}

function AdaptiveQuestionForm({ form, onCancel, onSubmit }) {
  const roleFocusAreas = ROLE_FOCUS_AREAS[form.assessmentRoleFamily] || [];
  // Prefer the engine catalog — it is the only source that knows what can
  // actually be asked and scored. The static lists are the offline fallback.
  const fallbackChoices = [
    ...roleFocusAreas,
    ...UNIVERSAL_FOCUS_AREAS.filter(value => !roleFocusAreas.includes(value)),
  ];
  const focusAreaChoices = form.adaptiveFocusAreaOptions?.length
    ? form.adaptiveFocusAreaOptions
    : fallbackChoices;
  const { max: derivedMax } = form.adaptiveQuestionCount;
  const noFocusAreas = form.adaptiveFocusAreas.length === 0;

  return (
    <>
      <div className="flex h-[56px] flex-shrink-0 items-center border-b border-border-subtle px-[22px]">
        <h2 className="text-[15px] font-medium leading-none text-text-secondary">
          Configure <span className="font-bold text-text-primary">AI adaptive interview</span>
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto px-[22px] pb-[10px] pt-[24px]">
        <p className="text-[14px] leading-[20px] text-text-secondary">
          The interviewer asks one question at a time, adapting how it probes based on each
          answer. Difficulty stays fixed at the assessment&apos;s seniority so candidates stay
          comparable.
        </p>

        <div className="mt-[24px]">
          <label className="block text-[15px] font-semibold leading-none text-text-primary">
            Interview style
          </label>
          <div className="relative mt-[10px]">
            <select
              value={form.adaptivePreset}
              onChange={event => form.setAdaptivePreset(event.target.value)}
              className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[15px] font-medium text-text-primary outline-none"
            >
              {ADAPTIVE_PRESET_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
          </div>
          <p className="mt-[6px] text-[13px] leading-[18px] text-text-muted">
            {ADAPTIVE_PRESET_OPTIONS.find(option => option.value === form.adaptivePreset)?.hint}
          </p>
        </div>

        <div className="mt-[22px]">
          <label className="block text-[15px] font-semibold leading-none text-text-primary">
            Grounded on
          </label>
          <div className="relative mt-[10px]">
            <select
              value={form.adaptiveAnchorId}
              onChange={event => form.setAdaptiveAnchorId(event.target.value)}
              className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[15px] font-medium text-text-primary outline-none"
            >
              <option value="">Most recent coding section</option>
              <option value="none">Nothing — standalone interview</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
          </div>
          <p className="mt-[6px] text-[13px] leading-[18px] text-text-muted">
            Follow-up questions reference the candidate&apos;s submitted code and test results.
          </p>
        </div>

        <div className="mt-[22px]">
          <label className="block text-[15px] font-semibold leading-none text-text-primary">
            Duration
          </label>
          <div className="relative mt-[10px]">
            <select
              value={form.sectionTimer}
              onChange={event => form.setSectionTimer(Number(event.target.value))}
              className="h-[42px] w-full appearance-none rounded-[8px] border border-border-default bg-surface px-[12px] pr-[38px] text-[15px] font-medium text-text-primary outline-none"
            >
              {ADAPTIVE_TIMER_OPTIONS.map(minutes => (
                <option key={minutes} value={minutes}>{minutes} minutes</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-[14px] top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-text-muted" strokeWidth={1.8} />
          </div>
          <p className="mt-[6px] text-[13px] leading-[18px] text-text-muted">
            Roughly <span className="font-semibold text-text-secondary">{derivedMax} question{derivedMax === 1 ? '' : 's'}</span>
            {' '}at this length. The interview ends after the last question or when time runs out.
          </p>
        </div>

        <div className="mt-[22px]">
          <label className="block text-[15px] font-semibold leading-none text-text-primary">
            Focus areas
          </label>
          <p className="mt-[6px] text-[13px] leading-[18px] text-text-muted">
            What the interview probes and scores against. Pick at least one.
            {form.adaptiveCatalogAvailable === false
              ? ' Showing all known areas — some may not be scoreable for this role and level.'
              : ' Only areas that can be scored for this role and level are shown.'}
          </p>
          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            {focusAreaChoices.map(focusArea => {
              const selected = form.adaptiveFocusAreas.includes(focusArea);
              return (
                <button
                  key={focusArea}
                  type="button"
                  onClick={() => form.toggleAdaptiveFocusArea(focusArea)}
                  aria-pressed={selected}
                  className={`h-[32px] rounded-full border px-[14px] text-[13px] font-medium transition-colors ${
                    selected
                      ? 'border-[var(--color-assessment-cta)] bg-[var(--color-assessment-cta)] text-[var(--color-assessment-cta-text)]'
                      : 'border-border-default bg-surface text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {formatFocusAreaLabel(focusArea)}
                </button>
              );
            })}
          </div>
          {noFocusAreas && (
            <p className="mt-[8px] text-[13px] font-medium text-red-600">
              Select at least one focus area.
            </p>
          )}
        </div>

        <div className="mt-[22px]">
          <label className="block text-[15px] font-semibold leading-none text-text-primary">
            What will they actually work on? <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <input
            value={form.adaptiveRoleTitle}
            onChange={event => form.setAdaptiveRoleTitle(event.target.value)}
            placeholder="e.g. Event-driven ingestion pipelines on our billing service"
            className="mt-[10px] h-[42px] w-full rounded-[8px] border border-border-default bg-surface px-[12px] text-[15px] text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>

        <details className="mt-[24px] rounded-[8px] border border-border-default bg-surface-muted px-[14px] py-[12px]">
          <summary className="cursor-pointer text-[14px] font-semibold text-text-primary">
            Advanced
          </summary>

          <div className="mt-[14px]">
            <label className="block text-[14px] font-semibold leading-none text-text-primary">
              Number of questions
            </label>
            <input
              type="number"
              min={1}
              max={derivedMax}
              value={form.adaptiveQuestionMax ?? derivedMax}
              onChange={event => form.setAdaptiveQuestionMax(event.target.value)}
              className="mt-[8px] h-[38px] w-[120px] rounded-[8px] border border-border-default bg-surface px-[12px] text-[15px] text-text-primary outline-none"
            />
            <p className="mt-[6px] text-[13px] leading-[18px] text-text-muted">
              Capped at {derivedMax} — each focus area can carry at most two questions.
            </p>
          </div>

          <div className="mt-[16px]">
            <label className="block text-[14px] font-semibold leading-none text-text-primary">
              Must ask about <span className="font-normal text-text-muted">(one per line)</span>
            </label>
            <textarea
              rows={3}
              value={form.adaptiveMustAsk}
              onChange={event => form.setAdaptiveMustAsk(event.target.value)}
              placeholder="How they would handle a duplicate write"
              className="mt-[8px] w-full resize-none rounded-[8px] border border-border-default bg-surface px-[12px] py-[10px] text-[14px] text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="mt-[16px]">
            <label className="block text-[14px] font-semibold leading-none text-text-primary">
              Avoid topics <span className="font-normal text-text-muted">(one per line)</span>
            </label>
            <textarea
              rows={2}
              value={form.adaptiveAvoidTopics}
              onChange={event => form.setAdaptiveAvoidTopics(event.target.value)}
              placeholder="Kubernetes internals"
              className="mt-[8px] w-full resize-none rounded-[8px] border border-border-default bg-surface px-[12px] py-[10px] text-[14px] text-text-primary outline-none placeholder:text-text-muted"
            />
          </div>
        </details>
      </div>

      <DrawerFooter onCancel={onCancel} onSubmit={noFocusAreas ? () => {} : onSubmit} />
    </>
  );
}

function QuestionStep({ drawerType, form, actions, onCancel }) {
  if (drawerType === 'adaptive') {
    return <AdaptiveQuestionForm form={form} onCancel={onCancel} onSubmit={actions.createAdaptive} />;
  }

  if (drawerType === 'coding') {
    return <CodingQuestionForm form={form} onCancel={onCancel} onSubmit={actions.createCoding} />;
  }

  if (drawerType === 'free_text') {
    return <FreeTextQuestionForm form={form} onCancel={onCancel} onSubmit={actions.createFreeText} />;
  }

  if (drawerType === 'ranking') {
    return <RankingQuestionForm form={form} onCancel={onCancel} onSubmit={actions.createRanking} />;
  }

  return <McqQuestionForm form={form} onCancel={onCancel} onSubmit={actions.createMcq} />;
}

export function SectionCreationDrawer({ drawer, form, actions }) {
  if (!drawer.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={`Close ${drawer.type} drawer`}
        onClick={drawer.close}
        className={`absolute inset-0 bg-text-primary/35 transition-opacity duration-[380ms] ease-out ${
          drawer.isClosing ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <div
        className={`absolute inset-y-0 right-0 flex w-[min(760px,54vw)] min-w-[560px] flex-col border-l border-border-subtle bg-surface shadow-modal transition-all duration-[380ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          drawer.isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 animate-slideInRight'
        }`}
      >
        {drawer.step === 'section' ? (
          <SectionDetailsStep
            drawerType={drawer.type}
            form={form}
            onCancel={drawer.close}
            onContinue={drawer.continueToQuestion}
          />
        ) : (
          <QuestionStep
            drawerType={drawer.type}
            form={form}
            actions={actions}
            onCancel={drawer.close}
          />
        )}
      </div>
    </div>
  );
}

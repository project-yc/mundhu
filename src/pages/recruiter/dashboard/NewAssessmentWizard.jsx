// NewAssessmentWizard — 2-step modal: assessment basics → pick from task library
import { useState, useEffect, useCallback } from 'react';
import {
  X, Loader, AlertCircle, Check, Clock, ArrowRight,
  Sparkles, MessageSquare, Zap, ZapOff, Search, Library,
  ChevronDown, Tag, SlidersHorizontal, CheckCircle2,
} from 'lucide-react';
import { createAssessment, attachLibraryTask, getLibraryTasks } from '../../../api/recruiter/assessment.jsx';
import { StepTrack, Field, FInput, FTextarea, DURATION_PRESETS } from './shared/FormPrimitives.jsx';

const DIFFICULTY_COLORS = {
  easy:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50  text-amber-700  border-amber-200',
  hard:   'bg-rose-50   text-rose-700   border-rose-200',
};
const SENIORITY_LABELS = { junior:'Junior', mid:'Mid', senior:'Senior', staff:'Staff', principal:'Principal' };
const DOMAIN_LABELS    = { backend:'Backend', frontend:'Frontend', devops:'DevOps', data:'Data', mobile:'Mobile', security:'Security', fullstack:'Full Stack' };

function TaskCard({ task, selected, onToggle }) {
  return (
    <button
      type="button"
      onClick={() => onToggle(task)}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 group ${
        selected
          ? 'bg-brand-tint border-brand ring-1 ring-brand/20'
          : 'bg-page border-border-default hover:border-border-strong hover:bg-surface-muted/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-text-primary leading-snug">{task.title}</p>
          <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {task.difficulty && (
              <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${DIFFICULTY_COLORS[task.difficulty] ?? 'bg-surface-muted text-text-secondary border-border-default'}`}>
                {task.difficulty.toUpperCase()}
              </span>
            )}
            {task.seniority && (
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-border-default">
                {SENIORITY_LABELS[task.seniority] ?? task.seniority}
              </span>
            )}
            {task.domain && (
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-border-default">
                {DOMAIN_LABELS[task.domain] ?? task.domain}
              </span>
            )}
            {task.language && (
              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-tint text-brand border border-brand-border/40">
                {task.language}
              </span>
            )}
          </div>
        </div>
        <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all duration-150 mt-0.5 ${
          selected ? 'bg-brand border-brand' : 'border-border-default group-hover:border-brand/50'
        }`}>
          {selected && <Check className="w-3 h-3 text-on-brand" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );
}

export default function NewAssessmentWizard({ onClose, onCreated }) {
  const [wizardStep,    setWizardStep]    = useState(0);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError,   setWizardError]   = useState('');

  const [assessmentForm, setAssessmentForm] = useState({
    name: '', description: '', duration_minutes: '', ai_level: 'full',
  });

  // Library task selection state
  const [libraryTasks,   setLibraryTasks]   = useState([]);
  const [libLoading,     setLibLoading]     = useState(false);
  const [libError,       setLibError]       = useState('');
  const [selectedTask,   setSelectedTask]   = useState(null);
  const [search,         setSearch]         = useState('');
  const [filters,        setFilters]        = useState({ difficulty: '', seniority: '', domain: '', language: '' });
  const [showFilters,    setShowFilters]     = useState(false);

  const close = () => { onClose(); };

  // Load library tasks when entering step 2
  const fetchLibraryTasks = useCallback(async (overrideFilters) => {
    setLibLoading(true); setLibError('');
    try {
      const f = overrideFilters ?? filters;
      const data = await getLibraryTasks({ ...f, search: search.trim() || undefined });
      setLibraryTasks((data.data ?? data) || []);
    } catch (err) {
      setLibError(err.message || 'Failed to load task library.');
    } finally {
      setLibLoading(false);
    }
  }, [filters, search]);

  useEffect(() => {
    if (wizardStep === 1) fetchLibraryTasks();
  }, [wizardStep]); // only on step enter; search/filter have their own handlers

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };
  const applySearch = (e) => {
    if (e.key === 'Enter') fetchLibraryTasks();
  };
  const setFilter = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchLibraryTasks(next);
  };
  const clearFilters = () => {
    const cleared = { difficulty: '', seniority: '', domain: '', language: '' };
    setFilters(cleared);
    setSearch('');
    fetchLibraryTasks(cleared);
  };

  const toggleTask = (task) => setSelectedTask(prev => prev?.id === task.id ? null : task);

  const handleStep1Next = () => {
    if (!assessmentForm.name.trim() || !assessmentForm.description.trim() || !assessmentForm.duration_minutes) {
      setWizardError('Please fill in all required fields.'); return;
    }
    setWizardError(''); setWizardStep(1);
  };

  const handleFinalCreate = async () => {
    setWizardLoading(true); setWizardError('');
    try {
      const assessmentData = await createAssessment(
        assessmentForm.name,
        assessmentForm.description,
        parseInt(assessmentForm.duration_minutes),
        { ai_level: assessmentForm.ai_level },
      );
      const newAssessment = assessmentData.data || assessmentData;

      let attachedTask = null;
      if (selectedTask) {
        await attachLibraryTask(newAssessment.id, selectedTask.id, 0);
        attachedTask = selectedTask;
      }

      onCreated({
        ...newAssessment,
        library_task_attachments: attachedTask ? [{ library_task: attachedTask, order: 0 }] : [],
        candidate_counts: { total: 0, invited: 0, in_progress: 0, submitted: 0, expired: 0 },
      });
      close();
    } catch (err) {
      setWizardError(err.message || 'Failed to create assessment. Please try again.');
    } finally {
      setWizardLoading(false);
    }
  };

  const hasActiveFilters = filters.difficulty || filters.seniority || filters.domain || filters.language;

  return (
    <>
      <div className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm z-40 animate-fadeIn" onClick={close} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-[820px] bg-surface border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] pointer-events-auto animate-slideInUp"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 py-5 border-b border-border-default flex-shrink-0">
            <div>
              <h2 className="text-[15px] font-bold text-text-primary font-display">New Assessment</h2>
              <p className="text-[11px] text-text-secondary mt-0.5">
                {wizardStep === 0 ? 'Step 1 of 2 — Define assessment basics' : 'Step 2 of 2 — Pick a task from the library'}
              </p>
            </div>
            <button onClick={close} className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-all duration-150">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Left sidebar */}
            <div className="w-56 flex-shrink-0 hidden sm:flex flex-col gap-5 bg-page border-r border-border-default p-5">
              <StepTrack current={wizardStep} steps={[
                { label: 'Assessment Details', desc: 'Name, description, duration' },
                { label: 'Attach Task',         desc: 'Pick from the task library'  },
              ]} />
              {wizardStep === 1 && assessmentForm.name && (
                <div className="p-3 rounded-xl border border-border-default bg-surface animate-fadeIn">
                  <p className="text-[10px] font-semibold text-brand uppercase tracking-wider mb-2">Assessment</p>
                  <p className="text-[13px] font-semibold text-text-primary leading-snug">{assessmentForm.name}</p>
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] text-text-secondary">
                    <Clock className="w-3 h-3" />{assessmentForm.duration_minutes} min
                  </div>
                </div>
              )}
              {wizardStep === 1 && selectedTask && (
                <div className="p-3 rounded-xl border border-brand-border/40 bg-brand-tint animate-fadeIn">
                  <p className="text-[10px] font-semibold text-brand uppercase tracking-wider mb-1.5">Selected Task</p>
                  <p className="text-[12px] font-semibold text-text-primary leading-snug">{selectedTask.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedTask.difficulty && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${DIFFICULTY_COLORS[selectedTask.difficulty] ?? ''}`}>
                        {selectedTask.difficulty.toUpperCase()}
                      </span>
                    )}
                    {selectedTask.language && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded border bg-surface text-text-secondary border-border-default">
                        {selectedTask.language}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <div className="flex-1" />
              <div className="p-3 rounded-xl bg-surface border border-border-default">
                <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Note</p>
                <p className="text-[11px] text-text-muted leading-relaxed">Task details (name, domain, difficulty) are pulled automatically from the library.</p>
              </div>
            </div>

            {/* Form panel */}
            <div className="flex-1 overflow-y-auto min-w-0">
              <div className={`${wizardStep === 1 ? 'p-5' : 'p-7'} space-y-5`}>
                {wizardError && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl animate-fadeIn">
                    <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                    <p className="text-[13px] text-error">{wizardError}</p>
                  </div>
                )}

                {/* ── Step 1 ── */}
                {wizardStep === 0 && (
                  <div className="space-y-5 animate-fadeIn">
                    <Field label="Assessment Name">
                      <FInput value={assessmentForm.name} onChange={e => setAssessmentForm({ ...assessmentForm, name: e.target.value })} placeholder="e.g., Senior Backend Engineer — Q2 2026" />
                    </Field>
                    <Field label="Description">
                      <FTextarea value={assessmentForm.description} onChange={e => setAssessmentForm({ ...assessmentForm, description: e.target.value })} placeholder="What skills and areas will this assessment evaluate?" rows={4} />
                    </Field>
                    <Field label="Duration">
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {DURATION_PRESETS.map(p => (
                          <button key={p} type="button" onClick={() => setAssessmentForm({ ...assessmentForm, duration_minutes: String(p) })} className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-all duration-150 ${assessmentForm.duration_minutes === String(p) ? 'bg-brand-tint border-brand text-brand' : 'bg-transparent border-border-default text-text-secondary hover:border-border-strong hover:text-text-secondary'}`}>
                            {p}m
                          </button>
                        ))}
                      </div>
                      <FInput type="number" value={assessmentForm.duration_minutes} onChange={e => setAssessmentForm({ ...assessmentForm, duration_minutes: e.target.value })} placeholder="Or enter custom minutes…" min="1" />
                    </Field>
                    <Field label="AI Assistance">
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { value: 'full',               label: 'Full Agent',   desc: 'Orchestrator + chat + inline completions', Icon: Sparkles     },
                          { value: 'chat_only',          label: 'Chat + Inline',desc: 'Chat (manual context) + inline completions', Icon: MessageSquare },
                          { value: 'inline_completions', label: 'Inline Only',  desc: 'Code suggestions only — no chat panel',     Icon: Zap          },
                          { value: 'none',               label: 'No AI',        desc: 'All AI features disabled',                  Icon: ZapOff       },
                        ].map(({ value, label, desc, Icon }) => (
                          <button key={value} type="button" onClick={() => setAssessmentForm({ ...assessmentForm, ai_level: value })} className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-150 ${assessmentForm.ai_level === value ? 'bg-brand-tint border-brand' : 'bg-transparent border-border-default hover:border-border-strong'}`}>
                            <div className="flex items-center gap-1.5">
                              <Icon className={`w-3.5 h-3.5 ${assessmentForm.ai_level === value ? 'text-brand' : 'text-text-secondary'}`} />
                              <span className={`text-[12px] font-bold ${assessmentForm.ai_level === value ? 'text-brand' : 'text-text-secondary'}`}>{label}</span>
                            </div>
                            <span className="text-[10px] text-text-secondary leading-relaxed">{desc}</span>
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── Step 2 — Task Library Picker ── */}
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Search + filter bar */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                        <input
                          value={search}
                          onChange={handleSearch}
                          onKeyDown={applySearch}
                          placeholder="Search tasks… (press Enter)"
                          className="w-full pl-8 pr-3 py-2 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowFilters(v => !v)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-semibold transition-all duration-150 ${(showFilters || hasActiveFilters) ? 'bg-brand-tint border-brand text-brand' : 'bg-page border-border-default text-text-secondary hover:border-border-strong'}`}
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filters
                        {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand" />}
                      </button>
                    </div>

                    {/* Filter chips */}
                    {showFilters && (
                      <div className="flex flex-wrap gap-2 p-3 bg-page rounded-xl border border-border-default animate-fadeIn">
                        {[
                          { key: 'difficulty', label: 'Difficulty', options: ['easy','medium','hard'] },
                          { key: 'seniority',  label: 'Seniority',  options: ['junior','mid','senior','staff','principal'] },
                          { key: 'domain',     label: 'Domain',     options: ['backend','frontend','devops','data','mobile','security','fullstack'] },
                        ].map(({ key, label, options }) => (
                          <div key={key} className="flex items-center gap-1">
                            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider pr-1">{label}:</span>
                            {options.map(opt => (
                              <button key={opt} type="button" onClick={() => setFilter(key, filters[key] === opt ? '' : opt)} className={`px-2 py-1 text-[11px] font-semibold rounded-md border transition-all duration-100 ${filters[key] === opt ? 'bg-brand-tint border-brand text-brand' : 'bg-surface border-border-default text-text-secondary hover:border-border-strong'}`}>
                                {DOMAIN_LABELS[opt] ?? SENIORITY_LABELS[opt] ?? opt}
                              </button>
                            ))}
                          </div>
                        ))}
                        {hasActiveFilters && (
                          <button type="button" onClick={clearFilters} className="ml-auto text-[11px] text-text-secondary hover:text-error transition-colors duration-150">
                            Clear all
                          </button>
                        )}
                      </div>
                    )}

                    {/* Task list */}
                    {libLoading ? (
                      <div className="flex items-center justify-center py-12 gap-2 text-text-muted">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-[13px]">Loading library…</span>
                      </div>
                    ) : libError ? (
                      <div className="flex items-center gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
                        <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                        <p className="text-[13px] text-error">{libError}</p>
                      </div>
                    ) : libraryTasks.length === 0 ? (
                      <div className="flex flex-col items-center gap-3 py-14 text-text-muted">
                        <Library className="w-8 h-8 opacity-30" />
                        <p className="text-[13px]">No tasks found matching your filters.</p>
                        {hasActiveFilters && (
                          <button type="button" onClick={clearFilters} className="text-[12px] text-brand hover:underline">Clear filters</button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2.5 pb-2">
                        {libraryTasks.map(task => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            selected={selectedTask?.id === task.id}
                            onToggle={toggleTask}
                          />
                        ))}
                      </div>
                    )}

                    {/* Optional skip hint */}
                    {!selectedTask && !libLoading && libraryTasks.length > 0 && (
                      <p className="text-[11px] text-text-muted text-center">
                        Select a task above, or skip — you can attach one later from the Task Library.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-7 py-4 border-t border-border-default bg-page flex-shrink-0">
            {wizardStep === 1 ? (
              <button onClick={() => { setWizardStep(0); setWizardError(''); }} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-all duration-150">
                ← Back
              </button>
            ) : (
              <button onClick={close} className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:bg-surface-muted rounded-lg transition-all duration-150">
                Cancel
              </button>
            )}
            <div className="flex items-center gap-3">
              {wizardStep === 1 && (
                <button onClick={handleFinalCreate} disabled={wizardLoading} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg border border-border-default transition-all duration-150 disabled:opacity-40">
                  {wizardLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : null}
                  Skip &amp; Create
                </button>
              )}
              <button
                onClick={wizardStep === 0 ? handleStep1Next : handleFinalCreate}
                disabled={wizardLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {wizardLoading ? (
                  <><Loader className="w-4 h-4 animate-spin" />{wizardStep === 0 ? 'Saving…' : 'Creating…'}</>
                ) : wizardStep === 0 ? (
                  <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" /><span>{selectedTask ? 'Create with Task' : 'Create Assessment'}</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

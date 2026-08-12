import { useState } from 'react';
import { FileText, Briefcase, CalendarIcon } from 'lucide-react';
import { format, startOfToday, isBefore } from 'date-fns';
import assessmentCard from '../../../../../assets/recruiter/images/assessmentCard.png';
import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { createAssessment } from '../api/assessmentBuilderApi';
import { cn } from '../../../../../lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '../../../../../components/ui/popover';
import { Calendar } from '../../../../../components/ui/calendar';
import { Input } from '../../../../../components/ui/input';
import { Textarea } from '../../../../../components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../../../../components/ui/select';

// This step highlights focus/selection in black rather than the brand accent
// used elsewhere in the builder — keeps form chrome neutral against the
// orange step indicators and CTA.
const FIELD_FOCUS = 'focus-visible:ring-black/15 focus-visible:border-black focus-visible:ring-offset-0';
// SelectTrigger styles its ring on plain `:focus` (fires on click, not just
// keyboard) rather than `:focus-visible` like the other inputs — needs its
// own override to match.
const SELECT_TRIGGER_FOCUS = 'focus:ring-black/15 focus:border-black';
const SELECT_ITEM_FOCUS = 'data-[highlighted]:bg-black data-[highlighted]:text-white';

const DURATION_OPTIONS = [30, 45, 60, 90, 120];
const DEFAULT_DURATION = 45;
// Sent to the backend as `config_json.seniority`; values must match TaskSeniority.
// These previously shipped display labels ("Junior Level") as the values, which
// matched no enum member — so nothing downstream could read them.
// "Entry level" is `new_grad`, a separate rung below Junior. Both are early
// career (scaffolded questions, leniency scoring) but they score against
// different level-calibrated rubrics.
const SENIORITY_OPTIONS = [
  { value: 'new_grad', label: 'Entry level' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'staff', label: 'Staff' },
  { value: 'principal', label: 'Principal' },
];
const DEFAULT_SENIORITY = 'new_grad';

// Must match TaskDomain — `config_json.domain` is what the adaptive interview
// reads to resolve focus areas, role topics and its catalog slice.
const DOMAIN_OPTIONS = [
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data' },
  { value: 'data_science', label: 'Data Science' },
  { value: 'llm_engineering', label: 'LLM Engineering' },
  { value: 'ai_ml', label: 'ML Engineering' },
  { value: 'mlops', label: 'MLOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'security', label: 'Security' },
];
const DEFAULT_DOMAIN = 'fullstack';

function StepProgress({ currentStep }) {
  const steps = [
    { number: 1, label: 'Add details' },
    { number: 2, label: 'Build Assessment' },
    { number: 3, label: 'Review' },
  ];

  return (
    <div className="flex items-center h-[30px]">
      {steps.map((step, idx) => {
        const isActive = currentStep === step.number;
        const isPast = currentStep > step.number;
        const isFuture = currentStep < step.number;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] leading-none font-medium ${
                  isActive || isPast
                    ? 'bg-[var(--color-assessment-accent)]  text-surface shadow-card'
                    : 'bg-surface text-text-muted border border-border-strong'
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-[14px] leading-none font-semibold ${
                  isActive ? 'text-text-primary' : isFuture ? 'text-text-muted' : 'text-text-secondary'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="relative w-[48px] h-px mx-[10px] bg-border-strong">
                <span className="absolute right-0 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rotate-45 border-r border-t border-border-strong" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[13px] leading-none font-semibold text-text-primary mb-[8px]">{label}</span>
      {children}
    </label>
  );
}

function IconInput({ icon, className, ...props }) {
  const Icon = icon;
  return (
    <div className="relative">
      <Icon className="absolute left-[13px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-text-muted pointer-events-none z-10" strokeWidth={1.8} />
      <Input
        className={cn('h-[40px] pl-[38px] pr-4 rounded-[8px] border-border-strong', FIELD_FOCUS, className)}
        {...props}
      />
    </div>
  );
}

export function AssessmentDetailsStep({ onCancel }) {
  const { state, dispatch, ACTIONS } = useAssessmentBuilder();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  const [expiryOpen, setExpiryOpen] = useState(false);

  const durationValue = state.duration_minutes ?? DEFAULT_DURATION;
  const seniorityValue = state.seniority || DEFAULT_SENIORITY;
  const domainValue = state.domain || DEFAULT_DOMAIN;
  const today = startOfToday();
  const expiryDate = state.expiry_datetime ? new Date(state.expiry_datetime) : undefined;
  const expiryInvalid = !!expiryDate && isBefore(expiryDate, today);

  const handleSaveDraft = () => {
    localStorage.setItem(
      'assessmentBuilderDraft',
      JSON.stringify({ ...state, duration_minutes: durationValue, seniority: seniorityValue }),
    );
    setSavedAsDraft(true);
  };

  const handleExpirySelect = date => {
    if (!date) return;
    // Store end-of-day so candidates can start any time on the expiry date itself.
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    dispatch({ type: ACTIONS.SET_DETAILS, payload: { expiry_datetime: endOfDay.toISOString() } });
    setExpiryOpen(false);
  };

  const handleContinue = async () => {
    if (!state.name.trim()) return;
    if (expiryInvalid) {
      setError('Expiry date cannot be in the past.');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const res = await createAssessment({
        name: state.name,
        description: state.description,
        duration_minutes: durationValue,
        config_json: {
          role: state.role || '',
          seniority: seniorityValue,
          // `domain` (not `role`) is the key the adaptive interview config reads
          // as its role_family fallback.
          domain: domainValue,
        },
        expiry_datetime: state.expiry_datetime || undefined,
      });
      dispatch({
        type: ACTIONS.SET_DETAILS,
        payload: {
          backendId: res.id || res.data?.id,
          duration_minutes: durationValue,
          seniority: seniorityValue,
          domain: domainValue,
          config_json: { role: state.role || '', seniority: seniorityValue, domain: domainValue },
        },
      });
      dispatch({ type: ACTIONS.SET_STEP, payload: 2 });
    } catch (err) {
      setError(err.message || 'Failed to create assessment.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[390px_minmax(0,1fr)] bg-surface overflow-hidden">
      <aside className="hidden lg:flex flex-col border-r border-border-subtle bg-surface">
        <div className="px-[36px] pt-[46px]">
          <h1 className="text-[24px] leading-[29px] font-bold text-text-primary tracking-normal">
            Build assessments
            <span className="block text-[var(--color-assessment-accent)]">that truly evaluate.</span>
          </h1>
          <p className="mt-[22px] max-w-[300px] text-[15px] leading-[22px] text-text-secondary">
            Create structured assessments with the right mix of question types or leverage AI to adapt in real-time.
          </p>
          <img
            src={assessmentCard}
            alt=""
            className="mt-[46px] w-[585px] max-w-full select-none"
            draggable={false}
          />
        </div>

      </aside>

      <section className="min-w-0 overflow-y-auto">
        <div className="pt-[38px] px-8 xl:pl-[44px] xl:pr-[54px] pb-10">
          <StepProgress currentStep={state.currentStep} />

          <div className="mt-[28px] w-full max-w-[760px]">
            <div>
              <h2 className="text-[22px] leading-[28px] font-bold text-text-primary tracking-normal">Assessment details</h2>
              <p className="mt-[6px] text-[14px] leading-[20px] text-text-secondary">
                This information is shown to candidates before they begin.
              </p>
            </div>

            <div className="mt-[30px] grid grid-cols-1 lg:grid-cols-2 gap-x-[18px] gap-y-[22px]">
              <Field label="Assessment name">
                <IconInput
                  icon={FileText}
                  value={state.name}
                  onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { name: e.target.value } })}
                  placeholder="Senior Backend Engineer — API & Infrastructure"
                />
              </Field>

              <Field label="Role/Position">
                <IconInput
                  icon={Briefcase}
                  value={state.role ?? ''}
                  onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { role: e.target.value } })}
                  placeholder="Staff Software Engineer, Payments"
                />
              </Field>

              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  value={state.description}
                  onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { description: e.target.value } })}
                  placeholder="Describe your assessment here."
                  rows={3}
                  className={cn('h-[88px] px-4 py-[12px] rounded-[8px] border-border-strong resize-none', FIELD_FOCUS)}
                />
              </Field>

              <Field label="Seniority Level">
                <Select
                  value={seniorityValue}
                  onValueChange={value => dispatch({ type: ACTIONS.SET_DETAILS, payload: { seniority: value } })}
                >
                  <SelectTrigger className={cn('h-[40px] rounded-[8px] border-border-strong text-[14px]', SELECT_TRIGGER_FOCUS)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITY_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value} className={cn('text-[14px]', SELECT_ITEM_FOCUS)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Discipline">
                <Select
                  value={domainValue}
                  onValueChange={value => dispatch({ type: ACTIONS.SET_DETAILS, payload: { domain: value } })}
                >
                  <SelectTrigger className={cn('h-[40px] rounded-[8px] border-border-strong text-[14px]', SELECT_TRIGGER_FOCUS)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAIN_OPTIONS.map(({ value, label }) => (
                      <SelectItem key={value} value={value} className={cn('text-[14px]', SELECT_ITEM_FOCUS)}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Duration cap">
                <Select
                  value={String(durationValue)}
                  onValueChange={value => dispatch({ type: ACTIONS.SET_DETAILS, payload: { duration_minutes: Number(value) } })}
                >
                  <SelectTrigger className={cn('h-[40px] rounded-[8px] border-border-strong text-[14px]', SELECT_TRIGGER_FOCUS)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(minutes => (
                      <SelectItem key={minutes} value={String(minutes)} className={cn('text-[14px]', SELECT_ITEM_FOCUS)}>
                        {minutes}m
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Expiry date (optional)">
                <Popover open={expiryOpen} onOpenChange={setExpiryOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        'w-full h-[40px] px-4 flex items-center gap-[10px] bg-surface border rounded-[8px] text-[14px] leading-none text-left focus:outline-none focus-visible:ring-2 transition-all',
                        FIELD_FOCUS,
                        expiryInvalid ? 'border-error-border' : 'border-border-strong',
                      )}
                    >
                      <CalendarIcon className="w-[15px] h-[15px] text-text-muted shrink-0" strokeWidth={1.8} />
                      <span className={expiryDate ? 'text-text-primary' : 'text-text-muted'}>
                        {expiryDate ? format(expiryDate, 'PPP') : 'No expiry — select a date'}
                      </span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expiryDate}
                      defaultMonth={expiryDate ?? today}
                      onSelect={handleExpirySelect}
                      disabled={{ before: today }}
                      autoFocus
                    />
                    {expiryDate && (
                      <div className="border-t border-border-subtle p-2">
                        <button
                          type="button"
                          onClick={() => {
                            dispatch({ type: ACTIONS.SET_DETAILS, payload: { expiry_datetime: null } });
                            setExpiryOpen(false);
                          }}
                          className="w-full h-[32px] rounded-[6px] text-[13px] font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                        >
                          Clear expiry
                        </button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
                {expiryInvalid && (
                  <span className="mt-[6px] block text-[12px] leading-none text-error">
                    Expiry date cannot be in the past.
                  </span>
                )}
              </Field>
            </div>

            {error && (
              <p className="mt-[22px] text-[13px] leading-[18px] text-error bg-error-bg border border-error-border rounded-[8px] px-4 py-3">
                {error}
              </p>
            )}

            <div className="mt-[28px] flex items-center justify-end gap-[10px]">
              <button
                type="button"
                onClick={onCancel}
                className="h-[40px] px-[24px] rounded-[8px] border border-border-default bg-surface text-[14px] leading-none font-medium text-text-primary shadow-card hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={!state.name.trim() || creating || expiryInvalid}
                className="h-[40px] px-[26px] rounded-[8px] bg-[var(--color-assessment-cta)] hover:bg-[var(--color-assessment-cta-hover)] text-[var(--color-assessment-cta-text)] text-[14px] leading-none font-bold shadow-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

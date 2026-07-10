import { useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import assessmentCard from '../../../../../assets/recruiter/images/assessmentCard.png';
import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { createAssessment } from '../api/assessmentBuilderApi';

const DURATION_OPTIONS = [30, 45, 60, 90, 120];
const DEFAULT_DURATION = 45;
const SENIORITY_OPTIONS = ['Junior Level', 'Mid Level', 'Senior Level', 'Lead Level', 'Staff Level'];
const DEFAULT_SENIORITY = 'Junior Level';

function StepProgress({ currentStep }) {
  const steps = [
    { number: 1, label: 'Add details' },
    { number: 2, label: 'Build Assessment' },
    { number: 3, label: 'Review' },
  ];

  return (
    <div className="flex items-center h-[34px]">
      {steps.map((step, idx) => {
        const isActive = currentStep === step.number;
        const isPast = currentStep > step.number;
        const isFuture = currentStep < step.number;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center text-[15px] leading-none font-medium ${
                  isActive || isPast
                    ? 'bg-[var(--color-assessment-step-active)] text-surface shadow-card'
                    : 'bg-surface text-text-muted border border-border-strong'
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-[16px] leading-none font-semibold ${
                  isActive ? 'text-text-primary' : isFuture ? 'text-text-muted' : 'text-text-secondary'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className="relative w-[56px] h-px mx-[12px] bg-border-strong">
                <span className="absolute right-0 top-1/2 h-[6px] w-[6px] -translate-y-1/2 rotate-45 border-r border-t border-border-strong" />
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
      <span className="block text-[15px] leading-none font-semibold text-text-primary mb-[10px]">{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <FileText className="absolute left-[14px] top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-text-muted pointer-events-none" strokeWidth={1.8} />
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-[44px] pl-[42px] pr-4 bg-surface border border-border-strong rounded-[8px] text-[15px] leading-[44px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
      />
    </div>
  );
}

function SelectInput({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full h-[44px] appearance-none px-4 pr-10 bg-surface border border-border-strong rounded-[8px] text-[15px] leading-[44px] text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-[14px] top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-text-muted pointer-events-none" strokeWidth={1.8} />
    </div>
  );
}

export function AssessmentDetailsStep({ onCancel }) {
  const { state, dispatch, ACTIONS } = useAssessmentBuilder();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [savedAsDraft, setSavedAsDraft] = useState(false);

  const durationValue = state.duration_minutes ?? DEFAULT_DURATION;
  const seniorityValue = state.seniority || DEFAULT_SENIORITY;

  const handleSaveDraft = () => {
    localStorage.setItem(
      'assessmentBuilderDraft',
      JSON.stringify({ ...state, duration_minutes: durationValue, seniority: seniorityValue }),
    );
    setSavedAsDraft(true);
  };

  const handleContinue = async () => {
    if (!state.name.trim()) return;
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
        },
      });
      dispatch({
        type: ACTIONS.SET_DETAILS,
        payload: {
          backendId: res.id || res.data?.id,
          duration_minutes: durationValue,
          seniority: seniorityValue,
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
        <div className="pt-[42px] px-8 xl:pl-[44px] xl:pr-[54px] pb-10">
          <StepProgress currentStep={state.currentStep} />

          <div className="mt-[54px] w-full max-w-[760px]">
            <div>
              <h2 className="text-[25px] leading-[31px] font-bold text-text-primary tracking-normal">Assessment details</h2>
              <p className="mt-[6px] text-[16px] leading-[22px] text-text-secondary">
                This information is shown to candidates before they begin.
              </p>
            </div>

            <div className="mt-[34px] grid grid-cols-1 lg:grid-cols-2 gap-x-[18px] gap-y-[26px]">
              <Field label="Assessment name">
                <TextInput
                  value={state.name}
                  onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { name: e.target.value } })}
                  placeholder="e.g. Backend Engineer"
                />
              </Field>

              <Field label="Role/Position">
                <TextInput
                  value={state.role ?? ''}
                  onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { role: e.target.value } })}
                  placeholder="e.g. Backend Engineer"
                />
              </Field>

              <Field label="Description" className="sm:col-span-2">
                <textarea
                  value={state.description}
                  onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { description: e.target.value } })}
                  placeholder="Descript your assessment here."
                  rows={3}
                  className="w-full h-[96px] px-4 py-[14px] bg-surface border border-border-strong rounded-[8px] text-[15px] leading-[22px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 resize-none transition-all"
                />
              </Field>

              <Field label="Seniority Level">
                <SelectInput
                  value={seniorityValue}
                  onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { seniority: e.target.value } })}
                >
                  {SENIORITY_OPTIONS.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Duration cap">
                <SelectInput
                  value={durationValue}
                  onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { duration_minutes: Number(e.target.value) } })}
                >
                  {DURATION_OPTIONS.map(minutes => (
                    <option key={minutes} value={minutes}>{minutes}m</option>
                  ))}
                </SelectInput>
              </Field>
            </div>

            {error && (
              <p className="mt-[22px] text-[13px] leading-[18px] text-error bg-error-bg border border-error-border rounded-[8px] px-4 py-3">
                {error}
              </p>
            )}

            <div className="mt-[32px] flex items-center justify-end gap-[12px]">
              <button
                type="button"
                onClick={onCancel}
                className="h-[44px] px-[28px] rounded-[8px] border border-border-default bg-surface text-[15px] leading-none font-medium text-text-primary shadow-card hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleContinue}
                disabled={!state.name.trim() || creating}
                className="h-[44px] px-[30px] rounded-[8px] bg-[var(--color-assessment-cta)] hover:bg-[var(--color-assessment-cta-hover)] text-[var(--color-assessment-cta-text)] text-[15px] leading-none font-bold shadow-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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

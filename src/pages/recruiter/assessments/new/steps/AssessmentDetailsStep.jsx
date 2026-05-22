import { useState } from 'react';
import { IconArrowRight } from '@tabler/icons-react';
import { useAssessmentBuilder } from '../context/AssessmentBuilderContext';
import { createAssessment } from '../api/assessmentBuilderApi';

const DURATION_PRESETS = [30, 45, 60, 90, 120];
const SENIORITY_OPTIONS = ['Junior', 'Mid-level', 'Senior', 'Lead', 'Staff'];

export function AssessmentDetailsStep({ onCancel }) {
  const { state, dispatch, ACTIONS } = useAssessmentBuilder();
  const [customDuration, setCustomDuration] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const selectedDuration = state.duration_minutes;

  const handleDurationPreset = (val) => {
    setUseCustom(false);
    dispatch({ type: ACTIONS.SET_DETAILS, payload: { duration_minutes: val } });
  };

  const handleCustom = () => {
    setUseCustom(true);
    dispatch({ type: ACTIONS.SET_DETAILS, payload: { duration_minutes: customDuration ? Number(customDuration) : null } });
  };

  const handleCustomInput = (val) => {
    setCustomDuration(val);
    if (useCustom) {
      dispatch({ type: ACTIONS.SET_DETAILS, payload: { duration_minutes: val ? Number(val) : null } });
    }
  };

  const handleContinue = async () => {
    if (!state.name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await createAssessment({
        name: state.name,
        description: state.description,
        duration_minutes: state.duration_minutes,
        config_json: { role: state.role || '', seniority: state.seniority || '' },
      });
      dispatch({ type: ACTIONS.SET_DETAILS, payload: { backendId: res.id || res.data?.id } });
      dispatch({ type: ACTIONS.SET_STEP, payload: 2 });
    } catch (err) {
      setError(err.message || 'Failed to create assessment.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto py-12 px-6">
      <div className="max-w-[640px] mx-auto space-y-6">
        <div>
          <h2 className="text-[20px] font-bold text-text-primary mb-1">Assessment details</h2>
          <p className="text-[13px] text-text-secondary">This information is shown to candidates before they begin.</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">
            Assessment name <span className="text-error normal-case font-normal">*</span>
          </label>
          <input
            value={state.name}
            onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { name: e.target.value } })}
            placeholder="e.g. Senior Backend Engineer"
            className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">
            Description
          </label>
          <textarea
            value={state.description}
            onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { description: e.target.value } })}
            placeholder="Brief description shown to candidates…"
            rows={3}
            className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 resize-none transition-all"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-2">
            Duration cap
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATION_PRESETS.map(val => (
              <button
                key={val}
                onClick={() => handleDurationPreset(val)}
                className={`px-4 py-2 rounded-lg border text-[13px] font-semibold transition-all ${
                  !useCustom && selectedDuration === val
                    ? 'bg-brand border-brand text-on-brand'
                    : 'bg-surface border-border-default text-text-secondary hover:border-brand hover:text-text-primary'
                }`}
              >
                {val}m
              </button>
            ))}
            <button
              onClick={handleCustom}
              className={`px-4 py-2 rounded-lg border text-[13px] font-semibold transition-all ${
                useCustom
                  ? 'bg-brand border-brand text-on-brand'
                  : 'bg-surface border-border-default text-text-secondary hover:border-brand hover:text-text-primary'
              }`}
            >
              Custom
            </button>
            {useCustom && (
              <input
                type="number"
                min={1}
                max={999}
                value={customDuration}
                onChange={e => handleCustomInput(e.target.value)}
                placeholder="min"
                autoFocus
                className="w-20 px-3 py-2 bg-page border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
              />
            )}
          </div>
        </div>

        {/* Role */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-1.5">
            Role / Position
          </label>
          <input
            value={state.role ?? ''}
            onChange={e => dispatch({ type: ACTIONS.SET_DETAILS, payload: { role: e.target.value } })}
            placeholder="e.g. Backend Engineer, Data Scientist…"
            className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
          />
        </div>

        {/* Seniority */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-2">
            Seniority level
          </label>
          <div className="flex flex-wrap gap-2">
            {SENIORITY_OPTIONS.map(level => {
              const active = state.seniority === level;
              return (
                <button
                  key={level}
                  onClick={() => dispatch({ type: ACTIONS.SET_DETAILS, payload: { seniority: active ? '' : level } })}
                  className={`px-4 py-2 rounded-lg border text-[13px] font-semibold transition-all ${
                    active
                      ? 'bg-brand border-brand text-on-brand'
                      : 'bg-surface border-border-default text-text-secondary hover:border-brand hover:text-text-primary'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-[13px] text-error bg-error-bg border border-error/30 rounded-lg px-4 py-2.5">{error}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleContinue}
            disabled={!state.name.trim() || creating}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating…' : 'Continue'}
            {!creating && <IconArrowRight size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}

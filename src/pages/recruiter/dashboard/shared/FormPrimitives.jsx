// Reusable form primitives for wizard and other forms
import { Check } from 'lucide-react';

export const DURATION_PRESETS = [30, 45, 60, 90, 120];

export function StepTrack({ current }) {
  const steps = [
    { label: 'Assessment Details', desc: 'Name, description, duration' },
    { label: 'Task Configuration', desc: 'What candidates will build' },
  ];
  return (
    <div className="space-y-1">
      {steps.map((step, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${i === current ? 'bg-surface' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 transition-all duration-300 ${
            i < current ? 'bg-brand text-on-brand'
            : i === current ? 'border-2 border-brand text-brand'
            : 'border border-border-default text-text-secondary'
          }`}>
            {i < current ? <Check className="w-3 h-3" /> : i + 1}
          </div>
          <div>
            <p className={`text-[13px] font-semibold transition-colors ${i <= current ? 'text-text-primary' : 'text-text-secondary'}`}>{step.label}</p>
            <p className={`text-[11px] mt-0.5 transition-colors ${i === current ? 'text-text-secondary' : 'text-text-muted'}`}>{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Field({ label, optional, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
        {optional
          ? <span className="text-[10px] text-text-muted normal-case tracking-normal">(optional)</span>
          : <span className="text-error text-xs leading-none">*</span>
        }
      </label>
      {children}
    </div>
  );
}

export function FInput({ value, onChange, placeholder, type = 'text', min }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder} min={min}
      className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150"
    />
  );
}

export function FTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150"
    />
  );
}

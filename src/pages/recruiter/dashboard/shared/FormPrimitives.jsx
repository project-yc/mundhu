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
        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${i === current ? 'bg-[#111113]' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 transition-all duration-300 ${
            i < current ? 'bg-[#06B6D4] text-[#0C0C0E]'
            : i === current ? 'border-2 border-[#06B6D4] text-[#06B6D4]'
            : 'border border-[#27272A] text-[#52525B]'
          }`}>
            {i < current ? <Check className="w-3 h-3" /> : i + 1}
          </div>
          <div>
            <p className={`text-[13px] font-semibold transition-colors ${i <= current ? 'text-[#E4E4E7]' : 'text-[#52525B]'}`}>{step.label}</p>
            <p className={`text-[11px] mt-0.5 transition-colors ${i === current ? 'text-[#A1A1AA]' : 'text-[#3F3F46]'}`}>{step.desc}</p>
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
        <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">{label}</span>
        {optional
          ? <span className="text-[10px] text-[#3F3F46] normal-case tracking-normal">(optional)</span>
          : <span className="text-[#F43F5E] text-xs leading-none">*</span>
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
      className="w-full px-3.5 py-2.5 bg-[#0C0C0E] border border-[#27272A] rounded-lg text-[13px] text-[#E4E4E7] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]/15 transition-all duration-150"
    />
  );
}

export function FTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-3.5 py-2.5 bg-[#0C0C0E] border border-[#27272A] rounded-lg text-[13px] text-[#E4E4E7] placeholder:text-[#3F3F46] resize-none focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]/15 transition-all duration-150"
    />
  );
}

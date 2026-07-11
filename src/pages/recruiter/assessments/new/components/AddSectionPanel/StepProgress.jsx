const STEPS = [
  { number: 1, label: 'Add details' },
  { number: 2, label: 'Build Assessment' },
  { number: 3, label: 'Review' },
];

export function StepProgress({ currentStep }) {
  return (
    <div className="flex h-[30px] w-full items-center">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.number;
        const isPast = currentStep > step.number;
        const isFuture = currentStep < step.number;

        return (
          <div key={step.number} className={`flex items-center ${idx < STEPS.length - 1 ? 'flex-1' : 'flex-shrink-0'}`}>
            <div className="flex items-center gap-[10px]">
              <div
                className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border text-[13px] font-medium leading-none ${
                  isActive
                    ? 'border-[var(--color-assessment-step-active)] bg-[var(--color-assessment-step-active)] text-surface shadow-card'
                    : isPast
                      ? 'border-border-strong bg-surface text-text-secondary'
                      : 'border-border-strong bg-surface text-text-muted'
                }`}
              >
                {step.number}
              </div>
              <span
                className={`text-[12px] font-semibold leading-none ${
                  isActive ? 'text-text-primary' : isFuture ? 'text-text-muted' : 'text-text-secondary'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="relative mx-[12px] h-px min-w-[42px] flex-1 bg-border-strong">
                <span className="absolute right-0 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rotate-45 border-r border-t border-border-strong" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

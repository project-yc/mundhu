const STEPS = [
  { number: 1, label: 'Add details' },
  { number: 2, label: 'Build Assessment' },
  { number: 3, label: 'Review' },
];

export function StepProgress({ currentStep }) {
  return (
    <div className="flex h-[28px] items-center">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.number;
        const isPast = currentStep > step.number;
        const isFuture = currentStep < step.number;

        return (
          <div key={step.number} className="flex items-center">
            <div className="flex items-center gap-[10px]">
              <div
                className={`flex h-[28px] w-[28px] items-center justify-center rounded-full text-[12px] font-medium leading-none ${
                  isActive
                    ? 'bg-[var(--color-assessment-step-active)] text-surface shadow-card'
                    : isPast
                      ? 'text-text-muted'
                      : 'border border-border-strong bg-surface text-text-muted'
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
              <div className="relative mx-[10px] h-px w-[50px] bg-border-strong">
                <span className="absolute right-0 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rotate-45 border-r border-t border-border-strong" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

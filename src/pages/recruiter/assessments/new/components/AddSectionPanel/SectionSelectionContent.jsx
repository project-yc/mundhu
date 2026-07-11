import { ADAPTIVE_CARD_IMAGE, SECTION_CARDS } from './constants';
import { StepProgress } from './StepProgress';

export function SectionSelectionContent({
  currentStep,
  onAddSection,
  onSaveDraft,
  onReview,
}) {
  return (
    <>
      <div className="w-[calc(100%-24px)]">
        <StepProgress currentStep={currentStep} />

        <div className="mt-[36px]">
          <h2 className="text-[22px] font-bold leading-[28px] text-text-primary">Assessment details</h2>
          <p className="mt-[4px] text-[14px] leading-[20px] text-text-secondary">
            This information is shown to candidates before they begin.
          </p>
        </div>

        <button type="button" className="mt-[24px] block w-full text-left">
          <img
            src={ADAPTIVE_CARD_IMAGE}
            alt="Artificial Intelligence adaptive interview"
            className="block w-full select-none"
            draggable={false}
          />
        </button>

        <div className="mt-[18px] grid grid-cols-2 gap-[12px] xl:grid-cols-4">
          {SECTION_CARDS.map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => onAddSection(type, label)}
              className="group flex h-[98px] flex-col items-center justify-between rounded-[10px] border border-border-default bg-surface p-[4px] text-center transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              <div className="flex h-[62px] w-full items-center justify-center rounded-[8px] bg-surface-muted">
                <img src={icon} alt="" className="h-[40px] w-[43px] select-none" draggable={false} />
              </div>
              <span className="pb-[9px] text-[13px] font-semibold leading-none text-text-primary">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex w-[calc(100%-24px)] justify-end gap-[10px] pt-[24px]">
        <button
          type="button"
          onClick={onSaveDraft}
          className="h-[40px] rounded-button border border-border-default bg-surface px-[28px] text-[14px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
        >
          Save as draft
        </button>
        <button
          type="button"
          onClick={onReview}
          className="h-[40px] rounded-button bg-[var(--color-assessment-cta)] px-[28px] text-[14px] font-bold text-[var(--color-assessment-cta-text)] shadow-card transition-colors hover:bg-[var(--color-assessment-cta-hover)]"
        >
          Review &amp; Publish
        </button>
      </div>
    </>
  );
}

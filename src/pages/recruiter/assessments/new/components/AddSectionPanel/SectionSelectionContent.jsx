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
      <div className="w-[min(680px,100%)]">
        <StepProgress currentStep={currentStep} />

        <div className="mt-[50px]">
          <h2 className="text-[24px] font-bold leading-[30px] text-text-primary">Assessment details</h2>
          <p className="mt-[5px] text-[16px] leading-[22px] text-text-secondary">
            This information is shown to candidates before they begin.
          </p>
        </div>

        <button type="button" className="mt-[34px] block w-full text-left">
          <img
            src={ADAPTIVE_CARD_IMAGE}
            alt="Artificial Intelligence adaptive interview"
            className="block w-full select-none"
            draggable={false}
          />
        </button>

        <div className="mt-[24px] grid grid-cols-2 gap-[18px] xl:grid-cols-4">
          {SECTION_CARDS.map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => onAddSection(type, label)}
              className="group flex h-[121px] flex-col items-center justify-between rounded-[12px] border border-border-default bg-surface p-[5px] text-center transition-colors hover:border-border-strong hover:bg-surface-hover"
            >
              <div className="flex h-[78px] w-full items-center justify-center rounded-[10px] bg-surface-muted">
                <img src={icon} alt="" className="h-[50px] w-[54px] select-none" draggable={false} />
              </div>
              <span className="pb-[12px] text-[15px] font-semibold leading-none text-text-primary">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto flex w-[min(680px,100%)] justify-end gap-[12px] pt-[36px]">
        <button
          type="button"
          onClick={onSaveDraft}
          className="h-[45px] rounded-button border border-border-default bg-surface px-[36px] text-[15px] font-medium text-text-primary shadow-card transition-colors hover:bg-surface-hover"
        >
          Save as draft
        </button>
        <button
          type="button"
          onClick={onReview}
          className="h-[45px] rounded-button bg-[var(--color-assessment-cta)] px-[35px] text-[15px] font-bold text-[var(--color-assessment-cta-text)] shadow-card transition-colors hover:bg-[var(--color-assessment-cta-hover)]"
        >
          Review &amp; Publish
        </button>
      </div>
    </>
  );
}

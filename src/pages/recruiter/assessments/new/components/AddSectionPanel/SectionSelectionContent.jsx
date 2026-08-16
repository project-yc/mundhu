import { ADAPTIVE_CARD_IMAGE, SECTION_CARDS } from './constants';
import { StepProgress } from './StepProgress';

/**
 * The section-type picker.
 *
 * Save-as-draft and Review & Publish used to live at the bottom of this
 * component, which meant they vanished the moment you clicked a question —
 * selecting a question swaps the whole right panel to an editor. They are
 * builder-wide actions, so they now live in a persistent footer
 * (`BuilderActionsFooter`) instead.
 */
export function SectionSelectionContent({ currentStep, onAddSection }) {
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

        <button
          type="button"
          onClick={() => onAddSection('adaptive', 'AI Adaptive Interview')}
          className="mt-[24px] block w-full max-w-[380px] rounded-[10px] text-left transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
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
    </>
  );
}

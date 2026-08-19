import { Copy, LayoutTemplate, PenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ActionCard({ icon, title, description, cta, onClick, primary }) {
  const Icon = icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full flex-col rounded-[10px] border border-border-subtle bg-surface p-[22px] text-left shadow-card transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
    >
      <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] bg-page">
        <Icon className="h-[18px] w-[18px] text-text-primary" strokeWidth={1.7} />
      </div>
      <h3 className="mt-[16px] text-[15px] font-bold leading-[20px] text-text-primary">
        {title}
      </h3>
      <p className="mt-[7px] text-[13px] leading-[19px] text-text-secondary">
        {description}
      </p>
      <div className="flex-1" />
      <span
        className={
          primary
            ? 'mt-[18px] inline-flex h-[36px] items-center justify-center rounded-[8px] bg-[var(--color-assessment-cta)] px-[18px] text-[13px] font-bold leading-none text-[var(--color-assessment-cta-text)] transition-colors group-hover:bg-[var(--color-assessment-cta-hover)]'
            : 'mt-[18px] inline-flex h-[36px] items-center justify-center rounded-[8px] border border-border-default bg-surface px-[18px] text-[13px] font-medium leading-none text-text-primary transition-colors group-hover:bg-surface-hover'
        }
      >
        {cta}
      </span>
    </button>
  );
}

/**
 * Step 0 — how do you want to start?
 *
 * Shown only for a genuinely blank `/recruiter/assessments/new`. Arriving with
 * `?template=<id>` or `?from=scratch` means the recruiter has already made this
 * choice somewhere else (the gallery, the dashboard CTA), so the builder skips
 * straight past it rather than asking twice.
 */
export function AssessmentStartStep({ onStartFromScratch, onCancel }) {
  const navigate = useNavigate();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-surface">
      <div className="mx-auto w-full max-w-[860px] px-8 pb-10 pt-[52px]">
        <h1 className="text-[24px] font-bold leading-[30px] tracking-normal text-text-primary">
          Create an assessment
        </h1>
        <p className="mt-[8px] max-w-[520px] text-[15px] leading-[22px] text-text-secondary">
          Start from a prebuilt template for the role you're hiring, or build the
          question set yourself.
        </p>

        <div className="mt-[30px] grid grid-cols-1 gap-[14px] md:grid-cols-3">
          <ActionCard
            primary
            icon={LayoutTemplate}
            title="Use a template"
            description="Prebuilt assessments for common roles, with the questions, timings and settings already chosen. Everything stays editable."
            cta="Browse templates"
            onClick={() => navigate('/recruiter/templates')}
          />
          <ActionCard
            icon={PenLine}
            title="Start from scratch"
            description="Name it, then assemble sections and questions yourself from the task library."
            cta="Start building"
            onClick={onStartFromScratch}
          />
          <ActionCard
            icon={Copy}
            title="Duplicate an assessment"
            description="Copy one you have already run and adjust it for the new requisition."
            cta="Pick an assessment"
            onClick={() => navigate('/recruiter/assessments')}
          />
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-[26px] text-[13px] font-medium text-text-secondary hover:text-text-primary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

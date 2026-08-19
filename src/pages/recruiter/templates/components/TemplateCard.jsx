import { Briefcase, Clock, FileText, Layers, Lock, Users } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import {
  DIFFICULTY_TONE,
  TONE_CLASSES,
  formatDuration,
} from '../constants/templatesConfig';
import { contentTypeChips } from '../utils/presetRows';

function Chip({ tone = 'slate', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[6px] border px-[7px] py-[3px] text-[11px] font-semibold leading-none',
        TONE_CLASSES[tone] || TONE_CLASSES.slate,
      )}
    >
      {children}
    </span>
  );
}

function Meta({ icon, children }) {
  const Icon = icon;
  return (
    <span className="inline-flex items-center gap-[5px] text-[12px] leading-none text-text-secondary">
      <Icon className="h-[13px] w-[13px] shrink-0" strokeWidth={1.8} />
      {children}
    </span>
  );
}

/**
 * One template in the gallery.
 *
 * The whole card is the preview affordance and "Use template" is the commit —
 * two actions, not one, because choosing a template is a decision a recruiter
 * wants to inspect first, and a card that instantiated on click would create a
 * stray draft assessment every time someone browsed.
 */
export function TemplateCard({ template, onPreview, onUse, busy }) {
  const chips = contentTypeChips(template.contentTypeCounts);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onPreview(template)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPreview(template);
        }
      }}
      className="group flex h-full cursor-pointer flex-col rounded-[10px] border border-border-subtle bg-surface p-[18px] text-left shadow-card transition-colors hover:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[15px] font-bold leading-[20px] text-text-primary">
          {template.name}
        </h3>
        {template.isLocked && (
          <span title="Certified template — content cannot be edited">
            <Lock className="h-[14px] w-[14px] shrink-0 text-text-muted" strokeWidth={1.8} />
          </span>
        )}
      </div>

      {template.targetRole && (
        <p className="mt-[6px]">
          <Meta icon={Briefcase}>{template.targetRole}</Meta>
        </p>
      )}

      {template.summary && (
        <p className="mt-[10px] line-clamp-2 text-[13px] leading-[18px] text-text-secondary">
          {template.summary}
        </p>
      )}

      <div className="mt-[14px] flex flex-wrap items-center gap-x-[14px] gap-y-[6px]">
        <Meta icon={Clock}>{formatDuration(template.durationMinutes)}</Meta>
        <Meta icon={FileText}>
          {template.itemCount} {template.itemCount === 1 ? 'question' : 'questions'}
        </Meta>
        <Meta icon={Layers}>
          {template.sectionCount} {template.sectionCount === 1 ? 'section' : 'sections'}
        </Meta>
        {template.usageCount > 0 && (
          <Meta icon={Users}>Used {template.usageCount}×</Meta>
        )}
      </div>

      {chips.length > 0 && (
        <div className="mt-[12px] flex flex-wrap gap-[6px]">
          {chips.map(chip => (
            <Chip key={chip.type} tone={chip.tone}>
              {chip.count} {chip.label}
            </Chip>
          ))}
        </div>
      )}

      {/* Pushes the footer down so cards in a row line up regardless of how
          much of the body each one filled. */}
      <div className="flex-1" />

      <div className="mt-[16px] flex items-center justify-between gap-3 border-t border-border-subtle pt-[14px]">
        <div className="flex flex-wrap gap-[6px]">
          {template.difficulty && (
            <Chip tone={DIFFICULTY_TONE[template.difficulty] || 'slate'}>
              {template.difficulty}
            </Chip>
          )}
          {template.seniority && <Chip>{template.seniority.replace('_', ' ')}</Chip>}
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={event => {
            // The card behind this is the preview trigger.
            event.stopPropagation();
            onUse(template);
          }}
          className="h-[32px] shrink-0 rounded-[7px] bg-[var(--color-assessment-cta)] px-[14px] text-[13px] font-bold leading-none text-[var(--color-assessment-cta-text)] transition-colors hover:bg-[var(--color-assessment-cta-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? 'Creating…' : 'Use template'}
        </button>
      </div>
    </div>
  );
}

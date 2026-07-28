import { cn } from '../../../../lib/utils';
import {
  CARD_BASIS,
  SECTION_BADGES,
  SECTION_TASK_NAMES,
  getSectionSignalLabel,
  getSectionSignalTone,
} from '../constants/sectionCards';

function getScorePercent(section) {
  const score = Number(section?.score ?? 0);
  const maxScore = Number(section?.max_score ?? 0);
  if (maxScore <= 0) return null;
  return Math.round((score / maxScore) * 100);
}

function formatScore(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '00';
  return String(Math.round(Number(value))).padStart(2, '0');
}

/** Figma illustration block: 117x112 — badge plus five skeleton lines. */
function CardIllustration({ badge }) {
  return (
    <div className="flex w-[117px] flex-shrink-0 items-center justify-center bg-surface-muted">
      <div className="h-[80px] w-[77px] rounded-[9px] bg-surface p-[8px] shadow-card">
        <span className="inline-flex h-[20px] items-center rounded-[6px] bg-[var(--color-assessment-accent)] px-[6px] text-[7px] font-bold text-surface">
          {badge}
        </span>
        <div className="mt-[8px] space-y-[4px]">
          {[43, 61, 43, 61, 43].map((width, index) => (
            <span
              key={index}
              className="block h-[4px] rounded-full bg-border-default"
              style={{ width }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** One assessment section. Clicking "Show details" opens that section's panel. */
export function SectionCard({ section, onShowDetails }) {
  const type = section?.content_type;
  const percent = getScorePercent(section);
  const title = section?.section_name || SECTION_TASK_NAMES[type] || 'Section';
  const signalLabel = getSectionSignalLabel(percent);

  return (
    <article
      className={cn(
        'flex min-h-[113px] overflow-hidden rounded-[10px] border border-border-subtle bg-surface shadow-card',
        CARD_BASIS,
      )}
    >
      <CardIllustration badge={SECTION_BADGES[type] || 'Section'} />

      <div className="flex min-w-0 flex-1 flex-col px-[12px] py-[16px]">
        <div className="flex items-start justify-between gap-3">
          <h3 className="truncate text-[15px] font-bold leading-[18px] text-text-primary">{title}</h3>
          <button
            type="button"
            onClick={() => onShowDetails(section)}
            className="flex-shrink-0 text-[14px] font-medium leading-[18px] text-brand transition-colors hover:text-brand-hover"
          >
            Show details
          </button>
        </div>

        <div className="mt-auto">
          <p className="text-[20px] font-bold leading-[18px] text-text-primary">
            {formatScore(percent)}{' '}
            <span className="text-[14px] font-medium text-text-muted">(out of 100)</span>
          </p>
          {signalLabel && (
            <p className={cn('mt-[5px] text-[13px] font-bold leading-[18px]', getSectionSignalTone(percent))}>
              {signalLabel}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

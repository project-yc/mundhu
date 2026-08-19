import { useEffect, useState } from 'react';
import { Clock, FileText, Layers, Target } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../../../components/ui/sheet';
import { cn } from '../../../../lib/utils';
import { getPreset } from '../../../../api/recruiter/presets';
import {
  CONTENT_TYPE_META,
  TONE_CLASSES,
  formatDuration,
} from '../constants/templatesConfig';
import { normalizeTemplateRow } from '../utils/presetRows';

function TypeBadge({ contentType }) {
  const meta = CONTENT_TYPE_META[contentType] || { full: contentType, tone: 'slate' };
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-[6px] border px-[7px] py-[3px] text-[11px] font-semibold leading-none',
        TONE_CLASSES[meta.tone] || TONE_CLASSES.slate,
      )}
    >
      {meta.full}
    </span>
  );
}

function Stat({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="flex-1 rounded-[8px] border border-border-subtle bg-page px-[12px] py-[10px]">
      <div className="flex items-center gap-[6px] text-[11px] font-semibold uppercase tracking-[0.03em] text-text-muted">
        <Icon className="h-[13px] w-[13px]" strokeWidth={1.8} />
        {label}
      </div>
      <p className="mt-[6px] text-[15px] font-bold leading-none text-text-primary">{value}</p>
    </div>
  );
}

/**
 * What the recruiter reads before committing: which sections, which questions,
 * what each is worth.
 *
 * Note what is deliberately absent — prompts, options and answer keys. This
 * catalogue is visible to every org on the platform, so the detail endpoint
 * does not serve the answers and this panel could not show them if it wanted to.
 */
export function TemplatePreviewDrawer({ template, open, onOpenChange, onUse, busy }) {
  // Fetched state is tagged with the request it answered, so `loading` and
  // `error` are derived rather than set at the top of the effect. Same pattern
  // as useTemplateGallery — it keeps the effect free of synchronous setState,
  // and it means reopening the drawer on a different template cannot briefly
  // show the previous template's outline.
  const [result, setResult] = useState({ key: null, detail: null, error: '' });

  const templateId = template?.id;
  const requestKey = open && templateId ? templateId : null;

  useEffect(() => {
    if (!requestKey) return undefined;

    let cancelled = false;

    getPreset(requestKey)
      .then(payload => {
        if (!cancelled) {
          setResult({ key: requestKey, detail: normalizeTemplateRow(payload), error: '' });
        }
      })
      .catch(err => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            detail: null,
            error: err?.message || 'Could not load this template.',
          });
        }
      });

    return () => { cancelled = true; };
  }, [requestKey]);

  const settled = result.key === requestKey;
  const detail = settled ? result.detail : null;
  const error = settled ? result.error : '';
  const loading = Boolean(requestKey) && !settled;

  // The card already carries enough to render the header, so the panel shows
  // it immediately and fills in the outline when the detail request lands.
  const shown = detail || template;
  const preview = detail?.preview;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-[520px]">
        {shown && (
          <>
            <SheetHeader className="space-y-[6px] border-b border-border-subtle px-[24px] py-[20px] text-left">
              <SheetTitle className="text-[18px] font-bold leading-[24px] text-text-primary">
                {shown.name}
              </SheetTitle>
              <SheetDescription className="text-[13px] leading-[18px] text-text-secondary">
                {shown.summary || shown.description || 'Prebuilt assessment template.'}
              </SheetDescription>
            </SheetHeader>

            <div className="min-h-0 flex-1 overflow-y-auto px-[24px] py-[20px]">
              <div className="flex gap-[10px]">
                <Stat icon={Clock} label="Length" value={formatDuration(shown.durationMinutes)} />
                <Stat icon={Layers} label="Sections" value={shown.sectionCount} />
                <Stat icon={FileText} label="Questions" value={shown.itemCount} />
              </div>

              {shown.targetRole && (
                <div className="mt-[18px] flex items-center gap-[7px] text-[13px] text-text-secondary">
                  <Target className="h-[14px] w-[14px]" strokeWidth={1.8} />
                  Built for <span className="font-semibold text-text-primary">{shown.targetRole}</span>
                </div>
              )}

              {shown.skills?.length > 0 && (
                <div className="mt-[18px]">
                  <p className="mb-[8px] text-[12px] font-bold uppercase tracking-[0.04em] text-text-muted">
                    Skills covered
                  </p>
                  <div className="flex flex-wrap gap-[6px]">
                    {shown.skills.map(skill => (
                      <span
                        key={skill}
                        className="rounded-[6px] border border-border-subtle bg-page px-[8px] py-[4px] text-[12px] leading-none text-text-secondary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-[24px]">
                <p className="mb-[10px] text-[12px] font-bold uppercase tracking-[0.04em] text-text-muted">
                  What's inside
                </p>

                {loading && (
                  <p className="text-[13px] text-text-secondary">Loading outline…</p>
                )}
                {error && <p className="text-[13px] text-error">{error}</p>}

                {preview?.sections?.map((section, index) => (
                  <div
                    key={section.id}
                    className="mb-[12px] overflow-hidden rounded-[8px] border border-border-subtle"
                  >
                    <div className="flex items-center justify-between gap-3 bg-page px-[14px] py-[10px]">
                      <p className="text-[13px] font-bold text-text-primary">
                        {index + 1}. {section.name}
                      </p>
                      {section.timerMinutes != null && (
                        <span className="shrink-0 text-[12px] text-text-secondary">
                          {formatDuration(section.timerMinutes)}
                        </span>
                      )}
                    </div>
                    <ul className="divide-y divide-border-subtle">
                      {section.items.map(item => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 px-[14px] py-[10px]"
                        >
                          <div className="flex min-w-0 items-center gap-[8px]">
                            <TypeBadge contentType={item.contentType} />
                            <span className="truncate text-[13px] text-text-primary">
                              {item.title}
                            </span>
                          </div>
                          <span className="shrink-0 text-[12px] font-medium text-text-secondary">
                            {item.points} pts
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-[10px] border-t border-border-subtle px-[24px] py-[16px]">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-[38px] rounded-[8px] border border-border-default bg-surface px-[18px] text-[14px] font-medium leading-none text-text-primary transition-colors hover:bg-surface-hover"
              >
                Close
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => onUse(shown)}
                className="h-[38px] rounded-[8px] bg-[var(--color-assessment-cta)] px-[20px] text-[14px] font-bold leading-none text-[var(--color-assessment-cta-text)] transition-colors hover:bg-[var(--color-assessment-cta-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? 'Creating…' : 'Use this template'}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

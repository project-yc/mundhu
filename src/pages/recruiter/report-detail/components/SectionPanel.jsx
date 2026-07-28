import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../../lib/utils';

/**
 * Right-side drawer shell shared by every section panel.
 * Figma: 622px wide, header row with title + circular close, hairline divider,
 * scrolling body.
 *
 * Content-agnostic on purpose — MCQ and AI Adaptive panels reuse this shell.
 */
export function SectionPanel({ open, title, subtitle, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = event => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <div className={cn('fixed inset-0 z-50 transition-[visibility] duration-500', open ? 'visible' : 'invisible')}>
      <button
        type="button"
        aria-label="Close panel"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          'absolute inset-0 bg-text-primary/45 transition-opacity duration-500 ease-out',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-hidden={!open}
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-[622px] flex-col border-l border-border-subtle bg-surface shadow-modal',
          'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <header className="flex h-[56px] flex-shrink-0 items-center justify-between border-b border-border-subtle px-[22px]">
          <div className="min-w-0">
            <h2 className="truncate text-[16px] font-bold leading-[20px] text-text-primary">{title}</h2>
            {subtitle && (
              <p className="truncate text-[12px] leading-[15px] text-text-muted">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full border border-border-default text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary"
          >
            <X className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-[22px] py-[20px]">{children}</div>
      </aside>
    </div>
  );
}

/** Consistent heading + spacing for the blocks inside a panel. */
export function PanelBlock({ title, action, children, className }) {
  return (
    <section className={cn('mt-[26px] first:mt-0', className)}>
      {(title || action) && (
        <div className="mb-[10px] flex items-center justify-between gap-3">
          {title && <h3 className="text-[15px] font-bold leading-[19px] text-text-primary">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

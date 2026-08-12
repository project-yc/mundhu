import { IconClock } from '@tabler/icons-react';

/**
 * Section settings card shown at the top of MCQ, FreeText, and Ranking editors.
 * Displays the section timer as read-only — configure it in the Add Section panel.
 */
export function SectionConfigCard({ timerMinutes }) {
  return (
    <div className="bg-surface border border-border-default rounded-lg p-3 mb-3">
      <p className="text-[9.5px] font-bold uppercase tracking-widest text-text-muted mb-2">Section Settings</p>
      <div className="flex items-center gap-2 text-[12px] text-text-secondary">
        <IconClock size={12} className="text-text-muted" />
        <span className="font-medium">Section timer</span>
        <span className="px-2 py-0.5 bg-surface-muted border border-border-default rounded-md text-[12px] text-text-primary font-semibold">
          {timerMinutes ? `${timerMinutes} min` : '—'}
        </span>
      </div>
    </div>
  );
}

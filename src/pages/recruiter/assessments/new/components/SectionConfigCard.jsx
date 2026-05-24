import { IconClock } from '@tabler/icons-react';

/**
 * Section settings card shown at the top of MCQ, FreeText, and Ranking editors.
 * Displays the section timer as read-only — configure it in the Add Section panel.
 */
export function SectionConfigCard({ timerMinutes }) {
  return (
    <div className="bg-surface border border-border-default rounded-xl p-4 mb-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Section Settings</p>
      <div className="flex items-center gap-2 text-[13px] text-text-secondary">
        <IconClock size={13} className="text-text-muted" />
        <span className="font-medium">Section timer</span>
        <span className="px-2.5 py-1 bg-surface-muted border border-border-default rounded-lg text-[13px] text-text-primary font-semibold">
          {timerMinutes ? `${timerMinutes} min` : '—'}
        </span>
      </div>
    </div>
  );
}

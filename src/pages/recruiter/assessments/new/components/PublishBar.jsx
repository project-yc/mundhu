import { IconLock } from '@tabler/icons-react';

/**
 * Amber publish bar pinned at bottom of draft question cards.
 * onPublish — async callback; button shows loading state.
 */
export function PublishBar({ onPublish, loading = false }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-warning-bg border-t border-warning-border rounded-b-xl">
      <p className="text-[12px] text-warning flex items-center gap-1.5">
        <span className="text-base">ℹ️</span>
        Publish to lock this question before inviting candidates.
      </p>
      <button
        onClick={onPublish}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-warning border border-warning-border rounded-lg hover:bg-warning/10 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        <IconLock size={13} />
        {loading ? 'Publishing…' : 'Publish question'}
      </button>
    </div>
  );
}

import { IconLock, IconLockOpen } from '@tabler/icons-react';

/**
 * Green locked banner shown atop any locked question/task.
 * onUnlock — callback when "Unlock to edit" is clicked.
 */
export function LockedBanner({ onUnlock }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 bg-success-bg border border-success-border rounded-lg text-[13px]">
      <div className="flex items-center gap-2 text-success font-medium">
        <IconLock size={15} />
        <span>This question is published and locked. Candidates may have already seen it.</span>
      </div>
      <button
        onClick={onUnlock}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-success border border-success-border rounded-lg hover:bg-success/10 transition-colors whitespace-nowrap"
      >
        <IconLockOpen size={13} />
        Unlock to edit
      </button>
    </div>
  );
}

/**
 * Amber warning banner shown when editing an unlocked (previously published) question.
 */
export function UnlockedWarningBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-warning-bg border border-warning-border rounded-lg text-[13px] text-warning font-medium">
      <IconLockOpen size={15} />
      <span>Editing a published question. Changes will apply to future sessions only.</span>
    </div>
  );
}

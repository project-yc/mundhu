import { IconCoin, IconCopy, IconTrash } from '@tabler/icons-react';

/**
 * Shared question card footer — points, duplicate, delete.
 * Extra children can be passed for type-specific toggles (shuffle, partial credit, etc.)
 */
export function QuestionFooter({
  points, onPointsChange,
  onDuplicate, onDelete,
  disabled = false,
  children,
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-surface-muted border-t border-border-default rounded-b-lg">
      {/* Left: pts + extra slots */}
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-1.5 text-[11.5px] text-text-secondary">
          <IconCoin size={12} className="text-text-muted" />
          <span>Pts</span>
          <input
            type="number"
            min={0}
            max={9999}
            value={points ?? ''}
            onChange={e => onPointsChange(e.target.value !== '' ? Number(e.target.value) : null)}
            disabled={disabled}
            className="w-12 px-1.5 py-1 bg-surface border border-border-default rounded text-[11.5px] text-text-primary focus:outline-none focus:border-brand disabled:opacity-50"
          />
        </label>
        {children}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onDuplicate}
          disabled={disabled}
          title="Duplicate"
          className="p-1 text-text-muted hover:text-text-primary hover:bg-surface rounded transition-colors disabled:opacity-40"
        >
          <IconCopy size={13} />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="p-1 text-text-muted hover:text-error hover:bg-error-bg rounded transition-colors"
        >
          <IconTrash size={13} />
        </button>
      </div>
    </div>
  );
}

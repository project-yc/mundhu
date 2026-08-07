import { IconArrowUp, IconMicrophone } from '@tabler/icons-react'
import { cn } from '../../../../lib/utils'

export default function Composer({ value, onChange, onSend, disabled, inputRef }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSend()
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          'flex items-end gap-2 rounded-xl bg-chrome p-2.5',
          disabled && 'opacity-60',
        )}
      >
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={2}
          placeholder="Type your response..."
          className="min-h-[44px] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Voice input coming soon"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-hover text-text-muted opacity-60"
          >
            <IconMicrophone size={17} />
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            aria-label="Send response"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand transition-opacity disabled:opacity-40"
          >
            <IconArrowUp size={17} />
          </button>
        </div>
      </div>
      <p className="text-[12px] leading-[1.4] text-text-faint">
        Press Enter to send | Shift + Enter for a new line
      </p>
    </div>
  )
}

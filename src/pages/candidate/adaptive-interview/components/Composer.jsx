import { IconArrowUp, IconMicrophone, IconPlayerStopFilled } from '@tabler/icons-react'
import { cn } from '../../../../lib/utils'

// Engine rejects answers over 65,536 chars with a 422; cap slightly below so a
// giant paste is trimmed client-side instead of erroring after send.
const MAX_ANSWER_CHARS = 65000
const COUNTER_THRESHOLD = 60000

export default function Composer({
  value,
  onChange,
  onSend,
  disabled,
  inputRef,
  dictation,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && value.trim()) onSend()
    }
  }

  const listening = Boolean(dictation?.listening)
  // Interim speech is shown as a ghost line under the box rather than written
  // into the textarea: recognition rewrites the tail of a phrase as it refines
  // it, so streaming it into an editable field fights whatever the candidate is
  // typing and moves their cursor. Only finalized phrases get committed.
  const interim = dictation?.interim?.trim()

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          'flex items-end gap-2 rounded-xl bg-chrome p-2.5',
          disabled && 'opacity-60',
          listening && 'ring-1 ring-brand',
        )}
      >
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={2}
          maxLength={MAX_ANSWER_CHARS}
          aria-label="Your answer"
          placeholder={
            listening
              ? 'Listening — speak, then edit anything that came out wrong...'
              : 'Type your answer — plain, informal language is fine...'
          }
          className="min-h-[44px] flex-1 resize-none bg-transparent px-1.5 py-1.5 text-[14px] text-text-primary placeholder:text-text-muted focus:outline-none disabled:cursor-not-allowed"
        />
        <div className="flex shrink-0 items-center gap-1">
          {dictation?.supported && (
            <button
              type="button"
              onClick={dictation.toggle}
              disabled={disabled}
              aria-pressed={listening}
              aria-label={listening ? 'Stop voice input' : 'Answer using your voice'}
              title={listening ? 'Stop voice input' : 'Answer using your voice'}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                listening
                  ? 'bg-brand text-on-brand'
                  : 'bg-surface-hover text-text-secondary hover:text-text-primary',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {listening ? <IconPlayerStopFilled size={15} /> : <IconMicrophone size={17} />}
            </button>
          )}
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

      {listening && (
        <p className="min-h-[17px] text-[12px] leading-[1.4] text-text-muted" aria-live="polite">
          {interim || 'Listening...'}
        </p>
      )}

      {dictation?.error && (
        <p role="alert" className="text-[12px] leading-[1.4] text-warning">
          {dictation.error}
        </p>
      )}

      <p className="text-[12px] leading-[1.4] text-text-faint">
        Press Enter to send | Shift + Enter for a new line
        {dictation?.supported && !listening && ' | Tap the mic to speak instead'}
        {value.length >= COUNTER_THRESHOLD && (
          <span className="ml-2">{value.length.toLocaleString()} / {MAX_ANSWER_CHARS.toLocaleString()}</span>
        )}
      </p>
    </div>
  )
}

import { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'
import { cn } from '../../../../../lib/utils'

// `tone` distinguishes a genuine error log from neutral monospace content. The
// error styling was hardcoded, so the memory aid — which shows a stuck candidate
// their OWN working code — framed it in a red error box.
const TONES = {
  error: {
    container: 'border-error-border bg-error-bg',
    divider: 'border-error-border',
  },
  neutral: {
    container: 'border-border-subtle bg-surface-muted',
    divider: 'border-border-subtle',
  },
}

export default function LogSection({ section }) {
  const [expanded, setExpanded] = useState(!!section.defaultExpanded)
  const tone = TONES[section.tone] || TONES.error

  return (
    <div className="flex flex-col gap-1">
      <p className="text-[13px] font-medium text-text-primary">{section.label}</p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn('flex w-full flex-col gap-1 rounded-xl border p-3 text-left', tone.container)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[12px] text-text-secondary">{section.lines[0]}</span>
          <IconChevronDown
            size={16}
            className={cn('shrink-0 text-text-muted transition-transform', expanded && 'rotate-180')}
          />
        </div>
        {expanded && section.lines.length > 1 && (
          <div className={cn('flex flex-col gap-0.5 border-t pt-2', tone.divider)}>
            {section.lines.slice(1).map((line, i) => (
              <span key={i} className="font-mono text-[12px] leading-[1.4] text-text-secondary">
                {line}
              </span>
            ))}
          </div>
        )}
      </button>
    </div>
  )
}

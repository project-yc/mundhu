export default function ChatTranscriptSection({ section }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] font-medium text-text-primary">{section.label}</p>
      <div className="flex flex-col gap-4">
        {section.messages.map((message, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-[30px] w-[30px] shrink-0 rounded-full bg-surface-muted" aria-hidden="true" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[13px] font-medium text-text-primary">{message.author}</span>
                <span className="text-[12px] text-text-faint">{message.timestampLabel}</span>
              </div>
              <p className="border-l-2 border-border-strong pl-1.5 text-[13px] leading-[1.4] text-text-secondary">
                {message.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

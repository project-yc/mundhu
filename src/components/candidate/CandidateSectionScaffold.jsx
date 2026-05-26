function CandidatePageShell({ children, maxWidth = 'max-w-lg' }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className={`w-full ${maxWidth} space-y-7 animate-slideInUp`}>
        {children}
      </div>
    </div>
  )
}

export function CandidateCenteredLoadingState({ label }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center gap-3 text-zinc-400 text-sm">
      <div className="w-4 h-4 border-2 border-zinc-700 border-t-cyan rounded-full animate-spin" />
      {label}
    </div>
  )
}

export function CandidateCenteredErrorState({ title, message }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6 animate-slideInUp text-center">
        <div className="w-14 h-14 rounded-full bg-rose/10 border border-rose/20 flex items-center justify-center mx-auto">
          <span className="text-rose text-2xl">!</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-zinc-50 text-xl font-bold">{title}</h1>
          <p className="text-zinc-400 text-sm">{message}</p>
        </div>
      </div>
    </div>
  )
}

export function CandidateErrorBanner({ children }) {
  return (
    <div className="rounded-xl border border-rose/20 bg-rose/10 px-4 py-3 text-sm text-rose">
      {children}
    </div>
  )
}

export function CandidatePrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`w-full flex items-center justify-center gap-2 py-3.5 bg-cyan hover:bg-cyan-hover text-zinc-950 font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function CandidateSecondaryButton({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`px-4 py-2.5 border border-zinc-700 text-zinc-300 hover:text-zinc-100 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function CandidateSectionIntroScreen({
  eyebrow,
  title,
  subtitle,
  metaItems = [],
  noticeTitle = 'Before you begin',
  tips = [],
  error,
  actionContent,
  onAction,
  actionDisabled = false,
  maxWidth = 'max-w-lg',
}) {
  return (
    <CandidatePageShell maxWidth={maxWidth}>
      <div className="text-center space-y-2">
        <p className="text-zinc-600 text-xs font-semibold uppercase tracking-widest">{eyebrow}</p>
        <h1 className="text-zinc-50 text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? <p className="text-zinc-400 text-sm">{subtitle}</p> : null}
      </div>

      {metaItems.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {metaItems.map((item, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800/80 border border-zinc-700/60 px-2.5 py-1 rounded-full"
            >
              {item}
            </span>
          ))}
        </div>
      ) : null}

      {tips.length > 0 ? (
        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl px-4 py-4 space-y-2.5">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wide">{noticeTitle}</p>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2.5 text-zinc-500 text-sm">
                <span className="w-1 h-1 rounded-full bg-zinc-600 shrink-0 mt-2" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <CandidateErrorBanner>{error}</CandidateErrorBanner> : null}

      <CandidatePrimaryButton onClick={onAction} disabled={actionDisabled}>
        {actionContent}
      </CandidatePrimaryButton>
    </CandidatePageShell>
  )
}
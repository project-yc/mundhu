import { CheckCircle, UserPlus } from 'lucide-react';

export function SuccessState({ success, selectedName, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-success-border bg-success-bg">
        <CheckCircle className="h-7 w-7 text-success" />
      </div>
      <h2 className="mb-1 font-display text-[20px] font-bold text-text-primary">
        {success.invited} invite{success.invited !== 1 ? 's' : ''} sent
      </h2>
      <p className="mb-6 text-[13px] text-text-secondary">
        Candidates will receive an email with their unique assessment link for{' '}
        <span className="text-text-secondary">{selectedName}</span>.
      </p>
      {success.results.length > 0 && (
        <div className="mb-6 w-full max-w-md overflow-hidden rounded-xl border border-border-default text-left">
          {success.results.map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 ${i < success.results.length - 1 ? 'border-b border-border-subtle' : ''}`}
            >
              <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${r.status === 'sent' ? 'bg-success-bg text-success' : 'bg-error-bg text-error'}`}>
                {r.status === 'sent' ? '✓' : '✕'}
              </span>
              <span className="flex-1 truncate text-[12px] text-text-primary">{r.email}</span>
              {r.error && <span className="max-w-[140px] truncate text-[11px] text-text-secondary">{r.error}</span>}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={onReset}
        className="flex items-center gap-2 rounded-xl border border-brand-border bg-brand-tint px-5 py-2.5 text-[13px] font-semibold text-brand transition-all hover:bg-brand-tint-light"
      >
        <UserPlus className="h-4 w-4" />
        Invite more
      </button>
    </div>
  );
}

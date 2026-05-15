// Shared status badge + funnel bar components

export const STATUS_CONFIG = {
  'Invited':     { color: '#22D3EE', bg: '#CFFAFE', border: '#0E7490', label: 'Invited' },
  'In Progress': { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', label: 'Active' },
  'Submitted':   { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', label: 'Submitted' },
  'Expired':     { color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', label: 'Expired' },
};

export function CandidateStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Invited'];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

export function FunnelBar({ counts }) {
  const total = counts?.total || 0;
  if (total === 0) return <span className="text-[11px] text-text-muted">No candidates yet</span>;
  const segs = [
    { key: 'invited',     color: '#22D3EE' },
    { key: 'in_progress', color: '#D97706' },
    { key: 'submitted',   color: '#16A34A' },
    { key: 'expired',     color: '#CBD5E1' },
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 rounded-full overflow-hidden w-24 bg-border-default">
        {segs.map(({ key, color }) => {
          const pct = (counts?.[key] || 0) / total * 100;
          return pct > 0 ? (
            <div key={key} className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
          ) : null;
        })}
      </div>
      <span className="text-[11px] text-text-secondary">{total} candidate{total !== 1 ? 's' : ''}</span>
    </div>
  );
}

export function EmptyGrid() {
  return (
    <div className="relative mx-auto" style={{ width: 88, height: 72 }}>
      <div className="absolute inset-0 border border-border-default rounded-xl" />
      <div className="absolute top-0 left-0 right-0 h-5 border-b border-border-default rounded-t-xl flex items-center px-3 gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-border-default" />
        <div className="w-8 h-1 rounded-full bg-border-default" />
      </div>
      {[32, 48, 62].map((top, i) => (
        <div key={i} className="absolute left-3 right-3 flex items-center gap-2" style={{ top }}>
          <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-brand/50' : 'bg-border-default'}`} />
          <div className={`h-1 rounded-full ${i === 0 ? 'bg-brand/20' : 'bg-surface-muted'}`} style={{ width: i === 0 ? 40 : i === 1 ? 28 : 34 }} />
        </div>
      ))}
    </div>
  );
}

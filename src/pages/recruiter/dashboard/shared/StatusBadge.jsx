// Shared status badge + funnel bar components

export const STATUS_CONFIG = {
  'Invited':     { color: '#06B6D4', bg: '#083344', border: '#0E7490', label: 'Invited' },
  'In Progress': { color: '#F59E0B', bg: '#1C150A', border: '#78350F', label: 'Active' },
  'Submitted':   { color: '#10B981', bg: '#022C22', border: '#065F46', label: 'Submitted' },
  'Expired':     { color: '#52525B', bg: '#17171A', border: '#27272A', label: 'Expired' },
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
  if (total === 0) return <span className="text-[11px] text-[#3F3F46]">No candidates yet</span>;
  const segs = [
    { key: 'invited',     color: '#06B6D4' },
    { key: 'in_progress', color: '#F59E0B' },
    { key: 'submitted',   color: '#10B981' },
    { key: 'expired',     color: '#3F3F46' },
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 rounded-full overflow-hidden w-24 bg-[#27272A]">
        {segs.map(({ key, color }) => {
          const pct = (counts?.[key] || 0) / total * 100;
          return pct > 0 ? (
            <div key={key} className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
          ) : null;
        })}
      </div>
      <span className="text-[11px] text-[#52525B]">{total} candidate{total !== 1 ? 's' : ''}</span>
    </div>
  );
}

export function EmptyGrid() {
  return (
    <div className="relative mx-auto" style={{ width: 88, height: 72 }}>
      <div className="absolute inset-0 border border-[#27272A] rounded-xl" />
      <div className="absolute top-0 left-0 right-0 h-5 border-b border-[#27272A] rounded-t-xl flex items-center px-3 gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#27272A]" />
        <div className="w-8 h-1 rounded-full bg-[#27272A]" />
      </div>
      {[32, 48, 62].map((top, i) => (
        <div key={i} className="absolute left-3 right-3 flex items-center gap-2" style={{ top }}>
          <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-[#06B6D4]/50' : 'bg-[#27272A]'}`} />
          <div className={`h-1 rounded-full ${i === 0 ? 'bg-[#06B6D4]/20' : 'bg-[#1C1C20]'}`} style={{ width: i === 0 ? 40 : i === 1 ? 28 : 34 }} />
        </div>
      ))}
    </div>
  );
}

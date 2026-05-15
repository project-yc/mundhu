// MetricsStrip — 5-tile stat bar for the dashboard
export default function MetricsStrip({ metricsData, loading }) {
  return (
    <div className="grid grid-cols-5 gap-px bg-border-default rounded-xl overflow-hidden border border-border-default">
      {[
        { label: 'Assessments', value: metricsData.assessments, color: '#0F172A',   sub: 'total'       },
        { label: 'Invited',     value: metricsData.invited,     color: '#22D3EE',   sub: 'sent links'  },
        { label: 'Active',      value: metricsData.in_progress, color: '#D97706',   sub: 'working now' },
        { label: 'Submitted',   value: metricsData.submitted,   color: '#16A34A',   sub: 'completed'   },
        { label: 'Expired',     value: metricsData.expired,     color: '#64748B',   sub: 'timed out'   },
      ].map(({ label, value, color, sub }) => (
        <div key={label} className="bg-page px-5 py-5">
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] mb-2">{label}</p>
          <p className="text-[26px] font-bold leading-none mb-1 font-display" style={{ color: loading ? '#E2E8F0' : color }}>
            {loading ? '—' : value}
          </p>
          <p className="text-[11px] text-text-muted">{sub}</p>
        </div>
      ))}
    </div>
  );
}

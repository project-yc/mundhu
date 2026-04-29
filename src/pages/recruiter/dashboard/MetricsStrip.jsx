// MetricsStrip — 5-tile stat bar for the dashboard
export default function MetricsStrip({ metricsData, loading }) {
  return (
    <div className="grid grid-cols-5 gap-px bg-[#27272A] rounded-xl overflow-hidden border border-[#27272A]">
      {[
        { label: 'Assessments', value: metricsData.assessments, color: '#FAFAFA',   sub: 'total'       },
        { label: 'Invited',     value: metricsData.invited,     color: '#06B6D4',   sub: 'sent links'  },
        { label: 'Active',      value: metricsData.in_progress, color: '#F59E0B',   sub: 'working now' },
        { label: 'Submitted',   value: metricsData.submitted,   color: '#10B981',   sub: 'completed'   },
        { label: 'Expired',     value: metricsData.expired,     color: '#52525B',   sub: 'timed out'   },
      ].map(({ label, value, color, sub }) => (
        <div key={label} className="bg-[#0C0C0E] px-5 py-5">
          <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] mb-2">{label}</p>
          <p className="text-[26px] font-bold leading-none mb-1 font-display" style={{ color: loading ? '#27272A' : color }}>
            {loading ? '—' : value}
          </p>
          <p className="text-[11px] text-[#3F3F46]">{sub}</p>
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { UserPlus, MoreHorizontal } from 'lucide-react';
import MonthFilter from './MonthFilter';
import { getDashboardCandidateMetrics } from '../../../../api/recruiter/dashboard';

const METRICS_CONFIG = [
  {
    key: 'total_invited',
    label: 'Total invited',
    sub: 'Invitations sent to candidates.',
  },
  {
    key: 'pending_review',
    label: 'Total Submitted',
    sub: 'Completed submissions.',
  },
  {
    key: 'total_shortlisted',
    label: 'Total Shortlisted',
    sub: 'Qualified for the next round.',
  },
  {
    key: 'total_hired',
    label: 'Total Hired',
    sub: 'Successfully joined the company.',
  },
];

function MetricTile({ label, value, sub, loading }) {
  return (
    <div className="rounded-xl border flex flex-col gap-1.5" style={{ backgroundColor: '#FAFAFA', borderColor: '#EDEDED' }}>
      <div className="bg-white border rounded-xl flex flex-col items-center justify-center gap-3 py-3" style={{ borderColor: '#F1F1F1' }}>
        <div className="flex items-center justify-between w-full px-4">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-lg bg-[#EFEFEF] flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-3 h-3 text-text-primary" strokeWidth={1.8} />
            </span>
            <p className="text-[13px] capitalize" style={{ color: '#474747' }}>{label}</p>
          </div>
          <MoreHorizontal className="w-5 h-5 text-text-muted flex-shrink-0" strokeWidth={1.8} />
        </div>
        <p className="text-[22px] lg:text-[24px] font-medium leading-none text-black w-full px-4">
          {loading ? '—' : String(value ?? 0).padStart(2, '0')}
        </p>
      </div>
      <p className="text-[12px] px-3 pb-1.5" style={{ color: '#898989' }}>{sub}</p>
    </div>
  );
}

export default function CandidateMetricsPanel() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardCandidateMetrics({ month: month || undefined });
      setMetrics(res?.data ?? res ?? null);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  return (
    <div className="rounded-2xl border p-3 flex flex-col gap-2.5" style={{ backgroundColor: '#FAFAFA', borderColor: '#EDEDED' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-[14px] font-medium text-black" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
          Candidates Metrics
        </h2>
        <MonthFilter value={month} onChange={setMonth} />
      </div>

      {/* Grid */}
      <div className="bg-white border rounded-2xl p-3" style={{ borderColor: '#F1F1F1' }}>
        <div className="grid grid-cols-2 gap-2.5">
          {METRICS_CONFIG.map(({ key, label, sub }) => (
            <MetricTile
              key={key}
              label={label}
              value={metrics?.[key]}
              sub={sub}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import MonthFilter from './MonthFilter';
import { getDashboardStats } from '../../../../api/recruiter/dashboard';

// ── SVG staggered-arc "swirl" chart ──────────────────────────────────────────
// Angles are measured from 12 o'clock, clockwise. Every ring ENDS just left of
// the top (352°) while its START walks down the right side — so the open gap
// sits at the upper-right, where the total is displayed (matches the mockup).
const CX = 88;
const CY = 102;
const END_DEG = 352;

// Outer ring first → largest arc, longest sweep; inner rings open up more
const RINGS = [
  { r: 82, strokeWidth: 11, startDeg: 58,  color: 'var(--color-dashboard-ring-closed)' },
  { r: 66, strokeWidth: 10, startDeg: 84,  color: 'var(--color-dashboard-ring-active)' },
  { r: 51, strokeWidth: 9,  startDeg: 110, color: 'var(--color-dashboard-ring-draft)' },
  { r: 36, strokeWidth: 8,  startDeg: 136, color: 'var(--color-dashboard-ring-expired-links)' },
];

function polarPoint(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startDeg, sweepDeg) {
  const start = polarPoint(cx, cy, r, startDeg);
  const end   = polarPoint(cx, cy, r, startDeg + sweepDeg);
  const large = sweepDeg > 180 ? 1 : 0;
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

function RadialChart({ total }) {
  return (
    <svg viewBox="0 0 200 195" className="w-full max-w-[210px] mx-auto">
      {/* Colored arcs — each sweeps clockwise from its start to the shared top end */}
      {RINGS.map((ring, i) => (
        <path
          key={`arc-${i}`}
          d={arcPath(CX, CY, ring.r, ring.startDeg, END_DEG - ring.startDeg)}
          fill="none"
          stroke={ring.color}
          strokeWidth={ring.strokeWidth}
          strokeLinecap="round"
        />
      ))}

      {/* Total count — sits in the upper-right gap */}
      <text
        x={152}
        y={64}
        textAnchor="middle"
        fontSize="28"
        fontWeight="600"
        fill="var(--color-text-primary)"
        fontFamily="'Google Sans Flex', inherit"
      >
        {total ?? 0}
      </text>
      <text
        x={152}
        y={82}
        textAnchor="middle"
        fontSize="10.5"
        fill="#959595"
        fontFamily="'Google Sans Flex', inherit"
      >
        Total assessments
      </text>
    </svg>
  );
}

// ── Legend items — colored swatch matching each ring, count in the same color ──
const LEGEND_ITEMS = [
  { key: 'closed',        label: 'Closed assessments', color: 'var(--color-dashboard-ring-closed)' },
  { key: 'active',        label: 'Active assessments', color: 'var(--color-dashboard-ring-active)' },
  { key: 'draft',         label: 'Draft assessments',  color: 'var(--color-dashboard-ring-draft)' },
  { key: 'expired_links', label: 'Expired links',      color: 'var(--color-dashboard-ring-expired-links)' },
];

// ── Main panel ────────────────────────────────────────────────────────────────
export default function WorkspaceSnapshotPanel() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats({ month: month || undefined });
      const data = res?.data ?? res ?? {};
      setSnapshot(data.workspace_snapshot ?? null);
    } catch {
      // non-critical
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const snap = snapshot ?? {};

  return (
    <div className="rounded-2xl border p-3 flex flex-col gap-1.5" style={{ backgroundColor: '#FAFAFA', borderColor: '#EDEDED' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-[14px] font-medium text-black" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
          Workspace snapshot
        </h2>
        <MonthFilter value={month} onChange={setMonth} />
      </div>

      <div className="bg-white border rounded-2xl flex flex-col items-center gap-3 px-4 py-4" style={{ borderColor: '#F1F1F1' }}>
        {/* Chart */}
        {loading ? (
          <div className="h-[190px] w-full flex items-center justify-center">
            <div
              className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'var(--color-assessment-accent)', borderTopColor: 'transparent' }}
            />
          </div>
        ) : (
          <RadialChart total={snap.total_assessments} />
        )}

        {/* Legend */}
        <div className="w-full space-y-2">
          {LEGEND_ITEMS.map(({ key, label, color }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-[7px] h-[18px] rounded-[2px] flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-[13px]" style={{ color: '#2A2A2A' }}>{label}</span>
              </div>
              <span className="text-[15px] font-semibold" style={{ color }}>
                {loading ? '—' : String(snap[key] ?? 0).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

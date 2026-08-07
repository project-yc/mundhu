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

// Outer ring first → largest arc, longest sweep; inner rings open up more.
// Each ring's start angle is solved so the start points all fall on the same
// horizontal line (START_LINE_Y, below center) — a true single line across
// the differing radii, sitting below the "Total assessments" text.
// The END angle is data-driven: a ring sweeps the full startDeg→END_DEG span
// only when its count equals the total, otherwise it stops short in proportion
// to its share of the total — so the arc lengths reflect the real numbers.
const START_LINE_Y = CY + 25;
const MIN_SWEEP_DEG = 4;
function startDegForRadius(r) {
  return 90 + Math.asin((START_LINE_Y - CY) / r) * (180 / Math.PI);
}
const RINGS = [
  { key: 'closed',        r: 82, strokeWidth: 11, color: 'var(--color-dashboard-ring-closed)' },
  { key: 'active',        r: 66, strokeWidth: 10, color: 'var(--color-dashboard-ring-active)' },
  { key: 'draft',         r: 51, strokeWidth: 9,  color: 'var(--color-dashboard-ring-draft)' },
  { key: 'expired_links', r: 36, strokeWidth: 8,  color: 'var(--color-dashboard-ring-expired-links)' },
].map(ring => ({ ...ring, startDeg: startDegForRadius(ring.r) }));

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

function RadialChart({ total, snap }) {
  return (
    <svg viewBox="0 0 200 195" className="w-full max-w-[210px] mx-auto">
      {/* Colored arcs — length is proportional to each count's share of the total */}
      {RINGS.map((ring, i) => {
        const value = Number(snap?.[ring.key] ?? 0);
        const maxSweep = END_DEG - ring.startDeg;
        const ratio = total > 0 ? Math.min(value / total, 1) : 0;
        const sweepDeg = value > 0 ? Math.max(maxSweep * ratio, MIN_SWEEP_DEG) : 0;
        return (
          <path
            key={`arc-${i}`}
            d={arcPath(CX, CY, ring.r, ring.startDeg, sweepDeg)}
            fill="none"
            stroke={ring.color}
            strokeWidth={ring.strokeWidth}
            strokeLinecap="round"
          />
        );
      })}

      {/* Total count — sits in the upper-right gap */}
      <text
        x={128}
        y={92}
        textAnchor="middle"
        fontSize="28"
        fontWeight="600"
        fill="var(--color-text-primary)"
        fontFamily="'Google Sans Flex', inherit"
      >
        {total ?? 0}
      </text>
      <text
        x={128}
        y={110}
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
          <RadialChart total={snap.total_assessments} snap={snap} />
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

import { useState, useEffect, useCallback } from 'react';
import {
  Loader,
  ClipboardList,
  UserPlus,
  MessageSquare,
  FileCheck,
  BadgeCheck,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import {
  getDashboardAssessmentsList,
  getDashboardScoreDistribution,
  getDashboardPipelineFunnel,
} from '../../../../api/recruiter/dashboard';

// ── Bubble chart ─────────────────────────────────────────────────────────────
// Fixed geometry (position + radius) for the 5 score buckets, matching the
// Figma cluster exactly. Bubble SIZE never changes — only the number inside
// is dynamic. This keeps the chart looking balanced even when every bucket
// is 0 or has very low counts (a shrinking-radius chart looked broken then).
// Each bubble now shades from `from` (light) to `to` (deep) for a cleaner,
// less "shiny ball" look than the old radial gradient.
const BUBBLES = [
  { cx: 105, cy: 69,  r: 68, from: '#FF9A45', to: '#E8630A' }, // largest, top-center
  { cx: 37,  cy: 76,  r: 37, from: '#FFAE5C', to: '#EF7A16' }, // mid-left
  { cx: 55,  cy: 132, r: 48, from: '#FFC768', to: '#F0980A' }, // bottom-left
  { cx: 126, cy: 132, r: 42, from: '#FF9E52', to: '#DE640A' }, // bottom-right
  { cx: 166, cy: 97,  r: 28, from: '#FFCE7A', to: '#EFA020' }, // small, right
];

function BubbleChart({ buckets, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-5 h-5 animate-spin" style={{ color: 'var(--color-assessment-accent)' }} />
      </div>
    );
  }

  if (!buckets || buckets.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <p className="text-[11px] text-text-muted">No data</p>
      </div>
    );
  }

  return (
    <svg viewBox="0 0 200 182" className="w-full h-full" style={{ overflow: 'visible' }}>
      <defs>
        {BUBBLES.map((b, i) => (
          <radialGradient key={`grad-${i}`} id={`bubble3d-${i}`} cx="38%" cy="32%" r="80%">
            <stop offset="0%" stopColor={b.from} />
            <stop offset="100%" stopColor={b.to} />
          </radialGradient>
        ))}
        <filter id="bubbleShadow" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#B4530A" floodOpacity="0.22" />
        </filter>
      </defs>
      {BUBBLES.map((bubble, i) => {
        const count = buckets[i]?.count ?? 0;
        const fontSize = bubble.r > 45 ? 18 : bubble.r > 32 ? 15 : 12;

        return (
          <g key={buckets[i]?.range ?? i} filter="url(#bubbleShadow)">
            <circle
              cx={bubble.cx}
              cy={bubble.cy}
              r={bubble.r}
              fill={`url(#bubble3d-${i})`}
              stroke="#FFF"
              strokeWidth="1.5"
              strokeOpacity="0.9"
            />
            <text
              x={bubble.cx}
              y={bubble.cy}
              textAnchor="middle"
              dominantBaseline="central"
              fill="white"
              fontSize={fontSize}
              fontWeight="600"
              fontFamily="'Google Sans Flex', inherit"
            >
              {count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Pipeline funnel bars ──────────────────────────────────────────────────────
const STAGE_ICONS = [ClipboardList, UserPlus, MessageSquare, FileCheck, BadgeCheck];

function FunnelBars({ stages, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-32 bg-surface-muted rounded animate-pulse" />
            <div className="h-[5px] bg-surface-muted rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!stages || stages.length === 0) {
    return <p className="text-[11px] text-text-muted">No pipeline data</p>;
  }

  return (
    <div className="space-y-[13px]">
      {stages.map((stage, i) => {
        const Icon = STAGE_ICONS[i % STAGE_ICONS.length];
        return (
          <div key={stage.label}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon className="w-3.5 h-3.5 text-text-primary flex-shrink-0" strokeWidth={1.6} />
              <span className="text-[11.5px] text-text-secondary truncate">{stage.label}</span>
            </div>
            <div className="h-[5px] bg-[#F0F0EE] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(stage.percentage ?? 0, 100)}%`,
                  background: 'linear-gradient(90deg, #FF7A1A, #FFA845)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function ScoreDistributionPanel() {
  const [assessmentsList, setAssessmentsList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [buckets, setBuckets] = useState([]);
  const [stages, setStages] = useState([]);
  const [loadingScore, setLoadingScore] = useState(false);
  const [loadingFunnel, setLoadingFunnel] = useState(false);

  // Load assessments list on mount and auto-select first
  useEffect(() => {
    getDashboardAssessmentsList()
      .then(res => {
        const list = res?.data?.assessments ?? res?.assessments ?? [];
        setAssessmentsList(list);
        if (list.length > 0) setSelectedId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const fetchScoreData = useCallback(async () => {
    if (!selectedId) return;
    setLoadingScore(true);
    setLoadingFunnel(true);
    try {
      const [scoreRes, funnelRes] = await Promise.all([
        getDashboardScoreDistribution({ assessmentId: selectedId }),
        getDashboardPipelineFunnel({ assessmentId: selectedId }),
      ]);
      setBuckets(scoreRes?.data?.buckets ?? scoreRes?.buckets ?? []);
      setStages(funnelRes?.data?.stages ?? funnelRes?.stages ?? []);
    } catch {
      setBuckets([]);
      setStages([]);
    } finally {
      setLoadingScore(false);
      setLoadingFunnel(false);
    }
  }, [selectedId]);

  useEffect(() => { fetchScoreData(); }, [fetchScoreData]);

  return (
    <div className="w-full h-full rounded-2xl border p-3 flex flex-col gap-2.5" style={{ backgroundColor: '#FAFAFA', borderColor: '#EDEDED' }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-[14px] font-medium text-black" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
          Score distribution stats
        </h2>
        {/* Assessment selector */}
        <Select value={selectedId || undefined} onValueChange={setSelectedId}>
          <SelectTrigger
            className="h-auto py-[6px] rounded-full text-[12px] text-[#707F93] gap-1.5 px-3 flex-shrink-0 w-auto min-w-[130px] border-[#DFDFDF] hover:border-border-strong bg-white"
          >
            <SelectValue placeholder="Select assessment" />
          </SelectTrigger>
          <SelectContent>
            {assessmentsList.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Body: bubble chart left + funnel right */}
      <div className="flex-1 min-h-0 bg-white border rounded-2xl flex items-center gap-4 px-3 py-3" style={{ borderColor: '#F1F1F1' }}>
        {/* Bubble chart */}
        <div className="flex-[5] min-w-0 h-full max-h-[180px]">
          <BubbleChart buckets={buckets} loading={loadingScore} />
        </div>

        {/* Pipeline funnel */}
        <div className="flex-[4] min-w-0">
          <FunnelBars stages={stages} loading={loadingFunnel} />
        </div>
      </div>
    </div>
  );
}

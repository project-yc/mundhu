// ReportDetailScreen — recruiter detail view with assessment-level scoring
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader, AlertCircle, Download, ChevronDown, ChevronUp,
  CheckCircle, XCircle, AlertTriangle, Code, Brain, Clock,
  TrendingUp, MessageSquare, Award, Target,
} from 'lucide-react';
import { getRecruiterReportDetail } from '../../api/recruiter/assessment.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SIGNAL_CFG = {
  green:  { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', icon: CheckCircle,    label: 'Strong'   },
  yellow: { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', icon: AlertTriangle,  label: 'Moderate' },
  red:    { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', icon: XCircle,        label: 'Weak'     },
};

const SUBSCORE_LABELS = {
  planning_debugging: 'Planning & Debugging',
  verification: 'Verification',
  direction: 'Direction',
  iteration: 'Iteration',
};

const REPORT_STATUS_CFG = {
  finalized: { label: 'Finalized', color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
  completed: { label: 'Completed', color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
  coding_analytics_pending: { label: 'Coding Analytics Pending', color: '#0F766E', bg: '#CCFBF1', border: '#5EEAD4' },
  processing: { label: 'Processing', color: '#0891B2', bg: '#ECFEFF', border: '#67E8F9' },
  pending: { label: 'Pending', color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  not_requested: { label: 'Not Requested', color: '#64748B', bg: '#F8FAFC', border: '#CBD5E1' },
  failed: { label: 'Failed', color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
};

function formatSubscoreLabel(key) {
  return SUBSCORE_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function DetailStatusBadge({ status }) {
  const cfg = REPORT_STATUS_CFG[status] || REPORT_STATUS_CFG.pending;
  return (
    <span
      className="px-3 py-1.5 rounded-xl text-[12px] font-bold border"
      style={{ color: cfg.color, backgroundColor: cfg.bg, borderColor: cfg.border }}
    >
      {cfg.label}
    </span>
  );
}

function SectionStatusBadge({ status }) {
  const cfg = REPORT_STATUS_CFG[status] || REPORT_STATUS_CFG.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      {cfg.label}
    </span>
  );
}

function SignalCard({ label, signal, score, summary, subscores, icon }) {
  const cfg = SIGNAL_CFG[signal] || { color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', icon: Target, label: 'N/A' };
  const SigIcon = cfg.icon;
  const IconComponent = icon;
  const subscoreEntries = subscores && typeof subscores === 'object'
    ? Object.entries(subscores).filter(([, v]) => typeof v === 'number')
    : [];
  return (
    <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4" style={{ color: cfg.color }} />
          <span className="text-[12px] font-bold text-text-primary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {score !== undefined && score !== null && (
            <span className="text-[13px] font-bold font-display" style={{ color: cfg.color }}>{score}<span className="text-[10px] opacity-60">/100</span></span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
            style={{ color: cfg.color, border: `1px solid ${cfg.border}` }}>
            <SigIcon className="w-3 h-3" />{cfg.label}
          </span>
        </div>
      </div>
      {summary && <p className="text-[12px] text-text-secondary leading-relaxed">{summary}</p>}
      {subscoreEntries.length > 0 && (
        <div className="pt-2 mt-2 border-t border-border-default/60 grid grid-cols-2 gap-x-4 gap-y-1">
          {subscoreEntries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-[11px]">
              <span className="text-text-secondary">{formatSubscoreLabel(key)}</span>
              <span className="font-mono text-text-primary">{value}<span className="text-text-secondary">/100</span></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, color = '#22D3EE', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  const IconComponent = icon;
  return (
    <div className="rounded-xl border border-border-default overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-surface hover:bg-surface-muted transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
            <IconComponent className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <span className="text-[13px] font-bold text-text-primary">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
      </button>
      {open && <div className="p-5 border-t border-border-default bg-page">{children}</div>}
    </div>
  );
}

function downloadReport(reportData, candidateName) {
  const json = JSON.stringify(reportData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `report-${(candidateName || 'candidate').replace(/\s+/g, '-').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ReportDetailScreen() {
  const { assessmentId, sessionId } = useParams();
  const navigate = useNavigate();

  const [report,   setReport]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    getRecruiterReportDetail(assessmentId, sessionId)
      .then(d => setReport(d.data || d))
      .catch(err => setError(err.message || 'Failed to load report.'))
      .finally(() => setLoading(false));
  }, [assessmentId, sessionId]);

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader className="w-6 h-6 text-brand animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-[900px] mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[13px] text-text-secondary hover:text-text-secondary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back
      </button>
      <div className="flex items-center gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
        <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
        <p className="text-[13px] text-error">{error}</p>
      </div>
    </div>
  );

  if (!report) return null;

  const dims = report.dimensions || {};
  const tc   = dims.task_completion        || {};
  const dq   = dims.design_quality         || {};
  const psp  = dims.problem_solving_process|| {};
  const ai   = dims.ai_collaboration;
  const bev  = report.behavioral_evidence  || [];
  const probes = report.interview_probes   || [];
  const growth = report.growth_edges       || [];
  const sections = Array.isArray(report.section_results)
    ? [...report.section_results].sort((a, b) => (a.section_order ?? Number.MAX_SAFE_INTEGER) - (b.section_order ?? Number.MAX_SAFE_INTEGER))
    : [];
  const codingAnalytics = report.coding_analytics || {};
  const detailStatus = report.assessment_status || report.status || 'pending';
  const showCodingPending = ['pending', 'processing', 'not_requested'].includes(codingAnalytics.status);
  const hasCodingDetail = !!(tc.signal || dq.signal || psp.signal || ai?.signal);
  const totalScore = report.total_score;
  const maxScore = report.max_score;
  const overallScore = report.overall_score;

  const overallColor = overallScore >= 75 ? '#16A34A' : overallScore >= 50 ? '#D97706' : overallScore != null ? '#DC2626' : '#64748B';

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[13px] text-text-secondary hover:text-text-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Candidates
        </button>
        <button
          onClick={() => downloadReport(report, '')}
          className="flex items-center gap-2 px-3.5 py-2 bg-surface border border-border-default text-text-secondary text-[12px] font-semibold rounded-lg hover:border-border-strong hover:text-text-primary transition-all"
        >
          <Download className="w-3.5 h-3.5" />Download JSON
        </button>
      </div>

      {/* Hero score card */}
      <div className="rounded-2xl border border-border-default bg-surface p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.14em] mb-2">Overall Score</p>
            <div className="flex items-end gap-3">
              <span className="text-[56px] font-bold leading-none font-display" style={{ color: overallColor }}>
                {overallScore ?? '—'}
              </span>
              <span className="text-[18px] text-text-muted mb-2 font-display">/100</span>
            </div>
            {totalScore !== null && totalScore !== undefined && maxScore !== null && maxScore !== undefined ? (
              <p className="text-[13px] text-text-secondary mt-1">Points: <span className="text-text-primary font-semibold">{totalScore} / {maxScore}</span></p>
            ) : null}
            <p className="text-[13px] text-text-secondary mt-1">Coding Session ID: <span className="text-text-muted font-mono text-[11px]">{sessionId}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <DetailStatusBadge status={detailStatus} />
            {report.no_verdict && <span className="text-[11px] text-text-secondary">Evidence-based · No auto-verdict</span>}
          </div>
        </div>
      </div>

      {showCodingPending && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-brand-border bg-brand-tint text-brand">
          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-semibold">Assessment scoring is available while coding analytics continue processing.</p>
            <p className="text-[12px] text-text-secondary mt-1">
              Coding analytics status: <span className="font-semibold text-text-primary">{REPORT_STATUS_CFG[codingAnalytics.status]?.label || codingAnalytics.status || 'Pending'}</span>
            </p>
          </div>
        </div>
      )}

      {sections.length > 0 && (
        <Section title="Assessment Breakdown" icon={Target} color="#0EA5E9" defaultOpen>
          <div className="space-y-3">
            {sections.map((section, index) => {
              const sectionScore = section.score ?? 0;
              const sectionMax = section.max_score ?? 0;
              const sectionPercent = sectionMax > 0 ? Math.round((sectionScore / sectionMax) * 100) : null;
              return (
                <div key={section.section_id || index} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-surface border border-border-default">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-text-primary truncate">{section.section_name || `Section ${index + 1}`}</p>
                    <p className="text-[11px] text-text-secondary mt-0.5">{sectionScore} / {sectionMax} points{sectionPercent !== null ? ` · ${sectionPercent}%` : ''}</p>
                  </div>
                  <SectionStatusBadge status={section.status} />
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* 4 dimension signals */}
      {hasCodingDetail && (
        <div className="grid grid-cols-2 gap-3">
          <SignalCard label="Task Completion"         signal={tc.signal}   score={tc.score}   summary={tc.summary}   icon={Code} />
          <SignalCard label="Design Quality"          signal={dq.signal}   score={dq.score}   summary={dq.summary}   icon={Target} />
          <SignalCard label="Problem-Solving Process" signal={psp.signal}  score={psp.score}  summary={psp.summary}  subscores={psp.subscores} icon={Brain} />
          {ai ? (
            <SignalCard label="AI Collaboration" signal={ai.signal} score={ai.score} summary={ai.summary} subscores={ai.subscores} icon={MessageSquare} />
          ) : (
            <div className="rounded-xl border border-border-default p-4 bg-surface flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-text-muted" />
              <span className="text-[12px] text-text-muted">AI was disabled for this session</span>
            </div>
          )}
        </div>
      )}

      {/* Behavioral evidence */}
      {bev.length > 0 && (
        <Section title="Behavioral Evidence" icon={TrendingUp} color="#10B981" defaultOpen>
          <div className="space-y-3">
            {bev.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border-default">
                <div className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0 mt-2" />
                <div className="min-w-0">
                  {ev.dimension && (
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-0.5">{ev.dimension.replace(/_/g, ' ')}</span>
                  )}
                  <p className="text-[13px] text-text-primary leading-relaxed">{ev.observation}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Growth edges */}
      {growth.length > 0 && (
        <Section title="Growth Edges" icon={Award} color="#F59E0B">
          <div className="space-y-2">
            {growth.map((g, i) => {
              const isObj = g && typeof g === 'object';
              return (
                <div key={i} className="p-3 rounded-xl bg-warning-bg border border-warning-border/40 space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#78350F]/40 text-warning text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-[13px] text-text-primary leading-relaxed">{isObj ? g.moment : g}</p>
                  </div>
                  {isObj && g.alternative && (
                    <div className="ml-8 space-y-1">
                      <p className="text-[10px] font-semibold text-[#78350F] uppercase tracking-wider">Better approach</p>
                      <p className="text-[12px] text-text-secondary leading-relaxed">{g.alternative}</p>
                    </div>
                  )}
                  {isObj && g.why && (
                    <div className="ml-8 space-y-1">
                      <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Why it matters</p>
                      <p className="text-[12px] text-text-secondary leading-relaxed">{g.why}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Interview probes */}
      {probes.length > 0 && (
        <Section title="Interview Probes" icon={MessageSquare} color="#A78BFA">
          <div className="space-y-2">
            {probes.map((p, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-surface border border-border-default">
                <span className="text-[11px] font-bold text-[#A78BFA] flex-shrink-0 mt-0.5">Q{i + 1}</span>
                <p className="text-[13px] text-text-primary leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

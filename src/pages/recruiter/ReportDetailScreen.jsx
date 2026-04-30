// ReportDetailScreen — full B2B hiring report for a session
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader, AlertCircle, Download, ChevronDown, ChevronUp,
  CheckCircle, XCircle, AlertTriangle, Code, Brain,
  TrendingUp, MessageSquare, Award, Target,
} from 'lucide-react';
import { getSessionReport } from '../../api/recruiter/assessment.jsx';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SIGNAL_CFG = {
  green:  { color: '#10B981', bg: '#022C22', border: '#065F46', icon: CheckCircle,    label: 'Strong'   },
  yellow: { color: '#F59E0B', bg: '#1C150A', border: '#78350F', icon: AlertTriangle,  label: 'Moderate' },
  red:    { color: '#F43F5E', bg: '#1C0813', border: '#881337', icon: XCircle,        label: 'Weak'     },
};

function SignalCard({ label, signal, score, summary, icon: Icon }) {
  const cfg = SIGNAL_CFG[signal] || { color: '#52525B', bg: '#17171A', border: '#27272A', icon: Target, label: 'N/A' };
  const SigIcon = cfg.icon;
  return (
    <div className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: cfg.bg, borderColor: cfg.border }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
          <span className="text-[12px] font-bold text-[#E4E4E7]">{label}</span>
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
      {summary && <p className="text-[12px] text-[#A1A1AA] leading-relaxed">{summary}</p>}
    </div>
  );
}

function Section({ title, icon: Icon, color = '#06B6D4', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-[#27272A] overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-[#111113] hover:bg-[#17171A] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
            <Icon className="w-3.5 h-3.5" style={{ color }} />
          </div>
          <span className="text-[13px] font-bold text-[#E4E4E7]">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#52525B]" /> : <ChevronDown className="w-4 h-4 text-[#52525B]" />}
      </button>
      {open && <div className="p-5 border-t border-[#27272A] bg-[#0C0C0E]">{children}</div>}
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
    getSessionReport(assessmentId, sessionId)
      .then(d => setReport(d.data || d))
      .catch(err => setError(err.message || 'Failed to load report.'))
      .finally(() => setLoading(false));
  }, [assessmentId, sessionId]);

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <Loader className="w-6 h-6 text-[#06B6D4] animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-[900px] mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[13px] text-[#52525B] hover:text-[#A1A1AA] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />Back
      </button>
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl">
        <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0" />
        <p className="text-[13px] text-[#F43F5E]">{error}</p>
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

  const overallColor = report.overall_score >= 75 ? '#10B981' : report.overall_score >= 50 ? '#F59E0B' : '#F43F5E';

  return (
    <div className="p-6 max-w-[900px] mx-auto space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[13px] text-[#52525B] hover:text-[#A1A1AA] transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Candidates
        </button>
        <button
          onClick={() => downloadReport(report, '')}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#111113] border border-[#27272A] text-[#A1A1AA] text-[12px] font-semibold rounded-lg hover:border-[#3F3F46] hover:text-[#E4E4E7] transition-all"
        >
          <Download className="w-3.5 h-3.5" />Download JSON
        </button>
      </div>

      {/* Hero score card */}
      <div className="rounded-2xl border border-[#27272A] bg-[#111113] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-[0.14em] mb-2">Overall Score</p>
            <div className="flex items-end gap-3">
              <span className="text-[56px] font-bold leading-none font-display" style={{ color: overallColor }}>
                {report.overall_score ?? '—'}
              </span>
              <span className="text-[18px] text-[#3F3F46] mb-2 font-display">/100</span>
            </div>
            <p className="text-[13px] text-[#52525B] mt-1">Session ID: <span className="text-[#3F3F46] font-mono text-[11px]">{sessionId}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1.5 rounded-xl text-[12px] font-bold border ${
              report.status === 'completed' ? 'bg-[#022C22] border-[#065F46] text-[#10B981]' : 'bg-[#1C150A] border-[#78350F] text-[#F59E0B]'
            }`}>{(report.status || 'pending').toUpperCase()}</span>
            {report.no_verdict && <span className="text-[11px] text-[#52525B]">Evidence-based · No auto-verdict</span>}
          </div>
        </div>
      </div>

      {/* 4 dimension signals */}
      <div className="grid grid-cols-2 gap-3">
        <SignalCard label="Task Completion"         signal={tc.signal}   score={tc.score}   summary={tc.summary}   icon={Code} />
        <SignalCard label="Design Quality"          signal={dq.signal}   score={dq.score}   summary={dq.summary}   icon={Target} />
        <SignalCard label="Problem-Solving Process" signal={psp.signal}  score={psp.score}  summary={psp.summary}  icon={Brain} />
        {ai ? (
          <SignalCard label="AI Collaboration" signal={ai.signal} score={ai.score} summary={ai.summary} icon={MessageSquare} />
        ) : (
          <div className="rounded-xl border border-[#27272A] p-4 bg-[#111113] flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-[#3F3F46]" />
            <span className="text-[12px] text-[#3F3F46]">AI was disabled for this session</span>
          </div>
        )}
      </div>

      {/* Behavioral evidence */}
      {bev.length > 0 && (
        <Section title="Behavioral Evidence" icon={TrendingUp} color="#10B981" defaultOpen>
          <div className="space-y-3">
            {bev.map((ev, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#111113] border border-[#27272A]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] flex-shrink-0 mt-2" />
                <div className="min-w-0">
                  {ev.dimension && (
                    <span className="text-[10px] font-semibold text-[#52525B] uppercase tracking-wider block mb-0.5">{ev.dimension.replace(/_/g, ' ')}</span>
                  )}
                  <p className="text-[13px] text-[#E4E4E7] leading-relaxed">{ev.observation}</p>
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
                <div key={i} className="p-3 rounded-xl bg-[#1C150A] border border-[#78350F]/40 space-y-2">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-[#78350F]/40 text-[#F59E0B] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-[13px] text-[#E4E4E7] leading-relaxed">{isObj ? g.moment : g}</p>
                  </div>
                  {isObj && g.alternative && (
                    <div className="ml-8 space-y-1">
                      <p className="text-[10px] font-semibold text-[#78350F] uppercase tracking-wider">Better approach</p>
                      <p className="text-[12px] text-[#A1A1AA] leading-relaxed">{g.alternative}</p>
                    </div>
                  )}
                  {isObj && g.why && (
                    <div className="ml-8 space-y-1">
                      <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-wider">Why it matters</p>
                      <p className="text-[12px] text-[#71717A] leading-relaxed">{g.why}</p>
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
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#111113] border border-[#27272A]">
                <span className="text-[11px] font-bold text-[#A78BFA] flex-shrink-0 mt-0.5">Q{i + 1}</span>
                <p className="text-[13px] text-[#E4E4E7] leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

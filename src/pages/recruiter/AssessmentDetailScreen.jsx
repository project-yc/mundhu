// AssessmentDetailScreen — full-page view for a single assessment + its candidates
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader, AlertCircle, Users, Copy, CheckCircle,
  ExternalLink, FileText, Search, Clock, Code, Terminal, Globe,
  Calendar, ChevronRight, UserPlus, ChevronDown, ChevronUp,
  ListChecks, Settings2, Cpu, BookOpen, Layers,
} from 'lucide-react';
import { getAssessmentById, getAssessmentCandidates } from '../../api/recruiter/assessment.jsx';
import { CandidateStatusBadge } from './dashboard/shared/StatusBadge.jsx';
import { formatDate, formatDateTime, getInitials, copyToClipboard } from './dashboard/shared/utils.js';

// ─── Constants ───────────────────────────────────────────────────────────────
const AI_LEVEL_LABELS = { full: 'Full AI', partial: 'Partial AI', none: 'No AI', limited: 'Limited AI' };
const DIFFICULTY_COLORS = {
  Easy:   'bg-success-bg text-success border-success-border',
  Medium: 'bg-warning-bg text-warning border-warning-border',
  Hard:   'bg-error-bg text-error border-error-border',
  Mid:    'bg-warning-bg text-warning border-warning-border',
};
const SELECTION_MODE_LABELS = { single: 'Single choice', multi: 'Multi choice' };

// ─── Invite link display ──────────────────────────────────────────────────────
function InviteLinkCell({ link }) {
  const [copied, setCopied] = useState(false);
  if (!link) return <span className="text-[11px] text-text-muted italic">Link unavailable</span>;

  const handleCopy = () => {
    copyToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-surface border border-border-default rounded-lg min-w-0 flex-1 max-w-[280px]">
        <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
        <span className="text-[11px] text-text-secondary font-mono truncate flex-1">{link}</span>
      </div>
      <button onClick={handleCopy} title="Copy invite link"
        className="p-1.5 rounded-md transition-all duration-150 flex-shrink-0 hover:bg-surface-muted">
        {copied ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-text-muted hover:text-brand" />}
      </button>
      <a href={link} target="_blank" rel="noopener noreferrer" title="Open invite link"
        className="p-1.5 rounded-md text-text-muted hover:text-brand hover:bg-surface-muted transition-all duration-150 flex-shrink-0">
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ─── Option row (single question option) ─────────────────────────────────────
function OptionRow({ option, selectionMode, index }) {
  const isCorrect = option.is_correct;
  return (
    <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-colors ${
      isCorrect
        ? 'bg-success-bg border-success-border'
        : 'bg-page border-border-subtle'
    }`}>
      {/* Radio / checkbox indicator */}
      {selectionMode === 'single' ? (
        <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
          isCorrect ? 'border-success' : 'border-border-strong'
        }`}>
          {isCorrect && <div className="w-1.5 h-1.5 rounded-full bg-success" />}
        </div>
      ) : (
        <div className={`w-3.5 h-3.5 rounded-[3px] border-2 flex-shrink-0 flex items-center justify-center ${
          isCorrect ? 'border-success bg-success' : 'border-border-strong'
        }`}>
          {isCorrect && (
            <svg viewBox="0 0 10 8" className="w-2 h-1.5 fill-none stroke-white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 4l2.5 2.5L9 1" />
            </svg>
          )}
        </div>
      )}

      {/* Option label */}
      <span className={`text-[13px] flex-1 leading-snug ${isCorrect ? 'text-success font-medium' : 'text-text-secondary'}`}>
        {option.text || <span className="italic text-text-muted">Empty option</span>}
      </span>

      {/* Correct badge */}
      {isCorrect && (
        <span className="flex-shrink-0 text-[10px] font-bold tracking-wide text-success bg-success-bg border border-success-border px-1.5 py-0.5 rounded">
          CORRECT
        </span>
      )}
    </div>
  );
}

// ─── Single MCQ question card ─────────────────────────────────────────────────
function McqQuestionCard({ item, index }) {
  const mcq = item.mcq;
  if (!mcq) return null;

  return (
    <div className="rounded-xl border border-border-default bg-surface overflow-hidden">
      {/* Question header */}
      <div className="px-4 py-3 border-b border-border-subtle flex items-start gap-3">
        <span className="w-6 h-6 rounded-md bg-brand-tint border border-brand-border text-brand text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-text-primary leading-snug">
            {mcq.prompt || <span className="italic text-text-muted">No prompt</span>}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-muted border border-border-subtle text-text-secondary">
              {SELECTION_MODE_LABELS[mcq.selection_mode] || mcq.selection_mode}
            </span>
            {mcq.shuffle_options && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-muted border border-border-subtle text-text-secondary">
                Shuffled
              </span>
            )}
            {mcq.show_explanation_after && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-muted border border-border-subtle text-text-secondary">
                Shows explanation
              </span>
            )}
            {item.points > 0 && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-tint border border-brand-border text-brand ml-auto">
                {item.points} pts
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="px-4 py-3 space-y-2">
        {mcq.options.length > 0 ? (
          mcq.options.map((opt, oi) => (
            <OptionRow key={opt.id || oi} option={opt} selectionMode={mcq.selection_mode} index={oi} />
          ))
        ) : (
          <p className="text-[12px] text-text-muted italic py-2">No options added.</p>
        )}
      </div>
    </div>
  );
}

// ─── Non-MCQ item fallback ────────────────────────────────────────────────────
function CodingItemCard({ item, index }) {
  return (
    <div className="rounded-xl border border-border-default bg-surface px-4 py-3 flex items-center gap-3">
      <span className="w-6 h-6 rounded-md bg-brand-tint border border-brand-border text-brand text-[11px] font-bold flex items-center justify-center flex-shrink-0">
        {index + 1}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-primary truncate">{item.title || 'Untitled task'}</p>
        <span className="text-[11px] text-text-muted capitalize">{item.content_type?.replace('_', ' ')}</span>
      </div>
      {item.points > 0 && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-tint border border-brand-border text-brand">
          {item.points} pts
        </span>
      )}
    </div>
  );
}

// ─── Section accordion ────────────────────────────────────────────────────────
function SectionAccordion({ section, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const qCount = section.items.length;

  return (
    <div className="rounded-xl border border-border-default overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-surface hover:bg-surface-hover transition-colors text-left"
      >
        <div className="w-7 h-7 rounded-lg bg-brand-tint border border-brand-border flex items-center justify-center flex-shrink-0">
          <ListChecks className="w-3.5 h-3.5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-text-primary">{section.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {section.timer_minutes && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <Clock className="w-3 h-3" />{section.timer_minutes}m timer
              </span>
            )}
            <span className="text-[11px] text-text-muted">
              {qCount} question{qCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-text-muted flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-text-muted flex-shrink-0" />
        }
      </button>

      {/* Questions */}
      {open && (
        <div className="border-t border-border-subtle bg-page px-4 py-4 space-y-3">
          {section.items.length === 0 ? (
            <p className="text-[12px] text-text-muted italic py-2 text-center">No questions in this section.</p>
          ) : (
            section.items.map((item, idx) =>
              item.mcq
                ? <McqQuestionCard key={item.id} item={item} index={idx} />
                : <CodingItemCard key={item.id} item={item} index={idx} />
            )
          )}
        </div>
      )}
    </div>
  );
}

// ─── Configuration card ───────────────────────────────────────────────────────
function ConfigCard({ assessment }) {
  const cfg = assessment?.config_json || {};
  const caps = cfg.capabilities || {};

  const capabilityDefs = [
    { key: 'terminal',  label: 'Terminal',  icon: Terminal },
    { key: 'run_code',  label: 'Run Code',  icon: Code },
    { key: 'internet',  label: 'Internet',  icon: Globe },
  ];

  return (
    <div className="rounded-xl border border-border-default bg-surface p-5 space-y-4">
      <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] flex items-center gap-1.5">
        <Settings2 className="w-3 h-3" /> Configuration
      </p>

      {/* Description */}
      {assessment?.description && (
        <p className="text-[13px] text-text-secondary leading-relaxed">
          {assessment.description}
        </p>
      )}
      {!assessment?.description && (
        <p className="text-[12px] italic text-text-muted">No description provided.</p>
      )}

      <div className="h-px bg-border-subtle" />

      {/* Role + Seniority + Difficulty row */}
      <div className="space-y-2.5">
        {cfg.role && (
          <div>
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-1">Role</p>
            <p className="text-[13px] font-semibold text-text-primary">{cfg.role}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {cfg.seniority && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-surface-muted border border-border-subtle text-text-secondary">
              {cfg.seniority}
            </span>
          )}
          {cfg.difficulty && (
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${DIFFICULTY_COLORS[cfg.difficulty] || 'bg-surface-muted border-border-subtle text-text-secondary'}`}>
              {cfg.difficulty}
            </span>
          )}
          {cfg.ai_level && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-brand-tint border border-brand-border text-brand">
              <Cpu className="w-3 h-3" />
              {AI_LEVEL_LABELS[cfg.ai_level] || cfg.ai_level}
            </span>
          )}
        </div>
      </div>

      {/* Capabilities */}
      <div>
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2">Capabilities</p>
        <div className="flex flex-wrap gap-2">
          {capabilityDefs.map(({ key, label, icon: Icon }) => {
            const enabled = !!caps[key];
            return (
              <span key={key} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${
                enabled
                  ? 'bg-success-bg border-success-border text-success'
                  : 'bg-surface-muted border-border-subtle text-text-muted line-through'
              }`}>
                <Icon className="w-3 h-3" />
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Candidate funnel card ────────────────────────────────────────────────────
function CandidateFunnelCard({ candidates, isReady, navigate, id }) {
  return (
    <div className="rounded-xl border border-border-default bg-surface p-5">
      <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] mb-4 flex items-center gap-1.5">
        <Users className="w-3 h-3" /> Candidate Funnel
      </p>
      {candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Users className="w-8 h-8 text-text-faint mb-3" />
          <p className="text-[13px] text-text-muted">No candidates invited yet.</p>
          {isReady && (
            <button onClick={() => navigate(`/recruiter/invite?assessmentId=${id}`)}
              className="mt-3 text-[12px] text-brand hover:underline">
              Send first invite →
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {[
            { label: 'Invited',     color: '#22D3EE', count: candidates.filter(c => c.status === 'Invited').length },
            { label: 'Active',      color: '#D97706', count: candidates.filter(c => c.status === 'In Progress').length },
            { label: 'Submitted',   color: '#16A34A', count: candidates.filter(c => c.status === 'Submitted').length },
            { label: 'Expired',     color: '#64748B', count: candidates.filter(c => c.status === 'Expired').length },
          ].map(({ label, color, count }) => {
            const pct = candidates.length > 0 ? Math.round((count / candidates.length) * 100) : 0;
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[12px] text-text-secondary">{label}</span>
                  <span className="text-[12px] font-bold text-text-primary">
                    {count} <span className="font-normal text-text-secondary">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Candidate card row ───────────────────────────────────────────────────────
function CandidateCard({ candidate, assessmentId, onViewReport }) {
  return (
    <div className="px-6 py-4 hover:bg-surface transition-colors duration-100 group">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-full bg-surface-muted border border-border-default flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0 font-display">
          {getInitials(candidate.candidate_name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1.5">
            <p className="text-[13px] font-semibold text-text-primary truncate">
              {candidate.candidate_name || 'Unknown Candidate'}
            </p>
            <span className="text-[11px] text-text-secondary truncate">{candidate.candidate_email}</span>
            <CandidateStatusBadge status={candidate.status} />
          </div>
          <div className="flex items-center gap-4 mb-2.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-text-muted">
              <Calendar className="w-3 h-3" />Invited {formatDate(candidate.invited_at)}
            </span>
            {candidate.expires_at && candidate.status !== 'Submitted' && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                <Clock className="w-3 h-3" />Expires {formatDateTime(candidate.expires_at)}
              </span>
            )}
            {candidate.started_at && (
              <span className="flex items-center gap-1 text-[11px] text-text-muted">
                Started {formatDate(candidate.started_at)}
              </span>
            )}
          </div>
          <InviteLinkCell link={candidate.invite_link} />
        </div>
        {candidate.status === 'Submitted' && candidate.session_id && (
          <button onClick={() => onViewReport(candidate.session_id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-brand-tint border border-brand-border text-brand text-[11px] font-semibold rounded-lg hover:bg-brand-tint-light transition-all duration-150">
            <FileText className="w-3.5 h-3.5" />View Report<ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AssessmentDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment]   = useState(null);
  const [candidates, setCandidates]   = useState([]);
  const [assLoading, setAssLoading]   = useState(true);
  const [candLoading, setCandLoading] = useState(true);
  const [error, setError]             = useState('');
  const [filter, setFilter]           = useState('all');
  const [search, setSearch]           = useState('');

  useEffect(() => {
    setAssLoading(true);
    getAssessmentById(id)
      .then(res => setAssessment(res.data || res))
      .catch(err => setError(err.message || 'Failed to load assessment.'))
      .finally(() => setAssLoading(false));

    setCandLoading(true);
    getAssessmentCandidates(id)
      .then(res => { const data = res.data || res; setCandidates(data.candidates || []); })
      .catch(() => setCandidates([]))
      .finally(() => setCandLoading(false));
  }, [id]);

  const filtered = useMemo(() => candidates.filter(c => {
    const matchFilter = filter === 'all' || c.status === filter;
    const matchSearch = !search ||
      (c.candidate_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.candidate_email || '').toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  }), [candidates, filter, search]);

  const counts = useMemo(() => ({
    all:            candidates.length,
    Invited:        candidates.filter(c => c.status === 'Invited').length,
    'In Progress':  candidates.filter(c => c.status === 'In Progress').length,
    Submitted:      candidates.filter(c => c.status === 'Submitted').length,
    Expired:        candidates.filter(c => c.status === 'Expired').length,
  }), [candidates]);

  const isReady = assessment?.status === 'published';
  const sections = assessment?.sections || [];
  const totalQuestions = sections.reduce((acc, s) => acc + s.items.length, 0);

  const handleViewReport = (sessionId) => navigate(`/recruiter/reports/${id}/${sessionId}`);

  if (assLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader className="w-5 h-5 text-brand animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-[13px] text-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1100px]">

      {/* ── Back navigation ── */}
      <button onClick={() => navigate('/recruiter/dashboard')}
        className="flex items-center gap-2 text-[12px] text-text-secondary hover:text-text-primary transition-colors group">
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Assessments
      </button>

      {/* ── Assessment header ── */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-[22px] font-bold text-text-primary tracking-tight font-display">{assessment?.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0 ${
              isReady
                ? 'bg-success-bg text-success border border-success-border'
                : 'bg-warning-bg text-warning border border-warning-border'
            }`}>
              <span className={`w-1 h-1 rounded-full ${isReady ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
              {isReady ? 'Published' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            {assessment?.duration_minutes && (
              <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                <Clock className="w-3.5 h-3.5" />{assessment.duration_minutes} min
              </span>
            )}
            {assessment?.created_at && (
              <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
                <Calendar className="w-3.5 h-3.5" />Created {formatDate(assessment.created_at)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
              <Layers className="w-3.5 h-3.5" />{sections.length} section{sections.length !== 1 ? 's' : ''} · {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-text-secondary">
              <Users className="w-3.5 h-3.5" />{candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {isReady && (
          <button onClick={() => navigate(`/recruiter/invite?assessmentId=${id}`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-xl transition-all duration-150 active:scale-[0.97] flex-shrink-0">
            <UserPlus className="w-4 h-4" />Invite Candidates
          </button>
        )}
      </div>

      {/* ── Info row: Config + Funnel ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConfigCard assessment={assessment} />
        <CandidateFunnelCard candidates={candidates} isReady={isReady} navigate={navigate} id={id} />
      </div>

      {/* ── Assessment Content (sections + questions) ── */}
      <div className="rounded-xl border border-border-default overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center gap-2.5 px-5 py-4 bg-surface border-b border-border-default">
          <BookOpen className="w-4 h-4 text-brand" />
          <p className="text-[13px] font-bold text-text-primary">Assessment Content</p>
          <span className="text-[11px] text-text-secondary px-2 py-0.5 bg-surface-muted rounded-md">
            {sections.length} section{sections.length !== 1 ? 's' : ''} · {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="bg-page p-4 space-y-3">
          {sections.length === 0 ? (
            <div className="py-10 text-center">
              <BookOpen className="w-8 h-8 text-text-faint mx-auto mb-3" />
              <p className="text-[13px] text-text-secondary">No sections in this assessment.</p>
            </div>
          ) : (
            sections.map((section) => (
              <SectionAccordion key={section.id} section={section} defaultOpen={true} />
            ))
          )}
        </div>
      </div>

      {/* ── Candidates ── */}
      <div className="rounded-xl border border-border-default overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface border-b border-border-default">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" />
            <p className="text-[13px] font-bold text-text-primary">Candidates</p>
            <span className="text-[11px] text-text-secondary px-2 py-0.5 bg-surface-muted rounded-md">{candidates.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-page border border-border-default rounded-lg w-52 focus-within:border-border-strong transition-colors">
            <Search className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search candidates…" aria-label="Search candidates"
              className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-0.5 px-4 py-2.5 bg-page border-b border-border-subtle overflow-x-auto">
          {[
            { key: 'all',         label: 'All',       count: counts.all },
            { key: 'Invited',     label: 'Invited',   count: counts['Invited'] },
            { key: 'In Progress', label: 'Active',    count: counts['In Progress'] },
            { key: 'Submitted',   label: 'Submitted', count: counts['Submitted'] },
            { key: 'Expired',     label: 'Expired',   count: counts['Expired'] },
          ].filter(t => t.key === 'all' || t.count > 0).map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${
                filter === key ? 'bg-surface-muted text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}>
              {label}
              <span className={`text-[10px] ${filter === key ? 'text-text-secondary' : 'text-text-muted'}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* List */}
        {candLoading ? (
          <div className="flex justify-center py-12"><Loader className="w-4 h-4 text-brand animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-text-faint mx-auto mb-3" />
            <p className="text-[13px] text-text-secondary">
              {candidates.length === 0 ? 'No candidates invited yet.' : 'No candidates match this filter.'}
            </p>
            {candidates.length === 0 && isReady && (
              <button onClick={() => navigate(`/recruiter/invite?assessmentId=${id}`)}
                className="mt-3 flex items-center gap-1.5 mx-auto text-[12px] text-brand hover:underline">
                <UserPlus className="w-3.5 h-3.5" />Invite candidates →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {filtered.map(candidate => (
              <CandidateCard key={candidate.id} candidate={candidate} assessmentId={id} onViewReport={handleViewReport} />
            ))}
          </div>
        )}

        {/* Footer */}
        {!candLoading && candidates.length > 0 && (
          <div className="px-6 py-3 bg-surface border-t border-border-default flex items-center justify-between">
            <p className="text-[11px] text-text-muted">{filtered.length} of {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</p>
            {isReady && (
              <button onClick={() => navigate(`/recruiter/invite?assessmentId=${id}`)}
                className="flex items-center gap-1.5 text-[11px] text-brand hover:underline">
                <UserPlus className="w-3 h-3" />Invite more
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

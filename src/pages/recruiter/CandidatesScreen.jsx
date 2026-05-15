// CandidatesScreen — ranked candidates across all assessments, with report scores
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader, AlertCircle, Users, ChevronDown, ChevronUp,
  Award, FileText, Clock, Mail, TrendingUp, Filter, XCircle,
} from 'lucide-react';
import { getAllAssessments, getCandidatesWithReports } from '../../api/recruiter/assessment.jsx';

const POLL_INTERVAL_MS = 8000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const STATUS_CONFIG = {
  'Invited':     { color: '#22D3EE', bg: '#CFFAFE', border: '#0E7490', label: 'Invited' },
  'In Progress': { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', label: 'Active' },
  'Submitted':   { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', label: 'Submitted' },
  'Expired':     { color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', label: 'Expired'  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Invited'];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

const SIGNAL_COLORS = { green: '#16A34A', yellow: '#D97706', red: '#DC2626', null: '#CBD5E1' };

function SignalDot({ signal }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SIGNAL_COLORS[signal] || SIGNAL_COLORS.null }} />;
}

function ScorePill({ score }) {
  if (score === null || score === undefined) return <span className="text-[11px] text-text-muted">—</span>;
  const color = score >= 75 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626';
  const bg    = score >= 75 ? '#F0FDF4' : score >= 50 ? '#FFFBEB' : '#FEF2F2';
  const border= score >= 75 ? '#86EFAC' : score >= 50 ? '#FCD34D' : '#FCA5A5';
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-bold px-2.5 py-1 rounded-lg font-display"
      style={{ color, backgroundColor: bg, border: `1px solid ${border}` }}>
      {score}<span className="text-[10px] font-normal opacity-70">/100</span>
    </span>
  );
}

function RankBadge({ rank }) {
  if (!rank) return null;
  const styles = rank === 1 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
               : rank === 2 ? 'bg-zinc-400/10 text-zinc-300 border-zinc-400/30'
               : rank === 3 ? 'bg-orange-700/10 text-orange-400 border-orange-700/30'
               : 'bg-surface text-text-secondary border-border-default';
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-bold border font-display ${styles}`}>
      #{rank}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CandidatesScreen() {
  const navigate = useNavigate();

  const [assessments,  setAssessments]  = useState([]);
  const [selectedId,   setSelectedId]   = useState('');
  const [candidates,   setCandidates]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [assLoading,   setAssLoading]   = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy,       setSortBy]       = useState('rank');
  const [sortDir,      setSortDir]      = useState('asc');
  const [assessmentName, setAssessmentName] = useState('');
  const pollRef = useRef(null);

  // Load assessment list on mount
  useEffect(() => {
    getAllAssessments()
      .then(d => {
        const list = d.data || d;
        setAssessments(list);
        if (list.length > 0) setSelectedId(String(list[0].id));
      })
      .catch(() => setError('Failed to load assessments.'))
      .finally(() => setAssLoading(false));
  }, []);

  // Load candidates when assessment selected
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    setCandidates([]);
    setError('');
    getCandidatesWithReports(selectedId)
      .then(d => {
        if (!cancelled) {
          const payload = d.data || d;
          setCandidates(payload.candidates || []);
          setAssessmentName(payload.assessment_name || '');
        }
      })
      .catch(err => { if (!cancelled) setError(err.message || 'Failed to load candidates.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  // Poll while any candidate has pending/processing report or non-final assessment status
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    const needsPoll = candidates.some(
      c => c.report_status === 'pending' || c.report_status === 'processing' ||
           c.status === 'Invited' || c.status === 'In Progress'
    );
    if (needsPoll && selectedId) {
      pollRef.current = setInterval(() => {
        getCandidatesWithReports(selectedId)
          .then(d => {
            const payload = d.data || d;
            setCandidates(payload.candidates || []);
            setAssessmentName(payload.assessment_name || '');
          })
          .catch(() => {});
      }, POLL_INTERVAL_MS);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [candidates, selectedId]);

  const toggle = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let list = candidates.filter(c => {
      const matchSearch = !search ||
        c.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.candidate_email?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });

    list = [...list].sort((a, b) => {
      let va, vb;
      if (sortBy === 'rank')    { va = a.rank ?? 9999; vb = b.rank ?? 9999; }
      else if (sortBy === 'score') { va = a.overall_score ?? -1; vb = b.overall_score ?? -1; }
      else if (sortBy === 'name')  { va = (a.candidate_name || '').toLowerCase(); vb = (b.candidate_name || '').toLowerCase(); }
      else { va = a.invited_at || ''; vb = b.invited_at || ''; }
      return sortDir === 'asc' ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0);
    });

    return list;
  }, [candidates, search, statusFilter, sortBy, sortDir]);

  const total     = candidates.length;
  const submitted = candidates.filter(c => c.status === 'Submitted').length;
  const scored    = candidates.filter(c => c.overall_score !== null).length;
  const avgScore  = scored > 0
    ? Math.round(candidates.filter(c => c.overall_score !== null).reduce((s, c) => s + c.overall_score, 0) / scored)
    : null;

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-brand" /> : <ChevronDown className="w-3 h-3 text-brand" />;
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-text-primary font-display tracking-tight">Candidates</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">Ranked candidates with performance scores for each assessment.</p>
        </div>
      </div>

      {/* Assessment selector */}
      <div className="mb-5">
        {assLoading ? (
          <div className="flex items-center gap-2 text-[13px] text-text-secondary"><Loader className="w-3.5 h-3.5 animate-spin" />Loading assessments…</div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-default rounded-lg">
              <Filter className="w-3.5 h-3.5 text-text-secondary" />
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="bg-transparent text-[13px] text-text-primary focus:outline-none cursor-pointer min-w-[200px]"
              >
                {assessments.map(a => <option key={a.id} value={a.id} className="bg-surface">{a.name}</option>)}
              </select>
            </div>
            {assessmentName && <span className="text-[12px] text-text-secondary">· {assessmentName}</span>}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-[13px] font-medium text-error">{error}</p>
        </div>
      )}

      {/* Stats row */}
      {!loading && candidates.length > 0 && (
        <div className="grid grid-cols-4 gap-px bg-border-default rounded-xl overflow-hidden border border-border-default mb-5">
          {[
            { label: 'Total',     value: total,     color: '#0F172A',   sub: 'candidates' },
            { label: 'Submitted', value: submitted,  color: '#16A34A',   sub: 'completed'  },
            { label: 'Scored',    value: scored,     color: '#22D3EE',   sub: 'with report'},
            { label: 'Avg Score', value: avgScore !== null ? avgScore : '—', color: avgScore >= 75 ? '#16A34A' : avgScore >= 50 ? '#D97706' : '#DC2626', sub: 'overall' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="bg-page px-5 py-4">
              <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] mb-2">{label}</p>
              <p className="text-[24px] font-bold leading-none mb-1 font-display" style={{ color }}>{value}</p>
              <p className="text-[11px] text-text-muted">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-default rounded-lg flex-1 min-w-[180px] focus-within:border-border-strong">
          <Search className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none" />
        </div>
        <div className="flex items-center gap-0.5 bg-surface border border-border-default rounded-lg p-1">
          {['all', 'Invited', 'In Progress', 'Submitted', 'Expired'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${statusFilter === s ? 'bg-surface-muted text-text-primary' : 'text-text-secondary hover:text-text-secondary'}`}>
              {s === 'all' ? 'All' : s === 'In Progress' ? 'Active' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="flex justify-center py-24"><Loader className="w-5 h-5 text-brand animate-spin" /></div>}

      {/* Empty */}
      {!loading && !error && candidates.length === 0 && selectedId && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border-default flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-text-muted" />
          </div>
          <p className="text-[15px] font-bold text-text-primary font-display mb-1">No candidates yet</p>
          <p className="text-[13px] text-text-secondary">Invite candidates to this assessment to see them here.</p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-border-default overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-[40px_minmax(0,1fr)_100px_120px_200px_100px_120px] gap-3 items-center px-5 py-3 bg-surface border-b border-border-default">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em]">#</p>
            <button onClick={() => toggle('name')} className="flex items-center gap-1 text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] hover:text-text-secondary">
              Candidate<SortIcon col="name" />
            </button>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em]">Status</p>
            <button onClick={() => toggle('score')} className="flex items-center gap-1 text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] hover:text-text-secondary">
              Score<SortIcon col="score" />
            </button>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em]">Dimensions</p>
            <button onClick={() => toggle('invited')} className="flex items-center gap-1 text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] hover:text-text-secondary">
              Invited<SortIcon col="invited" />
            </button>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] text-right">Report</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border-subtle">
            {filtered.map((c, idx) => {
              const dims = c.dimensions;
              const hasReport = c.report_status === 'completed' && c.session_id;
              return (
                <div key={c.id} className="grid grid-cols-[40px_minmax(0,1fr)_100px_120px_200px_100px_120px] gap-3 items-center px-5 py-4 hover:bg-surface transition-colors group">
                  {/* Rank */}
                  <RankBadge rank={c.rank} />

                  {/* Candidate */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-surface-muted border border-border-default flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0 font-display">
                      {getInitials(c.candidate_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary truncate leading-none">{c.candidate_name || 'Unknown'}</p>
                      <p className="text-[11px] text-text-secondary truncate mt-0.5 flex items-center gap-1">
                        <Mail className="w-2.5 h-2.5 flex-shrink-0" />{c.candidate_email}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <StatusBadge status={c.status} />

                  {/* Score */}
                  <ScorePill score={c.overall_score} />

                  {/* Dimension signals */}
                  <div className="flex items-center gap-3">
                    {dims ? (
                      <>
                        {[
                          { key: 'task_completion',        label: 'Task' },
                          { key: 'design_quality',         label: 'Design' },
                          { key: 'problem_solving_process',label: 'Process' },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-1" title={`${label}: ${dims[key]?.signal || 'N/A'}`}>
                            <SignalDot signal={dims[key]?.signal} />
                            <span className="text-[10px] text-text-secondary">{label}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <span className="text-[11px] text-text-muted">No report yet</span>
                    )}
                  </div>

                  {/* Invited */}
                  <p className="text-[11px] text-text-secondary">{formatDate(c.invited_at)}</p>

                  {/* Report action */}
                  <div className="flex justify-end">
                    {hasReport ? (
                      <button
                        onClick={() => navigate(`/recruiter/reports/${selectedId}/${c.session_id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-tint border border-brand-border text-brand text-[11px] font-semibold rounded-lg hover:bg-brand-tint-light hover:border-brand transition-all"
                      >
                        <FileText className="w-3 h-3" />View
                      </button>
                    ) : c.report_status === 'processing' ? (
                      <span className="flex items-center gap-1 text-[11px] text-brand"><Loader className="w-3 h-3 animate-spin" />Generating…</span>
                    ) : c.report_status === 'pending' ? (
                      <span className="flex items-center gap-1 text-[11px] text-warning"><Clock className="w-3 h-3" />Queued</span>
                    ) : c.report_status === 'failed' ? (
                      <span className="flex items-center gap-1 text-[11px] text-error"><XCircle className="w-3 h-3" />Failed</span>
                    ) : (
                      <span className="text-[11px] text-text-muted">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-surface border-t border-border-default">
            <p className="text-[11px] text-text-muted">{filtered.length} of {total} candidate{total !== 1 ? 's' : ''} · Ranked by overall score</p>
          </div>
        </div>
      )}
    </div>
  );
}

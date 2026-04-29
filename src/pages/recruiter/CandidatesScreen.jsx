// CandidatesScreen — ranked candidates across all assessments, with report scores
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader, AlertCircle, Users, ChevronDown, ChevronUp,
  Award, FileText, Clock, Mail, TrendingUp, Filter,
} from 'lucide-react';
import { getAllAssessments } from '../../api/recruiter/assessment.jsx';
import { getCandidatesWithReports } from '../../api/recruiter/assessment.jsx';

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
  'Invited':     { color: '#06B6D4', bg: '#083344', border: '#0E7490', label: 'Invited' },
  'In Progress': { color: '#F59E0B', bg: '#1C150A', border: '#78350F', label: 'Active' },
  'Submitted':   { color: '#10B981', bg: '#022C22', border: '#065F46', label: 'Submitted' },
  'Expired':     { color: '#52525B', bg: '#17171A', border: '#27272A', label: 'Expired'  },
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

const SIGNAL_COLORS = { green: '#10B981', yellow: '#F59E0B', red: '#F43F5E', null: '#3F3F46' };

function SignalDot({ signal }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SIGNAL_COLORS[signal] || SIGNAL_COLORS.null }} />;
}

function ScorePill({ score }) {
  if (score === null || score === undefined) return <span className="text-[11px] text-[#3F3F46]">—</span>;
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#F43F5E';
  const bg    = score >= 75 ? '#022C22' : score >= 50 ? '#1C150A' : '#1C0813';
  const border= score >= 75 ? '#065F46' : score >= 50 ? '#78350F' : '#881337';
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
               : 'bg-[#111113] text-[#52525B] border-[#27272A]';
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
  const [sortBy,       setSortBy]       = useState('rank'); // rank | name | invited
  const [sortDir,      setSortDir]      = useState('asc');
  const [assessmentName, setAssessmentName] = useState('');

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
    setLoading(true); setCandidates([]); setError('');
    getCandidatesWithReports(selectedId)
      .then(d => {
        const payload = d.data || d;
        setCandidates(payload.candidates || []);
        setAssessmentName(payload.assessment_name || '');
      })
      .catch(err => setError(err.message || 'Failed to load candidates.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

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
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-[#06B6D4]" /> : <ChevronDown className="w-3 h-3 text-[#06B6D4]" />;
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-[#FAFAFA] font-display tracking-tight">Candidates</h1>
          <p className="text-[13px] text-[#52525B] mt-0.5">Ranked candidates with performance scores for each assessment.</p>
        </div>
      </div>

      {/* Assessment selector */}
      <div className="mb-5">
        {assLoading ? (
          <div className="flex items-center gap-2 text-[13px] text-[#52525B]"><Loader className="w-3.5 h-3.5 animate-spin" />Loading assessments…</div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#111113] border border-[#27272A] rounded-lg">
              <Filter className="w-3.5 h-3.5 text-[#52525B]" />
              <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="bg-transparent text-[13px] text-[#E4E4E7] focus:outline-none cursor-pointer min-w-[200px]"
              >
                {assessments.map(a => <option key={a.id} value={a.id} className="bg-[#111113]">{a.name}</option>)}
              </select>
            </div>
            {assessmentName && <span className="text-[12px] text-[#52525B]">· {assessmentName}</span>}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl">
          <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0" />
          <p className="text-[13px] font-medium text-[#F43F5E]">{error}</p>
        </div>
      )}

      {/* Stats row */}
      {!loading && candidates.length > 0 && (
        <div className="grid grid-cols-4 gap-px bg-[#27272A] rounded-xl overflow-hidden border border-[#27272A] mb-5">
          {[
            { label: 'Total',     value: total,     color: '#FAFAFA',   sub: 'candidates' },
            { label: 'Submitted', value: submitted,  color: '#10B981',   sub: 'completed'  },
            { label: 'Scored',    value: scored,     color: '#06B6D4',   sub: 'with report'},
            { label: 'Avg Score', value: avgScore !== null ? avgScore : '—', color: avgScore >= 75 ? '#10B981' : avgScore >= 50 ? '#F59E0B' : '#F43F5E', sub: 'overall' },
          ].map(({ label, value, color, sub }) => (
            <div key={label} className="bg-[#0C0C0E] px-5 py-4">
              <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] mb-2">{label}</p>
              <p className="text-[24px] font-bold leading-none mb-1 font-display" style={{ color }}>{value}</p>
              <p className="text-[11px] text-[#3F3F46]">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#111113] border border-[#27272A] rounded-lg flex-1 min-w-[180px] focus-within:border-[#3F3F46]">
          <Search className="w-3.5 h-3.5 text-[#52525B] flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            className="flex-1 bg-transparent text-[13px] text-[#E4E4E7] placeholder:text-[#52525B] focus:outline-none" />
        </div>
        <div className="flex items-center gap-0.5 bg-[#111113] border border-[#27272A] rounded-lg p-1">
          {['all', 'Invited', 'In Progress', 'Submitted', 'Expired'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${statusFilter === s ? 'bg-[#1C1C20] text-[#E4E4E7]' : 'text-[#52525B] hover:text-[#A1A1AA]'}`}>
              {s === 'all' ? 'All' : s === 'In Progress' ? 'Active' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="flex justify-center py-24"><Loader className="w-5 h-5 text-[#06B6D4] animate-spin" /></div>}

      {/* Empty */}
      {!loading && !error && candidates.length === 0 && selectedId && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-[#3F3F46]" />
          </div>
          <p className="text-[15px] font-bold text-[#E4E4E7] font-display mb-1">No candidates yet</p>
          <p className="text-[13px] text-[#52525B]">Invite candidates to this assessment to see them here.</p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-[#27272A] overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-[40px_minmax(0,1fr)_100px_120px_200px_100px_120px] gap-3 items-center px-5 py-3 bg-[#111113] border-b border-[#27272A]">
            <p className="text-[10px] font-semibold text-[#3F3F46] uppercase tracking-[0.14em]">#</p>
            <button onClick={() => toggle('name')} className="flex items-center gap-1 text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] hover:text-[#A1A1AA]">
              Candidate<SortIcon col="name" />
            </button>
            <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em]">Status</p>
            <button onClick={() => toggle('score')} className="flex items-center gap-1 text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] hover:text-[#A1A1AA]">
              Score<SortIcon col="score" />
            </button>
            <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em]">Dimensions</p>
            <button onClick={() => toggle('invited')} className="flex items-center gap-1 text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] hover:text-[#A1A1AA]">
              Invited<SortIcon col="invited" />
            </button>
            <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] text-right">Report</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#1C1C20]">
            {filtered.map((c, idx) => {
              const dims = c.dimensions;
              const hasReport = c.report_status === 'completed' && c.session_id;
              return (
                <div key={c.id} className="grid grid-cols-[40px_minmax(0,1fr)_100px_120px_200px_100px_120px] gap-3 items-center px-5 py-4 hover:bg-[#111113] transition-colors group">
                  {/* Rank */}
                  <RankBadge rank={c.rank} />

                  {/* Candidate */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#17171A] border border-[#27272A] flex items-center justify-center text-[11px] font-bold text-[#A1A1AA] flex-shrink-0 font-display">
                      {getInitials(c.candidate_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#E4E4E7] truncate leading-none">{c.candidate_name || 'Unknown'}</p>
                      <p className="text-[11px] text-[#52525B] truncate mt-0.5 flex items-center gap-1">
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
                            <span className="text-[10px] text-[#52525B]">{label}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <span className="text-[11px] text-[#3F3F46]">No report yet</span>
                    )}
                  </div>

                  {/* Invited */}
                  <p className="text-[11px] text-[#52525B]">{formatDate(c.invited_at)}</p>

                  {/* Report action */}
                  <div className="flex justify-end">
                    {hasReport ? (
                      <button
                        onClick={() => navigate(`/recruiter/reports/${selectedId}/${c.session_id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#083344] border border-[#0E7490] text-[#06B6D4] text-[11px] font-semibold rounded-lg hover:bg-[#0a3d52] hover:border-[#06B6D4] transition-all"
                      >
                        <FileText className="w-3 h-3" />View
                      </button>
                    ) : c.report_status === 'processing' ? (
                      <span className="flex items-center gap-1 text-[11px] text-[#F59E0B]"><Loader className="w-3 h-3 animate-spin" />Processing</span>
                    ) : (
                      <span className="text-[11px] text-[#3F3F46]">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 bg-[#111113] border-t border-[#27272A]">
            <p className="text-[11px] text-[#3F3F46]">{filtered.length} of {total} candidate{total !== 1 ? 's' : ''} · Ranked by overall score</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ReportsScreen — all scored candidates with reports across all assessments
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader, AlertCircle, FileText, Filter,
  ChevronDown, ChevronUp, Award, TrendingUp, Clock, XCircle,
} from 'lucide-react';
import { getAllAssessments, getCandidatesWithReports } from '../../api/recruiter/assessment.jsx';

const POLL_INTERVAL_MS = 8000;

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function ScorePill({ score }) {
  if (score === null || score === undefined) return <span className="text-[11px] text-text-muted">—</span>;
  const color = score >= 75 ? '#16A34A' : score >= 50 ? '#D97706' : '#DC2626';
  const bg    = score >= 75 ? '#F0FDF4' : score >= 50 ? '#FFFBEB' : '#FEF2F2';
  const border= score >= 75 ? '#86EFAC' : score >= 50 ? '#FCD34D' : '#FCA5A5';
  return (
    <span className="inline-flex items-center text-[12px] font-bold px-2.5 py-1 rounded-lg font-display"
      style={{ color, backgroundColor: bg, border: `1px solid ${border}` }}>
      {score}<span className="text-[10px] font-normal opacity-60">/100</span>
    </span>
  );
}

const SIGNAL_COLORS = { green: '#16A34A', yellow: '#D97706', red: '#DC2626' };
function SignalDot({ signal }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SIGNAL_COLORS[signal] || '#CBD5E1' }} />;
}

function SortIcon({ col, sortBy, sortDir }) {
  if (sortBy !== col) return <ChevronDown className="w-3 h-3 opacity-20" />;
  return sortDir === 'desc'
    ? <ChevronDown className="w-3 h-3 text-brand" />
    : <ChevronUp className="w-3 h-3 text-brand" />;
}

const REPORT_STATUS_CFG = {
  not_requested: { label: 'Not started',     color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' },
  pending:       { label: 'Queued',           color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' },
  processing:    { label: 'Generating…',      color: '#22D3EE', bg: '#CFFAFE', border: '#0E7490' },
  completed:     { label: 'Ready',            color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' },
  failed:        { label: 'Failed',           color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' },
};

function ReportStatusBadge({ status }) {
  const cfg = REPORT_STATUS_CFG[status] || REPORT_STATUS_CFG.not_requested;
  const spinning = status === 'pending' || status === 'processing';
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      {spinning
        ? <Loader className="w-2.5 h-2.5 animate-spin" />
        : status === 'failed'
          ? <XCircle className="w-2.5 h-2.5" />
          : status === 'completed'
            ? null
            : <Clock className="w-2.5 h-2.5" />
      }
      {cfg.label}
    </span>
  );
}

export default function ReportsScreen() {
  const navigate = useNavigate();

  const [assessments,  setAssessments]  = useState([]);
  const [selectedId,   setSelectedId]   = useState('');
  const [candidates,   setCandidates]   = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [assLoading,   setAssLoading]   = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [scoreFilter,  setScoreFilter]  = useState('all');
  const [sortBy,       setSortBy]       = useState('score');
  const [sortDir,      setSortDir]      = useState('desc');
  const pollRef = useRef(null);

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

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    setCandidates([]);
    setError('');
    getCandidatesWithReports(selectedId)
      .then(d => { if (!cancelled) setCandidates((d.data || d).candidates || []); })
      .catch(err => { if (!cancelled) setError(err.message || 'Failed to load reports.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId]);

  // Poll when any report is pending or processing
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    const hasActive = candidates.some(c => c.report_status === 'pending' || c.report_status === 'processing');
    if (hasActive && selectedId) {
      pollRef.current = setInterval(() => {
        getCandidatesWithReports(selectedId)
          .then(d => setCandidates((d.data || d).candidates || []))
          .catch(() => {});
      }, POLL_INTERVAL_MS);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [candidates, selectedId]);

  const toggle = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  // Show all submitted candidates, not just completed
  const submitted = useMemo(() => candidates.filter(c => c.status === 'Submitted'), [candidates]);
  const withReports = useMemo(() => submitted.filter(c => c.report_status === 'completed'), [submitted]);

  const filtered = useMemo(() => {
    let list = submitted.filter(c => {
      const matchSearch = !search ||
        c.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.candidate_email?.toLowerCase().includes(search.toLowerCase());
      const s = c.overall_score;
      const matchScore =
        scoreFilter === 'all'    ||
        (scoreFilter === 'high'   && s >= 75) ||
        (scoreFilter === 'medium' && s >= 50 && s < 75) ||
        (scoreFilter === 'low'    && s !== null && s < 50) ||
        (scoreFilter === 'pending' && (c.report_status === 'pending' || c.report_status === 'processing'));
      return matchSearch && matchScore;
    });

    return [...list].sort((a, b) => {
      let va, vb;
      if (sortBy === 'score') { va = a.overall_score ?? -1; vb = b.overall_score ?? -1; }
      else { va = (a.candidate_name || '').toLowerCase(); vb = (b.candidate_name || '').toLowerCase(); }
      return sortDir === 'desc' ? (vb < va ? -1 : vb > va ? 1 : 0) : (va < vb ? -1 : va > vb ? 1 : 0);
    });
  }, [submitted, search, scoreFilter, sortBy, sortDir]);

  const avgScore = withReports.length > 0 && withReports.some(c => c.overall_score !== null)
    ? Math.round(withReports.filter(c => c.overall_score !== null).reduce((s, c) => s + c.overall_score, 0) / withReports.filter(c => c.overall_score !== null).length)
    : null;

  const pendingCount = submitted.filter(c => c.report_status === 'pending' || c.report_status === 'processing').length;

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-text-primary font-display tracking-tight">Reports</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">Candidate assessment reports — scored and ranked by performance.</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-bg border border-warning-border rounded-lg">
            <Loader className="w-3 h-3 text-warning animate-spin" />
            <span className="text-[11px] font-semibold text-warning">{pendingCount} generating…</span>
          </div>
        )}
      </div>

      {/* Assessment selector */}
      <div className="mb-5">
        {assLoading ? (
          <div className="flex items-center gap-2 text-[13px] text-text-secondary"><Loader className="w-3.5 h-3.5 animate-spin" />Loading…</div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-default rounded-lg w-fit">
            <Filter className="w-3.5 h-3.5 text-text-secondary" />
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="bg-transparent text-[13px] text-text-primary focus:outline-none cursor-pointer min-w-[220px]">
              {assessments.map(a => <option key={a.id} value={a.id} className="bg-surface">{a.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-[13px] text-error">{error}</p>
        </div>
      )}

      {/* Stats */}
      {!loading && submitted.length > 0 && (
        <div className="grid grid-cols-4 gap-px bg-border-default rounded-xl overflow-hidden border border-border-default mb-5">
          {[
            { label: 'Submitted',    value: submitted.length,    color: '#0F172A',  sub: 'total' },
            { label: 'Reports Ready',value: withReports.length,  color: '#16A34A',  sub: 'completed' },
            { label: 'Generating',   value: pendingCount,        color: '#D97706',  sub: 'in progress' },
            { label: 'Avg Score',    value: avgScore !== null ? avgScore : '—', color: avgScore >= 75 ? '#16A34A' : avgScore >= 50 ? '#D97706' : '#DC2626', sub: 'overall' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…"
            className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none" />
        </div>
        <div className="flex items-center gap-0.5 bg-surface border border-border-default rounded-lg p-1">
          {[
            { key: 'all',     label: 'All' },
            { key: 'high',    label: '75+' },
            { key: 'medium',  label: '50–74' },
            { key: 'low',     label: '<50' },
            { key: 'pending', label: 'Generating' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setScoreFilter(key)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${scoreFilter === key ? 'bg-surface-muted text-text-primary' : 'text-text-secondary hover:text-text-secondary'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex justify-center py-24"><Loader className="w-5 h-5 text-brand animate-spin" /></div>}

      {!loading && submitted.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-2xl bg-surface border border-border-default flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-text-muted" />
          </div>
          <p className="text-[15px] font-bold text-text-primary font-display mb-1">No submissions yet</p>
          <p className="text-[13px] text-text-secondary">Reports are generated automatically when candidates submit.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-border-default overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-[32px_minmax(0,1fr)_180px_120px_180px_140px_120px] gap-3 items-center px-5 py-3 bg-surface border-b border-border-default">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em]">#</p>
            <button onClick={() => toggle('name')} className="flex items-center gap-1 text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] hover:text-text-secondary">
              Candidate<SortIcon col="name" sortBy={sortBy} sortDir={sortDir} />
            </button>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em]">Assessment</p>
            <button onClick={() => toggle('score')} className="flex items-center gap-1 text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] hover:text-text-secondary">
              Score<SortIcon col="score" sortBy={sortBy} sortDir={sortDir} />
            </button>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em]">Signals</p>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em]">Report</p>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] text-right">Action</p>
          </div>

          <div className="divide-y divide-border-subtle">
            {filtered.map((c, idx) => {
              const dims = c.dimensions || {};
              const assessmentName = assessments.find(a => String(a.id) === selectedId)?.name || '—';
              const canView = c.report_status === 'completed' && c.session_id;
              return (
                <div key={c.id} className="grid grid-cols-[32px_minmax(0,1fr)_180px_120px_180px_140px_120px] gap-3 items-center px-5 py-4 hover:bg-surface transition-colors">
                  <span className="text-[12px] font-bold text-text-secondary font-display">{idx + 1}</span>

                  {/* Candidate */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-surface-muted border border-border-default flex items-center justify-center text-[11px] font-bold text-text-secondary flex-shrink-0 font-display">
                      {getInitials(c.candidate_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-text-primary truncate">{c.candidate_name || 'Unknown'}</p>
                      <p className="text-[11px] text-text-secondary truncate">{c.candidate_email}</p>
                    </div>
                  </div>

                  <p className="text-[12px] text-text-secondary truncate">{assessmentName}</p>
                  <ScorePill score={c.overall_score} />

                  {/* Signals */}
                  <div className="flex items-center gap-3">
                    {c.report_status === 'completed' && dims.task_completion ? (
                      <>
                        {[
                          { key: 'task_completion',         label: 'T' },
                          { key: 'design_quality',          label: 'D' },
                          { key: 'problem_solving_process', label: 'P' },
                        ].map(({ key, label }) => (
                          <div key={key} className="flex items-center gap-1" title={`${label}: ${dims[key]?.signal || '?'}`}>
                            <SignalDot signal={dims[key]?.signal} />
                            <span className="text-[10px] text-text-secondary">{label}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <span className="text-[11px] text-text-muted">—</span>
                    )}
                  </div>

                  <ReportStatusBadge status={c.report_status} />

                  {/* Action */}
                  <div className="flex justify-end">
                    {canView ? (
                      <button
                        onClick={() => navigate(`/recruiter/reports/${selectedId}/${c.session_id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-tint border border-brand-border text-brand text-[11px] font-semibold rounded-lg hover:bg-brand-tint-light hover:border-brand transition-all"
                      >
                        <FileText className="w-3 h-3" />View
                      </button>
                    ) : (
                      <span className="text-[11px] text-text-muted">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 bg-surface border-t border-border-default">
            <p className="text-[11px] text-text-muted">{withReports.length} ready · {pendingCount} generating · {submitted.length - withReports.length - pendingCount} not started</p>
          </div>
        </div>
      )}
    </div>
  );
}

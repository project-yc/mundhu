// ReportsScreen — all scored candidates with reports across all assessments
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Loader, AlertCircle, FileText, Filter,
  ChevronDown, ChevronUp, Award, TrendingUp,
} from 'lucide-react';
import { getAllAssessments, getCandidatesWithReports } from '../../api/recruiter/assessment.jsx';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function ScorePill({ score }) {
  if (score === null || score === undefined) return <span className="text-[11px] text-[#3F3F46]">—</span>;
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#F43F5E';
  const bg    = score >= 75 ? '#022C22' : score >= 50 ? '#1C150A' : '#1C0813';
  const border= score >= 75 ? '#065F46' : score >= 50 ? '#78350F' : '#881337';
  return (
    <span className="inline-flex items-center text-[12px] font-bold px-2.5 py-1 rounded-lg font-display"
      style={{ color, backgroundColor: bg, border: `1px solid ${border}` }}>
      {score}<span className="text-[10px] font-normal opacity-60">/100</span>
    </span>
  );
}

const SIGNAL_COLORS = { green: '#10B981', yellow: '#F59E0B', red: '#F43F5E' };

function SignalDot({ signal }) {
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: SIGNAL_COLORS[signal] || '#3F3F46' }} />;
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
  const [scoreFilter,  setScoreFilter]  = useState('all'); // all | high | medium | low
  const [sortBy,       setSortBy]       = useState('score');
  const [sortDir,      setSortDir]      = useState('desc');

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
    setLoading(true); setCandidates([]); setError('');
    getCandidatesWithReports(selectedId)
      .then(d => setCandidates((d.data || d).candidates || []))
      .catch(err => setError(err.message || 'Failed to load reports.'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const toggle = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  // Only candidates with completed reports
  const withReports = useMemo(() => candidates.filter(c => c.report_status === 'completed'), [candidates]);

  const filtered = useMemo(() => {
    let list = withReports.filter(c => {
      const matchSearch = !search ||
        c.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.candidate_email?.toLowerCase().includes(search.toLowerCase());
      const s = c.overall_score;
      const matchScore =
        scoreFilter === 'all'    ||
        (scoreFilter === 'high'   && s >= 75) ||
        (scoreFilter === 'medium' && s >= 50 && s < 75) ||
        (scoreFilter === 'low'    && s < 50);
      return matchSearch && matchScore;
    });

    return [...list].sort((a, b) => {
      let va, vb;
      if (sortBy === 'score') { va = a.overall_score ?? -1; vb = b.overall_score ?? -1; }
      else { va = (a.candidate_name || '').toLowerCase(); vb = (b.candidate_name || '').toLowerCase(); }
      return sortDir === 'desc' ? (vb < va ? -1 : vb > va ? 1 : 0) : (va < vb ? -1 : va > vb ? 1 : 0);
    });
  }, [withReports, search, scoreFilter, sortBy, sortDir]);

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <ChevronDown className="w-3 h-3 opacity-20" />;
    return sortDir === 'desc' ? <ChevronDown className="w-3 h-3 text-[#06B6D4]" /> : <ChevronUp className="w-3 h-3 text-[#06B6D4]" />;
  };

  const avgScore = withReports.length > 0 && withReports.some(c => c.overall_score !== null)
    ? Math.round(withReports.filter(c => c.overall_score !== null).reduce((s, c) => s + c.overall_score, 0) / withReports.filter(c => c.overall_score !== null).length)
    : null;

  return (
    <div className="p-6 max-w-[1100px] mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-[#FAFAFA] font-display tracking-tight">Reports</h1>
          <p className="text-[13px] text-[#52525B] mt-0.5">View and download candidate assessment reports ranked by performance.</p>
        </div>
      </div>

      {/* Assessment selector */}
      <div className="mb-5">
        {assLoading ? (
          <div className="flex items-center gap-2 text-[13px] text-[#52525B]"><Loader className="w-3.5 h-3.5 animate-spin" />Loading…</div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#111113] border border-[#27272A] rounded-lg w-fit">
            <Filter className="w-3.5 h-3.5 text-[#52525B]" />
            <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
              className="bg-transparent text-[13px] text-[#E4E4E7] focus:outline-none cursor-pointer min-w-[220px]">
              {assessments.map(a => <option key={a.id} value={a.id} className="bg-[#111113]">{a.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl">
          <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0" />
          <p className="text-[13px] text-[#F43F5E]">{error}</p>
        </div>
      )}

      {/* Stats */}
      {!loading && withReports.length > 0 && (
        <div className="grid grid-cols-3 gap-px bg-[#27272A] rounded-xl overflow-hidden border border-[#27272A] mb-5">
          {[
            { label: 'Total Reports', value: withReports.length, color: '#FAFAFA', sub: 'completed' },
            { label: 'Avg Score',     value: avgScore !== null ? avgScore : '—', color: avgScore >= 75 ? '#10B981' : avgScore >= 50 ? '#F59E0B' : '#F43F5E', sub: 'overall' },
            { label: 'Top Score',     value: Math.max(...withReports.map(c => c.overall_score || 0)), color: '#10B981', sub: 'best candidate' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports…"
            className="flex-1 bg-transparent text-[13px] text-[#E4E4E7] placeholder:text-[#52525B] focus:outline-none" />
        </div>
        <div className="flex items-center gap-0.5 bg-[#111113] border border-[#27272A] rounded-lg p-1">
          {[
            { key: 'all',    label: 'All' },
            { key: 'high',   label: '75+' },
            { key: 'medium', label: '50–74' },
            { key: 'low',    label: '<50' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setScoreFilter(key)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${scoreFilter === key ? 'bg-[#1C1C20] text-[#E4E4E7]' : 'text-[#52525B] hover:text-[#A1A1AA]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="flex justify-center py-24"><Loader className="w-5 h-5 text-[#06B6D4] animate-spin" /></div>}

      {!loading && withReports.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#111113] border border-[#27272A] flex items-center justify-center mb-4">
            <FileText className="w-5 h-5 text-[#3F3F46]" />
          </div>
          <p className="text-[15px] font-bold text-[#E4E4E7] font-display mb-1">No reports yet</p>
          <p className="text-[13px] text-[#52525B]">Reports are generated automatically when candidates submit.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-[#27272A] overflow-hidden">
          {/* Head */}
          <div className="grid grid-cols-[32px_minmax(0,1fr)_180px_120px_180px_100px] gap-3 items-center px-5 py-3 bg-[#111113] border-b border-[#27272A]">
            <p className="text-[10px] font-semibold text-[#3F3F46] uppercase tracking-[0.14em]">#</p>
            <button onClick={() => toggle('name')} className="flex items-center gap-1 text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] hover:text-[#A1A1AA]">
              Candidate<SortIcon col="name" />
            </button>
            <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em]">Assessment</p>
            <button onClick={() => toggle('score')} className="flex items-center gap-1 text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] hover:text-[#A1A1AA]">
              Score<SortIcon col="score" />
            </button>
            <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em]">Signals</p>
            <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] text-right">Action</p>
          </div>

          <div className="divide-y divide-[#1C1C20]">
            {filtered.map((c, idx) => {
              const dims = c.dimensions || {};
              const assessmentName = assessments.find(a => String(a.id) === selectedId)?.name || '—';
              return (
                <div key={c.id} className="grid grid-cols-[32px_minmax(0,1fr)_180px_120px_180px_100px] gap-3 items-center px-5 py-4 hover:bg-[#111113] transition-colors">
                  {/* Rank */}
                  <span className="text-[12px] font-bold text-[#52525B] font-display">{idx + 1}</span>

                  {/* Candidate */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#17171A] border border-[#27272A] flex items-center justify-center text-[11px] font-bold text-[#A1A1AA] flex-shrink-0 font-display">
                      {getInitials(c.candidate_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold text-[#E4E4E7] truncate">{c.candidate_name || 'Unknown'}</p>
                      <p className="text-[11px] text-[#52525B] truncate">{c.candidate_email}</p>
                    </div>
                  </div>

                  {/* Assessment */}
                  <p className="text-[12px] text-[#A1A1AA] truncate">{assessmentName}</p>

                  {/* Score */}
                  <ScorePill score={c.overall_score} />

                  {/* Signals */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      { key: 'task_completion',         label: 'T' },
                      { key: 'design_quality',          label: 'D' },
                      { key: 'problem_solving_process', label: 'P' },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-1" title={`${label}: ${dims[key]?.signal || '?'}`}>
                        <SignalDot signal={dims[key]?.signal} />
                        <span className="text-[10px] text-[#52525B]">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate(`/recruiter/reports/${selectedId}/${c.session_id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#083344] border border-[#0E7490] text-[#06B6D4] text-[11px] font-semibold rounded-lg hover:bg-[#0a3d52] hover:border-[#06B6D4] transition-all"
                    >
                      <FileText className="w-3 h-3" />View
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 bg-[#111113] border-t border-[#27272A]">
            <p className="text-[11px] text-[#3F3F46]">{filtered.length} report{filtered.length !== 1 ? 's' : ''} · {candidates.length - withReports.length} pending</p>
          </div>
        </div>
      )}
    </div>
  );
}

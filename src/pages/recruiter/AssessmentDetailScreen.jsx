// AssessmentDetailScreen — full-page view for a single assessment + its candidates
import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader, AlertCircle, Users, Copy, CheckCircle,
  ExternalLink, FileText, Search, Clock, Code, GitBranch,
  Tag, Calendar, ChevronRight, UserPlus,
} from 'lucide-react';
import { getAssessmentById, getAssessmentCandidates } from '../../api/recruiter/assessment.jsx';
import { CandidateStatusBadge } from './dashboard/shared/StatusBadge.jsx';
import { formatDate, formatDateTime, getInitials, copyToClipboard } from './dashboard/shared/utils.js';

// ─── Invite link display with copy + open buttons ────────────────────────────
function InviteLinkCell({ link }) {
  const [copied, setCopied] = useState(false);
  if (!link) return <span className="text-[11px] text-[#3F3F46] italic">Link unavailable</span>;

  const handleCopy = () => {
    copyToClipboard(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111113] border border-[#27272A] rounded-lg min-w-0 flex-1 max-w-[280px]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] flex-shrink-0" />
        <span className="text-[11px] text-[#52525B] font-mono truncate flex-1">{link}</span>
      </div>
      <button
        onClick={handleCopy}
        title="Copy invite link"
        className="p-1.5 rounded-md transition-all duration-150 flex-shrink-0 hover:bg-[#1C1C20]"
      >
        {copied
          ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" />
          : <Copy className="w-3.5 h-3.5 text-[#3F3F46] hover:text-[#06B6D4]" />
        }
      </button>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        title="Open invite link"
        className="p-1.5 rounded-md text-[#3F3F46] hover:text-[#06B6D4] hover:bg-[#1C1C20] transition-all duration-150 flex-shrink-0"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

// ─── Candidate card row ───────────────────────────────────────────────────────
function CandidateCard({ candidate, assessmentId, onViewReport }) {
  return (
    <div className="px-6 py-4 hover:bg-[#111113] transition-colors duration-100 group">
      <div className="flex items-start gap-4">

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#17171A] border border-[#27272A] flex items-center justify-center text-[11px] font-bold text-[#A1A1AA] flex-shrink-0 font-display">
          {getInitials(candidate.candidate_name)}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1.5">
            <p className="text-[13px] font-semibold text-[#E4E4E7] truncate">
              {candidate.candidate_name || 'Unknown Candidate'}
            </p>
            <span className="text-[11px] text-[#52525B] truncate">{candidate.candidate_email}</span>
            <CandidateStatusBadge status={candidate.status} />
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mb-2.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-[#3F3F46]">
              <Calendar className="w-3 h-3" />
              Invited {formatDate(candidate.invited_at)}
            </span>
            {candidate.expires_at && candidate.status !== 'Submitted' && (
              <span className="flex items-center gap-1 text-[11px] text-[#3F3F46]">
                <Clock className="w-3 h-3" />
                Expires {formatDateTime(candidate.expires_at)}
              </span>
            )}
            {candidate.started_at && (
              <span className="flex items-center gap-1 text-[11px] text-[#3F3F46]">
                Started {formatDate(candidate.started_at)}
              </span>
            )}
          </div>

          {/* Invite link */}
          <InviteLinkCell link={candidate.invite_link} />
        </div>

        {/* Right — view report */}
        {candidate.status === 'Submitted' && candidate.session_id && (
          <button
            onClick={() => onViewReport(candidate.session_id)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-[#083344] border border-[#0E7490] text-[#06B6D4] text-[11px] font-semibold rounded-lg hover:bg-[#0a3d52] transition-all duration-150"
          >
            <FileText className="w-3.5 h-3.5" />
            View Report
            <ChevronRight className="w-3 h-3" />
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
      .then(res => {
        const data = res.data || res;
        setCandidates(data.candidates || []);
      })
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
    all:       candidates.length,
    Invited:   candidates.filter(c => c.status === 'Invited').length,
    'In Progress': candidates.filter(c => c.status === 'In Progress').length,
    Submitted: candidates.filter(c => c.status === 'Submitted').length,
    Expired:   candidates.filter(c => c.status === 'Expired').length,
  }), [candidates]);

  const task = assessment?.tasks?.[0];
  const isReady = !!task;

  const handleViewReport = (sessionId) => {
    navigate(`/recruiter/reports/${id}/${sessionId}`);
  };

  if (assLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader className="w-5 h-5 text-[#06B6D4] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl">
          <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0" />
          <p className="text-[13px] text-[#F43F5E]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1100px]">

      {/* Back navigation */}
      <button
        onClick={() => navigate('/recruiter/dashboard')}
        className="flex items-center gap-2 text-[12px] text-[#52525B] hover:text-[#A1A1AA] transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to Assessments
      </button>

      {/* Assessment header */}
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-[22px] font-bold text-[#FAFAFA] tracking-tight font-display">{assessment?.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md flex-shrink-0 ${isReady ? 'bg-[#022C22] text-[#10B981] border border-[#065F46]' : 'bg-[#1C1005] text-[#F59E0B] border border-[#78350F]/60'}`}>
              <span className={`w-1 h-1 rounded-full ${isReady ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
              {isReady ? 'Ready' : 'Draft'}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[12px] text-[#52525B]">
              <Clock className="w-3.5 h-3.5" />
              {assessment?.duration_minutes} min
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-[#52525B]">
              <Calendar className="w-3.5 h-3.5" />
              Created {formatDate(assessment?.created_at)}
            </span>
            <span className="flex items-center gap-1.5 text-[12px] text-[#52525B]">
              <Users className="w-3.5 h-3.5" />
              {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {isReady && (
          <button
            onClick={() => navigate(`/recruiter/invite?assessmentId=${id}`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0C0C0E] text-[13px] font-bold rounded-xl transition-all duration-150 active:scale-[0.97] flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Invite Candidates
          </button>
        )}
      </div>

      {/* Info cards — description + task details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* About */}
        <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5">
          <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] mb-3">About</p>
          <p className="text-[13px] text-[#A1A1AA] leading-relaxed mb-4">
            {assessment?.description || <span className="italic text-[#3F3F46]">No description provided.</span>}
          </p>
          {task && (
            <>
              <div className="h-px bg-[#1C1C20] my-3" />
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Code className="w-3.5 h-3.5 text-[#06B6D4] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-semibold text-[#52525B] uppercase tracking-[0.12em] mb-0.5">Task</p>
                    <p className="text-[13px] font-semibold text-[#E4E4E7]">{task.title}</p>
                    {task.description && (
                      <p className="text-[12px] text-[#52525B] mt-1 leading-relaxed line-clamp-2">{task.description}</p>
                    )}
                  </div>
                </div>
                {task.source_type && (
                  <div className="flex items-center gap-2">
                    {task.source_type === 'git'
                      ? <GitBranch className="w-3.5 h-3.5 text-[#52525B]" />
                      : <Code className="w-3.5 h-3.5 text-[#52525B]" />
                    }
                    <span className="text-[12px] text-[#52525B] capitalize">{task.source_type === 'git' ? 'Git repository' : 'Local upload'}</span>
                  </div>
                )}
                {task.tags?.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {task.tags.map((tag, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#083344] border border-[#0E7490]/50 text-[#06B6D4]">
                        <Tag className="w-2.5 h-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Candidate funnel */}
        <div className="rounded-xl border border-[#27272A] bg-[#111113] p-5">
          <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] mb-4">Candidate Funnel</p>
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Users className="w-8 h-8 text-[#27272A] mb-3" />
              <p className="text-[13px] text-[#3F3F46]">No candidates invited yet.</p>
              {isReady && (
                <button
                  onClick={() => navigate(`/recruiter/invite?assessmentId=${id}`)}
                  className="mt-3 text-[12px] text-[#06B6D4] hover:underline"
                >
                  Send first invite →
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Invited',     key: 'Invited',      color: '#06B6D4', count: counts['Invited'] },
                { label: 'Active',      key: 'In Progress',  color: '#F59E0B', count: counts['In Progress'] },
                { label: 'Submitted',   key: 'Submitted',    color: '#10B981', count: counts['Submitted'] },
                { label: 'Expired',     key: 'Expired',      color: '#52525B', count: counts['Expired'] },
              ].map(({ label, color, count }) => {
                const pct = candidates.length > 0 ? Math.round((count / candidates.length) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12px] text-[#A1A1AA]">{label}</span>
                      <span className="text-[12px] font-bold text-[#E4E4E7]">
                        {count} <span className="font-normal text-[#52525B]">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#1C1C20] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Candidates section */}
      <div className="rounded-xl border border-[#27272A] overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#111113] border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#06B6D4]" />
            <p className="text-[13px] font-bold text-[#E4E4E7]">Candidates</p>
            <span className="text-[11px] text-[#52525B] px-2 py-0.5 bg-[#1C1C20] rounded-md">{candidates.length}</span>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0C0C0E] border border-[#27272A] rounded-lg w-52 focus-within:border-[#3F3F46] transition-colors">
            <Search className="w-3.5 h-3.5 text-[#52525B] flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search candidates…"
              className="flex-1 bg-transparent text-[12px] text-[#E4E4E7] placeholder:text-[#3F3F46] focus:outline-none"
            />
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex items-center gap-0.5 px-4 py-2.5 bg-[#0C0C0E] border-b border-[#1C1C20] overflow-x-auto">
          {[
            { key: 'all',         label: 'All',       count: counts.all },
            { key: 'Invited',     label: 'Invited',   count: counts['Invited'] },
            { key: 'In Progress', label: 'Active',    count: counts['In Progress'] },
            { key: 'Submitted',   label: 'Submitted', count: counts['Submitted'] },
            { key: 'Expired',     label: 'Expired',   count: counts['Expired'] },
          ].filter(t => t.key === 'all' || t.count > 0).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-150 whitespace-nowrap ${
                filter === key
                  ? 'bg-[#1C1C20] text-[#E4E4E7]'
                  : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              {label}
              <span className={`text-[10px] ${filter === key ? 'text-[#A1A1AA]' : 'text-[#3F3F46]'}`}>{count}</span>
            </button>
          ))}
        </div>

        {/* Candidates list */}
        {candLoading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-4 h-4 text-[#06B6D4] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-8 h-8 text-[#27272A] mx-auto mb-3" />
            <p className="text-[13px] text-[#52525B]">
              {candidates.length === 0 ? 'No candidates invited yet.' : 'No candidates match this filter.'}
            </p>
            {candidates.length === 0 && isReady && (
              <button
                onClick={() => navigate(`/recruiter/invite?assessmentId=${id}`)}
                className="mt-3 flex items-center gap-1.5 mx-auto text-[12px] text-[#06B6D4] hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Invite candidates →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#1C1C20]">
            {filtered.map(candidate => (
              <CandidateCard
                key={candidate.id}
                candidate={candidate}
                assessmentId={id}
                onViewReport={handleViewReport}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {!candLoading && candidates.length > 0 && (
          <div className="px-6 py-3 bg-[#111113] border-t border-[#27272A] flex items-center justify-between">
            <p className="text-[11px] text-[#3F3F46]">{filtered.length} of {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}</p>
            {isReady && (
              <button
                onClick={() => navigate(`/recruiter/invite?assessmentId=${id}`)}
                className="flex items-center gap-1.5 text-[11px] text-[#06B6D4] hover:underline"
              >
                <UserPlus className="w-3 h-3" />
                Invite more
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

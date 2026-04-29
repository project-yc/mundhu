// AssessmentTable — filterable table of assessments; clicking navigates to detail
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader, Plus, Code, Clock, ChevronRight, Users, ArrowRight } from 'lucide-react';
import { FunnelBar, EmptyGrid } from './shared/StatusBadge.jsx';

function AssessmentRow({ assessment, onInvite }) {
  const navigate = useNavigate();
  const task    = assessment.tasks?.[0];
  const isReady = !!task;
  const counts  = assessment.candidate_counts;

  return (
    <div
      className="group grid grid-cols-[minmax(0,1fr)_80px_160px_140px_80px_130px] gap-4 items-center px-5 py-4 bg-[#0C0C0E] hover:bg-[#111113] transition-colors duration-100 cursor-pointer"
      onClick={() => navigate(`/recruiter/assessments/${assessment.id}`)}
    >
      {/* Name + task */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px] font-semibold text-[#E4E4E7] truncate group-hover:text-white transition-colors">{assessment.name}</p>
          <ChevronRight className="w-3.5 h-3.5 text-[#3F3F46] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        {task ? (
          <p className="flex items-center gap-1 text-[11px] text-[#52525B] truncate">
            <Code className="w-3 h-3 flex-shrink-0" />{task.title}
          </p>
        ) : (
          <p className="text-[11px] text-[#3F3F46] italic">No task configured</p>
        )}
      </div>

      {/* Duration */}
      <div className="hidden md:flex items-center gap-1.5 text-[12px] text-[#A1A1AA]">
        <Clock className="w-3 h-3 text-[#52525B]" />{assessment.duration_minutes}m
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-1.5 flex-wrap">
        {task?.tags?.slice(0, 2).map((tag, i) => (
          <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#17171A] border border-[#27272A] text-[#A1A1AA]">{tag}</span>
        ))}
        {(task?.tags?.length ?? 0) > 2 && <span className="text-[11px] text-[#3F3F46]">+{task.tags.length - 2}</span>}
        {!task?.tags?.length && <span className="text-[11px] text-[#3F3F46]">—</span>}
      </div>

      {/* Candidate funnel */}
      <div className="hidden md:block" onClick={e => e.stopPropagation()}>
        <FunnelBar counts={counts} />
      </div>

      {/* Ready badge */}
      <div className="hidden md:block">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md ${isReady ? 'bg-[#022C22] text-[#10B981] border border-[#065F46]' : 'bg-[#1C1005] text-[#F59E0B] border border-[#78350F]/60'}`}>
          <span className={`w-1 h-1 rounded-full ${isReady ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
          {isReady ? 'Ready' : 'Draft'}
        </span>
      </div>

      {/* Action */}
      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
        {isReady ? (
          <button
            onClick={() => onInvite(assessment.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#083344] border border-[#0E7490] text-[#06B6D4] text-[11px] font-semibold rounded-lg hover:bg-[#0a3d52] hover:border-[#06B6D4] transition-all duration-150"
          >
            <Users className="w-3 h-3" />
            Invite
            <ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
          </button>
        ) : (
          <span className="text-[11px] text-[#3F3F46] italic pr-1 hidden md:block">Add task first</span>
        )}
      </div>
    </div>
  );
}

export default function AssessmentTable({ assessments, loading, onOpenWizard }) {
  const navigate = useNavigate();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const totalAssessments = assessments.length;
  const readyAssessments = assessments.filter(a => (a.tasks?.length ?? 0) > 0).length;

  const filtered = useMemo(() => assessments.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    const isReady = (a.tasks?.length ?? 0) > 0;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'ready'      && isReady)  ||
      (statusFilter === 'incomplete' && !isReady);
    return matchSearch && matchStatus;
  }), [assessments, search, statusFilter]);

  const handleInvite = (assessmentId) => navigate(`/recruiter/invite?assessmentId=${assessmentId}`);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#111113] border border-[#27272A] rounded-lg flex-1 max-w-[260px] focus-within:border-[#3F3F46] transition-colors">
          <Search className="w-3.5 h-3.5 text-[#52525B]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assessments…" className="flex-1 bg-transparent text-[13px] text-[#E4E4E7] placeholder:text-[#3F3F46] focus:outline-none" />
        </div>
        <div className="flex items-center gap-0.5 bg-[#111113] border border-[#27272A] rounded-lg p-1">
          {[
            { key: 'all',        label: 'All',       count: totalAssessments },
            { key: 'ready',      label: 'Ready',     count: readyAssessments },
            { key: 'incomplete', label: 'Incomplete', count: totalAssessments - readyAssessments },
          ].map(({ key, label, count }) => (
            <button key={key} onClick={() => setStatusFilter(key)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-150 ${statusFilter === key ? 'bg-[#1C1C20] text-[#E4E4E7]' : 'text-[#52525B] hover:text-[#A1A1AA]'}`}>
              {label}
              <span className={`text-[10px] font-bold ${statusFilter === key ? 'text-[#A1A1AA]' : 'text-[#3F3F46]'}`}>{count}</span>
            </button>
          ))}
        </div>
        <div className="ml-auto text-[11px] text-[#3F3F46]">
          {!loading && filtered.length > 0 && `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <Loader className="w-5 h-5 text-[#06B6D4] animate-spin" />
        </div>
      )}

      {/* Empty: no assessments at all */}
      {!loading && assessments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
          <div className="mb-7"><EmptyGrid /></div>
          <h3 className="text-[15px] font-bold text-[#E4E4E7] font-display mb-2">No assessments yet</h3>
          <p className="text-[13px] text-[#52525B] mb-8 max-w-xs leading-relaxed">Create your first assessment and configure the task candidates will solve.</p>
          <button onClick={onOpenWizard} className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0C0C0E] text-[13px] font-bold rounded-lg transition-colors duration-150 active:scale-[0.97]">
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Create First Assessment
          </button>
        </div>
      )}

      {/* Empty: filters yielded nothing */}
      {!loading && assessments.length > 0 && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[13px] text-[#52525B] mb-3">No assessments match your filters.</p>
          <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="text-[12px] text-[#06B6D4] hover:underline">Clear filters</button>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-[#27272A] overflow-hidden">
          {/* Column heads */}
          <div className="hidden md:grid grid-cols-[minmax(0,1fr)_80px_160px_140px_80px_130px] gap-4 items-center px-5 py-2.5 bg-[#111113] border-b border-[#27272A]">
            {['Assessment', 'Duration', 'Tags', 'Candidates', 'Status', ''].map((col, i) => (
              <p key={i} className={`text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] ${i === 5 ? 'text-right' : ''}`}>{col}</p>
            ))}
          </div>

          <div className="divide-y divide-[#27272A]">
            {filtered.map((assessment, idx) => (
              <div key={assessment.id} className="animate-rowIn" style={{ animationDelay: `${idx * 20}ms` }}>
                <AssessmentRow assessment={assessment} onInvite={handleInvite} />
              </div>
            ))}
          </div>

          <div className="px-5 py-3 bg-[#111113] border-t border-[#27272A] flex items-center justify-between">
            <p className="text-[11px] text-[#3F3F46]">{filtered.length} of {totalAssessments} assessment{totalAssessments !== 1 ? 's' : ''}</p>
            <p className="text-[11px] text-[#3F3F46]">Click any row to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}

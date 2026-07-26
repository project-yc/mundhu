import { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, Loader, Flag } from 'lucide-react';
import MonthFilter from './MonthFilter';
import { getDashboardAssessments } from '../../../../api/recruiter/dashboard';
import candidateAvatarsSvg from '../../../../assets/recruiter/icons/candidate_avatars.svg';

function formatExpiry(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `Expires on ${day} ${month}, ${time}`;
}

function getUrgencyBadge(expiryDatetime) {
  if (!expiryDatetime) return null;
  const daysUntil = (new Date(expiryDatetime) - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntil < 0) return null;
  if (daysUntil < 2) return 'urgent';
  if (daysUntil < 7) return 'low';
  return 'normal';
}

const BADGE_STYLES = {
  urgent: { label: 'Urgent', bg: 'rgba(255,164,164,0.19)', text: '#C30000' },
  low:    { label: 'Low',    bg: 'rgba(126,204,81,0.16)',  text: '#359200' },
  normal: { label: 'Normal', bg: 'rgba(255,203,98,0.22)',  text: '#FFC227' },
};

function UrgencyBadge({ type }) {
  if (!type) return null;
  const style = BADGE_STYLES[type];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-[3px] rounded-md flex-shrink-0"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      <Flag className="w-2.5 h-2.5" fill="currentColor" strokeWidth={0} />
      {style.label}
    </span>
  );
}

function ToggleButton({ expanded }) {
  return (
    <span className="flex items-center justify-center flex-shrink-0 w-5 h-5 rounded-full bg-white shadow-sm">
      {expanded ? (
        <ChevronUp className="w-3 h-3 text-text-muted" strokeWidth={2.2} />
      ) : (
        <ChevronDown className="w-3 h-3 text-text-muted" strokeWidth={2.2} />
      )}
    </span>
  );
}

function AssessmentItem({ assessment, isExpanded, onToggle }) {
  const urgency = getUrgencyBadge(assessment.expiry_datetime);

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: isExpanded ? '#FFF9F4' : '#F3F3F3',
        backgroundColor: isExpanded ? '#FFF9F4' : '#FEFEFE',
      }}
    >
      {/* Header row — always visible */}
      <button
        className="w-full flex items-start justify-between gap-3 px-3 py-3 text-left transition-colors"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="lg:text-[15px] text-[13.5px] font-medium text-black truncate">
              {assessment.name}
            </p>
            {!isExpanded && urgency && <UrgencyBadge type={urgency} />}
          </div>
          <p className="text-[12px] mt-1" style={{ color: isExpanded ? '#4B5563' : '#53677E' }}>
            {formatExpiry(assessment.expiry_datetime)}
          </p>
        </div>
        <ToggleButton expanded={isExpanded} />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mx-3 pt-3 pb-3.5 border-t" style={{ borderColor: '#EAEAEA' }}>
          {/* Created by | Candidates — two columns, stacked label over value */}
          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium" style={{ color: '#707F93' }}>Created by</p>
              <p className="text-[13px] text-black mt-1 truncate">
                {assessment.created_by?.name ?? '—'}
              </p>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium" style={{ color: '#707F93' }}>Candidates</p>
              <div className="flex items-center gap-1 mt-1">
                <img
                  src={candidateAvatarsSvg}
                  alt="candidate avatars"
                  className="h-6 object-contain"
                />
                {assessment.invited_count > 0 && (
                  <span className="text-[12px] font-medium" style={{ color: '#A2A2A2' }}>
                    +{assessment.invited_count}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {assessment.description && (
            <div className="mt-3.5">
              <p className="text-[12px] font-medium" style={{ color: '#707F93' }}>Description</p>
              <p className="text-[13px] leading-[18px] mt-1 line-clamp-3 text-black">
                {assessment.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ActiveAssessmentsPanel({ onCreateNew }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDashboardAssessments({ page: 1, pageSize: 7 });
      const items = res?.data?.items ?? res?.items ?? res?.data ?? [];
      const active = items.filter(a => a.status === 'active' || a.status === 'draft');
      setAssessments(active);
      // Only auto-expand the first item on initial load
      setExpandedId(prev => prev ?? active[0]?.id ?? null);
    } catch {
      // non-critical — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAssessments(); }, [fetchAssessments]);

  const toggle = (id) => setExpandedId(prev => (prev === id ? null : id));

  return (
    <div
      className="w-full lg:h-[360px] xl:h-[500px] h-full rounded-2xl border p-3 flex flex-col gap-2.5"
      style={{ backgroundColor: '#FAFAFA', borderColor: '#EDEDED' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <h2 className="text-[14px] font-medium text-black" style={{ fontFamily: "'Google Sans Flex', sans-serif" }}>
          Active assessments
        </h2>
        <MonthFilter value={month} onChange={setMonth} />
      </div>

      {/* Inner card */}
      <div className="flex-1 min-h-0 bg-white border rounded-2xl flex flex-col py-3" style={{ borderColor: '#F1F1F1' }}>
        <div className="flex-1 min-h-0 overflow-y-auto px-3">
          {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader
                  className="w-5 h-5 animate-spin"
                  style={{ color: 'var(--color-assessment-accent)' }}
                />
              </div>
            ) : assessments.length === 0 ? (
              <div className="py-10 text-center">
              <p className="text-[13px] text-text-muted">No active assessments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map(a => (
                <AssessmentItem
                  key={a.id}
                  assessment={a}
                  isExpanded={expandedId === a.id}
                  onToggle={() => toggle(a.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="px-3 pt-3">
          <button
            onClick={onCreateNew}
            className="w-full flex items-center justify-center py-3 rounded-lg text-[14px] font-semibold text-white transition-colors"
            style={{ backgroundColor: 'var(--color-assessment-accent)' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-assessment-cta-hover)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--color-assessment-accent)')}
          >
            Create new assessment
          </button>
        </div>
      </div>
    </div>
  );
}

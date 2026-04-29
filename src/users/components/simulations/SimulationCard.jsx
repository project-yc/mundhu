import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusStyles = {
  LIVE: {
    container: 'border-[#3D1212] bg-[#1A0A0A] text-[#EF4444]',
    label: 'LIVE INCIDENT',
  },
  IN_PROGRESS: {
    container: 'border-[#3D2E00] bg-[#1A1200] text-[#F59E0B]',
    label: 'IN-PROGRESS',
  },
  COMPLETED: {
    container: 'border-[#123D12] bg-[#0A1A0A] text-[#10B981]',
    label: 'COMPLETED',
  },
};

const getSimulationCardStatus = (row) => {
  if (row.status === 'COMPLETED') {
    return 'COMPLETED';
  }

  if (row.status === 'IN_PROGRESS') {
    return 'IN_PROGRESS';
  }

  if ((row.completedTasks || 0) === 0 && (row.progress || 0) === 0) {
    return 'LIVE';
  }

  return 'IN_PROGRESS';
};

const getProgressColorClass = (status) => {
  if (status === 'COMPLETED') {
    return 'bg-[#10B981]';
  }

  if (status === 'IN_PROGRESS') {
    return 'bg-[#F59E0B]';
  }

  return 'bg-transparent';
};

const getAccentBorderClass = (status) => {
  if (status === 'LIVE') {
    return 'border-l-[#EF4444]';
  }

  if (status === 'IN_PROGRESS') {
    return 'border-l-[#F59E0B]';
  }

  if (status === 'COMPLETED') {
    return 'border-l-[#10B981]';
  }

  return 'border-l-[#0F1A2E]';
};

const domainDisplay = (domain) => String(domain || 'INFRA').replace(/_/g, ' ');
const clampTwoLinesClass =
  '[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden';

export default function SimulationCard({ row }) {
  const navigate = useNavigate();
  const badgeStatus = getSimulationCardStatus(row);
  const badge = statusStyles[badgeStatus];
  const progressColorClass = getProgressColorClass(badgeStatus);
  const accentBorderClass = getAccentBorderClass(badgeStatus);
  const progressWidth = Math.max(0, Math.min(100, row.progress || 0));
  const isLiveStatus = badgeStatus === 'LIVE';

  const handleAction = () => {
    navigate(`/simulations/${row.id}`);
  };

  return (
    <article
      className={`w-full rounded-[8px] border border-[#0F1A2E] border-l-[3px] bg-[#0A0F1E] p-5 transition hover:border-[#06B6D4] ${accentBorderClass}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] ${badge.container}`}>
          {badgeStatus === 'LIVE' && <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#EF4444]" />}
          {badgeStatus === 'COMPLETED' && <CheckCircle2 className="h-3 w-3" />}
          <span>{badge.label}</span>
        </div>
      </div>

      <h3 className={`mt-3 text-[18px] font-bold leading-[1.2] text-[#F1F5F9] ${clampTwoLinesClass}`}>{row.name}</h3>

      <p className={`mt-2 text-[13px] leading-[1.5] text-[#94A3B8] ${clampTwoLinesClass}`}>
        {row.description || 'No incident summary provided for this simulation.'}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(row.stackTags || []).slice(0, 5).map((tag) => (
          <span
            key={`${row.id}-${tag}`}
            className="font-mono rounded-[4px] border border-[#0F1A2E] bg-[#060B18] px-1.5 py-0.5 text-[10px] text-[#06B6D4]"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4">
        <div className="h-[3px] w-full bg-[#0F1A2E]">
          <div className={`h-[3px] ${progressColorClass}`} style={{ width: `${progressWidth}%` }} />
        </div>
        {row.totalTasks !== null && row.completedTasks !== null && (
          <p className="mt-1 text-[11px] text-[#4B5563]">{row.completedTasks} / {row.totalTasks} tasks</p>
        )}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.06em] text-[#4B5563]">DOMAIN</p>
          <p className="mt-1 text-[13px] font-medium text-[#F1F5F9]">{domainDisplay(row.domain)}</p>
        </div>

        {badgeStatus === 'COMPLETED' ? (
          <button
            type="button"
            onClick={handleAction}
            className="text-[12px] text-[#94A3B8] transition hover:underline"
          >
            OPEN TASKS
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAction}
            className={`rounded-[8px] px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.06em] ${
              badgeStatus === 'IN_PROGRESS'
                ? 'border border-[#06B6D4] bg-transparent text-[#06B6D4]'
                : isLiveStatus
                  ? 'border-none bg-[#EF4444] text-[#FFFFFF] [animation:borderPulse_2s_ease-in-out_infinite]'
                  : 'bg-[#06B6D4] text-[#0A0A0F]'
            }`}
          >
            {badgeStatus === 'IN_PROGRESS' ? 'RESUME' : 'INTERVENE'}
          </button>
        )}
      </div>
    </article>
  );
}
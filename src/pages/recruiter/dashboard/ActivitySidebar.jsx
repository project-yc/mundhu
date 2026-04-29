// ActivitySidebar — right-side completion rate, health, and activity panels
import { useMemo } from 'react';
import { TrendingUp, UserCheck, Activity, CheckCircle, Mail } from 'lucide-react';
import { formatDate } from './shared/utils.js';

function ActivityFeed({ assessments }) {
  const events = useMemo(() => {
    const out = [];
    for (const a of assessments) {
      const c = a.candidate_counts;
      if (!c) continue;
      if (c.submitted > 0)   out.push({ type: 'submitted', count: c.submitted,   name: a.name, created_at: a.created_at });
      if (c.in_progress > 0) out.push({ type: 'active',    count: c.in_progress, name: a.name, created_at: a.created_at });
      if (c.invited > 0)     out.push({ type: 'invited',   count: c.invited,     name: a.name, created_at: a.created_at });
    }
    return out.slice(0, 8);
  }, [assessments]);

  const iconMap = {
    submitted: { icon: CheckCircle, color: '#10B981' },
    active:    { icon: Activity,    color: '#F59E0B' },
    invited:   { icon: Mail,        color: '#06B6D4' },
  };
  const labelMap = {
    submitted: (n, count) => `${count} candidate${count > 1 ? 's' : ''} submitted in "${n}"`,
    active:    (n, count) => `${count} actively working on "${n}"`,
    invited:   (n, count) => `${count} invited to "${n}"`,
  };

  if (events.length === 0) return (
    <div className="py-6 text-center">
      <p className="text-[12px] text-[#3F3F46]">No activity yet.</p>
      <p className="text-[11px] text-[#27272A] mt-1">Invite candidates to get started.</p>
    </div>
  );

  return (
    <div className="space-y-0 divide-y divide-[#1C1C20]">
      {events.map((ev, i) => {
        const { icon: Icon, color } = iconMap[ev.type];
        return (
          <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#111113] transition-colors duration-100">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[#A1A1AA] leading-snug">{labelMap[ev.type](ev.name, ev.count)}</p>
              <p className="text-[11px] text-[#3F3F46] mt-0.5">{formatDate(ev.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ActivitySidebar({ assessments, metricsData, totalAssessments, readyAssessments }) {
  return (
    <div className="w-[280px] flex-shrink-0 space-y-4">

      {/* Completion rate */}
      <div className="rounded-xl border border-[#27272A] bg-[#111113] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#06B6D4]" />
            <p className="text-[11px] font-bold text-[#E4E4E7] uppercase tracking-[0.12em]">Completion Rate</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: 'Invited',   key: 'invited',     color: '#06B6D4' },
            { label: 'Started',   key: 'in_progress', color: '#F59E0B' },
            { label: 'Submitted', key: 'submitted',   color: '#10B981' },
            { label: 'Expired',   key: 'expired',     color: '#3F3F46' },
          ].map(({ label, key, color }) => {
            const val = metricsData[key] || 0;
            const total = metricsData.total || 1;
            const pct = Math.round((val / total) * 100);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-[#A1A1AA]">{label}</span>
                  <span className="text-[11px] font-bold text-[#E4E4E7]">{val} <span className="font-normal text-[#52525B]">({pct}%)</span></span>
                </div>
                <div className="h-1 bg-[#1C1C20] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
          {metricsData.total === 0 && (
            <p className="text-[12px] text-[#3F3F46] text-center py-2">No candidates yet.</p>
          )}
        </div>
      </div>

      {/* Assessment health */}
      <div className="rounded-xl border border-[#27272A] bg-[#111113] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
            <p className="text-[11px] font-bold text-[#E4E4E7] uppercase tracking-[0.12em]">Assessment Health</p>
          </div>
        </div>
        <div className="p-4 space-y-2">
          {[
            { label: 'Ready to send',   value: readyAssessments,                                                              color: '#10B981' },
            { label: 'Need a task',     value: totalAssessments - readyAssessments,                                           color: '#F59E0B' },
            { label: 'Have candidates', value: assessments.filter(a => (a.candidate_counts?.total || 0) > 0).length,         color: '#06B6D4' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#1C1C20] last:border-0">
              <span className="text-[12px] text-[#A1A1AA]">{label}</span>
              <span className="text-[13px] font-bold font-display" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="rounded-xl border border-[#27272A] bg-[#111113] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
            <p className="text-[11px] font-bold text-[#E4E4E7] uppercase tracking-[0.12em]">Activity</p>
          </div>
        </div>
        <ActivityFeed assessments={assessments} />
      </div>

    </div>
  );
}

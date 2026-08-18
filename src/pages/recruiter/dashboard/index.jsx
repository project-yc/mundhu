import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AskAnythingBar } from '../../../components/recruiter/AskAnythingBar';
import DashboardHeader from './components/DashboardHeader';
import ActiveAssessmentsPanel from './components/ActiveAssessmentsPanel';
import CandidateMetricsPanel from './components/CandidateMetricsPanel';
import ScoreDistributionPanel from './components/ScoreDistributionPanel';
import WorkspaceSnapshotPanel from './components/WorkspaceSnapshotPanel';
import RecentActivityPanel from './components/RecentActivityPanel';
import EmptyDashboardState from './components/EmptyDashboardState';
import { getDashboardStats } from '../../../api/recruiter/dashboard';

function getUser() {
  try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
}

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const user = getUser();
  const userName = user?.full_name || user?.name || user?.email || 'Recruiter';

  // null = still checking, 0 = empty state, >0 = normal dashboard
  const [totalAssessments, setTotalAssessments] = useState(null);

  const checkAssessmentCount = useCallback(async () => {
    try {
      const res = await getDashboardStats();
      const data = res?.data ?? res ?? {};
      setTotalAssessments(Number(data?.workspace_snapshot?.total_assessments ?? 0));
    } catch {
      // If the check fails, fall back to the normal (populated) dashboard.
      setTotalAssessments(1);
    }
  }, []);

  useEffect(() => { checkAssessmentCount(); }, [checkAssessmentCount]);

  if (totalAssessments === 0) {
    return (
      <div className="flex flex-col h-full bg-[#FBF9F4] overflow-hidden">
        <AskAnythingBar className="px-[18px] flex-shrink-0" />
        <div className="flex-1 min-h-0 overflow-y-auto px-[18px] pb-4 pt-3 lg:pb-4 lg:pt-3">
          <EmptyDashboardState
            userName={userName}
            onCreateAssessment={() => navigate('/recruiter/assessments/new')}
            onInviteTeam={() => navigate('/recruiter/invite')}
            onOpenLibrary={() => navigate('/recruiter/task-library')}
            onBrowseTemplates={() => navigate('/recruiter/assessments/new')}
            // Opens in its own tab so the recruiter keeps their place in the
            // dashboard, and so the page is easy to forward to a colleague.
            onSeeHowItWorks={() => window.open('/product/adaptive-interview', '_blank', 'noopener,noreferrer')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-[#FBF9F4]">
      <AskAnythingBar className="px-[18px]" />

      {/* Columns stretch so all bottom edges align */}
      <div className="flex-1 px-[18px] pb-4 pt-4 lg:pb-5 lg:pt-5 flex gap-5 lg:gap-3 xl:gap-4 2xl:gap-6 items-stretch">

        {/* Left area: greeting + two-column card grid */}
        <div className="flex-1 min-w-0 flex flex-col gap-5 lg:gap-3 xl:gap-4">
          <DashboardHeader userName={userName} />

          <div className="flex-1 flex gap-5 lg:gap-3 xl:gap-4 2xl:gap-6 items-stretch">
            {/* Active Assessments */}
            <div className="flex-[3] min-w-0 flex">
              <ActiveAssessmentsPanel
                onCreateNew={() => navigate('/recruiter/assessments/new')}
                onSeeAll={() => navigate('/recruiter/assessments')}
              />
            </div>

            {/* Metrics + Score Distribution stacked */}
            <div className="flex-[4] min-w-0 flex flex-col gap-4 lg:gap-2.5 xl:gap-3">
              <CandidateMetricsPanel />
              <div className="flex-1 min-h-0">
                <ScoreDistributionPanel />
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar: Snapshot + Activity — starts at the top, beside the greeting */}
        <div className="w-[300px] lg:w-[280px] xl:w-[302px] 2xl:w-[320px] flex-shrink-0 flex flex-col gap-5 lg:gap-2.5 xl:gap-3">
          <WorkspaceSnapshotPanel />
          <div className="flex-1 min-h-0">
            <RecentActivityPanel />
          </div>
        </div>

      </div>
    </div>
  );
}

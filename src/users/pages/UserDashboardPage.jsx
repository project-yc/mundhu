import { AlertTriangle, Loader2 } from 'lucide-react';
import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';
import SignalScoreCard from '../components/dashboard/SignalScoreCard';
import StatCard from '../components/dashboard/StatCard';
import RecommendedSimulations from '../components/dashboard/RecommendedSimulations';
import WeakSignalsPanel from '../components/dashboard/WeakSignalsPanel';
import RecentSessionsTable from '../components/dashboard/RecentSessionsTable';
import { useUserDashboard } from '../hooks/useUserDashboard';

export default function UserDashboardPage() {
  const { dashboard, sessions, loading, error, refetch } = useUserDashboard();
  const debugEfficiencyPercent = dashboard?.stats?.debug_efficiency_percent;
  const debugEfficiencyValue =
    typeof debugEfficiencyPercent === 'number' ? `${debugEfficiencyPercent}%` : '--';

  return (
    <UserPageLayout
      sidebar={<UserSidebar signalScore={dashboard?.signal_score?.score || 0} activeItem="Dashboard" />}
      topbar={<UserTopbar />}
    >
      <main className="px-4 pb-6 pt-4 md:px-6">
            {loading && (
              <div className="flex h-[65vh] items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-[#18d3ff]" />
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-[#6a2335] bg-[#1b0f15] p-4 text-sm text-[#ff8fa5]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  <div>
                    <p className="font-semibold">Unable to load dashboard data</p>
                    <p className="mt-1 text-[#f5b4c2]">{error}</p>
                    <button
                      type="button"
                      onClick={refetch}
                      className="mt-3 rounded-md border border-[#2f3e65] bg-[#0b1223] px-3 py-1.5 text-xs text-[#b8c6e9] transition hover:border-[#18d3ff] hover:text-[#e7f6ff]"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && dashboard && (
              <div className="space-y-5">
                <SignalScoreCard signalScore={dashboard.signal_score} />

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard label="SIMULATIONS COMPLETED" value={dashboard.stats?.simulations_completed ?? '--'} />
                  <StatCard
                    label="AVG SIGNAL SCORE"
                    value={dashboard.stats?.avg_signal_score ?? '--'}
                    delta={dashboard.stats?.avg_signal_score_delta}
                  />
                  <StatCard
                    label="AI COLLABORATION"
                    value={dashboard.stats?.ai_collaboration_level || '--'}
                    status={dashboard.stats?.ai_collaboration_status}
                  />
                  <StatCard
                    label="DEBUG EFFICIENCY"
                    value={debugEfficiencyValue}
                    delta={dashboard.stats?.debug_efficiency_delta}
                    deltaSuffix="%"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-12">
                  <div className="xl:col-span-8">
                    <RecommendedSimulations simulations={dashboard.recommended_simulations || []} />
                  </div>
                  <div className="xl:col-span-4">
                    <WeakSignalsPanel weakSignals={dashboard.weak_signals || []} />
                  </div>
                </div>

                <RecentSessionsTable sessions={sessions} />
              </div>
            )}
      </main>
    </UserPageLayout>
  );
}

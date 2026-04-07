import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Loader2 } from 'lucide-react';
import UserSidebar from '../components/layout/UserSidebar';
import UserPageLayout from '../components/layout/UserPageLayout';
import ExecutiveSummaryCard from '../components/analytics/ExecutiveSummaryCard';
import SignalCard from '../components/analytics/SignalCard';
import TimeAllocationBar from '../components/analytics/TimeAllocationBar';
import DesignReviewPanel from '../components/analytics/DesignReviewPanel';
import AICollaborationPanel from '../components/analytics/AICollaborationPanel';
import DebuggingTimeline from '../components/analytics/DebuggingTimeline';
import GrowthEdgeCard from '../components/analytics/GrowthEdgeCard';
import { getSessionAnalyticsReport } from '../../api/ai-report/report';

const SIGNAL_CARD_CONFIG = [
  { title: 'Task Execution', key: 'task_completion' },
  { title: 'Design Quality', key: 'design_quality' },
  { title: 'Process Discipline', key: 'problem_solving' },
  { title: 'AI Collaboration', key: 'ai_collaboration' },
];

export default function SessionAnalyticsPage() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  const fetchReport = async () => {
    if (!sessionId) {
      setError('Session id is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await getSessionAnalyticsReport(sessionId);
      setReport(data || null);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load analytics report.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [sessionId]);

  const signalCards = SIGNAL_CARD_CONFIG.map((config) => {
    const cardData = report?.signal_cards?.[config.key] || {};
    return {
      title: config.title,
      signal: cardData?.signal,
      summary: cardData?.summary,
    };
  });

  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="Analytics" showSignalCard={false} showUserFooter analyticsSessionId={sessionId} />}
      topbar={null}
    >
      <main className="min-h-full bg-[#0a0c12] p-8 text-white">
        {loading && (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-3xl rounded-xl border border-[#4b1f2d] bg-[#1a1117] p-5 text-sm text-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-semibold">Unable to load session analytics report</p>
                <p className="mt-1 text-red-200">{error}</p>
                <button
                  type="button"
                  onClick={fetchReport}
                  className="mt-3 rounded-md border border-[#2f3e65] bg-[#0b1223] px-3 py-1.5 text-xs text-[#b8c6e9] transition hover:border-cyan-400 hover:text-white"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-4">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-semibold text-white">Session Analytics</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{dateLabel}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Live Session Active</span>
              </div>
            </div>

            <ExecutiveSummaryCard quote={report?.tldr} />

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              {signalCards.map((card) => (
                <SignalCard key={card.title} title={card.title} signal={card.signal} summary={card.summary} />
              ))}
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <TimeAllocationBar timeBreakdown={report?.engineering_process?.time_breakdown} />
              <DesignReviewPanel criteria={report?.design_feedback?.criteria} />
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <AICollaborationPanel analysis={report?.ai_usage_analysis} />
              <DebuggingTimeline />
            </section>

            <section className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Growth Edges</p>

              {(report?.growth_edges || []).map((edge, index) => (
                <GrowthEdgeCard
                  key={`${edge?.title || edge?.moment || 'edge'}-${index}`}
                  title={edge?.title || edge?.name}
                  moment={edge?.moment}
                  alternative={edge?.alternative}
                  why={edge?.why}
                />
              ))}

              {(!report?.growth_edges || report.growth_edges.length === 0) && (
                <div className="rounded-xl border border-[#1e2130] bg-[#13151f] p-5 text-sm text-gray-400">
                  No growth edges available for this session.
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </UserPageLayout>
  );
}
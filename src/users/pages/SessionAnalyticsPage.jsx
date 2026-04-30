import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { getSessionAnalyticsReport, queueSessionAnalyticsReport } from '../../api/ai-report/report';

const SIGNAL_CARD_CONFIG = [
  { title: 'Task Execution', key: 'task_completion' },
  { title: 'Design Quality', key: 'design_quality' },
  { title: 'Process Discipline', key: 'problem_solving' },
  { title: 'AI Collaboration', key: 'ai_collaboration' },
];

export default function SessionAnalyticsPage() {
  const { sessionId } = useParams();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const [queueing, setQueueing] = useState(false);
  const [queueError, setQueueError] = useState('');

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  const fetchReport = useCallback(async ({ background = false } = {}) => {
    if (!sessionId) {
      setError('Session id is missing.');
      setLoading(false);
      return;
    }

    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const data = await getSessionAnalyticsReport(sessionId);
      setReport(data || null);
      setQueueError('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to load analytics report.');
      setReport(null);
    } finally {
      if (background) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, [sessionId]);

  const reportStatus = report?.status;
  const reportNotRequested = reportStatus === 'not_requested';
  const reportPending = reportStatus === 'pending' || reportStatus === 'processing';
  const reportFailed = reportStatus === 'failed';

  const handleQueueReport = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    setQueueing(true);
    setQueueError('');
    try {
      const data = await queueSessionAnalyticsReport(sessionId);
      setReport(data || null);
    } catch (requestError) {
      setQueueError(requestError.message || 'Unable to queue analytics report.');
    } finally {
      setQueueing(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  useEffect(() => {
    if (!reportStatus || !['pending', 'processing'].includes(reportStatus)) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      fetchReport({ background: true });
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [fetchReport, reportStatus]);

  const signalCards = SIGNAL_CARD_CONFIG.map((config) => {
    const cardData = report?.signal_cards?.[config.key] || {};
    return {
      title: config.title,
      signal: cardData?.signal,
      summary: cardData?.summary,
      subscores: cardData?.subscores,
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
                  onClick={() => fetchReport()}
                  className="mt-3 rounded-md border border-[#2f3e65] bg-[#0b1223] px-3 py-1.5 text-xs text-[#b8c6e9] transition hover:border-cyan-400 hover:text-white"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && reportPending && (
          <div className="mx-auto max-w-3xl rounded-xl border border-[#19354a] bg-[#0f1a24] p-5 text-sm text-cyan-100">
            <div className="flex items-start gap-3">
              <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-cyan-400" />
              <div>
                <p className="font-semibold text-white">Analytics are still being generated</p>
                <p className="mt-1 text-cyan-100/80">
                  {report?.detail || 'Your report has been queued and will appear automatically once processing finishes.'}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-300/70">
                  {refreshing ? 'Checking again now' : 'Auto-refreshing every 5 seconds'}
                </p>
                <button
                  type="button"
                  onClick={() => fetchReport({ background: true })}
                  className="mt-3 rounded-md border border-[#2f3e65] bg-[#0b1223] px-3 py-1.5 text-xs text-[#b8c6e9] transition hover:border-cyan-400 hover:text-white"
                >
                  Refresh now
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && reportNotRequested && (
          <div className="mx-auto max-w-3xl rounded-xl border border-[#26403a] bg-[#111b18] p-5 text-sm text-emerald-100">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-emerald-300" />
              <div>
                <p className="font-semibold text-white">Generate your analytics report when you want feedback</p>
                <p className="mt-1 text-emerald-100/80">
                  {report?.detail || 'This B2C report is generated on demand to avoid running analytics for every completed session automatically.'}
                </p>
                <button
                  type="button"
                  disabled={queueing}
                  onClick={handleQueueReport}
                  className="mt-3 rounded-md border border-[#2f3e65] bg-[#0b1223] px-3 py-1.5 text-xs text-[#b8c6e9] transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {queueing ? 'Generating report...' : 'Generate report'}
                </button>
                {queueError ? (
                  <p className="mt-2 text-xs text-red-300">{queueError}</p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && reportFailed && (
          <div className="mx-auto max-w-3xl rounded-xl border border-[#4b1f2d] bg-[#1a1117] p-5 text-sm text-red-300">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>
                <p className="font-semibold">Analytics report could not be generated</p>
                <p className="mt-1 text-red-200">
                  {report?.error_message || report?.detail || 'The report failed to generate. Please try again shortly.'}
                </p>
                <button
                  type="button"
                  disabled={queueing}
                  onClick={handleQueueReport}
                  className="mt-3 rounded-md border border-[#2f3e65] bg-[#0b1223] px-3 py-1.5 text-xs text-[#b8c6e9] transition hover:border-cyan-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {queueing ? 'Retrying...' : 'Retry report'}
                </button>
                {queueError ? (
                  <p className="mt-2 text-xs text-red-200">{queueError}</p>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && reportStatus === 'completed' && (
          <div className="space-y-4">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-3xl font-semibold text-white">Session Analytics</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">{dateLabel}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Report Ready</span>
              </div>
            </div>

            <ExecutiveSummaryCard quote={report?.tldr} />

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-4">
              {signalCards.map((card) => (
                <SignalCard key={card.title} title={card.title} signal={card.signal} summary={card.summary} subscores={card.subscores} />
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
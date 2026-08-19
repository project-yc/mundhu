import { MetricsStrip } from '../../../../components/recruiter/MetricsStrip';
import { formatCompletionRate } from '../utils/assessmentRows';

/**
 * Assessments' four org-wide totals, shaped for the shared MetricsStrip.
 * Values come from the list endpoint's `summary` block, which is computed
 * over the unfiltered org queryset — it deliberately does not move as the
 * user searches or filters.
 */
export function AssessmentsStatStrip({ summary, loading }) {
  const withCandidates = summary.with_candidates ?? 0;

  const stats = [
    {
      key: 'total',
      label: 'Total assessments',
      value: summary.total,
      detail: `${summary.live} live · ${summary.draft} draft`,
    },
    {
      key: 'completion',
      label: 'Avg completion',
      value: formatCompletionRate(summary.avg_completion_rate),
      detail: withCandidates
        ? `across ${withCandidates} with candidates`
        : 'no candidates invited yet',
    },
    {
      key: 'candidates',
      label: 'Candidates',
      value: summary.invited_total,
      detail: `${summary.submitted_total} submitted`,
    },
    {
      key: 'endingSoon',
      label: 'Ending soon',
      value: summary.ending_soon,
      detail: 'closing in the next 7 days',
    },
  ];

  return <MetricsStrip stats={stats} loading={loading} />;
}

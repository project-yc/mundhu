import { MetricsStrip } from '../../../../components/recruiter/MetricsStrip';
import { REPORT_METRICS } from '../constants/reportsConfig';

/**
 * Reports' four candidate-derived totals, shaped for the shared MetricsStrip.
 * Replaces the gradient MetricCard grid this screen used to render — same
 * strip the Assessments list uses, so the two screens read as one product.
 */
export function ReportsStatStrip({ metrics, loading }) {
  const stats = REPORT_METRICS.map(({ key, label, description }) => ({
    key,
    label,
    value: metrics[key] ?? 0,
    detail: description,
  }));

  return <MetricsStrip stats={stats} loading={loading} />;
}

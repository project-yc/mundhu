import { BarChart3, CheckCircle2, Clock, FileText } from 'lucide-react';
import { MetricCard } from '../../reports/components/MetricCard';
import { ASSESSMENT_METRICS } from '../constants/assessmentsConfig';
import { formatCompletionRate } from '../utils/assessmentRows';

const ICONS = { FileText, CheckCircle2, BarChart3, Clock };

function metricDisplay(key, metrics) {
  switch (key) {
    case 'total':
      return {
        value: metrics.total,
        description: `${metrics.published} published · ${metrics.draft} draft`,
      };
    case 'averageCompletionRate':
      return {
        value: formatCompletionRate(metrics.averageCompletionRate),
        description: 'Across assessments with candidates',
      };
    case 'averageScore':
      return {
        value: '—',
        description: 'Coming soon',
      };
    case 'endingSoon':
      return {
        value: metrics.endingSoon,
        description: 'Closing within 7 days',
      };
    default:
      return { value: 0, description: '' };
  }
}

/** Four stat tiles above the assessments table. */
export function AssessmentsMetricsGrid({ metrics, loading }) {
  return (
    <div className="grid grid-cols-1 gap-[8px] md:grid-cols-2 xl:grid-cols-4">
      {ASSESSMENT_METRICS.map(({ key, label, icon, featured }) => {
        const { value, description } = metricDisplay(key, metrics);
        return (
          <MetricCard
            key={key}
            label={label}
            description={description}
            value={value}
            icon={ICONS[icon]}
            featured={featured}
            loading={loading}
          />
        );
      })}
    </div>
  );
}

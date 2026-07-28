import { REPORT_METRICS } from '../constants/reportsConfig';
import { MetricCard } from './MetricCard';

/** Four stat tiles. Figma: 4 x 268px with 8px gutters. */
export function ReportsMetricsGrid({ metrics, loading }) {
  return (
    <div className="grid grid-cols-1 gap-[8px] md:grid-cols-2 xl:grid-cols-4">
      {REPORT_METRICS.map(({ key, label, description, featured }) => (
        <MetricCard
          key={key}
          label={label}
          description={description}
          value={metrics[key] ?? 0}
          featured={featured}
          loading={loading}
        />
      ))}
    </div>
  );
}

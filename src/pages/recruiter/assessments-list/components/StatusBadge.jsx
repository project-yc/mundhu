import { Badge } from '../../../../components/ui/badge';
import { STATUS_BADGE_CONFIG } from '../constants/assessmentsConfig';

export function StatusBadge({ status }) {
  const config = STATUS_BADGE_CONFIG[status] || STATUS_BADGE_CONFIG.draft;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

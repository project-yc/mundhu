import { TrendingDown, TrendingUp } from 'lucide-react';
import { formatSignedValue } from '../../utils/formatters';

export default function DeltaIndicator({ value, suffix = '' }) {
  if (typeof value !== 'number') {
    return null;
  }

  const isPositive = value > 0;
  const isNegative = value < 0;

  if (!isPositive && !isNegative) {
    return <span className="text-xs text-[#8b9aba]">0</span>;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isPositive ? 'text-[#2fe18f]' : 'text-[#ff5f7e]'
      }`}
    >
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {formatSignedValue(value, suffix)}
    </span>
  );
}

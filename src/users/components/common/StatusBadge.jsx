import { getStatusClass } from '../../utils/formatters';

export default function StatusBadge({ status }) {
  if (!status) {
    return null;
  }

  return (
    <span className={`text-[10px] font-medium tracking-[0.18em] ${getStatusClass(status)}`}>
      {status}
    </span>
  );
}

import DeltaIndicator from '../common/DeltaIndicator';
import StatusBadge from '../common/StatusBadge';

export default function StatCard({ label, value, delta, deltaSuffix, status }) {
  return (
    <article className="rounded-xl border border-[#142340] bg-[#070f20] px-4 py-3.5">
      <p className="text-[10px] font-semibold tracking-[0.16em] text-[#7282a4]">{label}</p>

      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="text-[38px] font-semibold leading-none tracking-[-0.02em] text-[#edf4ff]">{value}</p>

        {typeof delta === 'number' && <DeltaIndicator value={delta} suffix={deltaSuffix} />}
        {typeof delta !== 'number' && <StatusBadge status={status} />}
      </div>
    </article>
  );
}

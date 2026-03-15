import { TriangleAlert } from 'lucide-react';
import { getSeverityColorClass } from '../../utils/formatters';

function WeakSignalItem({ signal }) {
  return (
    <li className="border-b border-[#14213a] px-4 py-4 last:border-none">
      <div className="flex items-start gap-2">
        <span className={`mt-[6px] h-2 w-2 rounded-full ${getSeverityColorClass(signal.severity)}`} />
        <div>
          <p className="text-[21px] font-semibold leading-tight text-[#e8f2ff]">{signal.title}</p>
          <p className="mt-1 text-[12px] leading-5 text-[#7588aa]">{signal.description}</p>
        </div>
      </div>
    </li>
  );
}

export default function WeakSignalsPanel({ weakSignals }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-[#d9e6ff]">
        <TriangleAlert className="h-4 w-4 text-[#ff5f7e]" />
        <h2 className="text-lg font-semibold">Weak Signals</h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#152543] bg-[#070f20]">
        <ul>
          {weakSignals.map((signal, index) => (
            <WeakSignalItem key={`${signal.title}-${index}`} signal={signal} />
          ))}
        </ul>
      </div>
    </section>
  );
}

import { CirclePlay, Clock3, Dot, Landmark, Signal } from 'lucide-react';

function RecommendationItem({ simulation, isHighlighted }) {
  return (
    <li
      className={`flex items-center justify-between rounded-lg border px-4 py-3.5 transition ${
        isHighlighted
          ? 'border-[#18d3ff] bg-[#061427] shadow-[inset_0_0_0_1px_rgba(24,211,255,0.2)]'
          : 'border-[#152543] bg-[#070f20] hover:border-[#1f335a]'
      }`}
    >
      <div className="min-w-0 pr-3">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-[28px] font-semibold leading-tight text-[#eaf2ff] md:text-[29px]">
            {simulation.name}
          </h3>

          {simulation.tag && (
            <span className="rounded bg-[#0b2a3d] px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.12em] text-[#1dd7ff]">
              {simulation.tag}
            </span>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-[#7284a8]">
          <span className="inline-flex items-center gap-1">
            <Landmark className="h-3 w-3" />
            {simulation.domain}
          </span>
          <span className="inline-flex items-center gap-1">
            <Signal className="h-3 w-3" />
            {simulation.difficulty}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {simulation.duration_minutes}m
          </span>
        </div>
      </div>

      <button
        type="button"
        className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#22365f] text-[#7392bb] transition hover:border-[#18d3ff] hover:text-[#18d3ff]"
      >
        <CirclePlay className="h-4 w-4" />
      </button>
    </li>
  );
}

export default function RecommendedSimulations({ simulations }) {
  return (
    <section>
      <div className="mb-2 flex items-center gap-2 text-[#d9e6ff]">
        <Dot className="h-5 w-5 text-[#18d3ff]" />
        <h2 className="text-lg font-semibold">Recommended Simulations</h2>
      </div>

      <ul className="space-y-2">
        {simulations.map((simulation, index) => (
          <RecommendationItem
            key={simulation.id || `${simulation.name}-${index}`}
            simulation={simulation}
            isHighlighted={index === 0}
          />
        ))}
      </ul>
    </section>
  );
}

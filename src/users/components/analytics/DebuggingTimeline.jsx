const DOT_COLORS = ['bg-cyan-400', 'bg-teal-400', 'bg-emerald-400', 'bg-amber-400'];

export default function DebuggingTimeline({ items }) {
  const timelineItems = Array.isArray(items) ? items.filter((item) => item?.detail) : [];

  if (timelineItems.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-[#1e2130] bg-[#13151f] p-5">
      <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">Debugging Timeline</p>

      <div className="relative">
        {timelineItems.length > 1 ? (
          <div className="absolute left-0 right-0 top-[18px] h-px bg-[#2a2d3a]" />
        ) : null}

        <div className="relative flex items-start justify-between">
          {timelineItems.map((item, index) => (
            <div key={`${item.stage}-${index}`} className="flex min-w-0 flex-1 flex-col items-center px-2 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">{item.stage}</p>
              <span className={`z-10 h-3 w-3 rounded-full border border-[#13151f] ${DOT_COLORS[index % DOT_COLORS.length]}`} />
              <p className="mt-3 max-w-[180px] text-[11px] leading-relaxed text-gray-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
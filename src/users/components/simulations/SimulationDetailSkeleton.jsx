const MONO_STYLE = { fontFamily: '"JetBrains Mono", monospace' };

export default function SimulationDetailSkeleton() {
  return (
    <>
      <div className="rounded-[8px] bg-[#0A0F1E] p-6 shimmer-block" style={{ height: '100px' }} />

      <section className="bg-[#040914] px-6 pb-6 pt-5">
        <p className="mb-3 text-[11px] text-[#4B5563]" style={MONO_STYLE}>// Loading incident data...</p>

        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`task-skeleton-${index}`}
            className="mb-2 h-20 rounded-[8px] bg-[#0A0F1E] shimmer-block"
          />
        ))}
      </section>
    </>
  );
}

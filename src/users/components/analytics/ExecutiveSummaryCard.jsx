export default function ExecutiveSummaryCard({ quote }) {
  return (
    <section className="rounded-xl border border-[#1e2130] bg-[#13151f] p-5">
      <div className="mb-3 flex justify-end">
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">Executive Summary</span>
      </div>
      <p className="text-2xl font-light leading-relaxed text-white">
        &quot;{quote || 'Session summary is not available yet.'}&quot;
      </p>
    </section>
  );
}
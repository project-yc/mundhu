import SimulationCard from './SimulationCard';

export default function SimulationsTable({
  rows,
  loading,
  error,
  onRetry,
  onClearFilters,
  hasActiveFilters,
}) {
  return (
    <section className="min-h-0 flex-1 bg-[#060B18] p-5">
      <style>{`@keyframes borderPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4) } 50% { box-shadow: 0 0 0 4px rgba(239,68,68,0) } }`}</style>
      {error && (
        <div className="mb-4 rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E] px-4 py-3 text-sm text-[#94A3B8]">
          <div className="flex flex-wrap items-center gap-3">
            <p>Failed to load simulations. Retry?</p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-[8px] border border-[#0F1A2E] bg-[#16161F] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#F1F5F9] transition hover:border-[#06B6D4]"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="h-[292px] animate-pulse rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E]"
            />
          ))}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
          <p className="text-[14px] text-[#4B5563]">No simulations match your filters.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-3 rounded-[8px] border border-[#0F1A2E] bg-[#16161F] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8] transition hover:border-[#06B6D4] hover:text-[#F1F5F9]"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
          {rows.map((row) => (
            <SimulationCard key={row.id} row={row} />
          ))}
        </div>
      )}
    </section>
  );
}

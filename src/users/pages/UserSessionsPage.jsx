import { useMemo } from 'react';
import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';
import SimulationCard from '../components/simulations/SimulationCard';
import { useUserSimulations } from '../hooks/useUserSimulations';

const MONO_STYLE = { fontFamily: "'JetBrains Mono', monospace" };

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function UserSessionsPage() {
  const { rows, loading, error, refetch } = useUserSimulations();

  const sessionRows = useMemo(() => {
    return [...rows]
      .filter(
        (row) =>
          row.hasActiveOrCompletedTask || row.status === 'IN_PROGRESS' || row.status === 'COMPLETED',
      )
      .sort((a, b) => {
        const dateSort = toTimestamp(b.lastActivityAt) - toTimestamp(a.lastActivityAt);
        if (dateSort !== 0) {
          return dateSort;
        }

        return (b.progress || 0) - (a.progress || 0);
      });
  }, [rows]);

  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="My Sessions" showSignalCard={false} showUserFooter />}
      topbar={<UserTopbar title="My Sessions" searchPlaceholder="Global search..." />}
    >
      <main className="min-h-full bg-[#040914] p-5">
        <p className="text-[11px] text-[#4B5563]" style={MONO_STYLE}>
          // Your active and completed incidents
        </p>

        {error && (
          <div className="mt-4 rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E] px-4 py-3 text-sm text-[#94A3B8]">
            <div className="flex flex-wrap items-center gap-3">
              <p>Failed to load sessions. Retry?</p>
              <button
                type="button"
                onClick={refetch}
                className="rounded-[8px] border border-[#0F1A2E] bg-[#16161F] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#F1F5F9] transition hover:border-[#06B6D4]"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`session-skeleton-${index}`}
                className="h-[292px] animate-pulse rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E]"
              />
            ))}
          </div>
        )}

        {!loading && sessionRows.length === 0 && (
          <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
            <p className="text-[13px] text-[#4B5563]" style={MONO_STYLE}>
              // No sessions yet.
            </p>
            <p className="mt-1 text-[12px] italic text-[#4B5563]">
              Start a simulation to begin tracking your progress.
            </p>
          </div>
        )}

        {!loading && sessionRows.length > 0 && (
          <section className="mt-4">
            <style>{`@keyframes borderPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4) } 50% { box-shadow: 0 0 0 4px rgba(239,68,68,0) } }`}</style>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {sessionRows.map((row) => (
                <SimulationCard key={row.id} row={row} />
              ))}
            </div>
          </section>
        )}
      </main>
    </UserPageLayout>
  );
}

import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';
import SimulationsFilterPanel from '../components/simulations/SimulationsFilterPanel';
import SimulationsTable from '../components/simulations/SimulationsTable';
import { useUserSimulations } from '../hooks/useUserSimulations';

const getStatsStatus = (row) => {
  const status = String(row?.status || '').toUpperCase();

  if (status === 'COMPLETED') {
    return 'COMPLETED';
  }

  if (status === 'IN_PROGRESS') {
    return 'IN_PROGRESS';
  }

  if (status === 'LIVE' || status === 'ACTIVE') {
    return 'LIVE';
  }

  return 'NOT_STARTED';
};

export default function UserSimulationsPage() {
  const {
    rows,
    loading,
    error,
    selectedDomains,
    toggleDomain,
    selectedDifficulties,
    toggleDifficulty,
    clearFilters,
    domainOptions,
    difficultyOptions,
    refetch,
  } = useUserSimulations();

  const activeIncidents = rows.filter((row) => getStatsStatus(row) === 'LIVE').length;
  const inProgress = rows.filter((row) => getStatsStatus(row) === 'IN_PROGRESS').length;
  const available = rows.filter((row) => getStatsStatus(row) === 'NOT_STARTED').length;
  const hasActiveFilters =
    !selectedDomains.includes('ALL_DOMAINS') || selectedDifficulties.length > 0;

  const livePlural = activeIncidents === 1 ? '' : 's';
  const progressPlural = inProgress === 1 ? '' : 's';

  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="Simulations" showSignalCard={false} showUserFooter />}
      topbar={<UserTopbar title="Simulations" searchPlaceholder="Global search..." />}
    >
      <div className="flex min-h-0 flex-1 flex-col bg-[#040914]">
        <div className="flex h-9 items-center justify-between border-b border-[#0F1A2E] bg-[#060B18] px-5 py-2">
          <div className="flex items-center font-mono">
            <div className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${activeIncidents > 0 ? 'bg-[#EF4444]' : 'bg-[#252535]'}`} />
              <span className={`text-[12px] font-semibold ${activeIncidents > 0 ? 'text-[#EF4444]' : 'text-[#4B5563]'}`}>
                {activeIncidents}
              </span>
              <span className="text-[11px] font-normal uppercase text-[#4B5563]">LIVE</span>
            </div>

            <span className="px-2 text-[11px] text-[#252535]">·</span>

            <div className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${inProgress > 0 ? 'bg-[#F59E0B]' : 'bg-[#252535]'}`} />
              <span className={`text-[12px] font-semibold ${inProgress > 0 ? 'text-[#F59E0B]' : 'text-[#4B5563]'}`}>
                {inProgress}
              </span>
              <span className="text-[11px] font-normal uppercase text-[#4B5563]">IN PROGRESS</span>
            </div>

            <span className="px-2 text-[11px] text-[#252535]">·</span>

            <div className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4]" />
              <span className={`text-[12px] font-semibold ${available > 0 ? 'text-[#06B6D4]' : 'text-[#4B5563]'}`}>
                {available}
              </span>
              <span className="text-[11px] font-normal uppercase text-[#4B5563]">AVAILABLE</span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <SimulationsFilterPanel
              domains={domainOptions}
              selectedDomains={selectedDomains}
              onToggleDomain={toggleDomain}
              difficulties={difficultyOptions}
              selectedDifficulties={selectedDifficulties}
              onToggleDifficulty={toggleDifficulty}
              onResetFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />

            <div className="inline-flex items-center gap-2">
              <p className="text-[12px] font-semibold text-[#06B6D4]">
                {/* TODO: Replace hardcoded signal score and weekly delta with user profile metrics. */}
                SIGNAL / 892
              </p>
              <p className="text-[11px] font-normal text-[#10B981]">↑ +14 this week</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-0 pt-2">
          {activeIncidents > 0 ? (
            <p className="truncate whitespace-nowrap text-[13px] font-medium text-[#EF4444]">
              ◉ {activeIncidents} live incident{livePlural} detected. Intervene now.
            </p>
          ) : inProgress > 0 ? (
            <p className="truncate whitespace-nowrap text-[13px] italic text-[#94A3B8]">
              {inProgress} simulation{progressPlural} in progress. Resume where you left off.
            </p>
          ) : (
            <p className="truncate whitespace-nowrap text-[13px] italic text-[#4B5563]">
              No active incidents. Browse available simulations below.
            </p>
          )}
        </div>

        <SimulationsTable
          rows={rows}
          loading={loading}
          error={error}
          onRetry={refetch}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>
    </UserPageLayout>
  );
}

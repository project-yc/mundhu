import { AlertTriangle } from 'lucide-react';
import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';
import SimulationsFilterPanel from '../components/simulations/SimulationsFilterPanel';
import SimulationsTable from '../components/simulations/SimulationsTable';
import { useUserSimulations } from '../hooks/useUserSimulations';

export default function UserSimulationsPage() {
  const {
    rows,
    loading,
    error,
    pageSize,
    totalPages,
    totalRows,
    startIndex,
    endIndex,
    page,
    setPage,
    search,
    setSearch,
    selectedDomains,
    toggleDomain,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedTags,
    toggleTag,
    aiAssistance,
    setAiAssistance,
    sortBy,
    setSortBy,
    domainOptions,
    difficultyOptions,
    tagOptions,
    sortOptions,
    fetchSimulationDetail,
    refetch,
  } = useUserSimulations();

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) {
      return;
    }

    setPage(nextPage);
  };

  const handleOpenSimulation = async (assessmentId) => {
    await fetchSimulationDetail(assessmentId);
  };

  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="Simulations" showSignalCard={false} showUserFooter />}
      topbar={<UserTopbar title="Simulations" searchPlaceholder="Global search..." />}
    >
      <div className="flex min-h-0 flex-1">
            <SimulationsFilterPanel
              domains={domainOptions}
              selectedDomains={selectedDomains}
              onToggleDomain={toggleDomain}
              difficulties={difficultyOptions}
              selectedDifficulty={selectedDifficulty}
              onSelectDifficulty={setSelectedDifficulty}
              tags={tagOptions}
              selectedTags={selectedTags}
              onToggleTag={toggleTag}
              aiAssistance={aiAssistance}
              onToggleAi={() => setAiAssistance((value) => !value)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              {error && (
                <div className="mx-6 mb-3 mt-4 rounded border border-[#6a2335] bg-[#1b0f15] p-3 text-sm text-[#ff8fa5]">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4" />
                    <div>
                      <p className="font-semibold">Unable to load simulations</p>
                      <p className="mt-1 text-[#f5b4c2]">{error}</p>
                      <button
                        type="button"
                        onClick={refetch}
                        className="mt-2 rounded border border-[#2f3e65] bg-[#0b1223] px-2.5 py-1 text-xs text-[#b8c6e9] transition hover:border-[#18d3ff] hover:text-[#e7f6ff]"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <SimulationsTable
                rows={rows}
                loading={loading}
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                sortBy={sortBy}
                sortOptions={sortOptions}
                onSortChange={setSortBy}
                search={search}
                onSearchChange={setSearch}
                totalRows={totalRows}
                startIndex={startIndex}
                endIndex={endIndex}
                pageSize={pageSize}
                onOpenSimulation={handleOpenSimulation}
              />
            </div>
      </div>
    </UserPageLayout>
  );
}

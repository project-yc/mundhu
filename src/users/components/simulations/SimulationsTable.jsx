import { Circle, Search } from 'lucide-react';

const statusClassMap = {
  COMPLETED: 'text-[#0fd7b2]',
  IN_PROGRESS: 'text-[#ffbf3d]',
  NOT_STARTED: 'text-[#5f7294]',
};

const domainTagClassMap = {
  INFRA: 'bg-[#172235] text-[#a8b9da]',
  AUTH: 'bg-[#15243f] text-[#a6bae8]',
  MICROSERVICES: 'bg-[#1a2438] text-[#a9bad8]',
  DATA_PIPELINE: 'bg-[#1d2638] text-[#9ab1d7]',
  PAYMENTS: 'bg-[#1b2438] text-[#a5b9de]',
};

const scoreIndicatorClassMap = {
  GREEN: 'fill-[#20df9f] text-[#20df9f]',
  AMBER: 'fill-[#ffbf3d] text-[#ffbf3d]',
};

const getStatusLabel = (value) =>
  value
    .split('_')
    .map((part) => `${part.charAt(0)}${part.slice(1).toLowerCase()}`)
    .join(' ');

function PaginationButton({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 min-w-8 rounded border px-2 text-[12px] font-semibold transition ${
        active
          ? 'border-[#17d1ff] bg-[#17d1ff] text-[#051325]'
          : 'border-[#1b2b49] bg-[#081022] text-[#95a7cb] hover:border-[#2b4573]'
      }`}
    >
      {children}
    </button>
  );
}

export default function SimulationsTable({
  rows,
  page,
  totalPages,
  onPageChange,
  sortBy,
  sortOptions,
  onSortChange,
  search,
  onSearchChange,
  totalRows,
  startIndex,
  endIndex,
  loading,
  onOpenSimulation,
}) {
  const pageNumbers = [];

  if (totalPages <= 6) {
    for (let index = 1; index <= totalPages; index += 1) {
      pageNumbers.push(index);
    }
  } else if (page <= 3) {
    pageNumbers.push(1, 2, 3, 'ellipsis', totalPages);
  } else if (page >= totalPages - 2) {
    pageNumbers.push(1, 'ellipsis', totalPages - 2, totalPages - 1, totalPages);
  } else {
    pageNumbers.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages);
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-[520px]">
          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Filter simulations..."
            className="h-10 w-full rounded border border-[#1b2b49] bg-[#070f1d] px-10 text-[14px] text-[#c8d7f5] placeholder:text-[#6e81a4] focus:border-[#16d2ff] focus:outline-none"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#607194]" />
        </div>

        <div className="flex items-center gap-2 text-[12px] text-[#8092b6]">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="h-8 rounded border border-[#1b2b49] bg-[#070f1d] px-2 text-[12px] text-[#d4e0fb] focus:border-[#16d2ff] focus:outline-none"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded border border-[#121f38]">
        <table className="min-w-full text-left">
          <thead className="border-b border-[#13233f] bg-[#070f20]">
            <tr>
              <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.14em] text-[#6f7f9f]">SIMULATION NAME</th>
              <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.14em] text-[#6f7f9f]">DOMAIN</th>
              <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.14em] text-[#6f7f9f]">DIFFICULTY</th>
              <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.14em] text-[#6f7f9f]">EST. TIME</th>
              <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.14em] text-[#6f7f9f]">YOUR BEST SIGNAL</th>
              <th className="px-4 py-3 text-[10px] font-semibold tracking-[0.14em] text-[#6f7f9f]">STATUS</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#7a8cae]">
                  Loading simulations...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#7a8cae]">
                  No simulations found for current filters.
                </td>
              </tr>
            )}

            {rows.map((row) => {
              const scoreLabel = row.user_best_score === null ? '--' : String(row.user_best_score);
              const domainClass = domainTagClassMap[row.domain] || 'bg-[#18263f] text-[#a8b9da]';
              const statusClass = statusClassMap[row.attempt_status] || 'text-[#95a7cb]';
              const indicatorClass = scoreIndicatorClassMap[row.user_best_score_indicator];

              return (
                <tr key={row.id} className="border-b border-[#101d35] last:border-none">
                  <td className="px-4 py-3 text-base font-semibold leading-tight text-[#e6efff]">
                    <button
                      type="button"
                      onClick={() => onOpenSimulation(row.id)}
                      className="text-left transition hover:text-[#17d1ff]"
                    >
                      {row.name}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded px-2 py-0.5 text-[9px] font-semibold tracking-[0.12em] ${domainClass}`}>
                      {row.domain}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#a0b2d4]">{row.difficulty}</td>
                  <td className="px-4 py-3 text-sm text-[#9db0d2]">{row.duration_minutes}m</td>
                  <td className="px-4 py-3 text-sm text-[#d9e5ff]">
                    <span className="inline-flex items-center gap-1">
                      {scoreLabel}
                      {indicatorClass && <Circle className={`h-1.5 w-1.5 ${indicatorClass}`} />}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${statusClass}`}>{getStatusLabel(row.attempt_status)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[12px] text-[#697c9f]">Showing {startIndex}-{endIndex} of {totalRows} simulations</p>

        <div className="flex items-center gap-1.5">
          <PaginationButton active={false} onClick={() => onPageChange(Math.max(1, page - 1))}>
            Previous
          </PaginationButton>

          {pageNumbers.map((item, index) => {
            if (item === 'ellipsis') {
              return (
                <span key={`ellipsis-${index}`} className="px-1 text-[#617396]">
                  ...
                </span>
              );
            }

            return (
              <PaginationButton key={item} active={page === item} onClick={() => onPageChange(item)}>
                {item}
              </PaginationButton>
            );
          })}

          <PaginationButton active={false} onClick={() => onPageChange(Math.min(totalPages, page + 1))}>
            Next
          </PaginationButton>
        </div>
      </div>
    </section>
  );
}

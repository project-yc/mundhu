import { useEffect, useRef, useState } from 'react';

const chipBaseClass =
  'rounded-[4px] border border-[#0F1A2E] bg-[#060B18] px-2 py-[3px] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#94A3B8] transition';

const activeChipClass = 'border-[#06B6D4] text-[#06B6D4]';

const domainLabel = (value) => (value === 'ALL_DOMAINS' ? 'ALL' : value);

export default function SimulationsFilterPanel({
  domains,
  selectedDomains,
  onToggleDomain,
  difficulties,
  selectedDifficulties,
  onToggleDifficulty,
  onResetFilters,
  hasActiveFilters,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#0F1A2E] bg-transparent px-3 py-1 text-[11px] uppercase text-[#94A3B8]"
      >
        <span className="font-mono">Filter</span>
        {hasActiveFilters && <span className="text-[#06B6D4]">◉</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[280px] rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E] p-4">
          <div>
            <p className="mb-2 text-[11px] uppercase text-[#4B5563]">DOMAIN</p>
            <div className="flex flex-wrap gap-2">
              {domains.map((domain) => {
                const isActive = selectedDomains.includes(domain);

                return (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => onToggleDomain(domain)}
                    className={`${chipBaseClass} ${isActive ? activeChipClass : ''}`}
                  >
                    {domainLabel(domain)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <p className="mb-2 text-[11px] uppercase text-[#4B5563]">DIFFICULTY</p>
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => {
                const isActive = selectedDifficulties.includes(difficulty);

                return (
                  <button
                    key={difficulty}
                    type="button"
                    onClick={() => onToggleDifficulty(difficulty)}
                    className={`${chipBaseClass} ${isActive ? activeChipClass : ''}`}
                  >
                    {difficulty}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 text-right">
            <button
              type="button"
              onClick={() => {
                onResetFilters();
                setIsOpen(false);
              }}
              className="text-[11px] text-[#4B5563]"
            >
              Reset filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

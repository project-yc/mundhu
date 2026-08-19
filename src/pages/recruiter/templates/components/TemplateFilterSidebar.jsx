import { cn } from '../../../../lib/utils';
import { DURATION_OPTIONS, FILTER_GROUPS } from '../constants/templatesConfig';

function FilterGroup({ label, options, value, onChange }) {
  if (!options?.length) return null;

  return (
    <div className="border-b border-border-subtle px-[18px] py-[16px] last:border-b-0">
      <p className="mb-[10px] text-[12px] font-bold uppercase tracking-[0.04em] text-text-muted">
        {label}
      </p>
      <div className="flex flex-col gap-[2px]">
        {/* "Any" is a real option rather than a clear button, so the group always
            shows which of its states is active. */}
        <Option label="Any" active={!value} onClick={() => onChange('')} />
        {options.map(option => (
          <Option
            key={option.value}
            label={option.label}
            active={value === option.value}
            onClick={() => onChange(value === option.value ? '' : option.value)}
          />
        ))}
      </div>
    </div>
  );
}

function Option({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-[30px] items-center rounded-[6px] px-[8px] text-left text-[13px] leading-none transition-colors',
        active
          ? 'bg-[var(--color-assessment-accent)]/10 font-semibold text-text-primary'
          : 'text-text-secondary hover:bg-surface-hover',
      )}
    >
      {label}
    </button>
  );
}

export function TemplateFilterSidebar({
  filters,
  setFilter,
  filterOptions,
  filtersActive,
  onClear,
}) {
  return (
    <aside className="hidden w-[220px] shrink-0 flex-col overflow-y-auto border-r border-border-subtle bg-surface lg:flex">
      <div className="flex h-[46px] items-center justify-between border-b border-border-subtle px-[18px]">
        <p className="text-[13px] font-bold text-text-primary">Filters</p>
        {filtersActive && (
          <button
            type="button"
            onClick={onClear}
            className="text-[12px] font-medium text-text-secondary hover:text-text-primary"
          >
            Clear
          </button>
        )}
      </div>

      {FILTER_GROUPS.map(group => (
        <FilterGroup
          key={group.key}
          label={group.label}
          options={filterOptions[group.optionsKey]}
          value={filters[group.key]}
          onChange={value => setFilter(group.key, value)}
        />
      ))}

      {/* Duration is a bound, not a category, so its options are local rather
          than coming back from filter-options as an enum. */}
      <div className="px-[18px] py-[16px]">
        <p className="mb-[10px] text-[12px] font-bold uppercase tracking-[0.04em] text-text-muted">
          Length
        </p>
        <div className="flex flex-col gap-[2px]">
          {DURATION_OPTIONS.map(option => (
            <Option
              key={option.value || 'any'}
              label={option.label}
              active={(filters.duration_max || '') === option.value}
              onClick={() => setFilter('duration_max', option.value)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

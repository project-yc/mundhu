// TaskLibraryPage — B2B task library browser for recruiters
import { useState, useEffect, useCallback } from 'react';
import {
  Library, Search, SlidersHorizontal, ChevronDown,
  Tag, Loader, AlertCircle, BookOpen, Code2, Globe, Server,
  Shield, Smartphone, Database, LayoutPanelLeft, RefreshCw,
} from 'lucide-react';
import { getLibraryTasks } from '../../api/recruiter/assessment.jsx';

// ─── constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_META = {
  easy:   { label: 'Easy',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
  hard:   { label: 'Hard',   cls: 'bg-rose-50   text-rose-700   border-rose-200'   },
};
const SENIORITY_META = {
  junior:    { label: 'Junior'    },
  mid:       { label: 'Mid'      },
  senior:    { label: 'Senior'   },
  staff:     { label: 'Staff'    },
  principal: { label: 'Principal'},
};
const DOMAIN_META = {
  backend:   { label: 'Backend',   Icon: Server          },
  frontend:  { label: 'Frontend',  Icon: LayoutPanelLeft },
  devops:    { label: 'DevOps',    Icon: Globe           },
  data:      { label: 'Data',      Icon: Database        },
  mobile:    { label: 'Mobile',    Icon: Smartphone      },
  security:  { label: 'Security',  Icon: Shield          },
  fullstack: { label: 'Full Stack',Icon: Code2           },
};

const FILTER_SECTIONS = [
  {
    key: 'difficulty',
    label: 'Difficulty',
    options: Object.entries(DIFFICULTY_META).map(([v, m]) => ({ value: v, label: m.label })),
  },
  {
    key: 'seniority',
    label: 'Seniority',
    options: Object.entries(SENIORITY_META).map(([v, m]) => ({ value: v, label: m.label })),
  },
  {
    key: 'domain',
    label: 'Domain',
    options: Object.entries(DOMAIN_META).map(([v, m]) => ({ value: v, label: m.label })),
  },
];

// ─── sub-components ───────────────────────────────────────────────────────────
function FilterSidebar({ filters, onChange, onClear }) {
  return (
    <aside className="w-52 flex-shrink-0 hidden lg:flex flex-col bg-surface border-r border-border-default">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border-default">
        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Filters</span>
        {(filters.difficulty || filters.seniority || filters.domain || filters.language) && (
          <button onClick={onClear} className="text-[10px] text-brand hover:underline">Clear all</button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {FILTER_SECTIONS.map(({ key, label, options }) => (
          <div key={key}>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.14em] mb-2">{label}</p>
            <div className="space-y-1">
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onChange(key, filters[key] === opt.value ? '' : opt.value)}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-100 ${
                    filters[key] === opt.value
                      ? 'bg-brand-tint text-brand'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${filters[key] === opt.value ? 'bg-brand' : 'bg-border-default'}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Language free-text */}
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.14em] mb-2">Language</p>
          <input
            value={filters.language}
            onChange={e => onChange('language', e.target.value)}
            placeholder="e.g. Python, Go…"
            className="w-full px-2.5 py-1.5 bg-page border border-border-default rounded-lg text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150"
          />
        </div>
      </div>
    </aside>
  );
}

function TaskCard({ task, onExpand, expanded }) {
  const diff   = DIFFICULTY_META[task.difficulty];
  const domain = DOMAIN_META[task.domain];
  const DomainIcon = domain?.Icon ?? BookOpen;

  return (
    <div className={`bg-surface border rounded-xl transition-all duration-200 ${expanded ? 'border-brand/40 shadow-sm' : 'border-border-default hover:border-border-strong'}`}>
      <button
        type="button"
        className="w-full text-left px-5 py-4"
        onClick={() => onExpand(task.id)}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand-tint border border-brand-border/30 flex items-center justify-center flex-shrink-0">
            <DomainIcon className="w-4 h-4 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-bold text-text-primary leading-snug">{task.title}</p>
              <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-1">{task.description}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {diff && (
                <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${diff.cls}`}>
                  {diff.label}
                </span>
              )}
              {task.seniority && (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-border-default">
                  {SENIORITY_META[task.seniority]?.label ?? task.seniority}
                </span>
              )}
              {task.domain && (
                <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-border-default">
                  {DOMAIN_META[task.domain]?.label ?? task.domain}
                </span>
              )}
              {task.language && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-tint text-brand border border-brand-border/40">
                  <Code2 className="w-2.5 h-2.5" />{task.language}
                </span>
              )}
              {(task.tags ?? []).slice(0, 3).map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface text-text-muted border border-border-default">
                  <Tag className="w-2.5 h-2.5" />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border-default px-5 pb-4 pt-3 animate-fadeIn">
          <p className="text-[13px] text-text-secondary leading-relaxed">{task.description}</p>
          {task.additional_info && Object.keys(task.additional_info).length > 0 && (
            <div className="mt-3 p-3 bg-page rounded-lg border border-border-default">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Additional Info</p>
              {Object.entries(task.additional_info).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[12px] text-text-secondary">
                  <span className="font-semibold text-text-secondary capitalize">{k.replace(/_/g, ' ')}:</span>
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function TaskLibraryPage() {
  const [tasks,     setTasks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [filters,   setFilters]   = useState({ difficulty: '', seniority: '', domain: '', language: '' });
  const [expanded,  setExpanded]  = useState(null);

  const fetchTasks = useCallback(async (overrideFilters, overrideSearch) => {
    setLoading(true); setError('');
    try {
      const f = overrideFilters ?? filters;
      const s = overrideSearch  !== undefined ? overrideSearch : search;
      const data = await getLibraryTasks({ ...f, search: s.trim() || undefined });
      setTasks((data.data ?? data) || []);
    } catch (err) {
      setError(err.message || 'Failed to load task library.');
    } finally {
      setLoading(false);
    }
  }, [filters, search]);

  useEffect(() => { fetchTasks(); }, []);

  const handleFilterChange = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchTasks(next, undefined);
  };

  const clearFilters = () => {
    const cleared = { difficulty: '', seniority: '', domain: '', language: '' };
    setFilters(cleared);
    setSearch('');
    fetchTasks(cleared, '');
  };

  const hasActiveFilters = filters.difficulty || filters.seniority || filters.domain || filters.language || search;

  return (
    <div className="flex flex-col h-full min-h-0 bg-page">
      {/* Page header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-border-default bg-surface">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-tint border border-brand-border/40 flex items-center justify-center">
              <Library className="w-4.5 h-4.5 text-brand" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-text-primary font-display leading-none">Task Library</h1>
              <p className="text-[12px] text-text-secondary mt-0.5">Browse and attach curated tasks to your assessments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchTasks()}
                placeholder="Search tasks…"
                className="pl-8 pr-3 py-2 w-56 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150"
              />
            </div>
            <button
              onClick={() => fetchTasks()}
              className="p-2 rounded-lg border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all duration-150"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Active filter pills (mobile / quick view) */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Active:</span>
            {filters.difficulty && <FilterPill label={`Difficulty: ${DIFFICULTY_META[filters.difficulty]?.label}`} onRemove={() => handleFilterChange('difficulty', '')} />}
            {filters.seniority  && <FilterPill label={`Seniority: ${SENIORITY_META[filters.seniority]?.label}`}  onRemove={() => handleFilterChange('seniority', '')}  />}
            {filters.domain     && <FilterPill label={`Domain: ${DOMAIN_META[filters.domain]?.label}`}          onRemove={() => handleFilterChange('domain', '')}     />}
            {filters.language   && <FilterPill label={`Language: ${filters.language}`}                          onRemove={() => handleFilterChange('language', '')}   />}
            {search             && <FilterPill label={`"${search}"`}                                            onRemove={() => { setSearch(''); fetchTasks(undefined, ''); }} />}
            <button onClick={clearFilters} className="text-[10px] text-error hover:underline ml-1">Clear all</button>
          </div>
        )}
      </div>

      {/* Body: sidebar + list */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-text-muted py-20">
              <Loader className="w-5 h-5 animate-spin" />
              <span className="text-[13px]">Loading task library…</span>
            </div>
          ) : error ? (
            <div className="flex items-start gap-3 px-5 py-4 bg-error-bg border border-error-border rounded-xl">
              <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-error">{error}</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-text-muted">
              <Library className="w-10 h-10 opacity-25" />
              <p className="text-[14px] font-semibold text-text-secondary">No tasks found</p>
              <p className="text-[12px] text-center max-w-xs">
                {hasActiveFilters
                  ? 'Try adjusting your filters or clearing the search.'
                  : 'No tasks have been published to the library yet.'}
              </p>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-[13px] text-brand hover:underline font-semibold">Clear filters</button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              <p className="text-[11px] text-text-muted mb-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  expanded={expanded === task.id}
                  onExpand={id => setExpanded(prev => prev === id ? null : id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint text-brand text-[11px] font-semibold rounded-full border border-brand-border/40">
      {label}
      <button onClick={onRemove} className="hover:text-brand-deep leading-none">×</button>
    </span>
  );
}

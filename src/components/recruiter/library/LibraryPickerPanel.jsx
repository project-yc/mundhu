/**
 * The library picker used inside the section-creation drawer.
 *
 * Replaces the static shell that shipped with the MCQ overlay: the markup
 * matched Figma but nothing was wired — the mode toggle had no handler, the tab
 * row had no "My library" entry, and "Create custom task" / "Sort" /
 * "View details" were inert.
 *
 * Parameterized by `contentType` so an MCQ section lists MCQ questions and a
 * coding section lists tasks; the mockup showed coding rows under "Create your
 * MCQ Question" because that panel was copied from the coding overlay.
 *
 * `Suggested` and `Trending tasks` are rendered disabled on purpose: there is no
 * ranking signal or endpoint behind them, and shipping them live would add two
 * more dead affordances to the set this work is removing.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink, Search, SlidersHorizontal, X } from 'lucide-react';

import { getMyLibrary, getTrudevLibrary } from '../../../api/recruiter/taskLibrary';

const TABS = [
  { key: 'all', label: 'All', enabled: true },
  { key: 'my', label: 'My library', enabled: true },
  {
    key: 'suggested',
    label: 'Suggested',
    enabled: false,
    hint: 'Needs usage data to rank on — not available yet.',
  },
  {
    key: 'trending',
    label: 'Trending tasks',
    enabled: false,
    hint: 'Needs usage data to rank on — not available yet.',
  },
];

const SEARCH_DEBOUNCE_MS = 300;

export default function LibraryPickerPanel({
  contentType,
  selectedId,
  onSelect,
  onEdit,
  onCreateCustom,
  onViewDetails,
  refreshToken,
  initialTab = 'all',
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestRef = useRef(0);

  // The old panel refetched on every keystroke and then filtered the same list
  // again client-side.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const isMyLibrary = activeTab === 'my';

  const fetchItems = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError('');
    try {
      const fetchFn = isMyLibrary ? getMyLibrary : getTrudevLibrary;
      const page = await fetchFn({
        content_type: contentType,
        search: debouncedSearch || undefined,
        page_size: 50,
      });
      // Ignore a response that a newer request has already superseded.
      if (requestId !== requestRef.current) return;
      setItems(page.items);
      setTotal(page.total);
    } catch (err) {
      if (requestId !== requestRef.current) return;
      // No fallback list here. The old panel rendered placeholder tasks with
      // fake ids on failure, which then threw mid-publish.
      setItems([]);
      setTotal(0);
      setError(err?.message || 'Could not load the library.');
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [contentType, debouncedSearch, isMyLibrary]);

  useEffect(() => { fetchItems(); }, [fetchItems, refreshToken]);

  const emptyMessage = useMemo(() => {
    if (debouncedSearch) return `No questions match "${debouncedSearch}".`;
    if (isMyLibrary) return 'Your library is empty. Create a question to reuse it later.';
    return 'No questions in the TruDev library yet.';
  }, [debouncedSearch, isMyLibrary]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-[8px]">
        <div className="relative flex h-[42px] flex-1 items-center rounded-[8px] border border-border-default bg-surface px-[12px]">
          <Search className="h-[16px] w-[16px] flex-shrink-0 text-text-primary" strokeWidth={1.9} />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="ml-[10px] min-w-0 flex-1 bg-transparent text-[15px] font-medium text-text-primary outline-none placeholder:text-text-muted"
            placeholder="Search for library questions..."
            aria-label="Search the library"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="ml-[8px] flex h-[22px] w-[22px] items-center justify-center rounded-[6px] bg-surface-muted text-text-primary"
              aria-label="Clear search"
            >
              <X className="h-[15px] w-[15px]" strokeWidth={2.2} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onCreateCustom}
          className="h-[42px] flex-shrink-0 rounded-[8px] bg-[#11172f] px-[16px] text-[15px] font-semibold text-surface transition-opacity hover:opacity-90"
        >
          Create custom task
        </button>
      </div>

      <div className="mt-[8px] flex items-center">
        <div className="flex items-center gap-[8px]">
          {TABS.map(tab => {
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                disabled={!tab.enabled}
                title={tab.hint}
                onClick={() => tab.enabled && setActiveTab(tab.key)}
                className={`h-[29px] rounded-[8px] px-[11px] text-[15px] font-semibold leading-none transition-colors ${
                  active ? 'bg-surface-muted text-text-primary' : 'text-text-primary'
                } ${tab.enabled ? '' : 'cursor-not-allowed opacity-40'}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex items-center gap-[20px]">
          <span className="text-[13px] font-medium text-text-muted">
            {loading ? 'Loading…' : `${total} question${total === 1 ? '' : 's'}`}
          </span>
          <button
            type="button"
            disabled
            title="Sorting isn't available yet."
            className="flex cursor-not-allowed items-center gap-[5px] text-[15px] font-semibold leading-none text-text-secondary opacity-40"
          >
            Sort
            <SlidersHorizontal className="h-[14px] w-[14px]" strokeWidth={2} />
          </button>
          {/* Bulk curation — delete, org sharing — lives on the full page. A new
              tab, because the builder has draft state that navigating away would
              discard. */}
          <a
            href="/recruiter/task-library"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-[4px] text-[14px] font-semibold leading-none text-brand hover:underline"
          >
            Manage in library
            <ExternalLink className="h-[13px] w-[13px]" strokeWidth={2} />
          </a>
        </div>
      </div>

      <div className="mt-[18px] min-h-0 flex-1 space-y-[8px] overflow-y-auto">
        {loading && (
          <p className="py-[8px] text-[13px] text-text-muted">Loading library…</p>
        )}

        {!loading && error && (
          <div className="rounded-[8px] border border-border-default bg-surface-muted px-[12px] py-[10px]">
            <p className="text-[13px] text-error">{error}</p>
            <button
              type="button"
              onClick={fetchItems}
              className="mt-[6px] text-[13px] font-bold text-brand"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="py-[8px] text-center text-[13px] text-text-muted">{emptyMessage}</p>
        )}

        {!loading && !error && items.map(item => (
          <LibraryRow
            key={item.id}
            item={item}
            selected={String(selectedId) === String(item.id)}
            isMyLibrary={isMyLibrary}
            onSelect={() => onSelect?.(item)}
            onEdit={onEdit ? () => onEdit(item, { isMyLibrary }) : undefined}
            onViewDetails={onViewDetails ? () => onViewDetails(item) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function LibraryRow({ item, selected, isMyLibrary, onSelect, onEdit, onViewDetails }) {
  const title = item.title || 'Untitled question';
  const language = item.language || item.tags?.[0] || '';
  const tags = (item.tags || []).filter(tag => tag !== language).slice(0, 2);
  const meta = [language, ...tags].filter(Boolean).join('  ·  ');
  const usageCount = item.usage_count ?? 0;

  return (
    <div
      className={`grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-[10px] rounded-[8px] px-[8px] py-[6px] transition-colors ${
        selected ? 'bg-[#f7f7f7]' : 'bg-transparent hover:bg-surface-muted'
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className={`h-[34px] w-[34px] rounded-[7px] ${selected ? 'bg-surface ring-2 ring-brand' : 'bg-[#ededed]'}`}
        aria-label={`Select ${title}`}
        aria-pressed={selected}
      />

      <button type="button" onClick={onSelect} className="min-w-0 text-left">
        <span className="block truncate text-[15px] font-semibold leading-[18px] text-text-primary">
          {title}
        </span>
        <span className="mt-[3px] block truncate text-[13px] font-medium leading-none text-[#52657d]">
          {meta || 'No tags'}
          {item.is_locked && ' · Locked'}
          {!item.is_locked && usageCount > 0 && ` · Used by ${usageCount}`}
        </span>
      </button>

      <div className="flex items-center gap-[6px]">
        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-border-default bg-surface px-[12px] text-[14px] font-semibold text-text-primary hover:bg-surface-hover"
          >
            View details
          </button>
        )}
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            disabled={item.is_locked}
            title={item.is_locked
              ? 'Locked by a published assessment — make a copy to edit.'
              : (isMyLibrary ? 'Edit this question' : 'Edits save a copy to My Library')}
            className="flex h-[34px] items-center justify-center rounded-[8px] border border-border-default bg-surface px-[12px] text-[14px] font-semibold text-text-primary hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { listAssessmentsPage } from '../../../../api/recruiter/assessments';
import {
  DEFAULT_ORDER,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  SEARCH_DEBOUNCE_MS,
} from '../constants/assessmentsConfig';
import { normalizeAssessmentRows } from '../utils/assessmentRows';

const EMPTY_ROWS = [];
const EMPTY_SUMMARY = {
  total: 0,
  live: 0,
  draft: 0,
  closed: 0,
  invited_total: 0,
  submitted_total: 0,
  ending_soon: 0,
  with_candidates: 0,
  avg_completion_rate: null,
};

const EMPTY_RESULT = { rows: EMPTY_ROWS, total: 0, totalPages: 1 };

/**
 * Owns fetching for the Assessments list screen. Search, status filtering,
 * sorting and pagination are all server-side — this hook only holds the query
 * state and hands it to the API. Page size is fixed (DEFAULT_PAGE_SIZE); there
 * is no control for it in the UI by design.
 *
 * Keeps the house staleness pattern (shared with reports/hooks/useReportsTable):
 * fetched state is tagged with a `version` counter so `loading`/`error` are
 * derived rather than set synchronously inside the effect, and `refetch` (used
 * after Duplicate) just bumps the counter.
 */
export function useAssessmentsTable() {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ version: -1, data: EMPTY_RESULT });
  const [failure, setFailure] = useState({ version: -1, message: '' });

  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatusState] = useState('all');
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [order, setOrder] = useState(DEFAULT_ORDER);
  const [page, setPageState] = useState(1);

  // Held separately from `result` because the summary is org-wide and filter
  // independent: blanking the stat strip on every keystroke would make it
  // flicker for data that did not change.
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // Every query input is a dependency, so any change refires the request. The
  // version counter is bumped alongside so `loading` flips while it is in
  // flight rather than showing the previous page's rows as settled.
  const queryKey = `${version}|${debouncedSearch}|${status}|${sort}|${order}|${page}`;

  useEffect(() => {
    const controller = new AbortController();

    listAssessmentsPage({
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      search: debouncedSearch,
      status: status === 'all' ? '' : status,
      sort,
      order,
      signal: controller.signal,
    })
      .then(payload => {
        if (controller.signal.aborted) return;
        setResult({
          version: queryKey,
          data: {
            rows: normalizeAssessmentRows(payload.items),
            total: payload.total,
            totalPages: payload.totalPages,
          },
        });
        setSummary(payload.summary);
        setSummaryLoaded(true);
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setFailure({ version: queryKey, message: err?.message || 'Failed to load assessments.' });
      });

    return () => controller.abort();
    // queryKey encodes every input; listing it alone keeps the effect honest.
  }, [queryKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCurrent = result.version === queryKey;
  const error = failure.version === queryKey ? failure.message : '';
  const loading = !isCurrent && !error;
  const data = isCurrent ? result.data : EMPTY_RESULT;

  const summaryLoading = !summaryLoaded && !error;

  const offset = (page - 1) * DEFAULT_PAGE_SIZE;

  // Any change to what is being queried invalidates the current page number.
  const resetPage = useCallback(setter => value => {
    setter(value);
    setPageState(1);
  }, []);

  const setSearch = useMemo(() => resetPage(setSearchState), [resetPage]);
  const setStatus = useMemo(() => resetPage(setStatusState), [resetPage]);

  /** Clicking a sorted column flips direction; a new column starts descending. */
  const toggleSort = useCallback(
    nextSort => {
      if (!nextSort) return;
      if (nextSort === sort) {
        setOrder(current => (current === 'desc' ? 'asc' : 'desc'));
      } else {
        setSort(nextSort);
        setOrder('desc');
      }
      setPageState(1);
    },
    [sort],
  );

  const clearFilters = useCallback(() => {
    setSearchState('');
    setStatusState('all');
    setPageState(1);
  }, []);

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  return {
    rows: data.rows,
    summary,
    summaryLoading,
    loading,
    error,

    search,
    setSearch,
    status,
    setStatus,
    sort,
    order,
    toggleSort,
    clearFilters,
    filtersActive: Boolean(search.trim()) || status !== 'all',

    totalCount: data.total,
    offset,
    page,
    setPage: setPageState,
    totalPages: data.totalPages,
    pageSize: DEFAULT_PAGE_SIZE,

    refetch,
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { listAssessments } from '../../../../api/recruiter/reports';
import { DEFAULT_PAGE_SIZE, SEARCH_DEBOUNCE_MS } from '../constants/assessmentsConfig';
import {
  deriveAssessmentMetrics,
  filterAssessments,
  normalizeAssessmentRows,
  normalizeList,
} from '../utils/assessmentRows';

// Server caps page_size at 50 (core/utils/pagination.py); assessment counts
// per org are small enough that this covers "all of them" in one request.
const FETCH_ALL_PAGE_SIZE = 50;
const EMPTY_ROWS = [];

/**
 * Owns assessment fetching, search and client-side pagination for the
 * Assessments list screen. Same shape as reports/hooks/useReportsTable.js —
 * fetched state is tagged with a `version` counter so `loading`/`error` are
 * derived rather than set synchronously inside the effect, and `refetch`
 * (used after Duplicate) just bumps the counter to re-run the effect.
 */
export function useAssessmentsTable() {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState({ version: -1, data: EMPTY_ROWS });
  const [failure, setFailure] = useState({ version: -1, message: '' });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);

  const isCurrent = result.version === version;
  const assessments = isCurrent ? result.data : EMPTY_ROWS;
  const error = failure.version === version ? failure.message : '';
  const loading = !isCurrent && !error;

  useEffect(() => {
    const controller = new AbortController();

    listAssessments({ pageSize: FETCH_ALL_PAGE_SIZE, signal: controller.signal })
      .then(payload => {
        if (controller.signal.aborted) return;
        setResult({ version, data: normalizeAssessmentRows(normalizeList(payload)) });
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setFailure({ version, message: err?.message || 'Failed to load assessments.' });
      });

    return () => controller.abort();
  }, [version]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const metrics = useMemo(() => deriveAssessmentMetrics(assessments), [assessments]);

  const filtered = useMemo(
    () => filterAssessments(assessments, debouncedSearch),
    [assessments, debouncedSearch],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const offset = (currentPage - 1) * pageSize;

  const rows = useMemo(
    () => filtered.slice(offset, offset + pageSize),
    [filtered, offset, pageSize],
  );

  const setPage = useCallback(next => setPageState(next), []);

  const setSearchAndResetPage = useCallback(value => {
    setSearch(value);
    setPageState(1);
  }, []);

  const refetch = useCallback(() => setVersion(v => v + 1), []);

  return {
    rows,
    metrics,
    loading,
    error,
    search,
    setSearch: setSearchAndResetPage,
    totalCount: filtered.length,
    offset,
    page: currentPage,
    setPage,
    totalPages,
    pageSize,
    setPageSize: setPageSizeState,
    refetch,
  };
}

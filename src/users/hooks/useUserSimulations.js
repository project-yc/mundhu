import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SIMULATION_DIFFICULTIES,
  SIMULATION_DOMAINS,
  SIMULATION_SORT_OPTIONS,
  SIMULATION_TAGS,
} from '../constants/simulationsData';
import { getUserSimulationById, getUserSimulations } from '../services/dashboardService';

export const useUserSimulations = () => {
  const [rows, setRows] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedDomains, setSelectedDomains] = useState(['AUTH', 'MICROSERVICES']);
  const [selectedDifficulty, setSelectedDifficulty] = useState('Senior');
  const [selectedTags, setSelectedTags] = useState([]);
  const [aiAssistance, setAiAssistance] = useState(true);
  const [sortBy, setSortBy] = useState('relevant');
  const [page, setPage] = useState(1);

  const pageSize = 7;

  const queryParams = useMemo(
    () => ({
      domain: selectedDomains.length ? selectedDomains.join(',') : undefined,
      difficulty: selectedDifficulty || undefined,
      tags: selectedTags.length ? selectedTags.join(',') : undefined,
      ai_assistance: String(aiAssistance),
      search: search.trim() || undefined,
      sort_by: sortBy,
      page,
      page_size: pageSize,
    }),
    [selectedDomains, selectedDifficulty, selectedTags, aiAssistance, search, sortBy, page],
  );

  const fetchSimulations = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getUserSimulations(queryParams);
      setRows(data?.results || []);
      setTotalRows(data?.total || 0);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load simulations.');
      setRows([]);
      setTotalRows(0);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchSimulations();
  }, [fetchSimulations]);

  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  const startIndex = totalRows === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = totalRows === 0 ? 0 : Math.min(page * pageSize, totalRows);

  const toggleDomain = (domain) => {
    setPage(1);
    setSelectedDomains((current) =>
      current.includes(domain) ? current.filter((item) => item !== domain) : [...current, domain],
    );
  };

  const toggleTag = (tag) => {
    setPage(1);
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  };

  const updateSearch = (value) => {
    setPage(1);
    setSearch(value);
  };

  const updateDifficulty = (value) => {
    setPage(1);
    setSelectedDifficulty(value);
  };

  const updateAiAssistance = (value) => {
    setPage(1);
    setAiAssistance(value);
  };

  const updateSortBy = (value) => {
    setPage(1);
    setSortBy(value);
  };

  const fetchSimulationDetail = async (assessmentId) => getUserSimulationById(assessmentId);

  return {
    rows,
    loading,
    error,
    totalRows,
    pageSize,
    totalPages,
    startIndex,
    endIndex,
    page,
    setPage,
    search,
    setSearch: updateSearch,
    selectedDomains,
    toggleDomain,
    selectedDifficulty,
    setSelectedDifficulty: updateDifficulty,
    selectedTags,
    toggleTag,
    aiAssistance,
    setAiAssistance: updateAiAssistance,
    sortBy,
    setSortBy: updateSortBy,
    domainOptions: SIMULATION_DOMAINS,
    difficultyOptions: SIMULATION_DIFFICULTIES,
    tagOptions: SIMULATION_TAGS,
    sortOptions: SIMULATION_SORT_OPTIONS,
    refetch: fetchSimulations,
    fetchSimulationDetail,
  };
};

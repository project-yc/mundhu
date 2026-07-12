import { useEffect, useMemo, useRef, useState } from 'react';
import { getLibraryTasks } from '../../api/assessmentBuilderApi';
import { SECTION_TYPE_CONFIG } from '../../constants/sectionTypeConfig';
import {
  CODING_RUBRICS,
  DRAWER_CLOSE_MS,
  FALLBACK_CODING_TASKS,
  createInitialOptions,
  createInitialRankingItems,
} from './constants';

const DRAWER_SECTION_TYPES = ['mcq', 'coding', 'ranking', 'free_text'];
const DEFAULT_CODING_FILTERS = { role: 'Front-end developer', language: '', difficulty: 'easy' };

const createInitialRubricPoints = () => CODING_RUBRICS.reduce((acc, name) => ({ ...acc, [name]: 5 }), {});

export function useSectionCreationDrawer({ dispatch, ACTIONS, state }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [drawerStep, setDrawerStep] = useState('section');
  const [drawerType, setDrawerType] = useState('mcq');
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [sectionTimer, setSectionTimer] = useState(45);
  const [itemTimer, setItemTimer] = useState(5);
  const [aiLevel, setAiLevel] = useState('chat');
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [freeTextAnswer, setFreeTextAnswer] = useState('');
  const [gradingHints, setGradingHints] = useState('');
  const [wordLimit, setWordLimit] = useState(50);
  const [rankingItems, setRankingItems] = useState(() => createInitialRankingItems());
  const [pollType, setPollType] = useState('multi');
  const [points, setPoints] = useState(5);
  const [options, setOptions] = useState(() => createInitialOptions());
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [rubricPoints, setRubricPoints] = useState(() => createInitialRubricPoints());
  const [libraryTasks, setLibraryTasks] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [codingFilterOpen, setCodingFilterOpen] = useState(false);
  const [codingFilters, setCodingFilters] = useState(DEFAULT_CODING_FILTERS);
  const closeTimerRef = useRef(null);

  const resetDrawerState = () => {
    setDrawerOpen(false);
    setDrawerClosing(false);
    setDrawerStep('section');
    setDrawerType('mcq');
    setTargetSectionId(null);
    setSectionName('');
    setSectionTimer(45);
    setItemTimer(5);
    setAiLevel('chat');
    setQuestionPrompt('');
    setFreeTextAnswer('');
    setGradingHints('');
    setWordLimit(50);
    setRankingItems(createInitialRankingItems());
    setPollType('multi');
    setPoints(5);
    setOptions(createInitialOptions());
    setShuffleOptions(false);
    setRubricPoints(createInitialRubricPoints());
    setTaskSearch('');
    setSelectedTask(null);
    setCodingFilterOpen(false);
    setCodingFilters(DEFAULT_CODING_FILTERS);
  };

  const closeDrawer = () => {
    if (drawerClosing) return;
    setDrawerClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      closeTimerRef.current = null;
      resetDrawerState();
    }, DRAWER_CLOSE_MS);
  };

  const openDrawer = (type, options = {}) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDrawerClosing(false);
    setDrawerOpen(true);
    setDrawerType(type);
    setDrawerStep(options.step ?? 'section');
    setTargetSectionId(options.targetSectionId ?? null);
    setSectionTimer(45);
    setItemTimer(5);
    setAiLevel('chat');
    setPoints(5);
  };

  const handleAddSection = (type, label) => {
    if (DRAWER_SECTION_TYPES.includes(type)) {
      openDrawer(type);
      return;
    }

    dispatch({
      type: ACTIONS.ADD_SECTION,
      payload: {
        name: label,
        type,
        timer_minutes: SECTION_TYPE_CONFIG[type]?.defaultTimerMinutes ?? null,
        ai_level_override: null,
      },
    });
  };

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  useEffect(() => {
    const request = state.addQuestionDrawerRequest;
    if (!request) return;
    if (!DRAWER_SECTION_TYPES.includes(request.sectionType)) return;

    openDrawer(request.sectionType, {
      step: 'question',
      targetSectionId: request.sectionId,
    });
    dispatch({ type: ACTIONS.CLEAR_ADD_QUESTION_DRAWER });
  }, [ACTIONS.CLEAR_ADD_QUESTION_DRAWER, dispatch, state.addQuestionDrawerRequest?.requestId]);

  useEffect(() => {
    if (!drawerOpen || drawerType !== 'coding' || drawerStep !== 'question') return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLibraryLoading(true);
      setLibraryError('');
    });

    getLibraryTasks({
      search: taskSearch.trim() || undefined,
      language: codingFilters.language || undefined,
      difficulty: codingFilters.difficulty === 'adaptive' ? undefined : codingFilters.difficulty,
    })
      .then(res => {
        if (cancelled) return;
        setLibraryTasks(res.data || res || []);
      })
      .catch(error => {
        if (cancelled) return;
        setLibraryError(error.message);
        setLibraryTasks([]);
      })
      .finally(() => {
        if (!cancelled) setLibraryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [codingFilters.difficulty, codingFilters.language, drawerOpen, drawerStep, drawerType, taskSearch]);

  const codingTasks = useMemo(() => {
    const source = libraryTasks.length > 0 ? libraryTasks : FALLBACK_CODING_TASKS;
    const roleQuery = codingFilters.role.toLowerCase().replace('-end developer', '').replace(' engineer', '').trim();

    return source.filter(task => {
      const title = (task.title || task.name || '').toLowerCase();
      const domain = (task.domain || '').toLowerCase();
      const tags = (task.tags || []).join(' ').toLowerCase();
      const language = (task.language || task.primary_language || '').toLowerCase();
      const searchText = taskSearch.trim().toLowerCase();
      const matchesSearch = !searchText || `${title} ${domain} ${tags} ${language}`.includes(searchText);
      const matchesRole = !roleQuery || roleQuery === 'qa' || `${title} ${domain} ${tags}`.includes(roleQuery);
      return matchesSearch && matchesRole;
    });
  }, [codingFilters.role, libraryTasks, taskSearch]);

  const updateOption = (optionId, text) => {
    setOptions(current => current.map(option => (
      option.id === optionId ? { ...option, text } : option
    )));
  };

  const toggleCorrectOption = (optionId) => {
    setOptions(current => current.map(option => {
      if (pollType === 'single') {
        return { ...option, is_correct: option.id === optionId };
      }
      return option.id === optionId ? { ...option, is_correct: !option.is_correct } : option;
    }));
  };

  const removeOption = (optionId) => {
    setOptions(current => {
      if (current.length <= 2) return current;
      const next = current.filter(option => option.id !== optionId);
      if (!next.some(option => option.is_correct)) {
        return next.map((option, index) => index === 0 ? { ...option, is_correct: true } : option);
      }
      return next;
    });
  };

  const addOption = () => {
    setOptions(current => [
      ...current,
      { id: crypto.randomUUID(), text: '', is_correct: false },
    ]);
  };

  const updateRankingItem = (itemId, text) => {
    setRankingItems(current => current.map(item => (
      item.id === itemId ? { ...item, text } : item
    )));
  };

  const removeRankingItem = (itemId) => {
    setRankingItems(current => (current.length <= 2 ? current : current.filter(item => item.id !== itemId)));
  };

  const addRankingItem = () => {
    setRankingItems(current => [...current, { id: crypto.randomUUID(), text: '' }]);
  };

  const handlePollTypeChange = (mode) => {
    setPollType(mode);
    if (mode === 'single') {
      setOptions(current => {
        const firstCorrectIndex = Math.max(current.findIndex(option => option.is_correct), 0);
        return current.map((option, index) => ({ ...option, is_correct: index === firstCorrectIndex }));
      });
    }
  };

  const handleCreateMcq = () => {
    const normalizedOptions = options.map((option, index) => ({
      id: option.id,
      text: option.text.trim() || `Option ${index + 1}`,
      is_correct: option.is_correct,
    }));
    const hasCorrectAnswer = normalizedOptions.some(option => option.is_correct);
    const finalOptions = hasCorrectAnswer
      ? normalizedOptions
      : normalizedOptions.map((option, index) => ({ ...option, is_correct: index === 0 }));

    const question = {
          id: crypto.randomUUID(),
          type: 'mcq',
          backendMcqId: null,
          backendItemId: null,
          points: Number(points),
          override_timer_minutes: null,
          published: false,
          locked: false,
          prompt: questionPrompt.trim(),
          selection_mode: pollType === 'single' ? 'single' : 'multi',
          shuffle_options: shuffleOptions,
          show_explanation_after: false,
          options: finalOptions,
    };

    if (targetSectionId) {
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      dispatch({
        type: ACTIONS.ADD_SECTION,
        payload: {
          name: sectionName.trim() || 'MCQ Section',
          type: 'mcq',
          timer_minutes: Number(sectionTimer),
          ai_level_override: null,
          items: [question],
        },
      });
    }
    closeDrawer();
  };

  const handleCreateCoding = () => {
    const task = selectedTask || codingTasks[0] || null;
    const question = {
          id: crypto.randomUUID(),
          type: 'coding',
          task_id: task?.id ?? null,
          task_data: task,
          points: Number(points),
          published: false,
          locked: true,
    };

    if (targetSectionId) {
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      dispatch({
        type: ACTIONS.ADD_SECTION,
        payload: {
          name: sectionName.trim() || 'Coding Section',
          type: 'coding',
          timer_minutes: Number(sectionTimer),
          ai_level_override: aiLevel || null,
          items: [question],
        },
      });
    }
    closeDrawer();
  };

  const handleCreateFreeText = () => {
    const question = {
          id: crypto.randomUUID(),
          type: 'free_text',
          backendFreeTextId: null,
          backendItemId: null,
          points: Number(points),
          override_timer_minutes: Number(itemTimer),
          published: false,
          locked: false,
          prompt: questionPrompt.trim(),
          answer: freeTextAnswer.trim(),
          word_limit: Number(wordLimit),
          grading_hints: gradingHints.trim(),
    };

    if (targetSectionId) {
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      dispatch({
        type: ACTIONS.ADD_SECTION,
        payload: {
          name: sectionName.trim() || 'Free Text Section',
          type: 'free_text',
          timer_minutes: Number(sectionTimer),
          ai_level_override: null,
          items: [question],
        },
      });
    }
    closeDrawer();
  };

  const handleCreateRanking = () => {
    const normalizedItems = rankingItems.map((item, index) => ({
      id: item.id,
      text: item.text.trim() || `Item ${index + 1}`,
    }));

    const question = {
          id: crypto.randomUUID(),
          type: 'ranking',
          backendRankingId: null,
          backendItemId: null,
          points: Number(points),
          override_timer_minutes: Number(itemTimer),
          published: false,
          locked: false,
          prompt: questionPrompt.trim(),
          grading_hints: gradingHints.trim(),
          items: normalizedItems,
    };

    if (targetSectionId) {
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      dispatch({
        type: ACTIONS.ADD_SECTION,
        payload: {
          name: sectionName.trim() || 'Ranking Section',
          type: 'ranking',
          timer_minutes: Number(sectionTimer),
          ai_level_override: null,
          items: [question],
        },
      });
    }
    closeDrawer();
  };

  return {
    drawer: {
      isOpen: drawerOpen,
      isClosing: drawerClosing,
      step: drawerStep,
      type: drawerType,
      close: closeDrawer,
      continueToQuestion: () => setDrawerStep('question'),
    },
    form: {
      sectionName,
      setSectionName,
      sectionTimer,
      setSectionTimer,
      itemTimer,
      setItemTimer,
      aiLevel,
      setAiLevel,
      questionPrompt,
      setQuestionPrompt,
      freeTextAnswer,
      setFreeTextAnswer,
      gradingHints,
      setGradingHints,
      wordLimit,
      setWordLimit,
      rankingItems,
      pollType,
      points,
      setPoints,
      options,
      shuffleOptions,
      setShuffleOptions,
      rubricPoints,
      setRubricPoints,
      libraryLoading,
      libraryError,
      taskSearch,
      setTaskSearch,
      selectedTask,
      setSelectedTask,
      codingFilterOpen,
      setCodingFilterOpen,
      codingFilters,
      setCodingFilters,
      codingTasks,
      updateOption,
      toggleCorrectOption,
      removeOption,
      addOption,
      updateRankingItem,
      removeRankingItem,
      addRankingItem,
      handlePollTypeChange,
    },
    actions: {
      addSection: handleAddSection,
      createMcq: handleCreateMcq,
      createCoding: handleCreateCoding,
      createFreeText: handleCreateFreeText,
      createRanking: handleCreateRanking,
    },
  };
}

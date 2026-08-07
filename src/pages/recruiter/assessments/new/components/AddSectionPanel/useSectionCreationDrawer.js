import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getAdaptiveFocusAreas, getLibraryTasks } from '../../api/assessmentBuilderApi';
import { SECTION_TYPE_CONFIG } from '../../constants/sectionTypeConfig';
import {
  ADAPTIVE_DEFAULT_TIMER,
  CODING_RUBRICS,
  FALLBACK_CODING_TASKS,
  ROLE_FOCUS_AREAS,
  createInitialOptions,
  createInitialRankingItems,
  deriveQuestionCount,
} from './constants';

const DRAWER_SECTION_TYPES = ['mcq', 'coding', 'ranking', 'free_text', 'adaptive'];
const DEFAULT_CODING_FILTERS = { role: 'Front-end developer', language: '', difficulty: 'easy' };

const createInitialRubricPoints = () => CODING_RUBRICS.reduce((acc, name) => ({ ...acc, [name]: 5 }), {});

export function useSectionCreationDrawer({ dispatch, ACTIONS, state }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerStep, setDrawerStep] = useState('section');
  const [drawerType, setDrawerType] = useState('mcq');
  const [targetSectionId, setTargetSectionId] = useState(null);
  const [sectionName, setSectionName] = useState('');
  const [sectionTimer, setSectionTimer] = useState(45);
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
  const [adaptivePreset, setAdaptivePreset] = useState('balanced_technical');
  const [adaptiveAnchorId, setAdaptiveAnchorId] = useState('');
  const [adaptiveFocusAreas, setAdaptiveFocusAreas] = useState([]);
  const [adaptiveRoleTitle, setAdaptiveRoleTitle] = useState('');
  const [adaptiveQuestionMax, setAdaptiveQuestionMax] = useState(null);
  const [adaptiveMustAsk, setAdaptiveMustAsk] = useState('');
  const [adaptiveAvoidTopics, setAdaptiveAvoidTopics] = useState('');
  const [adaptiveFocusAreaOptions, setAdaptiveFocusAreaOptions] = useState([]);
  const [adaptiveCatalogAvailable, setAdaptiveCatalogAvailable] = useState(true);

  // Role and level come from the assessment, not the section — one requisition,
  // one role. Both are needed to ask the catalog what is actually scoreable.
  const assessmentRoleFamily = (state.config_json?.domain || state.domain || '').toLowerCase();
  const assessmentSeniority = (state.config_json?.seniority || state.seniority || '').toLowerCase();

  // Mirrors LeftPanel's SectionAllocation math — the section-timer budget
  // against the assessment's total duration. Kept unclamped here (can go
  // negative) so over-allocation is detectable, unlike the display version.
  const allocatedMinutes = state.sections.reduce((sum, s) => (
    sum + Number(s.timer_minutes ?? SECTION_TYPE_CONFIG[s.type]?.defaultTimerMinutes ?? 0)
  ), 0);
  const totalMinutes = Math.max(Number(state.duration_minutes) || allocatedMinutes || 0, 0);
  const remainingMinutes = totalMinutes - allocatedMinutes;

  const guardSectionBudget = (newSectionTimerMinutes) => {
    if (remainingMinutes <= 0) {
      toast.error('No time left to allocate', {
        description: 'Increase the assessment duration or shorten another section before adding a new one.',
      });
      return false;
    }
    if (Number(newSectionTimerMinutes) > remainingMinutes) {
      toast.error('Section timer exceeds remaining time', {
        description: `Only ${remainingMinutes} min left to allocate.`,
      });
      return false;
    }
    return true;
  };

  const guardQuestionBudget = () => {
    if (remainingMinutes <= 0) {
      toast.error('No time left to allocate', {
        description: 'Increase the assessment duration or shorten a section before adding more questions.',
      });
      return false;
    }
    return true;
  };

  const resetDrawerState = () => {
    setDrawerOpen(false);
    setDrawerStep('section');
    setDrawerType('mcq');
    setTargetSectionId(null);
    setSectionName('');
    setSectionTimer(45);
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
    setAdaptivePreset('balanced_technical');
    setAdaptiveAnchorId('');
    setAdaptiveFocusAreas([]);
    setAdaptiveRoleTitle('');
    setAdaptiveQuestionMax(null);
    setAdaptiveMustAsk('');
    setAdaptiveAvoidTopics('');
  };

  const closeDrawer = () => {
    resetDrawerState();
  };

  const openDrawer = (type, options = {}) => {
    setDrawerOpen(true);
    setDrawerType(type);
    setDrawerStep(options.step ?? 'section');
    setTargetSectionId(options.targetSectionId ?? null);
    setSectionTimer(type === 'adaptive' ? ADAPTIVE_DEFAULT_TIMER : 45);
    setAiLevel('chat');
    setPoints(type === 'adaptive' ? 100 : 5);
    if (type === 'adaptive') {
      // Seed with the role's focus areas so the section is valid without the
      // recruiter having to pick anything.
      setAdaptiveFocusAreas(ROLE_FOCUS_AREAS[assessmentRoleFamily] || []);
    }
  };

  const handleAddSection = (type, label) => {
    if (DRAWER_SECTION_TYPES.includes(type)) {
      openDrawer(type);
      return;
    }

    if (!guardSectionBudget(SECTION_TYPE_CONFIG[type]?.defaultTimerMinutes ?? 0)) return;

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
      if (!guardQuestionBudget()) return;
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      if (!guardSectionBudget(sectionTimer)) return;
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
      if (!guardQuestionBudget()) return;
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      if (!guardSectionBudget(sectionTimer)) return;
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
          override_timer_minutes: null,
          published: false,
          locked: false,
          prompt: questionPrompt.trim(),
          answer: freeTextAnswer.trim(),
          word_limit: Number(wordLimit),
          grading_hints: gradingHints.trim(),
    };

    if (targetSectionId) {
      if (!guardQuestionBudget()) return;
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      if (!guardSectionBudget(sectionTimer)) return;
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
          override_timer_minutes: null,
          published: false,
          locked: false,
          prompt: questionPrompt.trim(),
          grading_hints: gradingHints.trim(),
          items: normalizedItems,
    };

    if (targetSectionId) {
      if (!guardQuestionBudget()) return;
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      if (!guardSectionBudget(sectionTimer)) return;
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

  // Chips come from the engine catalog, not a hardcoded list: a focus area with
  // no catalog entry is discarded by the engine with no error, so the recruiter
  // would pick it and silently get neither a question nor a score for it.
  useEffect(() => {
    if (!drawerOpen || drawerType !== 'adaptive') return undefined;

    let cancelled = false;
    getAdaptiveFocusAreas({ role_family: assessmentRoleFamily, seniority: assessmentSeniority })
      .then(res => {
        if (cancelled) return;
        const data = res.data || res || {};
        const options = data.focus_areas || [];
        setAdaptiveFocusAreaOptions(options);
        setAdaptiveCatalogAvailable(data.catalog_available !== false);
        // Drop any pre-seeded selection the catalog cannot honour.
        setAdaptiveFocusAreas(current => {
          const allowed = current.filter(area => options.includes(area));
          return allowed.length > 0 ? allowed : options.slice(0, 4);
        });
      })
      .catch(() => {
        if (cancelled) return;
        // Fall back to the role defaults rather than blocking authoring.
        setAdaptiveFocusAreaOptions([]);
        setAdaptiveCatalogAvailable(false);
      });

    return () => { cancelled = true; };
  }, [drawerOpen, drawerType, assessmentRoleFamily, assessmentSeniority]);

  const adaptiveQuestionCount = useMemo(
    () => deriveQuestionCount(sectionTimer, adaptiveFocusAreas),
    [sectionTimer, adaptiveFocusAreas],
  );

  const toggleAdaptiveFocusArea = (focusArea) => {
    setAdaptiveFocusAreas(current => (
      current.includes(focusArea)
        ? current.filter(value => value !== focusArea)
        : [...current, focusArea]
    ));
  };

  const handleCreateAdaptive = () => {
    const splitLines = (value) => value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    // The recruiter can override the derived budget, but never past what the
    // competency cap allows — the engine 500s on the candidate's first question
    // if focusAreas x 2 < max.
    const derived = deriveQuestionCount(sectionTimer, adaptiveFocusAreas);
    const questionMax = adaptiveQuestionMax
      ? Math.min(Number(adaptiveQuestionMax), derived.max)
      : derived.max;

    const question = {
      id: crypto.randomUUID(),
      type: 'adaptive',
      backendItemId: null,
      points: Number(points),
      published: false,
      locked: false,
      adaptive_config: {
        preset: adaptivePreset,
        focus_areas: adaptiveFocusAreas,
        question_count: { min: Math.min(derived.min, questionMax), max: questionMax },
        // '' means "most recent coding section" — the backend resolves that from
        // a blank source id. Only the explicit 'none' option detaches the anchor.
        anchor: adaptiveAnchorId === 'none'
          ? { type: 'none', source_section_item_id: '', use_coding_task_as_anchor: false }
          : {
              type: 'coding_task',
              source_section_item_id: adaptiveAnchorId || '',
              use_coding_task_as_anchor: true,
            },
        ...(adaptiveRoleTitle.trim() ? { role_title: adaptiveRoleTitle.trim() } : {}),
        ...(adaptiveMustAsk.trim() ? { must_ask_questions: splitLines(adaptiveMustAsk) } : {}),
        ...(adaptiveAvoidTopics.trim() ? { avoid_topics: splitLines(adaptiveAvoidTopics) } : {}),
      },
    };

    if (targetSectionId) {
      if (!guardQuestionBudget()) return;
      dispatch({ type: ACTIONS.ADD_QUESTION, payload: { sectionId: targetSectionId, question } });
    } else {
      if (!guardSectionBudget(sectionTimer)) return;
      dispatch({
        type: ACTIONS.ADD_SECTION,
        payload: {
          name: sectionName.trim() || 'AI Adaptive Interview',
          type: 'adaptive',
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
      adaptivePreset,
      setAdaptivePreset,
      adaptiveAnchorId,
      setAdaptiveAnchorId,
      adaptiveFocusAreas,
      toggleAdaptiveFocusArea,
      adaptiveRoleTitle,
      setAdaptiveRoleTitle,
      adaptiveQuestionCount,
      adaptiveQuestionMax,
      setAdaptiveQuestionMax,
      adaptiveMustAsk,
      setAdaptiveMustAsk,
      adaptiveAvoidTopics,
      setAdaptiveAvoidTopics,
      adaptiveFocusAreaOptions,
      adaptiveCatalogAvailable,
      assessmentRoleFamily,
    },
    actions: {
      addSection: handleAddSection,
      createMcq: handleCreateMcq,
      createCoding: handleCreateCoding,
      createFreeText: handleCreateFreeText,
      createRanking: handleCreateRanking,
      createAdaptive: handleCreateAdaptive,
    },
  };
}

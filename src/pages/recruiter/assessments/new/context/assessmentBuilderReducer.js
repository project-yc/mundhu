// ─── Action types ──────────────────────────────────────────────────────────────
export const ACTIONS = {
  SET_DETAILS: 'SET_DETAILS',
  ADD_SECTION: 'ADD_SECTION',
  UPDATE_SECTION: 'UPDATE_SECTION',
  REMOVE_SECTION: 'REMOVE_SECTION',
  REORDER_SECTIONS: 'REORDER_SECTIONS',
  TOGGLE_SECTION_EXPANDED: 'TOGGLE_SECTION_EXPANDED',
  ADD_QUESTION: 'ADD_QUESTION',
  UPDATE_QUESTION: 'UPDATE_QUESTION',
  REMOVE_QUESTION: 'REMOVE_QUESTION',
  REORDER_QUESTIONS: 'REORDER_QUESTIONS',
  PUBLISH_QUESTION: 'PUBLISH_QUESTION',
  UNLOCK_QUESTION: 'UNLOCK_QUESTION',
  SET_ACTIVE: 'SET_ACTIVE',
  SET_STEP: 'SET_STEP',
};

// ─── Initial state ─────────────────────────────────────────────────────────────
export const initialState = {
  // Step 1
  name: '',
  description: '',
  duration_minutes: null,
  role: '',
  seniority: '',

  // Step 2
  sections: [],

  // Navigation
  currentStep: 1,
  activeSection: null,  // section.id or '__add_section__'
  activeQuestion: null, // question.id
};

// ─── Helper: create a blank MCQ question ──────────────────────────────────────
export function makeMcqQuestion() {
  return {
    id: crypto.randomUUID(),
    type: 'mcq',
    backendMcqId: null,
    backendItemId: null,
    points: 5,
    override_timer_minutes: null,
    published: false,
    locked: false,
    prompt: '',
    selection_mode: 'single',
    shuffle_options: false,
    show_explanation_after: false,
    options: [],
  };
}

export function makeFreeTextQuestion() {
  return {
    id: crypto.randomUUID(),
    type: 'free_text',
    backendFreeTextId: null,
    backendItemId: null,
    points: 10,
    override_timer_minutes: null,
    published: false,
    locked: false,
    prompt: '',
    word_limit: null,
    grading_hints: '',
  };
}

export function makeRankingQuestion() {
  return {
    id: crypto.randomUUID(),
    type: 'ranking',
    backendRankingId: null,
    backendItemId: null,
    points: 8,
    override_timer_minutes: null,
    published: false,
    locked: false,
    prompt: '',
    items: [],
  };
}

export function makeCodingItem() {
  return {
    id: crypto.randomUUID(),
    type: 'coding',
    task_id: null,
    task_data: null,
    published: false,
    locked: true,
  };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
export function assessmentBuilderReducer(state, action) {
  switch (action.type) {

    case ACTIONS.SET_DETAILS:
      return { ...state, ...action.payload };

    case ACTIONS.ADD_SECTION: {
      const newSection = {
        id: crypto.randomUUID(),
        backendId: null,
        name: action.payload.name,
        type: action.payload.type,
        timer_minutes: action.payload.timer_minutes ?? null,
        ai_level_override: action.payload.ai_level_override ?? null,
        expanded: true,
        items: [],
      };
      // If it's a non-coding section, seed with one blank question
      let items = [];
      if (action.payload.type === 'mcq') items = [makeMcqQuestion()];
      else if (action.payload.type === 'free_text') items = [makeFreeTextQuestion()];
      else if (action.payload.type === 'ranking') items = [makeRankingQuestion()];
      else if (action.payload.type === 'coding') items = [makeCodingItem()];

      newSection.items = items;
      const firstQuestion = items[0] ?? null;

      return {
        ...state,
        sections: [...state.sections, newSection],
        activeSection: newSection.id,
        activeQuestion: firstQuestion?.id ?? null,
      };
    }

    case ACTIONS.UPDATE_SECTION: {
      const { sectionId, updates } = action.payload;
      return {
        ...state,
        sections: state.sections.map(s =>
          s.id === sectionId ? { ...s, ...updates } : s
        ),
      };
    }

    case ACTIONS.REMOVE_SECTION: {
      const remaining = state.sections.filter(s => s.id !== action.payload.sectionId);
      const newActive = remaining.length > 0 ? remaining[0].id : null;
      const newQuestion = remaining.length > 0 && remaining[0].items.length > 0
        ? remaining[0].items[0].id
        : null;
      return {
        ...state,
        sections: remaining,
        activeSection: state.activeSection === action.payload.sectionId ? newActive : state.activeSection,
        activeQuestion: state.activeSection === action.payload.sectionId ? newQuestion : state.activeQuestion,
      };
    }

    case ACTIONS.REORDER_SECTIONS:
      return { ...state, sections: action.payload.sections };

    case ACTIONS.TOGGLE_SECTION_EXPANDED: {
      const { sectionId } = action.payload;
      return {
        ...state,
        sections: state.sections.map(s =>
          s.id === sectionId ? { ...s, expanded: !s.expanded } : s
        ),
      };
    }

    case ACTIONS.ADD_QUESTION: {
      const { sectionId, question } = action.payload;
      return {
        ...state,
        sections: state.sections.map(s =>
          s.id === sectionId
            ? { ...s, items: [...s.items, question], expanded: true }
            : s
        ),
        activeSection: sectionId,
        activeQuestion: question.id,
      };
    }

    case ACTIONS.UPDATE_QUESTION: {
      const { sectionId, questionId, updates } = action.payload;
      return {
        ...state,
        sections: state.sections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map(q =>
                  q.id === questionId ? { ...q, ...updates } : q
                ),
              }
            : s
        ),
      };
    }

    case ACTIONS.REMOVE_QUESTION: {
      const { sectionId, questionId } = action.payload;
      const updatedSections = state.sections.map(s => {
        if (s.id !== sectionId) return s;
        const items = s.items.filter(q => q.id !== questionId);
        return { ...s, items };
      });
      // Determine new active question
      const sec = updatedSections.find(s => s.id === sectionId);
      let newActiveQuestion = state.activeQuestion;
      if (state.activeQuestion === questionId) {
        newActiveQuestion = sec?.items?.[0]?.id ?? null;
      }
      return { ...state, sections: updatedSections, activeQuestion: newActiveQuestion };
    }

    case ACTIONS.REORDER_QUESTIONS: {
      const { sectionId, items } = action.payload;
      return {
        ...state,
        sections: state.sections.map(s =>
          s.id === sectionId ? { ...s, items } : s
        ),
      };
    }

    case ACTIONS.PUBLISH_QUESTION: {
      const { sectionId, questionId } = action.payload;
      return {
        ...state,
        sections: state.sections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map(q =>
                  q.id === questionId ? { ...q, published: true, locked: true } : q
                ),
              }
            : s
        ),
      };
    }

    case ACTIONS.UNLOCK_QUESTION: {
      const { sectionId, questionId } = action.payload;
      return {
        ...state,
        sections: state.sections.map(s =>
          s.id === sectionId
            ? {
                ...s,
                items: s.items.map(q =>
                  q.id === questionId ? { ...q, published: false, locked: false } : q
                ),
              }
            : s
        ),
      };
    }

    case ACTIONS.SET_ACTIVE:
      return {
        ...state,
        activeSection: action.payload.sectionId ?? state.activeSection,
        activeQuestion: action.payload.questionId ?? null,
      };

    case ACTIONS.SET_STEP:
      return { ...state, currentStep: action.payload };

    default:
      return state;
  }
}

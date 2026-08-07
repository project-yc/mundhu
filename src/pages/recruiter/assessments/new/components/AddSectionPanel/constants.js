import adaptiveCard from '../../../../../../assets/recruiter/images/adaptive_card.svg';
import codingIcon from '../../../../../../assets/recruiter/icons/coding.svg';
import freeTextIcon from '../../../../../../assets/recruiter/icons/free_text.svg';
import mcqIcon from '../../../../../../assets/recruiter/icons/mcq.svg';
import rankingIcon from '../../../../../../assets/recruiter/icons/ranking.svg';

export const SECTION_CARDS = [
  { type: 'mcq', label: 'MCQ section', icon: mcqIcon },
  { type: 'ranking', label: 'Ranking section', icon: rankingIcon },
  { type: 'free_text', label: 'Free Text section', icon: freeTextIcon },
  { type: 'coding', label: 'Coding section', icon: codingIcon },
];

export const ADAPTIVE_CARD_IMAGE = adaptiveCard;

export const TIMER_OPTIONS = [15, 30, 45, 60, 90];
export const POINT_OPTIONS = [5, 10, 15, 20];
export const AI_LEVEL_OPTIONS = [
  { value: 'chat', label: 'Chat only' },
  { value: 'full', label: 'Full agent' },
  { value: 'none', label: 'Disabled' },
];
export const CODING_RUBRICS = ['Problem solving process', 'Task Completion', 'AI Collaboration', 'Design Quality'];
export const FILTER_ROLES = ['Front-end developer', 'QA engineer', 'QA engineer', 'Front-end developer', 'Front-end developer'];
export const LANGUAGE_OPTIONS = ['', 'Python', 'JavaScript', 'Ruby', 'C++', 'Go', 'Java'];
export const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'adaptive'];
export const WORD_LIMIT_OPTIONS = [50, 100, 150, 200, 300];
export const DRAWER_CLOSE_MS = 380;
export const DRAWER_TYPE_LABELS = {
  mcq: 'MCQ',
  coding: 'coding',
  ranking: 'ranking',
  free_text: 'free text',
  adaptive: 'AI adaptive interview',
};

// --- Adaptive interview -----------------------------------------------------
// Mirrors the backend's AdaptiveInterviewConfigSerializer. Only the fields a
// recruiter should decide are here; question_mix, design_depth and role_topics
// are left to the preset, and role/seniority/language come from the assessment.

export const ADAPTIVE_PRESET_OPTIONS = [
  { value: 'balanced_technical', label: 'Balanced technical', hint: 'Mix of task follow-up and role topics' },
  { value: 'coding_task_followup', label: 'Coding task follow-up', hint: 'Every question grounded in their submitted code' },
  { value: 'role_specific', label: 'Role specific', hint: 'Weighted toward role topics over their task' },
  { value: 'system_design_path', label: 'System design', hint: 'Design-heavy probing' },
  { value: 'architecture_deep_dive', label: 'Architecture deep dive', hint: 'Most design-heavy; best above mid level' },
];

// The 14 universal focus areas plus the per-role sets, kept in sync with
// UNIVERSAL_FOCUS_AREAS / ROLE_FOCUS_AREA_DEFAULTS in
// backend/core/assessments/services/adaptive_interview_config.py.
export const UNIVERSAL_FOCUS_AREAS = [
  'implementation_reasoning', 'debugging', 'testing_validation', 'edge_cases',
  'code_maintainability', 'design_tradeoffs', 'performance_scalability', 'api_design',
  'data_modeling', 'system_design', 'reliability', 'security',
  'ai_tool_usage', 'communication_clarity',
];

export const ROLE_FOCUS_AREAS = {
  backend: ['api_design', 'data_modeling', 'reliability', 'performance_scalability'],
  frontend: ['component_architecture', 'state_management', 'data_fetching', 'accessibility', 'frontend_performance'],
  fullstack: ['api_contracts', 'client_server_validation', 'end_to_end_data_flow'],
  data: ['sql', 'etl_pipelines', 'data_modeling', 'data_quality'],
  data_science: ['sql', 'experiment_design', 'metrics_definition', 'analytics_reasoning'],
  devops: ['ci_cd', 'observability', 'incident_response', 'infrastructure_design'],
  security: ['threat_modeling', 'secure_coding', 'incident_response', 'security'],
  mobile: ['mobile_architecture', 'offline_sync', 'performance_scalability', 'ux_tradeoffs'],
  llm_engineering: ['prompting', 'rag_retrieval', 'llm_tool_use', 'ai_safety_guardrails', 'agent_design', 'model_evaluation', 'latency_cost_tradeoffs'],
  ai_ml: ['model_evaluation', 'feature_engineering', 'experiment_design', 'ml_modeling'],
  mlops: ['model_deployment', 'monitoring_drift', 'serving_reliability', 'mlops_pipelines', 'infrastructure_design'],
};

export const ADAPTIVE_TIMER_OPTIONS = [10, 15, 20, 30, 45];
export const ADAPTIVE_DEFAULT_TIMER = 20;

// Roughly three minutes per question — an answer plus the model's turn. The
// engine terminates on the question budget, not the clock, so this only sets
// the budget; the timer is the hard stop.
export const MINUTES_PER_QUESTION = 3;
export const MAX_QUESTIONS_PER_COMPETENCY = 2;
export const ADAPTIVE_QUESTION_CEILING = 12;

export const formatFocusAreaLabel = (value) => (
  String(value || '')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
);

/**
 * Derive the question budget from the section duration.
 *
 * Clamped by the competency cap because the engine raises a bare ValueError when
 * `focusAreas x MAX_QUESTIONS_PER_COMPETENCY < max` — which escapes as a 500 on
 * the candidate's first question rather than an authoring-time error.
 */
export const deriveQuestionCount = (timerMinutes, focusAreas = []) => {
  const fromDuration = Math.floor((Number(timerMinutes) || ADAPTIVE_DEFAULT_TIMER) / MINUTES_PER_QUESTION);
  const competencyCap = Math.max(focusAreas.length, 1) * MAX_QUESTIONS_PER_COMPETENCY;
  const max = Math.max(1, Math.min(fromDuration, competencyCap, ADAPTIVE_QUESTION_CEILING));
  return { min: Math.max(1, Math.min(3, max)), max };
};

export const FALLBACK_CODING_TASKS = [
  { id: 'fallback-campus-lost-found', title: 'Campus lost and found System', language: 'Python', tags: ['FastAPI', 'Backend'], domain: 'backend' },
  { id: 'fallback-course-marketplace', title: 'Online Course Marketplace', language: 'JavaScript', tags: ['React', 'Frontend'], domain: 'frontend' },
  { id: 'fallback-budget-tracker', title: 'Personal Budget Tracker', language: 'Ruby', tags: ['Rails', 'Full Stack'], domain: 'fullstack' },
  { id: 'fallback-smart-home', title: 'Smart Home Automation', language: 'C++', tags: ['MQTT', 'IoT Development'], domain: 'iot' },
];

export const createInitialOptions = () => [
  { id: crypto.randomUUID(), text: 'Option 1', is_correct: true },
  { id: crypto.randomUUID(), text: '', is_correct: false },
  { id: crypto.randomUUID(), text: '', is_correct: false },
];

export const createInitialRankingItems = () => [
  { id: crypto.randomUUID(), text: '' },
  { id: crypto.randomUUID(), text: '' },
];

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

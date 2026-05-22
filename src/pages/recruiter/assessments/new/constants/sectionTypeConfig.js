import {
  IconTerminal2,
  IconCheckbox,
  IconWriting,
  IconSortAscending,
} from '@tabler/icons-react';

export const SECTION_TYPE_CONFIG = {
  coding: {
    label: 'Coding',
    dot: 'bg-sky-500',
    badge: 'bg-sky-100 text-sky-700',
    Icon: IconTerminal2,
    defaultTimerMinutes: 90,
  },
  mcq: {
    label: 'MCQ',
    dot: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700',
    Icon: IconCheckbox,
    defaultTimerMinutes: 20,
  },
  free_text: {
    label: 'Free text',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    Icon: IconWriting,
    defaultTimerMinutes: 15,
  },
  ranking: {
    label: 'Ranking',
    dot: 'bg-violet-500',
    badge: 'bg-violet-100 text-violet-700',
    Icon: IconSortAscending,
    defaultTimerMinutes: 10,
  },
};

export const AI_LEVEL_LABELS = {
  full: 'Full agent',
  chat: 'Chat only',
  none: 'Disabled',
};

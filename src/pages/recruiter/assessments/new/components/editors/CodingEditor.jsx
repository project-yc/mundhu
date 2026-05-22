import { useState, useEffect } from 'react';
import { IconTerminal2, IconClock, IconSearch, IconRobot } from '@tabler/icons-react';
import { useAssessmentBuilder } from '../../context/AssessmentBuilderContext';
import { getLibraryTasks } from '../../api/assessmentBuilderApi';

function TaskCard({ task, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(task)}
      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-150 ${
        selected
          ? 'border-brand bg-brand/5'
          : 'border-border-default hover:border-border-strong hover:bg-surface-muted'
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
        <IconTerminal2 size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-primary truncate">{task.name || task.title}</p>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {task.tags?.map(t => (
            <span key={t} className="px-1.5 py-0.5 bg-surface-muted border border-border-default rounded text-[10px] text-text-secondary">{t}</span>
          ))}
          {task.difficulty && (
            <span className="px-1.5 py-0.5 bg-surface-muted border border-border-default rounded text-[10px] text-text-secondary capitalize">{task.difficulty}</span>
          )}
        </div>
      </div>
    </button>
  );
}

export function CodingEditor({ sectionId, item }) {
  const { dispatch, ACTIONS, state } = useAssessmentBuilder();
  const section = state.sections.find(s => s.id === sectionId);

  const [libraryTasks, setLibraryTasks] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('library'); // 'library' | 'details'
  const [libError, setLibError] = useState('');

  useEffect(() => {
    setLoadingLibrary(true);
    setLibError('');
    getLibraryTasks()
      .then(res => setLibraryTasks(res.data || res || []))
      .catch(e => setLibError(e.message))
      .finally(() => setLoadingLibrary(false));
  }, []);

  const updateItem = (updates) => {
    dispatch({ type: ACTIONS.UPDATE_QUESTION, payload: { sectionId, questionId: item.id, updates } });
  };

  const updateSection = (updates) => {
    dispatch({ type: ACTIONS.UPDATE_SECTION, payload: { sectionId, updates } });
  };

  const filteredTasks = libraryTasks.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.name || t.title || '').toLowerCase().includes(q) ||
      t.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[640px] mx-auto px-6 py-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 text-sky-700 text-[12px] font-semibold rounded-lg">
          <IconTerminal2 size={13} /> Coding
        </span>
        <div className="flex gap-1 bg-surface-muted border border-border-default rounded-lg p-0.5">
          {['library', 'details'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab === 'library' ? 'Library' : 'Details'}
            </button>
          ))}
        </div>
      </div>

      {/* Section timer + AI level */}
      <div className="flex items-center gap-6 text-[13px] text-text-secondary">
        <div className="flex items-center gap-2">
          <IconClock size={14} className="text-text-muted" />
          <span>Section timer</span>
          <input
            type="number"
            min={1}
          max={480}
          value={section?.timer_minutes ?? ''}
          onChange={e => updateSection({ timer_minutes: e.target.value ? Number(e.target.value) : null })}
          placeholder="—"
            className="w-16 px-2.5 py-1.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-brand"
          />
          <span>min</span>
        </div>
        <div className="flex items-center gap-2">
          <IconRobot size={14} className="text-text-muted" />
          <span>AI level</span>
          <select
            value={section?.ai_level_override ?? ''}
            onChange={e => updateSection({ ai_level_override: e.target.value || null })}
            className="px-2.5 py-1.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary focus:outline-none focus:border-brand"
          >
            <option value="">Default</option>
            <option value="full">Full agent</option>
            <option value="chat">Chat only</option>
            <option value="none">Disabled</option>
          </select>
        </div>
      </div>

      {/* Locked banner */}

      {/* Content area */}
      <div className="space-y-3">
        {/* Attached task */}
        {item.task_data && (
          <div className="relative">
            <TaskCard task={item.task_data} selected />
            <button
              onClick={() => updateItem({ task_id: null, task_data: null })}
              className="absolute top-2 right-2 text-[11px] text-text-muted hover:text-error px-2 py-0.5 rounded"
            >
              × remove
            </button>
          </div>
        )}

        {activeTab === 'library' && (
          <>
            {item.task_data && (
              <p className="text-[11px] text-text-muted uppercase tracking-widest font-semibold">Other tasks in library</p>
            )}

            {/* Search */}
            <div className="relative">
              <IconSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search library tasks…"
                className="w-full pl-9 pr-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20"
              />
            </div>

            {libError && <p className="text-[12px] text-error">{libError}</p>}
            {loadingLibrary && <p className="text-[12px] text-text-muted">Loading library…</p>}

            <div className="space-y-2">
              {filteredTasks
                .filter(t => t.id !== item.task_id)
                .map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    selected={item.task_id === task.id}
                    onSelect={t => updateItem({ task_id: t.id, task_data: t })}
                  />
                ))}
              {!loadingLibrary && filteredTasks.length === 0 && (
                <p className="text-[13px] text-text-muted py-4 text-center">No tasks found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

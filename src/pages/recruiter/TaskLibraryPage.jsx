// TaskLibraryPage — B2B task library browser for recruiters
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, ChevronDown, ChevronRight, Plus, SlidersHorizontal,
  ArrowUpDown, Loader, AlertCircle, Library, CheckCircle2, Pencil,
} from 'lucide-react';
import { getLibraryTasks } from '../../api/recruiter/assessment.jsx';
import { Button } from '../../components/ui/button.jsx';
import { Input } from '../../components/ui/input.jsx';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '../../components/ui/select.jsx';
import { Badge } from '../../components/ui/badge.jsx';
import {
  Collapsible, CollapsibleContent,
} from '../../components/ui/collapsible.jsx';
import { AskAnythingBar } from '../../components/recruiter/AskAnythingBar.jsx';

// ─── constants ────────────────────────────────────────────────────────────────
const DIFFICULTY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const ROLE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'staff', label: 'Staff' },
  { value: 'principal', label: 'Principal' },
];

const DOMAIN_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'frontend', label: 'Front-end' },
  { value: 'backend', label: 'Backend' },
  { value: 'fullstack', label: 'Full Stack' },
  { value: 'devops', label: 'DevOps' },
  { value: 'data', label: 'Data' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'security', label: 'Security' },
];

const LANGUAGE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Python', label: 'Python' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Java', label: 'Java' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
  { value: 'C++', label: 'C++' },
];

const SECTION_COLORS = {
  mcq: 'bg-success',
  coding: 'bg-[#E91E8C]',
};

// ─── sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ label, count, color, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 px-4 py-3 rounded-lg bg-surface-muted/60 hover:bg-surface-muted transition-colors text-left"
    >
      {open ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
      <span className={`w-1 h-5 rounded-full flex-shrink-0 ${color}`} />
      <span className="text-[14px] font-bold text-text-primary">{label}</span>
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-tint text-brand text-[11px] font-bold">
        {count}
      </span>
      <span className="ml-auto">
        <Plus className="w-4 h-4 text-text-muted" />
      </span>
    </button>
  );
}

function TaskRow({ task }) {
  const options = task.options || task.choices || [];
  const correctIndex = task.correct_answer_index ?? task.correct_option;

  return (
    <div className="flex items-start gap-4 px-4 py-4 border-b border-border-subtle last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <span className="text-[14px] font-bold text-text-primary">{task.title}</span>
          <Badge variant="default" className="bg-brand-tint text-brand border-brand-border/30 text-[11px] font-bold px-2 py-0.5">
            {(task.task_type || task.type || 'MCQ').toUpperCase()}
          </Badge>
          <span className="text-text-faint">·</span>
          <span className="text-[12px] text-text-secondary font-medium capitalize">{task.difficulty || 'Medium'}</span>
          <span className="text-text-faint">·</span>
          <span className="text-[12px] text-text-secondary font-medium capitalize">{task.domain || 'Front-end'}</span>
          <span className="text-text-faint">·</span>
          <span className="text-[12px] text-text-secondary font-medium capitalize">{task.seniority || 'Senior'}</span>
          <span className="text-text-faint">·</span>
          <span className="text-[12px] text-text-secondary font-medium">{task.language || 'Python'}</span>
        </div>

        {options.length > 0 && (
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
            {options.map((opt, i) => {
              const isCorrect = i === correctIndex;
              const label = String.fromCharCode(65 + i);
              return (
                <span
                  key={i}
                  className={`text-[13px] font-medium ${
                    isCorrect ? 'text-success font-semibold' : 'text-text-secondary'
                  }`}
                >
                  {label}. {opt}
                  {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 inline ml-1 text-success" />}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="flex-shrink-0 h-8 px-4 text-[13px]">
        <Pencil className="w-3.5 h-3.5 mr-1.5" />
        Edit
      </Button>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function TaskLibraryPage() {
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ difficulty: '', seniority: '', domain: '', language: '' });
  const [openSections, setOpenSections] = useState({ mcq: true });

  const doFetch = useCallback(async (f, s) => {
    setLoading(true);
    setError('');
    try {
      const data = await getLibraryTasks({ ...f, search: s.trim() || undefined });
      setAllTasks((data.data ?? data) || []);
    } catch (err) {
      setError(err.message || 'Failed to load task library.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getLibraryTasks({ ...filters, search: search.trim() || undefined });
        if (!cancelled) setAllTasks((data.data ?? data) || []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load task library.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleFilterChange = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    doFetch(next, search);
  };

  const groupedTasks = useMemo(() => {
    const groups = { mcq: [], coding: [] };
    for (const task of allTasks) {
      const type = (task.task_type || task.type || 'mcq').toLowerCase();
      if (type === 'coding' || type === 'code') {
        groups.coding.push(task);
      } else {
        groups.mcq.push(task);
      }
    }
    return groups;
  }, [allTasks]);

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-page">
      <AskAnythingBar />

      {/* Single unified card — header + tabs/filters + content all live inside one container */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3">
        <div className="bg-surface rounded-lg border border-border-subtle min-h-[calc(100vh-70px)] flex flex-col">

          {/* Header block (title, search, create button) */}
          <div className="flex-shrink-0 px-6 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-bold text-text-primary font-display leading-tight">Task Library</h1>
                <p className="text-[13px] text-text-secondary mt-0.5">
                  {allTasks.length} question sets · Browse and add to assessments
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doFetch(filters, search)}
                    placeholder="Search for library tasks..."
                    className="pl-9 pr-8 w-72 h-10 text-[14px]"
                  />
                  {search && (
                    <button
                      onClick={() => { setSearch(''); doFetch(filters, ''); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    >
                      ×
                    </button>
                  )}
                </div>
                <Button variant="cta" size="default" className="h-10 px-5">
                  Create task
                </Button>
              </div>
            </div>

            {/* Tabs + Filters row */}
            <div className="flex items-center justify-between mt-5 gap-4">
              <Tabs defaultValue="task-library" className="w-auto">
                <TabsList className="h-9 bg-surface-muted">
                  <TabsTrigger value="task-library" className="text-[13px] px-5 h-7">Task library</TabsTrigger>
                  <TabsTrigger value="my-library" className="text-[13px] px-5 h-7">My library</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <Select value={filters.difficulty} onValueChange={v => handleFilterChange('difficulty', v)}>
                  <SelectTrigger className="w-[130px] h-9 text-[13px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.seniority} onValueChange={v => handleFilterChange('seniority', v)}>
                  <SelectTrigger className="w-[110px] h-9 text-[13px]">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.domain} onValueChange={v => handleFilterChange('domain', v)}>
                  <SelectTrigger className="w-[120px] h-9 text-[13px]">
                    <SelectValue placeholder="Domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOMAIN_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filters.language} onValueChange={v => handleFilterChange('language', v)}>
                  <SelectTrigger className="w-[130px] h-9 text-[13px]">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-border-default text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
                <button className="h-9 w-9 flex items-center justify-center rounded-lg border border-border-default text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors">
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Divider between header block and list content */}
          <div className="border-t border-border-subtle" />

          {/* Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-text-muted py-20">
                <Loader className="w-5 h-5 animate-spin" />
                <span className="text-[13px]">Loading task library…</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-3 px-5 py-4 bg-error-bg border border-error-border rounded-xl m-6">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-error">{error}</p>
              </div>
            ) : allTasks.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-20 text-text-muted">
                <Library className="w-10 h-10 opacity-25" />
                <p className="text-[14px] font-semibold text-text-secondary">No tasks found</p>
                <p className="text-[12px] text-center max-w-xs">
                  Try adjusting your filters or clearing the search.
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-3">
                {/* MCQ Section */}
                {groupedTasks.mcq.length > 0 && (
                  <Collapsible open={openSections.mcq !== false} onOpenChange={() => toggleSection('mcq')}>
                    <SectionHeader
                      label="MCQ Section"
                      count={groupedTasks.mcq.length}
                      color={SECTION_COLORS.mcq}
                      open={openSections.mcq !== false}
                      onToggle={() => toggleSection('mcq')}
                    />
                    <CollapsibleContent>
                      <div className="bg-surface border border-border-subtle rounded-b-lg mt-1 divide-y divide-border-subtle">
                        {groupedTasks.mcq.map(task => (
                          <TaskRow key={task.id} task={task} />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Coding Sections */}
                {groupedTasks.coding.length > 0 && (
                  <Collapsible open={openSections.coding || false} onOpenChange={() => toggleSection('coding')}>
                    <SectionHeader
                      label="Coding"
                      count={groupedTasks.coding.length}
                      color={SECTION_COLORS.coding}
                      open={!!openSections.coding}
                      onToggle={() => toggleSection('coding')}
                    />
                    <CollapsibleContent>
                      <div className="bg-surface border border-border-subtle rounded-b-lg mt-1 divide-y divide-border-subtle">
                        {groupedTasks.coding.map(task => (
                          <TaskRow key={task.id} task={task} />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {/* Additional collapsed coding sections to match screenshot */}
                {groupedTasks.coding.length === 0 && groupedTasks.mcq.length > 0 && (
                  <>
                    <Collapsible open={false}>
                      <SectionHeader label="Coding" count={0} color={SECTION_COLORS.coding} open={false} onToggle={() => {}} />
                    </Collapsible>
                    <Collapsible open={false}>
                      <SectionHeader label="Coding" count={0} color={SECTION_COLORS.coding} open={false} onToggle={() => {}} />
                    </Collapsible>
                    <Collapsible open={false}>
                      <SectionHeader label="Coding" count={0} color={SECTION_COLORS.coding} open={false} onToggle={() => {}} />
                    </Collapsible>
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
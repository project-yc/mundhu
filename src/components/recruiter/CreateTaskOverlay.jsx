// components/recruiter/CreateTaskOverlay.jsx
//
// Right-side overlay used by the "Create task" flow.
// Stage 1 ("form")      — title / domain / role / difficulty + file dropzone
// Stage 2 ("generating") — brief loading state while "AI" processes the file
// Stage 3 ("review")     — generated questions, per-type rendering, select/edit/view
//
// Wiring notes for you:
//   - `onGenerate` is where you plug in the real upload + AI-generation API call.
//     Right now it's mocked with setTimeout + sample data so the UI is fully
//     demoable end to end. Swap MOCK_GENERATORS / the generate() function for
//     your real request, keep the same shape: an array of question objects.
//   - `onSave(selectedQuestions, meta)` fires when the user hits
//     "Save to task library" from the review stage — wire your real save/API
//     call there.
//   - Coding task types intentionally aren't handled here yet (out of scope
//     for this pass, per your last message).

import { useState, useRef, useCallback } from 'react';
import {
  UploadCloud, FileText, ChevronLeft, Pencil, Eye, EyeOff,
  CheckCircle2, Loader2, GripVertical, X as XIcon,
} from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle,
} from '../ui/sheet.jsx';
import { Button } from '../ui/button.jsx';
import { Input } from '../ui/input.jsx';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '../ui/select.jsx';
import { Badge } from '../ui/badge.jsx';
import { inspectQuestionFile, parseQuestionFile } from '../../api/recruiter/taskLibrary.js';

// ─── type-specific config ──────────────────────────────────────────────────
// The accepted formats are the ones actually parsed. They once promised .docx
// and .pdf while the generator ignored the file entirely and returned hardcoded
// samples; now a spreadsheet or a Word table routes through the same column
// mapping a CSV does, and prose documents are read directly.
const ACCEPTED_FILE_TYPES = '.csv,.tsv,.xlsx,.xlsm,.docx,.pdf';

const TYPE_CONFIG = {
  mcq: {
    label: 'MCQ',
    dropHint: 'Drop a question bank',
    columnsHint: '.csv .xlsx .docx .pdf — you confirm the columns next',
  },
  ranking: {
    label: 'Ranking',
    dropHint: 'Drop a question bank',
    columnsHint: '.csv .xlsx .docx .pdf — you confirm the columns next',
  },
  free_text: {
    label: 'Free Text',
    dropHint: 'Drop a question bank',
    columnsHint: '.csv .xlsx .docx .pdf — you confirm the columns next',
  },
};

// Fallback labels for the mapping panel. The server sends `mapping_labels` with
// every inspection; these only cover the window before it arrives.
const DEFAULT_MAPPING_LABELS = {
  prompt: 'Question text',
  options: 'Answer options',
  correct: 'Correct answer',
  explanation: 'Explanation (optional)',
};

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

/**
 * A blank question of the given type.
 *
 * Manual entry reuses the review stage's existing per-type editors rather than
 * introducing a second set of forms — you get an empty question opened in edit
 * mode, and "Add another" appends more.
 */
function blankQuestion(type) {
  const base = { id: crypto.randomUUID(), question: '' };

  if (type === 'ranking') {
    return { ...base, items: ['', '', ''] };
  }
  if (type === 'free_text') {
    // Two fields, not one. `sample_answer` is the model answer and
    // `grading_hints` is advice to the grader — free_text_ai_scoring puts them
    // in separate blocks. They used to be a single "Model answer / guideline"
    // box that was saved as grading_hints, so no model answer ever existed.
    return { ...base, sample_answer: '', grading_hints: '' };
  }
  return {
    ...base,
    options: [
      { text: '', is_correct: true },
      { text: '', is_correct: false },
    ],
  };
}

/** A question the user started but left empty — not worth saving. */
function isBlankQuestion(question) {
  return !(question.question || '').trim();
}

// ─── small building blocks ─────────────────────────────────────────────────
function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-surface-muted rounded-full">
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 h-9 rounded-full text-[13px] font-semibold transition-all duration-150 ${
              active
                ? 'bg-surface text-text-primary shadow-sm border border-border-subtle'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="text-[13px] font-bold text-text-primary mb-2 block">{children}</label>;
}

/** One column picker in the mapping step. */
function MappingField({ label, value, columns, onChange, allowNone = false }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <Select value={value || '__none__'} onValueChange={v => onChange(v === '__none__' ? '' : v)}>
        <SelectTrigger className="h-10 text-[13px]">
          <SelectValue placeholder="Select a column" />
        </SelectTrigger>
        <SelectContent>
          {allowNone && <SelectItem value="__none__">None</SelectItem>}
          {columns.map(column => (
            <SelectItem key={column} value={column}>{column}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── question review cards (per type) ──────────────────────────────────────
function QuestionCardShell({
  index, question, selected, onToggleSelect, detailMode, onToggleView, onToggleEdit, children,
}) {
  return (
    <div
      className={`rounded-xl border transition-colors duration-150 ${
        selected ? 'border-brand/40 bg-brand-tint/20' : 'border-border-subtle bg-surface'
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-1 w-4 h-4 rounded border-border-default accent-brand cursor-pointer flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[11px] font-bold text-text-muted">Q{index + 1}</span>
          </div>
          <p className={`text-[14px] font-semibold leading-snug ${
            question.question ? 'text-text-primary' : 'text-text-muted italic'
          }`}>
            {question.question || 'Untitled — open the pencil to write this question'}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            type="button"
            onClick={onToggleView}
            title={detailMode === 'view' ? 'Hide details' : 'View details'}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors duration-150"
          >
            {detailMode === 'view' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={onToggleEdit}
            title={detailMode === 'edit' ? 'Done editing' : 'Edit question'}
            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors duration-150 ${
              detailMode === 'edit'
                ? 'text-brand bg-brand-tint'
                : 'text-text-muted hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {detailMode && (
        <div className="px-4 pb-4 pt-0 animate-in fade-in-0 slide-in-from-top-1 duration-150">
          <div className="border-t border-border-subtle pt-3">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function McqDetail({ question, editing, onChange }) {
  const updateOption = (i, field, val) => {
    const next = question.options.map((o, idx) => {
      if (field === 'is_correct') {
        return { ...o, is_correct: idx === i };
      }
      return idx === i ? { ...o, [field]: val } : o;
    });
    onChange({ ...question, options: next });
  };

  if (editing) {
    return (
      <div className="space-y-3">
        <textarea
          value={question.question}
          onChange={e => onChange({ ...question, question: e.target.value })}
          className="w-full text-[13px] rounded-lg border border-border-subtle px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
          rows={2}
        />
        <div className="space-y-2">
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={opt.is_correct}
                onChange={() => updateOption(i, 'is_correct', true)}
                className="w-4 h-4 accent-success flex-shrink-0"
              />
              <span className="text-[12px] font-bold text-text-muted w-4">{String.fromCharCode(65 + i)}</span>
              <input
                value={opt.text}
                onChange={e => updateOption(i, 'text', e.target.value)}
                className="flex-1 text-[13px] rounded-lg border border-border-subtle px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
      {question.options.map((opt, i) => (
        <span
          key={i}
          className={`text-[13px] font-medium ${opt.is_correct ? 'text-success font-semibold' : 'text-text-secondary'}`}
        >
          {String.fromCharCode(65 + i)}. {opt.text}
          {opt.is_correct && <CheckCircle2 className="w-3.5 h-3.5 inline ml-1 text-success" />}
        </span>
      ))}
    </div>
  );
}

function RankingDetail({ question, editing, onChange }) {
  if (editing) {
    return (
      <div className="space-y-3">
        <textarea
          value={question.question}
          onChange={e => onChange({ ...question, question: e.target.value })}
          className="w-full text-[13px] rounded-lg border border-border-subtle px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
          rows={2}
        />
        <div className="space-y-2">
          {question.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-text-muted w-4">{i + 1}</span>
              <input
                value={item}
                onChange={e => {
                  const next = question.items.map((it, idx) => (idx === i ? e.target.value : it));
                  onChange({ ...question, items: next });
                }}
                className="flex-1 text-[13px] rounded-lg border border-border-subtle px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {question.items.map((item, i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-warning/15 text-warning text-[11px] font-bold flex-shrink-0">
            {i + 1}
          </span>
          <GripVertical className="w-3.5 h-3.5 text-text-faint flex-shrink-0" />
          <span className="text-[13px] text-text-secondary font-medium">{item}</span>
        </div>
      ))}
    </div>
  );
}

function FreeTextDetail({ question, editing, onChange }) {
  if (editing) {
    return (
      <div className="space-y-3">
        <textarea
          value={question.question}
          onChange={e => onChange({ ...question, question: e.target.value })}
          className="w-full text-[13px] rounded-lg border border-border-subtle px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
          rows={2}
        />
        <div>
          <span className="text-[11px] font-bold text-text-muted mb-1 block">Model answer</span>
          <textarea
            value={question.sample_answer || ''}
            onChange={e => onChange({ ...question, sample_answer: e.target.value })}
            className="w-full text-[13px] rounded-lg border border-border-subtle px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
            rows={3}
          />
        </div>
        <div>
          <span className="text-[11px] font-bold text-text-muted mb-1 block">Grading hints</span>
          <textarea
            value={question.grading_hints || ''}
            onChange={e => onChange({ ...question, grading_hints: e.target.value })}
            className="w-full text-[13px] rounded-lg border border-border-subtle px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
            rows={2}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg bg-info/10 border border-info/20 px-3 py-2.5">
        <span className="text-[11px] font-bold text-info block mb-0.5">Model answer</span>
        <p className="text-[13px] text-text-secondary italic leading-snug">
          {question.sample_answer || '—'}
        </p>
      </div>
      {question.grading_hints && (
        <div className="rounded-lg bg-surface-muted border border-border-subtle px-3 py-2.5">
          <span className="text-[11px] font-bold text-text-muted block mb-0.5">Grading hints</span>
          <p className="text-[13px] text-text-secondary italic leading-snug">
            {question.grading_hints}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailRenderer({ type, ...props }) {
  if (type === 'mcq') return <McqDetail {...props} />;
  if (type === 'ranking') return <RankingDetail {...props} />;
  return <FreeTextDetail {...props} />;
}

// ─── main component ─────────────────────────────────────────────────────────
/**
 * @param inheritsMetadata  When true (the assessment builder), domain/role/
 *   difficulty are hidden because the section already carries them — the panel
 *   becomes upload → confirm columns → review. The standalone library shows them
 *   as tags applied to the whole batch.
 */
export default function CreateTaskOverlay({
  open, onOpenChange, taskType, domainOptions = [], roleOptions = [], onSave,
  inheritsMetadata = false,
}) {
  // 'mapping' sits where the fake "generating" delay used to: a wrong column
  // mapping is wrong for every row, so it is confirmed once, before parsing,
  // rather than discovered while reviewing forty broken questions.
  const [stage, setStage] = useState('form'); // 'form' | 'generating' | 'mapping' | 'review'
  const [form, setForm] = useState({ title: '', domain: '', role: '', difficulty: 'easy' });
  const [dragOver, setDragOver] = useState(false);
  // Holds the File itself — `parse` re-sends it with the confirmed mapping.
  const [fileName, setFileName] = useState(null);
  // 'upload' parses a question bank; 'manual' authors questions by hand. Both
  // land in the same review stage and save through the same path.
  const [entryMode, setEntryMode] = useState('upload');
  const [inspection, setInspection] = useState(null);
  const [mapping, setMapping] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [importError, setImportError] = useState('');
  // 'mapping' (columns confirmed by a human), 'structural' (read by pattern) or
  // 'ai' (a model segmented it and every string was checked back against the
  // source). Shown in review so the reviewer knows how hard to look.
  const [parseSource, setParseSource] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detail, setDetail] = useState({ id: null, mode: null }); // mode: 'view' | 'edit'
  const fileInputRef = useRef(null);

  const config = TYPE_CONFIG[taskType] || TYPE_CONFIG.mcq;
  // The server names the columns per type, so the panel does not carry a copy
  // of the mapping rules that could drift from the parser's.
  const mappingLabels = inspection?.mapping_labels || DEFAULT_MAPPING_LABELS;

  const resetAll = useCallback(() => {
    setStage('form');
    setEntryMode('upload');
    setForm({ title: '', domain: '', role: '', difficulty: 'easy' });
    setFileName(null);
    setInspection(null);
    setMapping(null);
    setWarnings([]);
    setImportError('');
    setQuestions([]);
    setSelectedIds(new Set());
    setDetail({ id: null, mode: null });
    setParseSource(null);
    // Setters are stable, but the React Compiler wants them declared.
  }, [
    setStage, setEntryMode, setForm, setFileName, setInspection, setMapping,
    setWarnings, setImportError, setQuestions, setSelectedIds, setDetail,
    setParseSource,
  ]);

  /** Start authoring by hand: one blank question, opened in edit mode. */
  const startManualEntry = useCallback(() => {
    const question = blankQuestion(taskType);
    setQuestions([question]);
    setSelectedIds(new Set([question.id]));
    setWarnings([]);
    setImportError('');
    setDetail({ id: question.id, mode: 'edit' });
    setStage('review');
  }, [taskType]);

  /** Append another blank question while authoring. */
  const addManualQuestion = useCallback(() => {
    const question = blankQuestion(taskType);
    setQuestions(prev => [...prev, question]);
    setSelectedIds(prev => new Set([...prev, question.id]));
    setDetail({ id: question.id, mode: 'edit' });
  }, [taskType]);

  const handleOpenChange = (next) => {
    onOpenChange(next);
    if (!next) setTimeout(resetAll, 200); // wait for close animation
  };

  /**
   * Upload -> mapping -> review.
   *
   * This used to keep `file.name`, drop the file, and hand back five hardcoded
   * samples that `onSave` then wrote to My Library as real rows. The file is now
   * actually read: the server proposes a column mapping from the headers, the
   * user confirms or corrects it, and only then is every row parsed.
   */
  const acceptParsed = useCallback((data) => {
    const parsed = (data.questions || []).map(q => ({ ...q, id: q.id || crypto.randomUUID() }));
    setQuestions(parsed);
    setSelectedIds(new Set(parsed.map(q => q.id)));
    setWarnings(data.warnings || []);
    setParseSource(data.parse_source || null);
    setStage('review');
  }, [setQuestions, setSelectedIds, setWarnings, setParseSource, setStage]);

  const startGeneration = useCallback(async (file) => {
    setFileName(file);
    setImportError('');
    setStage('generating');
    try {
      const res = await inspectQuestionFile(file, taskType);
      const data = res?.data ?? res;
      setInspection(data);
      // A spreadsheet or a Word table has columns to confirm. A prose .docx or
      // .pdf does not — inspect has already read the questions out of it, so
      // there is nothing to map and review is the next human step either way.
      if (data.needs_mapping === false) {
        acceptParsed(data);
        return;
      }
      setMapping(data.mapping);
      setStage('mapping');
    } catch (err) {
      setImportError(err?.response?.data?.message || err?.message || 'Could not read that file.');
      setStage('form');
    }
  }, [taskType, acceptParsed, setFileName, setImportError, setStage, setInspection, setMapping]);

  /** Parse every row through the confirmed mapping. */
  const runParse = useCallback(async () => {
    if (!fileName) return;
    setImportError('');
    setStage('generating');
    try {
      const res = await parseQuestionFile(fileName, mapping, taskType);
      acceptParsed(res?.data ?? res);
    } catch (err) {
      setImportError(err?.response?.data?.message || err?.message || 'Could not parse that file.');
      setStage('mapping');
    }
  }, [fileName, mapping, taskType, acceptParsed]);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) startGeneration(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) startGeneration(file);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const allSelected = questions.length > 0 && selectedIds.size === questions.length;
  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(questions.map(q => q.id)));
  };

  const updateQuestion = (id, next) => {
    setQuestions(prev => prev.map(q => (q.id === id ? next : q)));
  };

  const toggleView = (id) => {
    setDetail(prev => (prev.id === id && prev.mode === 'view' ? { id: null, mode: null } : { id, mode: 'view' }));
  };
  const toggleEdit = (id) => {
    setDetail(prev => (prev.id === id && prev.mode === 'edit' ? { id: null, mode: null } : { id, mode: 'edit' }));
  };

  // A question started and left empty is dropped rather than saved as an
  // untitled row — easy to do when adding several by hand.
  const savableQuestions = questions.filter(
    q => selectedIds.has(q.id) && !isBlankQuestion(q),
  );

  const handleSave = () => {
    if (!savableQuestions.length) return;
    // `entryMode` travels with the batch so the caller can record provenance
    // honestly — hand-written questions were being tagged as imports.
    onSave?.(savableQuestions, { ...form, taskType, entryMode });
    handleOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl p-0">
        <SheetHeader>
          <div className="flex items-center gap-2">
            {stage === 'review' && (
              <button
                type="button"
                onClick={() => setStage('form')}
                className="h-7 w-7 -ml-1 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-muted transition-colors duration-150"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <SheetTitle>
              {stage === 'review' ? (
                <>Review <span className="text-brand">{config.label}</span> questions</>
              ) : (
                <>Create <span className="text-brand">{config.label}</span> section</>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
          {/* ── Stage 1: form ───────────────────────────────────────── */}
          {stage === 'form' && (
            <div className="space-y-5 animate-in fade-in-0 duration-200">
              {/*
                No "Section title" field. Every row of the upload becomes its own
                library question, titled from its own prompt — a single title box
                gave all of them the same name. The fields below are tags applied
                across the batch, and they're hidden inside the assessment
                builder, where the section already carries them.
              */}
              {!inheritsMetadata && (
              <>
              <div>
                <FieldLabel>Select Domain</FieldLabel>
                <Select value={form.domain} onValueChange={v => setForm(f => ({ ...f, domain: v }))}>
                  <SelectTrigger className="h-11 text-[14px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {domainOptions.filter(o => o.value).map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel>Role</FieldLabel>
                <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger className="h-11 text-[14px]">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.filter(o => o.value).map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FieldLabel>Difficulty level</FieldLabel>
                <SegmentedControl
                  options={DIFFICULTIES}
                  value={form.difficulty}
                  onChange={v => setForm(f => ({ ...f, difficulty: v }))}
                />
              </div>
              </>
              )}

              <div>
                <FieldLabel>Add questions</FieldLabel>

                {/* Same choice the assessment builder offers: bring a bank, or
                    write one. Both end up in the same review stage. */}
                <div className="grid h-10 grid-cols-2 rounded-full border border-border-default bg-surface-muted p-[3px] mb-3">
                  {[
                    { key: 'upload', label: 'Upload file' },
                    { key: 'manual', label: 'Enter manually' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setEntryMode(opt.key)}
                      aria-pressed={entryMode === opt.key}
                      className={`rounded-full text-[13px] transition-colors duration-150 ${
                        entryMode === opt.key
                          ? 'border border-border-subtle bg-surface font-semibold text-text-primary shadow-sm'
                          : 'font-medium text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {entryMode === 'manual' ? (
                  <div className="rounded-xl border border-border-default bg-surface-muted/40 px-6 py-8 text-center">
                    <p className="text-[14px] font-bold text-text-primary">
                      Write your own {config.label} questions
                    </p>
                    <p className="text-[12px] text-text-muted mt-1">
                      Add them one at a time, then review before saving.
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 px-4 text-[13px] mt-3"
                      onClick={startManualEntry}
                    >
                      Start writing
                    </Button>
                  </div>
                ) : (
                <>
                <div className="rounded-lg bg-warning/10 border border-warning/25 px-3.5 py-2.5 mb-3">
                  <p className="text-[13px] text-warning font-medium">
                    Upload an existing question bank. Your answer keys are used as written.
                  </p>
                </div>

                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`rounded-xl border-2 border-dashed px-6 py-10 flex flex-col items-center gap-3 text-center transition-colors duration-150 ${
                    dragOver ? 'border-brand bg-brand-tint/30' : 'border-border-default bg-surface-muted/40'
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-surface-muted flex items-center justify-center">
                    <UploadCloud className="w-5 h-5 text-text-muted" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-text-primary">{config.dropHint}</p>
                    <p className="text-[12px] text-text-muted mt-1">{config.columnsHint}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 px-4 text-[13px] transition-transform duration-150 hover:scale-[1.02]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILE_TYPES}
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>
                </>
                )}
              </div>
            </div>
          )}

          {/* ── Stage 2: generating ─────────────────────────────────── */}
          {stage === 'generating' && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 animate-in fade-in-0 duration-200">
              <Loader2 className="w-7 h-7 text-brand animate-spin" />
              <div className="text-center">
                <p className="text-[14px] font-bold text-text-primary">Reading your file…</p>
                <p className="text-[12px] text-text-muted mt-1">{fileName?.name || 'Upload'}</p>
              </div>
            </div>
          )}

          {/* ── Stage 2b: confirm the column mapping ────────────────── */}
          {stage === 'mapping' && inspection && (
            <div className="space-y-5 animate-in fade-in-0 duration-200">
              <div>
                <p className="text-[14px] font-bold text-text-primary">
                  Check the columns
                </p>
                <p className="text-[12px] text-text-muted mt-1">
                  {inspection.row_count} row{inspection.row_count === 1 ? '' : 's'} in {fileName?.name}.
                  {inspection.mapping_source === 'heuristic'
                    ? ' Matched by column name — worth a quick look.'
                    : ' Inferred from your headers.'}
                  {inspection.note ? ` ${inspection.note}` : ''}
                </p>
              </div>

              {importError && (
                <p className="text-[13px] text-error">{importError}</p>
              )}

              <MappingField
                label={mappingLabels.prompt}
                value={mapping?.prompt || ''}
                columns={inspection.columns}
                onChange={v => setMapping(m => ({ ...m, prompt: v || null }))}
              />

              {/* Free text has no choices, so the server sends a null label and
                  the picker is not shown at all. Ranking reuses it — the chips
                  are the items, and the order they are picked in is the order
                  they were written in the file. */}
              {mappingLabels.options && (
                <div>
                  <FieldLabel>{mappingLabels.options}</FieldLabel>
                  <div className="flex flex-wrap gap-2">
                    {inspection.columns.map(column => {
                      const active = (mapping?.options || []).includes(column);
                      return (
                        <button
                          key={column}
                          type="button"
                          onClick={() => setMapping(m => ({
                            ...m,
                            options: active
                              ? m.options.filter(c => c !== column)
                              : [...(m.options || []), column],
                          }))}
                          className={`h-8 px-3 rounded-full border text-[13px] transition-colors duration-150 ${
                            active
                              ? 'border-brand bg-brand-tint/40 text-text-primary font-semibold'
                              : 'border-border-default text-text-secondary hover:bg-surface-muted'
                          }`}
                        >
                          {column}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <MappingField
                label={mappingLabels.correct}
                value={mapping?.correct || ''}
                columns={inspection.columns}
                onChange={v => setMapping(m => ({ ...m, correct: v || null }))}
                allowNone
              />

              <MappingField
                label={mappingLabels.explanation}
                value={mapping?.explanation || ''}
                columns={inspection.columns}
                onChange={v => setMapping(m => ({ ...m, explanation: v || null }))}
                allowNone
              />

              <div className="rounded-lg border border-border-default overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="bg-surface-muted">
                    <tr>
                      {inspection.columns.map(c => (
                        <th key={c} className="px-3 py-2 text-left font-semibold text-text-secondary whitespace-nowrap">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inspection.sample_rows.map((row, i) => (
                      <tr key={i} className="border-t border-border-subtle">
                        {inspection.columns.map(c => (
                          <td key={c} className="px-3 py-2 text-text-secondary whitespace-nowrap max-w-[180px] truncate">{row[c]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Stage 3: review ─────────────────────────────────────── */}
          {stage === 'review' && (
            <div className="space-y-4 animate-in fade-in-0 duration-200">
              {/* How the questions were read. `ai` means a model cut the
                  document into questions and labelled the parts — every string
                  it returned was checked back against the source and the answer
                  key was resolved from the marker the document itself states,
                  but it still deserves a closer read than a confirmed mapping. */}
              {parseSource === 'ai' && (
                <div className="rounded-lg border border-warning/25 bg-warning/10 px-3 py-2.5">
                  <p className="text-[12px] font-medium text-warning">
                    This document had no clear structure, so its questions were
                    located by AI. Every prompt, option and answer key was matched
                    back to the file — nothing was written for you — but check
                    them before saving.
                  </p>
                </div>
              )}
              {parseSource === 'structural' && (
                <p className="text-[12px] text-text-muted">
                  Read directly from the document&apos;s numbering and answer lines.
                </p>
              )}

              {warnings.length > 0 && (
                <div className="rounded-lg border border-border-default bg-surface-muted/60 px-3 py-2.5">
                  <p className="text-[12px] font-semibold text-text-primary">
                    {warnings.length} skipped — nothing is ever guessed
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {warnings.slice(0, 5).map((w, i) => (
                      <li key={i} className="text-[12px] text-text-secondary">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-border-default accent-brand cursor-pointer"
                  />
                  <span className="text-[13px] font-bold text-text-primary">Select all</span>
                </label>
                <Badge variant="default" className="bg-brand-tint text-brand border-brand-border/30 text-[11px] font-bold px-2.5 py-1">
                  {selectedIds.size} of {questions.length} selected
                </Badge>
              </div>

              <div className="space-y-3">
                {questions.map((q, i) => (
                  <QuestionCardShell
                    key={q.id}
                    index={i}
                    question={q}
                    selected={selectedIds.has(q.id)}
                    onToggleSelect={() => toggleSelect(q.id)}
                    detailMode={detail.id === q.id ? detail.mode : null}
                    onToggleView={() => toggleView(q.id)}
                    onToggleEdit={() => toggleEdit(q.id)}
                  >
                    <DetailRenderer
                      type={taskType}
                      question={q}
                      editing={detail.id === q.id && detail.mode === 'edit'}
                      onChange={next => updateQuestion(q.id, next)}
                    />
                  </QuestionCardShell>
                ))}
              </div>

              {entryMode === 'manual' && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full text-[13px]"
                  onClick={addManualQuestion}
                >
                  + Add another question
                </Button>
              )}
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            className="h-10 px-5 transition-transform duration-150 hover:scale-[1.02] active:scale-95"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          {stage === 'mapping' ? (
            <Button
              variant="cta"
              className="h-10 px-5 transition-transform duration-150 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              // Free text has no option columns, so "did you pick two?" is the
              // wrong gate for it — a question column is the whole requirement.
              disabled={
                !mapping?.prompt
                || (mappingLabels.options && (mapping?.options || []).length < 2)
              }
              onClick={runParse}
            >
              Read {inspection?.row_count || 0} question{inspection?.row_count === 1 ? '' : 's'}
            </Button>
          ) : (
            <Button
              variant="cta"
              className="h-10 px-5 transition-transform duration-150 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              disabled={stage !== 'review' || savableQuestions.length === 0}
              onClick={handleSave}
            >
              {stage === 'review' && savableQuestions.length
                ? `Save ${savableQuestions.length} to task library`
                : 'Save to task library'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
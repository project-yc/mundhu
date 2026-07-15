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

// ─── type-specific config ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  mcq: {
    label: 'MCQ',
    sectionLabel: 'MCQ section',
    dropHint: 'Drop a .csv, .docx or .pdf',
    columnsHint: 'Columns: question, option_a–d, correct',
  },
  ranking: {
    label: 'Ranking',
    sectionLabel: 'Ranking section',
    dropHint: 'Drop a .csv, .docx or .pdf',
    columnsHint: 'Columns: question, item_1–n, correct_order',
  },
  free_text: {
    label: 'Free Text',
    sectionLabel: 'Free text section',
    dropHint: 'Drop a .csv, .docx or .pdf',
    columnsHint: 'Columns: question, guideline / model answer',
  },
};

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

// ─── mock generation (replace with your real API call) ────────────────────
function mockGenerate(type, count = 5) {
  if (type === 'mcq') {
    return Array.from({ length: count }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      question: `Sample generated MCQ question #${i + 1} — what is the correct behavior here?`,
      options: [
        { text: 'Option A description', is_correct: i % 4 === 0 },
        { text: 'Option B description', is_correct: i % 4 === 1 },
        { text: 'Option C description', is_correct: i % 4 === 2 },
        { text: 'Option D description', is_correct: i % 4 === 3 },
      ],
    }));
  }
  if (type === 'ranking') {
    return Array.from({ length: count }, (_, i) => ({
      id: `gen-${Date.now()}-${i}`,
      question: `Sample generated ranking question #${i + 1} — order the steps correctly.`,
      items: ['First step in the process', 'Second step in the process', 'Third step in the process', 'Fourth step in the process'],
    }));
  }
  // free_text
  return Array.from({ length: count }, (_, i) => ({
    id: `gen-${Date.now()}-${i}`,
    question: `Sample generated free-text prompt #${i + 1} — explain your approach.`,
    guideline: 'Model answer should mention trade-offs, complexity, and a concrete example.',
  }));
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
          <p className="text-[14px] font-semibold text-text-primary leading-snug">{question.question}</p>
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
          <span className="text-[11px] font-bold text-text-muted mb-1 block">Model answer / guideline</span>
          <textarea
            value={question.guideline}
            onChange={e => onChange({ ...question, guideline: e.target.value })}
            className="w-full text-[13px] rounded-lg border border-border-subtle px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
            rows={3}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-info/10 border border-info/20 px-3 py-2.5">
      <span className="text-[11px] font-bold text-info block mb-0.5">Model answer / guideline</span>
      <p className="text-[13px] text-text-secondary italic leading-snug">{question.guideline}</p>
    </div>
  );
}

function DetailRenderer({ type, ...props }) {
  if (type === 'mcq') return <McqDetail {...props} />;
  if (type === 'ranking') return <RankingDetail {...props} />;
  return <FreeTextDetail {...props} />;
}

// ─── main component ─────────────────────────────────────────────────────────
export default function CreateTaskOverlay({
  open, onOpenChange, taskType, domainOptions = [], roleOptions = [], onSave,
}) {
  const [stage, setStage] = useState('form'); // 'form' | 'generating' | 'review'
  const [form, setForm] = useState({ title: '', domain: '', role: '', difficulty: 'easy' });
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detail, setDetail] = useState({ id: null, mode: null }); // mode: 'view' | 'edit'
  const fileInputRef = useRef(null);

  const config = TYPE_CONFIG[taskType] || TYPE_CONFIG.mcq;

  const resetAll = useCallback(() => {
    setStage('form');
    setForm({ title: '', domain: '', role: '', difficulty: 'easy' });
    setFileName('');
    setQuestions([]);
    setSelectedIds(new Set());
    setDetail({ id: null, mode: null });
  }, []);

  const handleOpenChange = (next) => {
    onOpenChange(next);
    if (!next) setTimeout(resetAll, 200); // wait for close animation
  };

  const startGeneration = useCallback((file) => {
    setFileName(file.name);
    setStage('generating');
    // TODO: replace with a real upload + AI generation API call.
    // e.g. const res = await generateQuestions({ file, type: taskType, ...form });
    setTimeout(() => {
      const generated = mockGenerate(taskType, 5);
      setQuestions(generated);
      setSelectedIds(new Set(generated.map(q => q.id)));
      setStage('review');
    }, 1400);
  }, [taskType]);

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

  const handleSave = () => {
    const selected = questions.filter(q => selectedIds.has(q.id));
    onSave?.(selected, { ...form, taskType });
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
              <div>
                <FieldLabel>Section title</FieldLabel>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                  <Input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Backend Engineer"
                    className="pl-9 h-11 text-[14px]"
                  />
                </div>
              </div>

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

              <div>
                <FieldLabel>Upload questions</FieldLabel>
                <div className="rounded-lg bg-warning/10 border border-warning/25 px-3.5 py-2.5 mb-3">
                  <p className="text-[13px] text-warning font-medium">
                    Any material can be uploaded and AI will generate questions.
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
                    accept=".csv,.docx,.pdf"
                    className="hidden"
                    onChange={handleFileInput}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Stage 2: generating ─────────────────────────────────── */}
          {stage === 'generating' && (
            <div className="flex flex-col items-center justify-center gap-4 py-24 animate-in fade-in-0 duration-200">
              <Loader2 className="w-7 h-7 text-brand animate-spin" />
              <div className="text-center">
                <p className="text-[14px] font-bold text-text-primary">Generating questions…</p>
                <p className="text-[12px] text-text-muted mt-1">Reading {fileName || 'your file'} and drafting {config.label.toLowerCase()} questions</p>
              </div>
            </div>
          )}

          {/* ── Stage 3: review ─────────────────────────────────────── */}
          {stage === 'review' && (
            <div className="space-y-4 animate-in fade-in-0 duration-200">
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
          <Button
            variant="cta"
            className="h-10 px-5 transition-transform duration-150 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            disabled={stage === 'review' ? selectedIds.size === 0 : stage !== 'review'}
            onClick={handleSave}
          >
            {stage === 'review' ? `Save ${selectedIds.size ? selectedIds.size : ''} to task library` : 'Save to task library'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
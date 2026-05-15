// PipelineScreen — recruiter decision board.
// Three views: NEEDS ACTION queue (default), BOARD (kanban), TRAYS (in-flight + expired).
// Detail rail slides in from the right when a card is selected.

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Loader, AlertCircle, Search, ChevronDown, X, Inbox, LayoutGrid, Archive,
  Sparkles, Shield, Clock, Mail, Hash, ArrowRight, ExternalLink,
  CheckCircle2, XCircle, UserCheck, Send, Eye, Star, Tag, Plus,
  ChevronRight, MoreHorizontal, FileText,
} from 'lucide-react';

const PIPELINE_POLL_MS = 10000;
import {
  getPipeline, getNeedsAction, updatePipelineCandidate,
} from '../../../api/recruiter/pipeline.jsx';

// ─── Stage taxonomy + theming ─────────────────────────────────────────────────
const STAGES = [
  { key: 'new',          label: 'New',          color: '#22D3EE', bg: '#CFFAFE', border: '#0E7490', icon: Sparkles },
  { key: 'reviewing',    label: 'Reviewing',    color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', icon: Eye },
  { key: 'shortlisted',  label: 'Shortlisted',  color: '#7C3AED', bg: '#F5F3FF', border: '#C4B5FD', icon: Star },
  { key: 'sent_to_hm',   label: 'Sent to HM',   color: '#2563EB', bg: '#EFF6FF', border: '#93C5FD', icon: Send },
  { key: 'hired',        label: 'Hired',        color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', icon: CheckCircle2 },
  { key: 'rejected',     label: 'Rejected',     color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', icon: XCircle },
];
const STAGE_BY_KEY = Object.fromEntries(STAGES.map(s => [s.key, s]));

const ASSESSMENT_STATUS = {
  'Invited':     { color: '#22D3EE', label: 'Invited' },
  'In Progress': { color: '#D97706', label: 'Active' },
  'Submitted':   { color: '#16A34A', label: 'Submitted' },
  'Expired':     { color: '#64748B', label: 'Expired' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getInitials(name = '') {
  return name.split(/[\s.@]+/).filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
}

function scoreColor(score) {
  if (score == null) return { color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0' };
  if (score >= 80) return { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC' };
  if (score >= 60) return { color: '#22D3EE', bg: '#CFFAFE', border: '#0E7490' };
  if (score >= 40) return { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D' };
  return { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5' };
}

// ─── Drag context ───────────────────────────────────────────────────────────
// Shared across board via a module-level ref; avoids prop drilling.
const dragState = { cardId: null, fromStage: null };

// ─── Compact UI atoms ─────────────────────────────────────────────────────────
function Avatar({ name, size = 32 }) {
  return (
    <div
      className="rounded-full bg-surface-muted border border-border-default flex items-center justify-center font-bold text-text-secondary flex-shrink-0 font-display"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {getInitials(name)}
    </div>
  );
}

function FitScoreChip({ score }) {
  const c = scoreColor(score);
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded font-display tabular-nums"
      style={{ color: c.color, backgroundColor: c.bg, border: `1px solid ${c.border}` }}
      title="Fit score"
    >
      {score == null ? '—' : score}
    </span>
  );
}

function IntegrityDot({ score }) {
  if (score == null) return null;
  const ok = score >= 70;
  const warn = score >= 40 && score < 70;
  const color = ok ? '#16A34A' : warn ? '#D97706' : '#DC2626';
  return (
    <span title={`Integrity ${score}/100`} className="flex items-center gap-1 text-[10px] text-text-secondary">
      <Shield className="w-2.5 h-2.5" style={{ color }} />
    </span>
  );
}

function StageChip({ stage }) {
  const cfg = STAGE_BY_KEY[stage];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

// ─── Candidate card (board) ───────────────────────────────────────────────────
function CandidateCard({ card, onClick, onDragStart, dense = false }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div
      draggable
      onDragStart={(e) => {
        setDragging(true);
        e.dataTransfer.effectAllowed = 'move';
        // store globally so the column drop handler can read it
        dragState.cardId = card.id;
        dragState.fromStage = card.stage;
        onDragStart?.(card);
      }}
      onDragEnd={() => setDragging(false)}
      onClick={onClick}
      className={`group w-full text-left bg-page hover:bg-surface border border-border-default hover:border-border-strong rounded-lg p-2.5 transition-all duration-100 cursor-grab active:cursor-grabbing select-none ${
        dragging ? 'opacity-40 scale-[0.97] rotate-1' : ''
      }`}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={card.candidate_name} size={dense ? 24 : 28} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="text-[12px] font-semibold text-text-primary truncate group-hover:text-text-primary">
              {card.candidate_name}
            </p>
            <FitScoreChip score={card.fit_score} />
          </div>
          {!dense && (
            <p className="text-[10.5px] text-text-secondary truncate mb-1.5">{card.candidate_email}</p>
          )}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-text-secondary flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {relativeTime(card.submitted_at || card.started_at || card.invited_at)}
            </span>
            <IntegrityDot score={card.integrity_score} />
            {card.tags?.slice(0, 2).map((t, i) => (
              <span key={i} className="text-[9.5px] px-1 py-px rounded bg-surface-muted border border-border-default text-text-secondary">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline column ──────────────────────────────────────────────────────────
function PipelineColumn({ stage, cards, onSelect, onDrop }) {
  const [expanded, setExpanded] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const cfg = STAGE_BY_KEY[stage];
  const Icon = cfg.icon;
  const visible = expanded ? cards.slice(0, 25) : [];
  const dense = cards.length > 12;

  const handleDragOver = (e) => {
    // Only allow drop if dragging from a different stage
    if (dragState.fromStage && dragState.fromStage !== stage) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOver(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (dragState.cardId && dragState.fromStage !== stage) {
      onDrop(dragState.cardId, stage);
      dragState.cardId = null;
      dragState.fromStage = null;
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragEnter={(e) => { if (dragState.fromStage && dragState.fromStage !== stage) { e.preventDefault(); setDragOver(true); } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false); }}
      onDrop={handleDrop}
      className="flex flex-col w-[280px] flex-shrink-0 rounded-xl overflow-hidden transition-all duration-150"
      style={{
        backgroundColor: dragOver ? cfg.bg : '#F8FAFC',
        border: dragOver ? `1.5px solid ${cfg.border}` : '1px solid #E2E8F0',
        boxShadow: dragOver ? `0 0 0 3px ${cfg.border}22` : 'none',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 border-b border-border-default cursor-pointer"
        onClick={() => setExpanded(e => !e)}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <span
          className="w-1 h-4 rounded-full"
          style={{ backgroundColor: cfg.color }}
        />
        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
        <p className="text-[12px] font-semibold text-text-primary flex-1">{cfg.label}</p>
        <span
          className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded font-display"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}
        >
          {cards.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-[200px]">
        {cards.length === 0 && (
          <div
            className="flex flex-col items-center justify-center text-center py-8 px-3 rounded-lg transition-all duration-150"
            style={dragOver ? { backgroundColor: `${cfg.bg}80`, border: `1px dashed ${cfg.border}` } : {}}
          >
            {dragOver ? (
              <p className="text-[11px] font-semibold" style={{ color: cfg.color }}>Drop here</p>
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center"
                  style={{ backgroundColor: cfg.bg, border: `1px dashed ${cfg.border}` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color, opacity: 0.5 }} />
                </div>
                <p className="text-[10.5px] text-text-muted">No candidates here</p>
              </>
            )}
          </div>
        )}
        {visible.map(card => (
          <CandidateCard
            key={card.id}
            card={card}
            onClick={() => onSelect(card)}
            dense={dense}
          />
        ))}
        {cards.length > 25 && (
          <div className="text-center py-2">
            <span className="text-[10px] text-text-secondary">Showing top 25 of {cards.length}</span>
          </div>
        )}
        {/* Drop indicator strip at bottom when column has cards */}
        {dragOver && cards.length > 0 && (
          <div
            className="h-1 rounded-full mx-1 transition-all"
            style={{ backgroundColor: cfg.color, opacity: 0.6 }}
          />
        )}
      </div>
    </div>
  );
}

// ─── Tray (in-flight, expired) ────────────────────────────────────────────────
function Tray({ title, icon: Icon, color, cards, onSelect, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-page border border-border-default rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 hover:bg-surface transition-colors"
      >
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <p className="text-[12px] font-semibold text-text-primary">{title}</p>
        <span className="text-[10px] font-bold text-text-secondary tabular-nums px-1.5 py-0.5 rounded bg-surface-muted font-display">
          {cards.length}
        </span>
        <ChevronDown className={`ml-auto w-3.5 h-3.5 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-border-default p-2 space-y-1 max-h-[300px] overflow-y-auto">
          {cards.length === 0 ? (
            <p className="text-[11px] text-text-muted text-center py-4">Empty</p>
          ) : (
            cards.map(card => (
              <button
                key={card.id}
                onClick={() => onSelect(card)}
                className="w-full text-left flex items-center gap-2.5 px-2 py-1.5 hover:bg-surface rounded-md transition-colors"
              >
                <Avatar name={card.candidate_name} size={22} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-text-primary truncate">{card.candidate_name}</p>
                  <p className="text-[10px] text-text-secondary truncate">{card.candidate_email}</p>
                </div>
                <span className="text-[10px] text-text-secondary flex-shrink-0">
                  {relativeTime(card.invited_at)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Needs-action queue ───────────────────────────────────────────────────────
const REASON_THEME = {
  submitted: { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', icon: Sparkles },
  expiring:  { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', icon: Clock },
  stale:     { color: '#DC2626', bg: '#FEF2F2', border: '#FCA5A5', icon: AlertCircle },
};

function NeedsActionQueue({ items, onSelect, loading }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader className="w-5 h-5 text-brand animate-spin" />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24">
        <div className="w-16 h-16 rounded-2xl bg-success-bg border border-success-border flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-success" strokeWidth={2} />
        </div>
        <h3 className="text-[15px] font-bold text-text-primary font-display mb-1.5">Inbox zero</h3>
        <p className="text-[12.5px] text-text-secondary max-w-xs leading-relaxed">
          Nothing needs your attention. New submissions and expiring invites will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {items.map(item => {
        const theme = REASON_THEME[item.reason] || REASON_THEME.submitted;
        const ReasonIcon = theme.icon;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item)}
            className="group w-full text-left flex items-center gap-3 px-4 py-3 bg-page hover:bg-surface border border-border-default hover:border-border-strong rounded-xl transition-all duration-100"
          >
            <div
              className="w-1 h-10 rounded-full flex-shrink-0"
              style={{ backgroundColor: theme.color }}
            />
            <Avatar name={item.candidate_name} size={36} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[13px] font-semibold text-text-primary truncate group-hover:text-text-primary">
                  {item.candidate_name}
                </p>
                <FitScoreChip score={item.fit_score} />
                <IntegrityDot score={item.integrity_score} />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1 text-[10.5px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ color: theme.color, backgroundColor: theme.bg, border: `1px solid ${theme.border}` }}
                >
                  <ReasonIcon className="w-2.5 h-2.5" />
                  {item.reason_label}
                </span>
                <span className="text-[10.5px] text-text-secondary truncate">{item.candidate_email}</span>
              </div>
            </div>

            <div className="hidden md:block text-[10.5px] text-text-secondary truncate max-w-[140px]">
              {item.assessment_name}
            </div>

            <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-secondary transition-colors" />
          </button>
        );
      })}
    </div>
  );
}

// ─── Detail rail (right slide-over) ───────────────────────────────────────────
function DetailRail({ card, onClose, onUpdate, onSaving }) {
  const [stage, setStage] = useState(card?.stage || '');
  const [notes, setNotes] = useState(card?.notes || '');
  const [tags, setTags] = useState(card?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [savingField, setSavingField] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setStage(card?.stage || '');
    setNotes(card?.notes || '');
    setTags(card?.tags || []);
    setTagInput('');
  }, [card?.id]);

  const save = async (payload, field) => {
    if (!card) return;
    setSavingField(field);
    try {
      const res = await onUpdate(card.id, payload);
      if (res?.data) onSaving(res.data);
    } finally {
      setSavingField(null);
    }
  };

  const handleStageChange = (newStage) => {
    setStage(newStage);
    save({ stage: newStage }, 'stage');
  };

  const notesTimer = useRef(null);
  const handleNotesChange = (val) => {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(() => save({ notes: val }, 'notes'), 600);
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    setTagInput('');
    save({ tags: next }, 'tags');
  };

  const removeTag = (t) => {
    const next = tags.filter(x => x !== t);
    setTags(next);
    save({ tags: next }, 'tags');
  };

  if (!card) return null;
  const statusCfg = ASSESSMENT_STATUS[card.status] || ASSESSMENT_STATUS['Invited'];

  return (
    <>
      <div
        className="fixed inset-0 bg-text-primary/30 backdrop-blur-[2px] z-40 animate-fadeIn"
        onClick={onClose}
      />
      <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-page border-l border-border-default z-50 flex flex-col animate-slideInRight">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-border-default">
          <Avatar name={card.candidate_name} size={48} />
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-bold text-text-primary truncate font-display">{card.candidate_name}</p>
            <p className="text-[12px] text-text-secondary truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3" /> {card.candidate_email}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ color: statusCfg.color }}
              >
                <span className="w-1 h-1 rounded-full" style={{ backgroundColor: statusCfg.color }} />
                {statusCfg.label}
              </span>
              {card.assessment_name && (
                <span className="text-[10.5px] text-text-secondary truncate">· {card.assessment_name}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-surface rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-page border border-border-default rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-text-secondary font-semibold mb-1.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Fit Score
              </p>
              <p className="text-[24px] font-bold font-display tabular-nums" style={{ color: scoreColor(card.fit_score).color }}>
                {card.fit_score == null ? '—' : card.fit_score}
              </p>
            </div>
            <div className="bg-page border border-border-default rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-[0.14em] text-text-secondary font-semibold mb-1.5 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" /> Integrity
              </p>
              <p className="text-[24px] font-bold font-display tabular-nums" style={{ color: scoreColor(card.integrity_score).color }}>
                {card.integrity_score == null ? '—' : card.integrity_score}
              </p>
            </div>
          </div>

          {/* Stage selector */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-secondary font-semibold mb-2 flex items-center gap-1.5">
              Pipeline Stage
              {savingField === 'stage' && <Loader className="w-2.5 h-2.5 animate-spin text-brand" />}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {STAGES.map(s => {
                const Icon = s.icon;
                const active = stage === s.key;
                return (
                  <button
                    key={s.key}
                    onClick={() => handleStageChange(s.key)}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-semibold transition-all duration-150 border"
                    style={{
                      color: active ? s.color : '#64748B',
                      backgroundColor: active ? s.bg : '#FFFFFF',
                      borderColor: active ? s.border : '#E2E8F0',
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-secondary font-semibold mb-2 flex items-center gap-1.5">
              Recruiter Notes
              {savingField === 'notes' && <Loader className="w-2.5 h-2.5 animate-spin text-brand" />}
            </p>
            <textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Quick context for yourself or the hiring manager…"
              rows={4}
              className="w-full bg-page border border-border-default focus:border-border-strong rounded-lg p-2.5 text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-secondary font-semibold mb-2 flex items-center gap-1.5">
              <Tag className="w-2.5 h-2.5" /> Tags
              {savingField === 'tags' && <Loader className="w-2.5 h-2.5 animate-spin text-brand" />}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map(t => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-surface-muted border border-border-default text-text-secondary"
                >
                  {t}
                  <button onClick={() => removeTag(t)} className="text-text-secondary hover:text-error">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && (
                <span className="text-[11px] text-text-muted">No tags yet</span>
              )}
            </div>
            <div className="flex gap-1.5">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Add tag…"
                className="flex-1 bg-page border border-border-default focus:border-border-strong rounded-lg px-2.5 py-1.5 text-[11.5px] text-text-primary placeholder:text-text-muted focus:outline-none"
              />
              <button
                onClick={addTag}
                className="px-2.5 py-1.5 bg-surface border border-border-default hover:border-border-strong rounded-lg text-text-secondary hover:text-text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-text-secondary font-semibold mb-2">Timeline</p>
            <div className="space-y-1 text-[11.5px]">
              <div className="flex justify-between text-text-secondary">
                <span className="text-text-secondary">Invited</span>
                <span>{relativeTime(card.invited_at)}</span>
              </div>
              {card.started_at && (
                <div className="flex justify-between text-text-secondary">
                  <span className="text-text-secondary">Started</span>
                  <span>{relativeTime(card.started_at)}</span>
                </div>
              )}
              {card.submitted_at && (
                <div className="flex justify-between text-text-secondary">
                  <span className="text-text-secondary">Submitted</span>
                  <span>{relativeTime(card.submitted_at)}</span>
                </div>
              )}
              {card.expires_at && (
                <div className="flex justify-between text-text-secondary">
                  <span className="text-text-secondary">Invite expires</span>
                  <span>{relativeTime(card.expires_at)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border-default flex gap-2">
          {card.report_status === 'completed' && card.session_id && card.assessment_id ? (
            <button
              onClick={() => navigate(`/recruiter/reports/${card.assessment_id}/${card.session_id}`)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand hover:bg-brand-hover text-on-brand text-[12px] font-bold rounded-lg transition-colors active:scale-[0.97]"
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
              View Report
            </button>
          ) : card.report_status === 'processing' ? (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-tint border border-brand-border text-brand text-[12px] font-semibold rounded-lg">
              <Loader className="w-3.5 h-3.5 animate-spin" />
              Generating Report…
            </div>
          ) : card.report_status === 'pending' ? (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-warning-bg border border-warning-border text-warning text-[12px] font-semibold rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              Report Queued
            </div>
          ) : card.report_status === 'failed' ? (
            <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-error-bg border border-error-border text-error text-[12px] font-semibold rounded-lg">
              <XCircle className="w-3.5 h-3.5" />
              Report Failed
            </div>
          ) : null}
          {card.assessment_id && (
            <button
              onClick={() => navigate(`/recruiter/assessments/${card.assessment_id}`)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-surface border border-border-default hover:border-border-strong text-text-secondary hover:text-text-primary text-[12px] font-semibold rounded-lg"
            >
              Assessment
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Assessment switcher ──────────────────────────────────────────────────────
function AssessmentSwitcher({ assessments, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selected = assessments.find(a => a.id === selectedId);
  const filtered = assessments.filter(a => a.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-default hover:border-border-strong rounded-lg transition-colors min-w-[220px]"
      >
        <Hash className="w-3.5 h-3.5 text-text-secondary" />
        <span className="text-[13px] font-semibold text-text-primary truncate flex-1 text-left">
          {selected ? selected.name : 'Select assessment'}
        </span>
        {selected && (
          <span className="text-[10px] font-bold text-text-secondary tabular-nums px-1.5 py-0.5 rounded bg-surface-muted font-display">
            {selected.total}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-text-secondary transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-[320px] bg-page border border-border-default rounded-xl shadow-2xl z-30 overflow-hidden animate-fadeIn">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border-default">
            <Search className="w-3.5 h-3.5 text-text-secondary" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search assessments…"
              className="flex-1 bg-transparent text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
          <div className="max-h-[320px] overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="text-[11px] text-text-muted text-center py-4">No assessments</p>
            ) : (
              filtered.map(a => (
                <button
                  key={a.id}
                  onClick={() => { onSelect(a.id); setOpen(false); setQ(''); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-colors ${
                    a.id === selectedId ? 'bg-brand-tint text-brand' : 'text-text-secondary hover:bg-surface hover:text-text-primary'
                  }`}
                >
                  <span className="text-[12px] font-semibold truncate flex-1">{a.name}</span>
                  <span className="text-[10px] font-bold tabular-nums text-text-secondary font-display">{a.total}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
const VIEWS = [
  { key: 'needs',  label: 'Needs Action', icon: Inbox },
  { key: 'board',  label: 'Board',        icon: LayoutGrid },
  { key: 'trays',  label: 'In Flight',    icon: Archive },
];

export default function PipelineScreen() {
  const [view, setView] = useState('needs');
  const [pipeline, setPipeline] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [needsLoading, setNeedsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const pollRef = useRef(null);

  const loadPipeline = useCallback(async (assessmentId) => {
    setLoading(true); setError('');
    try {
      const res = await getPipeline(assessmentId);
      const data = res.data || res;
      setPipeline(data);
      if (!selectedAssessment && data.selected_assessment_id) {
        setSelectedAssessment(data.selected_assessment_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load pipeline');
    } finally {
      setLoading(false);
    }
  }, [selectedAssessment]);

  const loadNeeds = useCallback(async (assessmentId) => {
    setNeedsLoading(true);
    try {
      const res = await getNeedsAction(assessmentId);
      const data = res.data || res;
      setNeeds(data.items || []);
    } catch {
      setNeeds([]);
    } finally {
      setNeedsLoading(false);
    }
  }, []);

  useEffect(() => { loadPipeline(selectedAssessment); }, [selectedAssessment]);
  useEffect(() => { loadNeeds(selectedAssessment); }, [selectedAssessment]);

  // Poll while any card has in-progress report or non-final status
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    const allCards = [
      ...Object.values(pipeline?.columns || {}).flat(),
      ...(pipeline?.trays?.in_flight || []),
    ];
    const needsPoll = allCards.some(
      c => c.report_status === 'pending' || c.report_status === 'processing' ||
           c.status === 'Invited' || c.status === 'In Progress'
    );
    if (needsPoll && selectedAssessment) {
      pollRef.current = setInterval(async () => {
        const res = await getPipeline(selectedAssessment).catch(() => null);
        if (res) {
          const data = res.data || res;
          setPipeline(data);
          if (selectedCard) {
            const allUpdated = [...Object.values(data.columns || {}).flat(), ...(data.trays?.in_flight || [])];
            const updated = allUpdated.find(c => c.id === selectedCard.id);
            if (updated) setSelectedCard(updated);
          }
        }
      }, PIPELINE_POLL_MS);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [pipeline, selectedAssessment, selectedCard]);

  const handleAssessmentSelect = (id) => setSelectedAssessment(id);

  const handleCardUpdate = useCallback(async (cardId, payload) => {
    const res = await updatePipelineCandidate(cardId, payload);
    return res;
  }, []);

  // After save, merge updated card into local pipeline + needs
  const mergeUpdatedCard = useCallback((updated) => {
    setSelectedCard(updated);

    setPipeline(prev => {
      if (!prev) return prev;
      const columns = { ...prev.columns };
      const trays = { ...prev.trays };
      // Remove from any column / tray
      for (const k of Object.keys(columns)) columns[k] = columns[k].filter(c => c.id !== updated.id);
      trays.in_flight = (trays.in_flight || []).filter(c => c.id !== updated.id);
      trays.expired = (trays.expired || []).filter(c => c.id !== updated.id);
      // Insert into correct bucket
      if (updated.stage && columns[updated.stage]) {
        columns[updated.stage] = [updated, ...columns[updated.stage]];
        columns[updated.stage].sort((a, b) => (a.fit_score == null) - (b.fit_score == null) || (b.fit_score || 0) - (a.fit_score || 0));
      } else if (updated.status === 'Expired') {
        trays.expired = [updated, ...trays.expired];
      } else {
        trays.in_flight = [updated, ...trays.in_flight];
      }
      const totals = Object.fromEntries(Object.entries(columns).map(([k, v]) => [k, v.length]));
      totals.in_flight = trays.in_flight.length;
      totals.expired = trays.expired.length;
      return { ...prev, columns, trays, totals };
    });

    setNeeds(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
  }, []);

  // Drop handler from kanban board: optimistically move the card then PATCH
  const handleDrop = useCallback(async (cardId, toStage) => {
    // Find the card across all columns
    let card = null;
    setPipeline(prev => {
      if (!prev) return prev;
      for (const stage of Object.keys(prev.columns)) {
        const found = prev.columns[stage].find(c => c.id === cardId);
        if (found) { card = found; break; }
      }
      return prev;
    });
    if (!card) return;

    // Optimistic UI merge immediately
    const optimistic = { ...card, stage: toStage };
    mergeUpdatedCard(optimistic);

    // Persist in background
    try {
      const res = await updatePipelineCandidate(cardId, { stage: toStage });
      const updated = res?.data || optimistic;
      if (updated.id) mergeUpdatedCard(updated);
    } catch {
      // Roll back on failure: restore original stage
      mergeUpdatedCard(card);
    }
  }, [mergeUpdatedCard]);

  const totals = pipeline?.totals || {};
  const assessments = pipeline?.assessments || [];

  const viewBadges = useMemo(() => ({
    needs: needs.length,
    board: STAGES.reduce((sum, s) => sum + (totals[s.key] || 0), 0),
    trays: (totals.in_flight || 0) + (totals.expired || 0),
  }), [needs.length, totals]);

  return (
    <div className="min-h-full bg-page font-sans antialiased">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-page/95 backdrop-blur-md border-b border-border-default">
        <div className="px-6 py-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary font-semibold mb-1">Recruiter Pipeline</p>
              <h1 className="text-[20px] font-bold text-text-primary font-display leading-tight">
                Decide who moves forward.
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <AssessmentSwitcher
                assessments={assessments}
                selectedId={selectedAssessment}
                onSelect={handleAssessmentSelect}
              />
            </div>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-1">
            {VIEWS.map(({ key, label, icon: Icon }) => {
              const active = view === key;
              const count = viewBadges[key];
              return (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-brand-tint text-brand border border-brand-border/60'
                      : 'text-text-secondary hover:text-text-secondary border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-bold tabular-nums px-1.5 py-px rounded font-display ${
                        active ? 'bg-brand-border/30 text-brand' : 'bg-surface-muted text-text-secondary'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                  {key === 'needs' && count > 0 && !active && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5">
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-4 bg-error-bg border border-[#9F1239]/40 text-error text-[12px] rounded-lg">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </div>
        )}

        {loading && view !== 'needs' && (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-5 h-5 text-brand animate-spin" />
          </div>
        )}

        {/* Needs Action */}
        {view === 'needs' && (
          <div className="max-w-3xl">
            <NeedsActionQueue items={needs} loading={needsLoading} onSelect={setSelectedCard} />
          </div>
        )}

        {/* Board */}
        {view === 'board' && !loading && pipeline && (
          <div className="overflow-x-auto pb-3 -mx-6 px-6">
            <div className="flex gap-3" style={{ minWidth: 'min-content' }}>
              {STAGES.map(s => (
                <PipelineColumn
                  key={s.key}
                  stage={s.key}
                  cards={pipeline.columns[s.key] || []}
                  onSelect={setSelectedCard}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trays */}
        {view === 'trays' && !loading && pipeline && (
          <div className="max-w-3xl space-y-3">
            <Tray
              title="In Flight — Invited & Active"
              icon={Clock}
              color="#F59E0B"
              cards={pipeline.trays.in_flight || []}
              onSelect={setSelectedCard}
              defaultOpen
            />
            <Tray
              title="Expired"
              icon={Archive}
              color="#64748B"
              cards={pipeline.trays.expired || []}
              onSelect={setSelectedCard}
            />
          </div>
        )}

        {/* Empty: no assessments at all */}
        {!loading && pipeline && assessments.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <h3 className="text-[15px] font-bold text-text-primary font-display mb-1.5">No assessments yet</h3>
            <p className="text-[12.5px] text-text-secondary mb-4">Create one to start filling your pipeline.</p>
          </div>
        )}
      </div>

      {/* Detail rail */}
      {selectedCard && (
        <DetailRail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={handleCardUpdate}
          onSaving={mergeUpdatedCard}
        />
      )}
    </div>
  );
}

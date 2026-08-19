// AdminPresetsPage — the platform template catalogue.
//
// The list is modelled on AdminLibraryPage (the same job one level down, for
// questions): search + status filter, cards, a create/edit modal, and publish
// as an explicit toggle.
//
// Structure is deliberately NOT edited here. An admin builds the question set
// as a normal assessment in the recruiter builder and promotes it from
// /admin/assessments — one authoring surface, not two that have to be kept in
// step. This page owns the shelf metadata and the lifecycle.
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, CheckCircle, Clock, FileText, Layers, Library,
  Loader, Lock, Plus, Search, Trash2, Users,
} from 'lucide-react';
import {
  createAdminPreset,
  deleteAdminPreset,
  listAdminPresets,
  publishAdminPreset,
  unpublishAdminPreset,
  updateAdminPreset,
} from '../../api/admin/presets';

const SENIORITIES = ['intern', 'new_grad', 'junior', 'mid', 'senior', 'staff', 'principal'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const DOMAINS = [
  'backend', 'frontend', 'fullstack', 'devops', 'data', 'data_science',
  'llm_engineering', 'ai_ml', 'mlops', 'mobile', 'security',
];

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'published', label: 'Published' },
];

const EMPTY_FORM = {
  name: '',
  suggested_name: '',
  summary: '',
  description: '',
  target_role: '',
  seniority: 'mid',
  domain: 'backend',
  difficulty: 'medium',
  duration_minutes: 60,
  tags: '',
  skills: '',
};

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-bold text-text-primary">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-text-muted">{hint}</span>}
    </label>
  );
}

const inputClass =
  'w-full px-3 py-2 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all';

// A comma-separated field is the honest UI for a JSON string array here: these
// are freeform, low-cardinality and typed once when the template is created.
const splitList = value =>
  value.split(',').map(entry => entry.trim()).filter(Boolean);

function PresetModal({ initial, onClose, onSaved }) {
  const editing = Boolean(initial?.id);
  const [form, setForm] = useState(
    initial
      ? {
          ...EMPTY_FORM,
          ...initial,
          tags: (initial.tags || []).join(', '),
          skills: (initial.skills || []).join(', '),
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const handleSubmit = async event => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('A name is required.');
      return;
    }
    setSaving(true);
    setError('');

    const body = {
      name: form.name.trim(),
      suggested_name: form.suggested_name.trim(),
      summary: form.summary.trim(),
      description: form.description.trim(),
      target_role: form.target_role.trim(),
      seniority: form.seniority,
      domain: form.domain,
      difficulty: form.difficulty,
      duration_minutes: Number(form.duration_minutes) || 60,
      tags: splitList(form.tags),
      skills: splitList(form.skills),
    };

    try {
      const saved = editing
        ? await updateAdminPreset(initial.id, body)
        : await createAdminPreset(body);
      onSaved(saved, editing);
    } catch (err) {
      setError(err?.message || 'Could not save this template.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[88vh] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-border-default bg-surface p-6"
      >
        <h2 className="font-display text-[16px] font-bold text-text-primary">
          {editing ? 'Edit template' : 'New template'}
        </h2>
        <p className="mt-1 text-[12px] text-text-secondary">
          Shelf metadata and defaults. Add the questions by promoting an assessment
          from the Assessments page.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Template name">
            <input
              className={inputClass}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Senior Backend Engineer — Node.js"
            />
          </Field>
          <Field label="Target role">
            <input
              className={inputClass}
              value={form.target_role}
              onChange={e => set('target_role', e.target.value)}
              placeholder="Backend Engineer"
            />
          </Field>

          <Field
            label="Suggested assessment name"
            hint="Prefills the recruiter's name field. Falls back to the template name."
          >
            <input
              className={inputClass}
              value={form.suggested_name}
              onChange={e => set('suggested_name', e.target.value)}
              placeholder="Backend Engineer Screen"
            />
          </Field>
          <Field label="Duration (minutes)">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.duration_minutes}
              onChange={e => set('duration_minutes', e.target.value)}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Summary" hint="One line, shown on the gallery card.">
              <input
                className={inputClass}
                value={form.summary}
                onChange={e => set('summary', e.target.value)}
                placeholder="Screens API design, SQL and debugging under time pressure."
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </Field>
          </div>

          <Field label="Seniority">
            <select className={inputClass} value={form.seniority} onChange={e => set('seniority', e.target.value)}>
              {SENIORITIES.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Discipline">
            <select className={inputClass} value={form.domain} onChange={e => set('domain', e.target.value)}>
              {DOMAINS.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Difficulty">
            <select className={inputClass} value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
              {DIFFICULTIES.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </Field>
          <Field label="Tags" hint="Comma separated">
            <input className={inputClass} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="python, api" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Skills covered" hint="Comma separated">
              <input className={inputClass} value={form.skills} onChange={e => set('skills', e.target.value)} placeholder="REST APIs, Postgres, Caching" />
            </Field>
          </div>
        </div>

        {error && (
          <p className="mt-4 flex items-center gap-2 rounded-xl border border-error-border bg-error-bg px-4 py-3 text-[13px] text-error">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border-default px-4 py-2 text-[13px] font-semibold text-text-secondary transition-all hover:bg-surface-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-on-brand transition-all hover:bg-brand-hover disabled:opacity-50"
          >
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Create template'}
          </button>
        </div>
      </form>
    </div>
  );
}

function PresetRow({ preset, onEdit, onTogglePublish, onDelete, busy }) {
  const published = preset.status === 'published';

  return (
    <div className="rounded-xl border border-border-default bg-surface px-5 py-4 transition-all hover:border-border-strong">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-bold text-text-primary">{preset.name}</p>
            {preset.is_locked && <Lock className="h-3 w-3 flex-shrink-0 text-text-muted" />}
            <span
              className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                published
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-border-default bg-surface-muted text-text-muted'
              }`}
            >
              {published ? 'Published' : 'Draft'}
            </span>
            {published && (
              <span className="text-[11px] text-text-muted">v{preset.version}</span>
            )}
          </div>
          <p className="mt-0.5 line-clamp-1 text-[12px] text-text-secondary">
            {preset.summary || preset.target_role || '—'}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />{preset.duration_minutes}m
            </span>
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3 w-3" />
              {preset.section_count} {preset.section_count === 1 ? 'section' : 'sections'}
            </span>
            <span className="inline-flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {preset.item_count} {preset.item_count === 1 ? 'question' : 'questions'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />used {preset.usage_count}×
            </span>
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(preset)}
            className="rounded-lg border border-border-default px-2.5 py-1.5 text-[12px] font-semibold text-text-secondary transition-all hover:bg-surface-muted hover:text-text-primary"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onTogglePublish(preset)}
            className={`rounded-lg px-2.5 py-1.5 text-[12px] font-semibold transition-all disabled:opacity-50 ${
              published
                ? 'border border-border-default text-text-secondary hover:bg-surface-muted'
                : 'bg-brand text-on-brand hover:bg-brand-hover'
            }`}
          >
            {published ? 'Unpublish' : 'Publish'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(preset)}
            title="Delete template"
            className="rounded-lg border border-border-default p-1.5 text-text-muted transition-all hover:border-error-border hover:text-error"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPresetsPage() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [version, setVersion] = useState(0);

  const toast = message => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 4000);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    listAdminPresets({ status: statusFilter, page_size: 100 })
      .then(payload => { if (!cancelled) setPresets(payload.items); })
      .catch(err => { if (!cancelled) setError(err?.message || 'Failed to load templates.'); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [statusFilter, version]);

  // Search is client-side here: the admin catalogue is small (tens of rows,
  // fetched whole) and a round trip per keystroke would be worse than useless.
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return presets;
    return presets.filter(
      preset =>
        preset.name?.toLowerCase().includes(needle) ||
        preset.target_role?.toLowerCase().includes(needle),
    );
  }, [presets, search]);

  const handleTogglePublish = async preset => {
    setBusyId(preset.id);
    setError('');
    try {
      if (preset.status === 'published') {
        await unpublishAdminPreset(preset.id);
        toast('Template unpublished.');
      } else {
        await publishAdminPreset(preset.id);
        toast('Template published — recruiters can use it now.');
      }
      setVersion(v => v + 1);
    } catch (err) {
      // Publish validation failures arrive here ("Section X has no questions"),
      // and they are the actionable half of this screen — never swallow them.
      setError(err?.message || 'Could not change the publish state.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async preset => {
    if (!window.confirm(`Delete "${preset.name}"? Assessments already created from it are unaffected.`)) {
      return;
    }
    try {
      await deleteAdminPreset(preset.id);
      setPresets(current => current.filter(row => row.id !== preset.id));
      toast('Template deleted.');
    } catch (err) {
      setError(err?.message || 'Could not delete this template.');
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border-default px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border/40 bg-brand-tint">
                <Library className="h-4 w-4 text-brand" />
              </div>
              <div>
                <h1 className="font-display text-[18px] font-bold leading-none text-text-primary">Templates</h1>
                <p className="mt-0.5 text-[12px] text-text-secondary">
                  Prebuilt assessments every organisation can start from
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search templates…"
                  className="w-52 rounded-lg border border-border-default bg-page py-2 pl-8 pr-3 text-[13px] text-text-primary transition-all placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand/20"
                />
              </div>
              <button
                onClick={() => setModal({})}
                className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-[13px] font-semibold text-on-brand transition-all hover:bg-brand-hover"
              >
                <Plus className="h-3.5 w-3.5" />New Template
              </button>
            </div>
          </div>

          <div className="mt-4 flex gap-1">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value || 'all'}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={`rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-all ${
                  statusFilter === tab.value
                    ? 'border border-brand-border/40 bg-brand-tint text-brand'
                    : 'text-text-secondary hover:bg-surface-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-5xl flex-1 px-8 py-6">
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-success-border bg-success-bg px-4 py-3">
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-success" />
              <p className="text-[13px] font-semibold text-success">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-error-border bg-error-bg px-4 py-3">
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-error" />
              <p className="text-[13px] text-error">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-24 text-text-muted">
              <Loader className="h-5 w-5 animate-spin" />
              <span className="text-[13px]">Loading…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-text-muted">
              <Library className="h-10 w-10 opacity-25" />
              <p className="text-[14px] font-semibold text-text-secondary">
                {search ? 'No matches found' : 'No templates yet'}
              </p>
              {!search && (
                <p className="max-w-[420px] text-center text-[12px]">
                  Create the shelf entry here, then add its questions by promoting an
                  assessment from the Assessments page.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="mb-1 text-[11px] text-text-muted">
                {filtered.length} template{filtered.length !== 1 ? 's' : ''}
              </p>
              {filtered.map(preset => (
                <PresetRow
                  key={preset.id}
                  preset={preset}
                  busy={busyId === preset.id}
                  onEdit={setModal}
                  onTogglePublish={handleTogglePublish}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {modal && (
          <PresetModal
            initial={modal.id ? modal : null}
            onClose={() => setModal(null)}
            onSaved={() => {
              setModal(null);
              setVersion(v => v + 1);
              toast('Template saved.');
            }}
          />
        )}
    </div>
  );
}

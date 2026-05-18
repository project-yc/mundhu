// AdminLibraryPage — CRUD for B2B library tasks (admin only)
import { useState, useEffect, useCallback } from 'react';
import {
  Library, Plus, Search, Loader, AlertCircle, CheckCircle,
  ChevronDown, Tag, Code2, Globe, Server, Shield, Smartphone,
  Database, LayoutPanelLeft, BookOpen, Pencil, Trash2, Eye, EyeOff,
  X, RefreshCw, GitBranch, Upload, FileArchive,
} from 'lucide-react';
import {
  adminGetLibraryTasks,
  adminCreateLibraryTask,
  adminUpdateLibraryTask,
  adminDeleteLibraryTask,
  adminUploadTaskZip,
} from '../../api/admin/library';

// ── constants ─────────────────────────────────────────────────────────────────
const DIFFICULTY_META = {
  easy:   { label: 'Easy',   cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  medium: { label: 'Medium', cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
  hard:   { label: 'Hard',   cls: 'bg-rose-50   text-rose-700   border-rose-200'   },
};
const SENIORITY_OPTIONS = ['junior','mid','senior','staff','principal'];
const DOMAIN_META = {
  backend:   { label: 'Backend',    Icon: Server          },
  frontend:  { label: 'Frontend',   Icon: LayoutPanelLeft },
  devops:    { label: 'DevOps',     Icon: Globe           },
  data:      { label: 'Data',       Icon: Database        },
  mobile:    { label: 'Mobile',     Icon: Smartphone      },
  security:  { label: 'Security',   Icon: Shield          },
  fullstack: { label: 'Full Stack', Icon: Code2           },
};
const FILTER_SECTIONS = [
  { key: 'difficulty',   label: 'Difficulty',   options: Object.keys(DIFFICULTY_META).map(v => ({ value: v, label: DIFFICULTY_META[v].label })) },
  { key: 'seniority',    label: 'Seniority',    options: SENIORITY_OPTIONS.map(v => ({ value: v, label: v[0].toUpperCase()+v.slice(1) })) },
  { key: 'domain',       label: 'Domain',       options: Object.entries(DOMAIN_META).map(([v,m]) => ({ value: v, label: m.label })) },
  { key: 'is_published', label: 'Status',       options: [{ value: 'true', label: 'Published' }, { value: 'false', label: 'Draft' }] },
];

const GITHUB_REPO_RE = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/?$/;
const inputCls = 'w-full px-3 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150';
const textareaCls = inputCls + ' resize-none';

// ── Filter sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({ filters, onChange, onClear }) {
  const hasActive = Object.values(filters).some(Boolean);
  return (
    <aside className="w-52 flex-shrink-0 hidden lg:flex flex-col bg-surface border-r border-border-default">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border-default">
        <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">Filters</span>
        {hasActive && <button onClick={onClear} className="text-[10px] text-brand hover:underline">Clear all</button>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {FILTER_SECTIONS.map(({ key, label, options }) => (
          <div key={key}>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.14em] mb-2">{label}</p>
            <div className="space-y-1">
              {options.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => onChange(key, filters[key] === opt.value ? '' : opt.value)}
                  className={`w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${filters[key] === opt.value ? 'bg-brand-tint text-brand' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${filters[key] === opt.value ? 'bg-brand' : 'bg-border-default'}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div>
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.14em] mb-2">Language</p>
          <input value={filters.language || ''} onChange={e => onChange('language', e.target.value)}
            placeholder="e.g. Python, Go…"
            className="w-full px-2.5 py-1.5 bg-page border border-border-default rounded-lg text-[12px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all" />
        </div>
      </div>
    </aside>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────
function TaskCard({ task, onEdit, onDelete, onTogglePublish }) {
  const [expanded, setExpanded] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const diff   = DIFFICULTY_META[task.difficulty];
  const domain = DOMAIN_META[task.domain];
  const DomainIcon = domain?.Icon ?? BookOpen;

  return (
    <div className={`bg-surface border rounded-xl transition-all duration-200 ${expanded ? 'border-brand/40 shadow-sm' : 'border-border-default hover:border-border-strong'}`}>
      {/* Header row */}
      <div className="px-5 py-4 flex items-start gap-3">
        <button type="button" className="flex-1 min-w-0 flex items-start gap-3 text-left" onClick={() => setExpanded(e => !e)}>
          <div className="w-9 h-9 rounded-lg bg-brand-tint border border-brand-border/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <DomainIcon className="w-4 h-4 text-brand" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-bold text-text-primary leading-snug">{task.title}</p>
              <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full border ${task.is_published ? 'bg-success-bg border-success-border text-success' : 'bg-surface-muted border-border-default text-text-muted'}`}>
                {task.is_published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p className="text-[12px] text-text-secondary mt-0.5 line-clamp-1">{task.description}</p>
            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {diff && <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${diff.cls}`}>{diff.label}</span>}
              {task.seniority && <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-border-default">{task.seniority[0].toUpperCase()+task.seniority.slice(1)}</span>}
              {task.domain && <span className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary border border-border-default">{DOMAIN_META[task.domain]?.label ?? task.domain}</span>}
              {task.language && <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-tint text-brand border border-brand-border/40"><Code2 className="w-2.5 h-2.5" />{task.language}</span>}
              {task.source_type === 'git' && <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"><GitBranch className="w-2.5 h-2.5" />Git</span>}
              {(task.tags ?? []).slice(0,3).map((t,i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface text-text-muted border border-border-default">
                  <Tag className="w-2.5 h-2.5" />{t}
                </span>
              ))}
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform duration-200 mt-1 ${expanded ? 'rotate-180' : ''}`} />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          <button
            onClick={() => onTogglePublish(task)}
            title={task.is_published ? 'Unpublish' : 'Publish'}
            className={`p-2 rounded-lg border transition-all text-[12px] font-semibold ${task.is_published ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100' : 'border-success-border bg-success-bg text-success hover:bg-success-bg/80'}`}
          >
            {task.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => onEdit(task)} className="p-2 rounded-lg border border-border-default text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {delConfirm ? (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-error font-semibold">Sure?</span>
              <button onClick={() => { onDelete(task.id); setDelConfirm(false); }} className="px-2 py-1 text-[11px] font-bold text-on-brand bg-error rounded-md hover:opacity-80">Yes</button>
              <button onClick={() => setDelConfirm(false)} className="px-2 py-1 text-[11px] font-semibold text-text-secondary border border-border-default rounded-md hover:bg-surface-muted">No</button>
            </div>
          ) : (
            <button onClick={() => setDelConfirm(true)} className="p-2 rounded-lg border border-border-default text-text-muted hover:text-error hover:border-error hover:bg-error-bg transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border-default px-5 pb-4 pt-3">
          <p className="text-[13px] text-text-secondary leading-relaxed">{task.description}</p>
          {task.additional_info && Object.keys(task.additional_info).length > 0 && (
            <div className="mt-3 p-3 bg-page rounded-lg border border-border-default">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Additional Info</p>
              {Object.entries(task.additional_info).map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[12px] text-text-secondary">
                  <span className="font-semibold capitalize">{k.replace(/_/g,' ')}:</span>
                  <span>{String(v)}</span>
                </div>
              ))}
            </div>
          )}
          {task.source_type === 'git' && (
            <div className="mt-3 flex flex-wrap gap-3 text-[12px] text-text-secondary">
              {task.git_repo_url && <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />{task.git_repo_url}</span>}
              {task.git_branch && <span className="text-text-muted">branch: <span className="font-semibold text-text-secondary">{task.git_branch}</span></span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Task form modal ───────────────────────────────────────────────────────────
function TaskFormModal({ task, onClose, onSaved }) {
  const isEdit = Boolean(task?.id);
  const blank = { title: '', description: '', tags: '', difficulty: 'medium', seniority: 'mid', language: '', domain: '', is_published: false, source_type: 'local', git_repo_url: '', git_branch: '' };
  const [form, setForm] = useState(isEdit ? { ...task, tags: (task.tags||[]).join(', ') } : blank);
  const [loading, setLoading]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);  // { name, s3keys }

  const set = (k, v) => setForm(f => {
    const n = { ...f, [k]: v };
    if (k === 'source_type' && v === 'local') { n.git_repo_url = ''; n.git_branch = ''; }
    if (k === 'source_type') setUploadedFile(null);
    return n;
  });

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.zip')) { setError('Only .zip files are accepted.'); return; }
    setError('');
    setUploading(true);
    try {
      const res = await adminUploadTaskZip(file);
      setUploadedFile({
        name: file.name,
        starter_bundle_s3_key: res.starter_bundle_s3_key,
        grader_bundle_s3_key:  res.grader_bundle_s3_key  || null,
        task_manifest_json:    res.task_manifest_json    || {},
      });
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.source_type === 'local' && !isEdit && !uploadedFile) {
      setError('Please upload a .zip file for this task.');
      return;
    }
    setLoading(true); setError('');
    try {
      const payload = {
        title: form.title,
        description: form.description,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        difficulty: form.difficulty,
        seniority: form.seniority,
        language: form.language,
        domain: form.domain,
        is_published: form.is_published,
        source_type: form.source_type,
        git_repo_url: form.source_type === 'git' ? form.git_repo_url.trim() || null : null,
        git_branch:   form.source_type === 'git' ? form.git_branch.trim()   || null : null,
        ...(uploadedFile ? {
          starter_bundle_s3_key: uploadedFile.starter_bundle_s3_key,
          grader_bundle_s3_key:  uploadedFile.grader_bundle_s3_key,
          task_manifest_json:    uploadedFile.task_manifest_json,
        } : {}),
      };
      let res;
      if (isEdit) res = await adminUpdateLibraryTask(task.id, payload);
      else        res = await adminCreateLibraryTask(payload);
      onSaved(res.data || res, isEdit);
    } catch (err) { setError(err.message || 'Failed to save.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-text-primary/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl bg-surface rounded-2xl border border-border-default shadow-xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-default flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-tint border border-brand-border/30 flex items-center justify-center">
              <Library className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-[15px] font-bold text-text-primary">{isEdit ? 'Edit Library Task' : 'New Library Task'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-surface-muted rounded-lg text-text-muted hover:text-text-primary"><X className="w-4 h-4" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <form id="lib-task-form" onSubmit={handleSubmit}>
            <div className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Title <span className="text-error">*</span></label>
                <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g., Build a REST API endpoint" className={inputCls} />
              </div>
              {/* Description */}
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Description <span className="text-error">*</span></label>
                <textarea required value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Describe what the candidate needs to accomplish..." className={textareaCls} />
              </div>

              {/* Row: difficulty + seniority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Difficulty</label>
                  <select value={form.difficulty} onChange={e => set('difficulty', e.target.value)} className={inputCls}>
                    {['easy','medium','hard'].map(v => <option key={v} value={v}>{v[0].toUpperCase()+v.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Seniority</label>
                  <select value={form.seniority} onChange={e => set('seniority', e.target.value)} className={inputCls}>
                    {SENIORITY_OPTIONS.map(v => <option key={v} value={v}>{v[0].toUpperCase()+v.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              {/* Row: domain + language */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Domain</label>
                  <select value={form.domain} onChange={e => set('domain', e.target.value)} className={inputCls}>
                    <option value="">— None —</option>
                    {Object.entries(DOMAIN_META).map(([v,m]) => <option key={v} value={v}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Language</label>
                  <input value={form.language} onChange={e => set('language', e.target.value)} placeholder="Python, Go, TypeScript…" className={inputCls} />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Tags (comma-separated)</label>
                <input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="rest-api, debugging, postgres" className={inputCls} />
              </div>

              {/* Source type */}
              <div>
                <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Codebase Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {['local','git'].map(v => (
                    <button key={v} type="button" onClick={() => set('source_type', v)}
                      className={`px-3 py-2.5 rounded-xl border text-[12px] font-semibold transition-all ${form.source_type === v ? 'border-brand bg-brand-tint text-brand' : 'border-border-default bg-page text-text-secondary hover:border-border-strong'}`}
                    >{v === 'local' ? 'Local / Upload' : 'Git Repository'}</button>
                  ))}
                </div>
              </div>
              {form.source_type === 'local' && (
                <div className="space-y-2">
                  <label
                    htmlFor="task-zip-upload"
                    className={`flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                      uploadedFile
                        ? 'border-success-border bg-success-bg'
                        : 'border-border-default hover:border-brand hover:bg-brand-tint/30'
                    }`}
                  >
                    {uploading ? (
                      <><Loader className="w-5 h-5 text-brand animate-spin" /><span className="text-[12px] text-text-secondary">Uploading…</span></>
                    ) : uploadedFile ? (
                      <><FileArchive className="w-5 h-5 text-success" /><span className="text-[12px] font-semibold text-success">{uploadedFile.name}</span><span className="text-[11px] text-text-muted">Uploaded to S3 ✓  — click to replace</span></>
                    ) : (
                      <><Upload className="w-5 h-5 text-text-muted" /><span className="text-[12px] font-semibold text-text-secondary">Click to upload task .zip</span><span className="text-[11px] text-text-muted">Must contain a <code>starter/</code> folder</span></>
                    )}
                    <input id="task-zip-upload" type="file" accept=".zip" className="hidden" onChange={handleFileChange} disabled={uploading} />
                  </label>
                  {isEdit && !uploadedFile && (
                    <p className="text-[11px] text-text-muted">Leave empty to keep the existing file.</p>
                  )}
                </div>
              )}
              {form.source_type === 'git' && (
                <div className="space-y-3 p-3 bg-page rounded-xl border border-border-default">
                  <div>
                    <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Repository URL</label>
                    <input value={form.git_repo_url} onChange={e => set('git_repo_url', e.target.value)} placeholder="https://github.com/org/repo" className={inputCls} />
                    {form.git_repo_url && !GITHUB_REPO_RE.test(form.git_repo_url) && (
                      <p className="mt-1 text-[11px] text-error">Must match https://github.com/[owner]/[repo]</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Branch</label>
                    <input value={form.git_branch} onChange={e => set('git_branch', e.target.value)} placeholder="main" className={inputCls} />
                  </div>
                </div>
              )}

              {/* Publish toggle */}
              <div className="flex items-center justify-between px-3 py-3 bg-page border border-border-default rounded-xl">
                <div>
                  <p className="text-[13px] font-semibold text-text-primary">Publish to library</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Recruiters can browse and attach published tasks</p>
                </div>
                <button
                  type="button"
                  onClick={() => set('is_published', !form.is_published)}
                  className={`relative w-11 h-6 rounded-full border transition-all duration-200 flex-shrink-0 ${form.is_published ? 'bg-brand border-brand' : 'bg-surface-muted border-border-default'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${form.is_published ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-error-bg border border-error-border rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-error flex-shrink-0" />
                  <p className="text-[12px] text-error">{error}</p>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-default bg-surface-muted/30 flex-shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-secondary hover:bg-surface-muted rounded-lg transition-all">Cancel</button>
          <button type="submit" form="lib-task-form" disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-on-brand text-[13px] font-semibold rounded-lg hover:bg-brand-hover transition-all disabled:opacity-60"
          >
            {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminLibraryPage() {
  const [tasks,    setTasks]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');
  const [search,   setSearch]   = useState('');
  const [filters,  setFilters]  = useState({ difficulty: '', seniority: '', domain: '', is_published: '', language: '' });
  const [modal,    setModal]    = useState(null); // task object to edit, or 'new'

  const fetchTasks = useCallback(async (overrideFilters, overrideSearch) => {
    setLoading(true); setError('');
    try {
      const f = overrideFilters ?? filters;
      const s = overrideSearch !== undefined ? overrideSearch : search;
      const res = await adminGetLibraryTasks({ ...f, search: s.trim() || undefined });
      setTasks(res.data ?? res ?? []);
    } catch (err) { setError(err.message || 'Failed to load tasks.'); }
    finally { setLoading(false); }
  }, [filters, search]);

  useEffect(() => { fetchTasks(); }, []);

  const toast = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000); };

  const handleFilterChange = (key, val) => {
    const next = { ...filters, [key]: val };
    setFilters(next);
    fetchTasks(next, undefined);
  };

  const clearFilters = () => {
    const cleared = { difficulty: '', seniority: '', domain: '', is_published: '', language: '' };
    setFilters(cleared);
    setSearch('');
    fetchTasks(cleared, '');
  };

  const handleTogglePublish = async (task) => {
    try {
      const res = await adminUpdateLibraryTask(task.id, { is_published: !task.is_published });
      const updated = res.data || res;
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      toast(updated.is_published ? 'Task published.' : 'Task unpublished.');
    } catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    try {
      await adminDeleteLibraryTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast('Task deleted.');
    } catch (err) { setError(err.message); }
  };

  const handleSaved = (saved, isEdit) => {
    if (isEdit) setTasks(prev => prev.map(t => t.id === saved.id ? saved : t));
    else        setTasks(prev => [saved, ...prev]);
    toast(isEdit ? 'Task updated.' : 'Task created.');
    setModal(null);
  };

  const hasActive = Object.values(filters).some(Boolean) || search;
  const publishedCount = tasks.filter(t => t.is_published).length;

  return (
    <div className="flex flex-col h-full min-h-0 bg-page">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-border-default bg-surface">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-tint border border-brand-border/40 flex items-center justify-center">
              <Library className="w-4.5 h-4.5 text-brand" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-text-primary font-display leading-none">Task Library</h1>
              <p className="text-[12px] text-text-secondary mt-0.5">
                {tasks.length} tasks · {publishedCount} published
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchTasks()}
                placeholder="Search tasks…"
                className="pl-8 pr-3 py-2 w-52 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all"
              />
            </div>
            <button onClick={() => fetchTasks()} className="p-2 rounded-lg border border-border-default text-text-secondary hover:bg-surface-muted transition-all" title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setModal('new')} className="flex items-center gap-2 px-4 py-2 bg-brand text-on-brand text-[13px] font-semibold rounded-xl hover:bg-brand-hover transition-all">
              <Plus className="w-3.5 h-3.5" />New Task
            </button>
          </div>
        </div>

        {/* Active filter pills */}
        {hasActive && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Active:</span>
            {filters.difficulty && <FilterPill label={`Difficulty: ${DIFFICULTY_META[filters.difficulty]?.label}`} onRemove={() => handleFilterChange('difficulty', '')} />}
            {filters.seniority  && <FilterPill label={`Seniority: ${filters.seniority[0].toUpperCase()+filters.seniority.slice(1)}`} onRemove={() => handleFilterChange('seniority', '')} />}
            {filters.domain     && <FilterPill label={`Domain: ${DOMAIN_META[filters.domain]?.label}`} onRemove={() => handleFilterChange('domain', '')} />}
            {filters.is_published && <FilterPill label={filters.is_published === 'true' ? 'Published' : 'Draft'} onRemove={() => handleFilterChange('is_published', '')} />}
            {filters.language   && <FilterPill label={`Lang: ${filters.language}`} onRemove={() => handleFilterChange('language', '')} />}
            {search             && <FilterPill label={`"${search}"`} onRemove={() => { setSearch(''); fetchTasks(undefined, ''); }} />}
            <button onClick={clearFilters} className="text-[10px] text-error hover:underline ml-1">Clear all</button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        <FilterSidebar filters={filters} onChange={handleFilterChange} onClear={clearFilters} />

        <main className="flex-1 overflow-y-auto p-6">
          {success && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-success-bg border border-success-border rounded-xl">
              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
              <p className="text-[13px] text-success font-semibold">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
              <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
              <p className="text-[13px] text-error">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-text-muted">
              <Loader className="w-5 h-5 animate-spin" /><span className="text-[13px]">Loading library…</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-text-muted">
              <Library className="w-10 h-10 opacity-25" />
              <p className="text-[14px] font-semibold text-text-secondary">{hasActive ? 'No matches' : 'Library is empty'}</p>
              <p className="text-[12px] text-center max-w-xs">
                {hasActive ? 'Try adjusting your filters.' : 'Create your first library task for recruiters.'}
              </p>
              {!hasActive && (
                <button onClick={() => setModal('new')} className="px-4 py-2 bg-brand text-on-brand text-[13px] font-semibold rounded-xl hover:bg-brand-hover transition-all">
                  Create First Task
                </button>
              )}
              {hasActive && <button onClick={clearFilters} className="text-[13px] text-brand hover:underline font-semibold">Clear filters</button>}
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              <p className="text-[11px] text-text-muted mb-1">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={(t) => setModal(t)}
                  onDelete={handleDelete}
                  onTogglePublish={handleTogglePublish}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {modal && (
        <TaskFormModal
          task={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-tint text-brand text-[11px] font-semibold rounded-full border border-brand-border/40">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 leading-none">&times;</button>
    </span>
  );
}

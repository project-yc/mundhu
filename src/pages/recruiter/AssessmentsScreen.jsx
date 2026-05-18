// AssessmentsScreen — list, create, and expand assessments
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import {
  Plus, X, Loader, AlertCircle, CheckCircle, Users,
  Clock, Zap, ArrowRight, Code, GitBranch, FileCode,
  Check, Tag, FolderOpen, Upload, XCircle,
  Search, ChevronDown, Copy, TrendingUp, UserCheck, Activity,
  Sparkles, MessageSquare, ZapOff,
} from 'lucide-react';
import {
  createAssessment, getAllAssessments, createTask, uploadTaskZip,
  getRecruiterStats, getAssessmentCandidates,
} from '../../api/recruiter/assessment.jsx';

// ─── Shared tokens / helpers ──────────────────────────────────────────────────
const DURATION_PRESETS = [30, 45, 60, 90, 120];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - d) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const STATUS_CONFIG = {
  'Invited':     { color: '#22D3EE', bg: '#CFFAFE', border: '#0E7490', label: 'Invited' },
  'In Progress': { color: '#D97706', bg: '#FFFBEB', border: '#FCD34D', label: 'Active' },
  'Submitted':   { color: '#16A34A', bg: '#F0FDF4', border: '#86EFAC', label: 'Submitted' },
  'Expired':     { color: '#64748B', bg: '#F1F5F9', border: '#E2E8F0', label: 'Expired'  },
};

function CandidateStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Invited'];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}>
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function FunnelBar({ counts }) {
  const total = counts?.total || 0;
  if (total === 0) return <span className="text-[11px] text-text-muted">No candidates yet</span>;
  const segs = [
    { key: 'invited',     color: '#22D3EE' },
    { key: 'in_progress', color: '#D97706' },
    { key: 'submitted',   color: '#16A34A' },
    { key: 'expired',     color: '#CBD5E1' },
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 rounded-full overflow-hidden w-24 bg-border-default">
        {segs.map(({ key, color }) => {
          const pct = (counts?.[key] || 0) / total * 100;
          return pct > 0 ? <div key={key} className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} /> : null;
        })}
      </div>
      <span className="text-[11px] text-text-secondary">{total} candidate{total !== 1 ? 's' : ''}</span>
    </div>
  );
}

function StepTrack({ current }) {
  const steps = [
    { label: 'Assessment Details', desc: 'Name, description, duration' },
    { label: 'Task Configuration', desc: 'What candidates will build' },
  ];
  return (
    <div className="space-y-1">
      {steps.map((step, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${i === current ? 'bg-surface' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 transition-all duration-300 ${
            i < current ? 'bg-brand text-on-brand' : i === current ? 'border-2 border-brand text-brand' : 'border border-border-default text-text-secondary'
          }`}>
            {i < current ? <Check className="w-3 h-3" /> : i + 1}
          </div>
          <div>
            <p className={`text-[13px] font-semibold transition-colors ${i <= current ? 'text-text-primary' : 'text-text-secondary'}`}>{step.label}</p>
            <p className={`text-[11px] mt-0.5 transition-colors ${i === current ? 'text-text-secondary' : 'text-text-muted'}`}>{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, optional, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">{label}</span>
        {optional ? <span className="text-[10px] text-text-muted normal-case">(optional)</span> : <span className="text-error text-xs">*</span>}
      </label>
      {children}
    </div>
  );
}

function FInput({ value, onChange, placeholder, type = 'text', min }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min}
      className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150" />
  );
}

function FTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-3.5 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted resize-none focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150" />
  );
}

function EmptyGrid() {
  return (
    <div className="relative mx-auto" style={{ width: 88, height: 72 }}>
      <div className="absolute inset-0 border border-border-default rounded-xl" />
      <div className="absolute top-0 left-0 right-0 h-5 border-b border-border-default rounded-t-xl flex items-center px-3 gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-border-default" />
        <div className="w-8 h-1 rounded-full bg-border-default" />
      </div>
      {[32, 48, 62].map((top, i) => (
        <div key={i} className="absolute left-3 right-3 flex items-center gap-2" style={{ top }}>
          <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-brand/50' : 'bg-border-default'}`} />
          <div className={`h-1 rounded-full ${i === 0 ? 'bg-brand/20' : 'bg-surface-muted'}`} style={{ width: i === 0 ? 40 : i === 1 ? 28 : 34 }} />
        </div>
      ))}
    </div>
  );
}

function CandidatePanel({ assessmentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getAssessmentCandidates(assessmentId)
      .then(d => setData(d.data || d))
      .catch(() => setData({ candidates: [] }))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  const candidates = data?.candidates || [];
  const filtered = filter === 'all' ? candidates : candidates.filter(c => c.status === filter);

  const handleCopy = (email, idx) => {
    navigator.clipboard.writeText(email).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusTabs = [
    { key: 'all', label: 'All', count: candidates.length },
    { key: 'Invited', label: 'Invited', count: candidates.filter(c => c.status === 'Invited').length },
    { key: 'In Progress', label: 'Active', count: candidates.filter(c => c.status === 'In Progress').length },
    { key: 'Submitted', label: 'Submitted', count: candidates.filter(c => c.status === 'Submitted').length },
    { key: 'Expired', label: 'Expired', count: candidates.filter(c => c.status === 'Expired').length },
  ].filter(t => t.count > 0 || t.key === 'all');

  return (
    <div className="border-t border-border-default bg-page">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-1 bg-surface border border-border-default rounded-lg p-0.5">
          {statusTabs.map(({ key, label, count }) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 ${filter === key ? 'bg-surface-muted text-text-primary' : 'text-text-secondary hover:text-text-secondary'}`}>
              {label}<span className={`text-[10px] ${filter === key ? 'text-text-secondary' : 'text-text-muted'}`}>{count}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="p-1.5 text-text-secondary hover:text-text-secondary hover:bg-surface-muted rounded-md transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader className="w-4 h-4 text-brand animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-text-secondary">No candidates yet.</p>
          <p className="text-[11px] text-text-muted mt-1">Use "Invite Candidates" to send invite links.</p>
        </div>
      ) : (
        <div className="divide-y divide-border-subtle">
          <div className="grid grid-cols-[minmax(0,1fr)_120px_120px_110px_80px] gap-4 px-5 py-2 bg-surface">
            {['Candidate', 'Status', 'Invited', 'Expires', ''].map((col, i) => (
              <p key={i} className={`text-[10px] font-semibold text-text-muted uppercase tracking-[0.14em] ${i === 4 ? 'text-right' : ''}`}>{col}</p>
            ))}
          </div>
          {filtered.map((c, idx) => (
            <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_120px_120px_110px_80px] gap-4 items-center px-5 py-3 hover:bg-surface transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-surface-muted border border-border-default flex items-center justify-center text-[10px] font-bold text-text-secondary flex-shrink-0 font-display">{getInitials(c.candidate_name)}</div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-text-primary truncate">{c.candidate_name || 'Unknown'}</p>
                  <p className="text-[11px] text-text-secondary truncate">{c.candidate_email}</p>
                </div>
              </div>
              <div><CandidateStatusBadge status={c.status} /></div>
              <p className="text-[12px] text-text-secondary">{formatDate(c.invited_at)}</p>
              <p className="text-[12px] text-text-secondary">{c.expires_at ? formatDateTime(c.expires_at) : '—'}</p>
              <div className="flex justify-end">
                <button onClick={() => handleCopy(c.candidate_email, idx)} title="Copy email"
                  className="p-1.5 text-text-muted hover:text-brand hover:bg-brand-tint rounded-md transition-all">
                  {copied === idx ? <CheckCircle className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AssessmentsScreen() {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId,  setExpandedId]  = useState(null);

  const [showWizard,    setShowWizard]    = useState(false);
  const [wizardStep,    setWizardStep]    = useState(0);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError,   setWizardError]   = useState('');
  const [assessmentForm, setAssessmentForm] = useState({ name: '', description: '', duration_minutes: '', ai_level: 'full' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', tags: '', source_type: 'local', git_repo_url: '', git_branch: '' });

  const folderInputRef = useRef(null);
  const [folderUpload,   setFolderUpload]   = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState,    setUploadState]    = useState('idle');
  const [uploadError,    setUploadError]    = useState('');

  useEffect(() => { fetchAssessments(); fetchStats(); }, []);

  const fetchAssessments = async () => {
    setLoading(true); setError('');
    try { const d = await import('../../api/recruiter/assessment.jsx').then(m => m.getAllAssessments()); setAssessments(d.data || d); }
    catch (err) { setError(err.message || 'Failed to fetch assessments.'); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try { const d = await getRecruiterStats(); setStats(d.data || d); } catch {}
  };

  const resetUpload = () => {
    setFolderUpload(null); setUploadProgress(0); setUploadState('idle'); setUploadError('');
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const openWizard = () => {
    setWizardStep(0); setWizardError('');
    setAssessmentForm({ name: '', description: '', duration_minutes: '', ai_level: 'full' });
    setTaskForm({ title: '', description: '', tags: '', source_type: 'local', git_repo_url: '', git_branch: '' });
    resetUpload();
    setShowWizard(true);
  };

  const closeWizard = () => { setShowWizard(false); setWizardStep(0); setWizardError(''); resetUpload(); };

  const handleFolderSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    resetUpload();
    const rootDir = files[0].webkitRelativePath.split('/')[0] || 'task';
    setUploadState('zipping');
    try {
      const zip = new JSZip();
      for (const file of files) zip.file(file.webkitRelativePath || file.name, file);
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const zipFile = new File([blob], `${rootDir}.zip`, { type: 'application/zip' });
      setUploadState('uploading');
      const result = await uploadTaskZip(zipFile, pct => setUploadProgress(pct));
      setFolderUpload({
        fileName: rootDir,
        fileCount: files.length,
        s3_key: result.s3_key,
        starter_bundle_s3_key: result.starter_bundle_s3_key,
        grader_bundle_s3_key: result.grader_bundle_s3_key,
        task_manifest_json: result.task_manifest_json,
      });
      setUploadState('done');
    } catch (err) {
      setUploadState('error');
      setUploadError(err.message || 'Upload failed. Please try again.');
    }
  };

  const handleStep1Next = () => {
    if (!assessmentForm.name.trim() || !assessmentForm.description.trim() || !assessmentForm.duration_minutes) {
      setWizardError('Please fill in all required fields.'); return;
    }
    setWizardError(''); setWizardStep(1);
  };

  const handleFinalCreate = async () => {
    if (!taskForm.title.trim() || !taskForm.description.trim()) { setWizardError('Please fill in task title and description.'); return; }
    if (taskForm.source_type === 'git' && !taskForm.git_repo_url.trim()) { setWizardError('Please enter a Git repository URL.'); return; }
    if (taskForm.source_type === 'local' && !folderUpload?.s3_key) { setWizardError('Please upload a folder for the local task source.'); return; }
    setWizardLoading(true); setWizardError('');
    try {
      const { createAssessment: ca, createTask: ct } = await import('../../api/recruiter/assessment.jsx');
      const assessmentData = await ca(
        assessmentForm.name,
        assessmentForm.description,
        parseInt(assessmentForm.duration_minutes),
        { ai_level: assessmentForm.ai_level },
      );
      const newAssessment = assessmentData.data || assessmentData;
      const tags = taskForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const additionalInfo = folderUpload?.s3_key ? { uploaded_folder: folderUpload.fileName, file_count: folderUpload.fileCount } : {};
      const taskData = await ct(newAssessment.id, taskForm.title, taskForm.description, tags, [], additionalInfo, taskForm.source_type,
        taskForm.source_type === 'git' ? taskForm.git_repo_url : null,
        taskForm.source_type === 'git' ? taskForm.git_branch : null,
        folderUpload?.s3_key || null,
        folderUpload?.starter_bundle_s3_key || null,
        folderUpload?.grader_bundle_s3_key || null,
        folderUpload?.task_manifest_json || null);
      const newTask = taskData.data || taskData;
      setAssessments(prev => [...prev, { ...newAssessment, tasks: [newTask], candidate_counts: { total: 0, invited: 0, in_progress: 0, submitted: 0, expired: 0 } }]);
      setSuccess('Assessment created successfully!');
      closeWizard();
      fetchStats();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setWizardError(err.message || 'Failed to create assessment. Please try again.');
    } finally {
      setWizardLoading(false);
    }
  };

  const toggleExpand = useCallback((id) => setExpandedId(prev => prev === id ? null : id), []);

  const totalAssessments = assessments.length;
  const readyAssessments = assessments.filter(a => (a.tasks?.length ?? 0) > 0 || (a.library_task_attachments?.length ?? 0) > 0).length;

  const filtered = useMemo(() => assessments.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    const isReady = (a.tasks?.length ?? 0) > 0 || (a.library_task_attachments?.length ?? 0) > 0;
    const matchStatus = statusFilter === 'all' || (statusFilter === 'ready' && isReady) || (statusFilter === 'incomplete' && !isReady);
    return matchSearch && matchStatus;
  }), [assessments, search, statusFilter]);

  const metricsData = useMemo(() => {
    if (stats) return {
      assessments: stats.assessments ?? totalAssessments,
      total: stats.candidates?.total ?? 0, invited: stats.candidates?.invited ?? 0,
      in_progress: stats.candidates?.in_progress ?? 0, submitted: stats.candidates?.submitted ?? 0,
      expired: stats.candidates?.expired ?? 0,
    };
    return assessments.reduce((acc, a) => {
      const c = a.candidate_counts || {};
      acc.total += c.total || 0; acc.invited += c.invited || 0; acc.in_progress += c.in_progress || 0;
      acc.submitted += c.submitted || 0; acc.expired += c.expired || 0;
      return acc;
    }, { assessments: totalAssessments, total: 0, invited: 0, in_progress: 0, submitted: 0, expired: 0 });
  }, [stats, assessments, totalAssessments]);

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-bold text-text-primary font-display tracking-tight">Assessments</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">Configure and manage technical assessments.</p>
        </div>
        <button onClick={openWizard} className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-lg transition-colors active:scale-[0.97]">
          <Plus className="w-4 h-4" strokeWidth={2.5} />New Assessment
        </button>
      </div>

      {/* Toasts */}
      {success && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-success-bg border border-success-border rounded-xl">
          <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
          <p className="text-[13px] font-medium text-success">{success}</p>
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-[13px] font-medium text-error">{error}</p>
        </div>
      )}

      {/* Layout */}
      <div className="flex gap-5 items-start">
        <div className="flex-1 min-w-0 space-y-5">

          {/* Metrics strip */}
          <div className="grid grid-cols-5 gap-px bg-border-default rounded-xl overflow-hidden border border-border-default">
            {[
              { label: 'Assessments', value: metricsData.assessments, color: '#0F172A',   sub: 'total'       },
              { label: 'Invited',     value: metricsData.invited,     color: '#22D3EE',   sub: 'sent links'  },
              { label: 'Active',      value: metricsData.in_progress, color: '#D97706',   sub: 'working now' },
              { label: 'Submitted',   value: metricsData.submitted,   color: '#16A34A',   sub: 'completed'   },
              { label: 'Expired',     value: metricsData.expired,     color: '#64748B',   sub: 'timed out'   },
            ].map(({ label, value, color, sub }) => (
              <div key={label} className="bg-page px-5 py-5">
                <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] mb-2">{label}</p>
                <p className="text-[26px] font-bold leading-none mb-1 font-display" style={{ color: loading ? '#E2E8F0' : color }}>
                  {loading ? '—' : value}
                </p>
                <p className="text-[11px] text-text-muted">{sub}</p>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 bg-surface border border-border-default rounded-lg flex-1 min-w-[160px] focus-within:border-border-strong">
              <Search className="w-3.5 h-3.5 text-text-secondary flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assessments…"
                className="flex-1 bg-transparent text-[13px] text-text-primary placeholder:text-text-secondary focus:outline-none" />
            </div>
            <div className="flex items-center gap-0.5 bg-surface border border-border-default rounded-lg p-1">
              {[
                { key: 'all',        label: 'All',        count: totalAssessments },
                { key: 'ready',      label: 'Ready',      count: readyAssessments },
                { key: 'incomplete', label: 'Incomplete', count: totalAssessments - readyAssessments },
              ].map(({ key, label, count }) => (
                <button key={key} onClick={() => setStatusFilter(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${statusFilter === key ? 'bg-surface-muted text-text-primary' : 'text-text-secondary hover:text-text-secondary'}`}>
                  {label}<span className={`text-[10px] font-bold ${statusFilter === key ? 'text-text-secondary' : 'text-text-muted'}`}>{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Loading / Empty */}
          {loading && <div className="flex justify-center py-24"><Loader className="w-5 h-5 text-brand animate-spin" /></div>}

          {!loading && assessments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-7"><EmptyGrid /></div>
              <h3 className="text-[15px] font-bold text-text-primary font-display mb-2">No assessments yet</h3>
              <p className="text-[13px] text-text-secondary mb-8 max-w-xs leading-relaxed">Create your first assessment and configure the task candidates will solve.</p>
              <button onClick={openWizard} className="flex items-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-lg active:scale-[0.97]">
                <Plus className="w-4 h-4" strokeWidth={2.5} />Create First Assessment
              </button>
            </div>
          )}

          {!loading && assessments.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-[13px] text-text-secondary mb-3">No assessments match your filters.</p>
              <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="text-[12px] text-brand hover:underline">Clear filters</button>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <div className="rounded-xl border border-border-default overflow-hidden">
              <div className="hidden md:grid grid-cols-[minmax(0,1fr)_80px_160px_140px_80px_120px] gap-4 items-center px-5 py-2.5 bg-surface border-b border-border-default">
                {['Assessment', 'Duration', 'Tags', 'Candidates', 'Status', ''].map((col, i) => (
                  <p key={i} className={`text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] ${i === 5 ? 'text-right' : ''}`}>{col}</p>
                ))}
              </div>
              <div className="divide-y divide-border-default">
                {filtered.map(assessment => {
                  const task = assessment.tasks?.[0] ?? assessment.library_task_attachments?.[0]?.library_task;
                  const isReady = !!task;
                  const counts = assessment.candidate_counts;
                  const isExpanded = expandedId === assessment.id;

                  return (
                    <div key={assessment.id}>
                      <div
                        className={`group flex md:grid md:grid-cols-[minmax(0,1fr)_80px_160px_140px_80px_120px] gap-4 items-center px-5 py-4 cursor-pointer flex-wrap transition-colors ${isExpanded ? 'bg-surface' : 'bg-page hover:bg-surface'}`}
                        onClick={() => toggleExpand(assessment.id)}
                      >
                        <div className="min-w-0 w-full md:w-auto">
                          <div className="flex items-center gap-2 mb-0.5">
                            <ChevronDown className={`w-3 h-3 text-text-muted flex-shrink-0 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                            <p className="text-[13px] font-semibold text-text-primary truncate">{assessment.name}</p>
                          </div>
                          {task ? (
                            <p className="flex items-center gap-1 text-[11px] text-text-secondary ml-5 truncate"><Code className="w-3 h-3 flex-shrink-0" />{task.title}</p>
                          ) : (
                            <p className="text-[11px] text-text-muted italic ml-5">No task configured</p>
                          )}
                        </div>
                        <div className="hidden md:flex items-center gap-1.5 text-[12px] text-text-secondary"><Clock className="w-3 h-3 text-text-secondary" />{assessment.duration_minutes}m</div>
                        <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                          {task?.tags?.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-surface-muted border border-border-default text-text-secondary">{tag}</span>
                          ))}
                          {(task?.tags?.length ?? 0) > 2 && <span className="text-[11px] text-text-muted">+{task.tags.length - 2}</span>}
                          {!task?.tags?.length && <span className="text-[11px] text-text-muted">—</span>}
                        </div>
                        <div className="hidden md:block" onClick={e => e.stopPropagation()}><FunnelBar counts={counts} /></div>
                        <div className="hidden md:block">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md ${isReady ? 'bg-success-bg text-success border border-success-border' : 'bg-warning-bg text-warning border border-warning-border'}`}>
                            <span className={`w-1 h-1 rounded-full ${isReady ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />{isReady ? 'Ready' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center justify-end gap-2 w-full md:w-auto" onClick={e => e.stopPropagation()}>
                          {isReady ? (
                            <button onClick={() => navigate(`/${assessment.id}/invite`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-tint border border-brand-border text-brand text-[11px] font-semibold rounded-lg hover:bg-brand-tint-light hover:border-brand transition-all">
                              <Users className="w-3 h-3" />Invite<ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-text-muted italic pr-1 hidden md:block">Add task first</span>
                          )}
                        </div>
                      </div>
                      {isExpanded && <CandidatePanel assessmentId={assessment.id} onClose={() => setExpandedId(null)} />}
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-3 bg-surface border-t border-border-default flex items-center justify-between">
                <p className="text-[11px] text-text-muted">{filtered.length} of {totalAssessments} assessment{totalAssessments !== 1 ? 's' : ''}</p>
                <p className="text-[11px] text-text-muted">Click any row to view candidates</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar stats */}
        {assessments.length > 0 && (
          <div className="w-[256px] flex-shrink-0 space-y-4 hidden xl:block">
            <div className="rounded-xl border border-border-default bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-brand" />
                <p className="text-[11px] font-bold text-text-primary uppercase tracking-[0.12em]">Completion Rate</p>
              </div>
              <div className="p-4 space-y-3">
                {[
                  { label: 'Invited', key: 'invited', color: '#22D3EE' },
                  { label: 'Started', key: 'in_progress', color: '#D97706' },
                  { label: 'Submitted', key: 'submitted', color: '#16A34A' },
                  { label: 'Expired', key: 'expired', color: '#CBD5E1' },
                ].map(({ label, key, color }) => {
                  const val = metricsData[key] || 0;
                  const total = metricsData.total || 1;
                  const pct = Math.round((val / total) * 100);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-text-secondary">{label}</span>
                        <span className="text-[11px] font-bold text-text-primary">{val} <span className="font-normal text-text-secondary">({pct}%)</span></span>
                      </div>
                      <div className="h-1 bg-surface-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border-default bg-surface overflow-hidden">
              <div className="px-4 py-3 border-b border-border-default flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-brand" />
                <p className="text-[11px] font-bold text-text-primary uppercase tracking-[0.12em]">Assessment Health</p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { label: 'Ready to send',   value: readyAssessments,                                                         color: '#16A34A' },
                  { label: 'Need a task',      value: totalAssessments - readyAssessments,                                     color: '#D97706' },
                  { label: 'Have candidates',  value: assessments.filter(a => (a.candidate_counts?.total || 0) > 0).length,   color: '#22D3EE' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-border-subtle last:border-0">
                    <span className="text-[12px] text-text-secondary">{label}</span>
                    <span className="text-[13px] font-bold font-display" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Wizard Modal ─────────────────────────────────────────────────────── */}
      {showWizard && (
        <>
          <div className="fixed inset-0 bg-text-primary/40 backdrop-blur-sm z-40" onClick={closeWizard} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-[760px] bg-surface border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] pointer-events-auto" onClick={e => e.stopPropagation()}>

              <div className="flex items-center justify-between px-7 py-5 border-b border-border-default flex-shrink-0">
                <div>
                  <h2 className="text-[15px] font-bold text-text-primary font-display">New Assessment</h2>
                  <p className="text-[11px] text-text-secondary mt-0.5">{wizardStep === 0 ? 'Step 1 of 2 — Define assessment basics' : 'Step 2 of 2 — Configure the task'}</p>
                </div>
                <button onClick={closeWizard} className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden min-h-0">
                <div className="w-56 flex-shrink-0 hidden sm:flex flex-col gap-5 bg-page border-r border-border-default p-5">
                  <StepTrack current={wizardStep} />
                  {wizardStep === 1 && assessmentForm.name && (
                    <div className="p-3 rounded-xl border border-border-default bg-surface">
                      <p className="text-[10px] font-semibold text-brand uppercase tracking-wider mb-2">Assessment</p>
                      <p className="text-[13px] font-semibold text-text-primary leading-snug">{assessmentForm.name}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-text-secondary">
                        <Clock className="w-3 h-3" />{assessmentForm.duration_minutes} min
                      </div>
                    </div>
                  )}
                  <div className="flex-1" />
                  <div className="p-3 rounded-xl bg-surface border border-border-default">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Note</p>
                    <p className="text-[11px] text-text-muted leading-relaxed">Each assessment contains one task. Candidates receive a timed link.</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-w-0">
                  <div className="p-7 space-y-6">
                    {wizardError && (
                      <div className="flex items-start gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
                        <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                        <p className="text-[13px] text-error">{wizardError}</p>
                      </div>
                    )}

                    {wizardStep === 0 && (
                      <div className="space-y-5">
                        <Field label="Assessment Name">
                          <FInput value={assessmentForm.name} onChange={e => setAssessmentForm({ ...assessmentForm, name: e.target.value })} placeholder="e.g., Senior Backend Engineer — Q2 2026" />
                        </Field>
                        <Field label="Description">
                          <FTextarea value={assessmentForm.description} onChange={e => setAssessmentForm({ ...assessmentForm, description: e.target.value })} placeholder="What skills will this assessment evaluate?" rows={4} />
                        </Field>
                        <Field label="Duration">
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {DURATION_PRESETS.map(p => (
                              <button key={p} type="button" onClick={() => setAssessmentForm({ ...assessmentForm, duration_minutes: String(p) })}
                                className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-all ${assessmentForm.duration_minutes === String(p) ? 'bg-brand-tint border-brand text-brand' : 'bg-transparent border-border-default text-text-secondary hover:border-border-strong hover:text-text-secondary'}`}>
                                {p}m
                              </button>
                            ))}
                          </div>
                          <FInput type="number" value={assessmentForm.duration_minutes} onChange={e => setAssessmentForm({ ...assessmentForm, duration_minutes: e.target.value })} placeholder="Or enter custom minutes…" min="1" />
                        </Field>
                        <Field label="AI Assistance">
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'full', label: 'Full Agent', desc: 'Orchestrator + chat + inline completions', Icon: Sparkles },
                              { value: 'chat_only', label: 'Chat + Inline', desc: 'Chat (manual context) + inline completions', Icon: MessageSquare },
                              { value: 'inline_completions', label: 'Inline Only', desc: 'Code suggestions only — no chat panel', Icon: Zap },
                              { value: 'none', label: 'No AI', desc: 'All AI features disabled', Icon: ZapOff },
                            ].map(({ value, label, desc, Icon }) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => setAssessmentForm({ ...assessmentForm, ai_level: value })}
                                className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all duration-150 ${
                                  assessmentForm.ai_level === value
                                    ? 'bg-[#083344] border-[#06B6D4]'
                                    : 'bg-transparent border-[#27272A] hover:border-[#3F3F46]'
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <Icon className={`w-3.5 h-3.5 ${assessmentForm.ai_level === value ? 'text-[#06B6D4]' : 'text-[#52525B]'}`} />
                                  <span className={`text-[12px] font-bold ${assessmentForm.ai_level === value ? 'text-[#06B6D4]' : 'text-[#A1A1AA]'}`}>{label}</span>
                                </div>
                                <span className="text-[10px] text-[#52525B] leading-relaxed">{desc}</span>
                              </button>
                            ))}
                          </div>
                        </Field>
                      </div>
                    )}

                    {wizardStep === 1 && (
                      <div className="space-y-5">
                        <Field label="Task Title">
                          <FInput value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="e.g., Debug the Payment Service" />
                        </Field>
                        <Field label="Task Description">
                          <FTextarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Describe what the candidate needs to implement, debug, or improve…" rows={4} />
                        </Field>
                        <Field label="Tags" optional>
                          <FInput value={taskForm.tags} onChange={e => setTaskForm({ ...taskForm, tags: e.target.value })} placeholder="Python, FastAPI, debugging — comma separated" />
                          {taskForm.tags && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                              {taskForm.tags.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                                <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand-tint border border-brand-border text-brand">
                                  <Tag className="w-2.5 h-2.5" />{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </Field>
                        <Field label="Source Type" optional>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { value: 'local', label: 'Local Upload',   icon: FileCode  },
                              { value: 'git',   label: 'Git Repository', icon: GitBranch },
                            ].map(({ value, label, icon: Icon }) => (
                              <button key={value} type="button" onClick={() => { setTaskForm({ ...taskForm, source_type: value }); resetUpload(); }}
                                className={`flex items-center justify-center gap-2 py-3 text-[13px] font-semibold rounded-xl border transition-all ${taskForm.source_type === value ? 'bg-brand-tint border-brand text-brand' : 'bg-transparent border-border-default text-text-secondary hover:border-border-strong hover:text-text-secondary'}`}>
                                <Icon className="w-4 h-4" />{label}
                              </button>
                            ))}
                          </div>
                        </Field>

                        {taskForm.source_type === 'local' && (
                          <div className="rounded-xl border border-border-default bg-page p-4">
                            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-[0.14em] mb-3">Task Folder <span className="text-error">*</span></p>
                            {uploadState === 'idle' && (
                              <label className="flex flex-col items-center justify-center gap-3 py-8 border border-dashed border-border-default hover:border-brand/40 rounded-xl cursor-pointer transition-all hover:bg-brand/[0.02]">
                                <div className="w-10 h-10 rounded-xl bg-brand-tint border border-brand-border flex items-center justify-center">
                                  <FolderOpen className="w-5 h-5 text-brand" />
                                </div>
                                <div className="text-center">
                                  <span className="text-[13px] font-semibold text-text-secondary block">Select project folder</span>
                                  <span className="text-[11px] text-text-muted">All files will be compressed and uploaded securely</span>
                                </div>
                                <input ref={folderInputRef} type="file" webkitdirectory="true" multiple onChange={handleFolderSelect} className="hidden" />
                              </label>
                            )}
                            {(uploadState === 'zipping' || uploadState === 'uploading') && (
                              <div className="flex flex-col items-center gap-3 py-6">
                                <Loader className="w-5 h-5 text-brand animate-spin" />
                                <p className="text-[13px] font-medium text-text-secondary">{uploadState === 'zipping' ? 'Compressing files…' : `Uploading — ${uploadProgress}%`}</p>
                                {uploadState === 'uploading' && <div className="w-full h-1 bg-surface-muted rounded-full overflow-hidden"><div className="h-full bg-brand rounded-full transition-all" style={{ width: `${uploadProgress}%` }} /></div>}
                              </div>
                            )}
                            {uploadState === 'done' && (
                              <div className="flex items-center gap-3 px-4 py-3 bg-success-bg border border-success-border rounded-xl">
                                <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold text-text-primary truncate">{folderUpload?.fileName}/</p>
                                  <p className="text-[11px] text-success">{folderUpload?.fileCount} files uploaded</p>
                                </div>
                                <button onClick={resetUpload} className="p-1.5 text-text-secondary hover:text-error rounded-md flex-shrink-0"><XCircle className="w-4 h-4" /></button>
                              </div>
                            )}
                            {uploadState === 'error' && (
                              <div className="space-y-3">
                                <div className="flex items-start gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
                                  <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                                  <p className="text-[13px] text-error">{uploadError}</p>
                                </div>
                                <button onClick={resetUpload} className="flex items-center gap-2 text-[12px] text-brand hover:underline"><Upload className="w-3.5 h-3.5" /> Try again</button>
                              </div>
                            )}
                          </div>
                        )}

                        {taskForm.source_type === 'git' && (
                          <div className="rounded-xl border border-border-default bg-page p-4 space-y-4">
                            <Field label="Repository URL">
                              <FInput type="url" value={taskForm.git_repo_url} onChange={e => setTaskForm({ ...taskForm, git_repo_url: e.target.value })} placeholder="https://github.com/your-org/repo.git" />
                            </Field>
                            <Field label="Branch" optional>
                              <FInput value={taskForm.git_branch} onChange={e => setTaskForm({ ...taskForm, git_branch: e.target.value })} placeholder="main" />
                            </Field>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-7 py-4 border-t border-border-default bg-page flex-shrink-0">
                {wizardStep === 1 ? (
                  <button onClick={() => { setWizardStep(0); setWizardError(''); }} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-all">← Back</button>
                ) : (
                  <button onClick={closeWizard} className="px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-secondary hover:bg-surface-muted rounded-lg transition-all">Cancel</button>
                )}
                <button onClick={wizardStep === 0 ? handleStep1Next : handleFinalCreate} disabled={wizardLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-on-brand text-[13px] font-bold rounded-lg transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed">
                  {wizardLoading ? (
                    <><Loader className="w-4 h-4 animate-spin" />{wizardStep === 0 ? 'Saving…' : 'Creating…'}</>
                  ) : wizardStep === 0 ? (
                    <><span>Continue</span><ArrowRight className="w-4 h-4" /></>
                  ) : (
                    <><Check className="w-4 h-4" /><span>Create Assessment</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

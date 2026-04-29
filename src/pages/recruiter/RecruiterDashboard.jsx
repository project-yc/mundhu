// RecruiterDashboard — Electric Ashby Design System v2
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import {
  Plus, X, Loader, AlertCircle, CheckCircle, Users, LogOut,
  Clock, Zap, ArrowRight, Code, GitBranch, FileCode,
  Check, Tag, FolderOpen, Upload, XCircle,
  Search, ChevronDown, ChevronRight, Copy, Mail,
  Activity, TrendingUp, UserCheck,
} from 'lucide-react';
import {
  createAssessment, getAllAssessments, createTask, uploadTaskZip,
  getRecruiterStats, getAssessmentCandidates,
} from '../../api/recruiter/assessment.jsx';

// ─── Utilities ────────────────────────────────────────────────────────────────

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

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Design tokens
// bg:#0C0C0E  surface:#111113  elevated:#17171A  hover:#1C1C20
// border:#27272A  border+:#3F3F46
// text-4:#52525B  text-3:#A1A1AA  text-2:#E4E4E7  text-1:#FAFAFA
// cyan:#06B6D4  cyan-h:#0891B2  cyan-bg:#083344  cyan-b:#0E7490
// green:#10B981  green-bg:#022C22  green-b:#065F46
// amber:#F59E0B  rose:#F43F5E  rose-bg:#1C0813  rose-b:#881337

// ─── Candidate status config ──────────────────────────────────────────────────

const STATUS_CONFIG = {
  'Invited':     { color: '#06B6D4', bg: '#083344', border: '#0E7490', label: 'Invited' },
  'In Progress': { color: '#F59E0B', bg: '#1C150A', border: '#78350F', label: 'Active' },
  'Submitted':   { color: '#10B981', bg: '#022C22', border: '#065F46', label: 'Submitted' },
  'Expired':     { color: '#52525B', bg: '#17171A', border: '#27272A', label: 'Expired'  },
};

function CandidateStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Invited'];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.color }} />
      {cfg.label}
    </span>
  );
}

// ─── Funnel bar ───────────────────────────────────────────────────────────────

function FunnelBar({ counts }) {
  const total = counts?.total || 0;
  if (total === 0) return <span className="text-[11px] text-[#3F3F46]">No candidates yet</span>;
  const segs = [
    { key: 'invited',     color: '#06B6D4' },
    { key: 'in_progress', color: '#F59E0B' },
    { key: 'submitted',   color: '#10B981' },
    { key: 'expired',     color: '#3F3F46' },
  ];
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 rounded-full overflow-hidden w-24 bg-[#27272A]">
        {segs.map(({ key, color }) => {
          const pct = (counts?.[key] || 0) / total * 100;
          return pct > 0 ? (
            <div key={key} className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
          ) : null;
        })}
      </div>
      <span className="text-[11px] text-[#52525B]">{total} candidate{total !== 1 ? 's' : ''}</span>
    </div>
  );
}

// ─── Step sidebar (wizard) ────────────────────────────────────────────────────

function StepTrack({ current }) {
  const steps = [
    { label: 'Assessment Details', desc: 'Name, description, duration' },
    { label: 'Task Configuration', desc: 'What candidates will build' },
  ];
  return (
    <div className="space-y-1">
      {steps.map((step, i) => (
        <div key={i} className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-200 ${i === current ? 'bg-[#111113]' : ''}`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5 transition-all duration-300 ${
            i < current ? 'bg-[#06B6D4] text-[#0C0C0E]'
            : i === current ? 'border-2 border-[#06B6D4] text-[#06B6D4]'
            : 'border border-[#27272A] text-[#52525B]'
          }`}>
            {i < current ? <Check className="w-3 h-3" /> : i + 1}
          </div>
          <div>
            <p className={`text-[13px] font-semibold transition-colors ${i <= current ? 'text-[#E4E4E7]' : 'text-[#52525B]'}`}>{step.label}</p>
            <p className={`text-[11px] mt-0.5 transition-colors ${i === current ? 'text-[#A1A1AA]' : 'text-[#3F3F46]'}`}>{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Form primitives ──────────────────────────────────────────────────────────

function Field({ label, optional, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">{label}</span>
        {optional
          ? <span className="text-[10px] text-[#3F3F46] normal-case tracking-normal">(optional)</span>
          : <span className="text-[#F43F5E] text-xs leading-none">*</span>
        }
      </label>
      {children}
    </div>
  );
}

function FInput({ value, onChange, placeholder, type = 'text', min }) {
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder} min={min}
      className="w-full px-3.5 py-2.5 bg-[#0C0C0E] border border-[#27272A] rounded-lg text-[13px] text-[#E4E4E7] placeholder:text-[#3F3F46] focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]/15 transition-all duration-150"
    />
  );
}

function FTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full px-3.5 py-2.5 bg-[#0C0C0E] border border-[#27272A] rounded-lg text-[13px] text-[#E4E4E7] placeholder:text-[#3F3F46] resize-none focus:outline-none focus:border-[#06B6D4] focus:ring-1 focus:ring-[#06B6D4]/15 transition-all duration-150"
    />
  );
}

// ─── Empty state illustration (pure CSS) ─────────────────────────────────────

function EmptyGrid() {
  return (
    <div className="relative mx-auto" style={{ width: 88, height: 72 }}>
      <div className="absolute inset-0 border border-[#27272A] rounded-xl" />
      <div className="absolute top-0 left-0 right-0 h-5 border-b border-[#27272A] rounded-t-xl flex items-center px-3 gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-[#27272A]" />
        <div className="w-8 h-1 rounded-full bg-[#27272A]" />
      </div>
      {[32, 48, 62].map((top, i) => (
        <div key={i} className="absolute left-3 right-3 flex items-center gap-2" style={{ top }}>
          <div className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-[#06B6D4]/50' : 'bg-[#27272A]'}`} />
          <div className={`h-1 rounded-full ${i === 0 ? 'bg-[#06B6D4]/20' : 'bg-[#1C1C20]'}`} style={{ width: i === 0 ? 40 : i === 1 ? 28 : 34 }} />
        </div>
      ))}
    </div>
  );
}

// ─── Candidate panel (expandable per assessment) ──────────────────────────────

function CandidatePanel({ assessmentId, onClose }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied]   = useState(null);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    setLoading(true);
    getAssessmentCandidates(assessmentId)
      .then(res => setData(res.data || res))
      .catch(() => setData({ candidates: [] }))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  const candidates = data?.candidates || [];
  const filtered = filter === 'all' ? candidates : candidates.filter(c => c.status === filter);

  const handleCopy = (email, idx) => {
    copyToClipboard(email);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const statusTabs = [
    { key: 'all',         label: 'All',       count: candidates.length },
    { key: 'Invited',     label: 'Invited',   count: candidates.filter(c => c.status === 'Invited').length },
    { key: 'In Progress', label: 'Active',    count: candidates.filter(c => c.status === 'In Progress').length },
    { key: 'Submitted',   label: 'Submitted', count: candidates.filter(c => c.status === 'Submitted').length },
    { key: 'Expired',     label: 'Expired',   count: candidates.filter(c => c.status === 'Expired').length },
  ].filter(t => t.count > 0 || t.key === 'all');

  return (
    <div className="border-t border-[#27272A] bg-[#0C0C0E] animate-fadeIn">
      {/* Panel toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1C1C20]">
        <div className="flex items-center gap-1 bg-[#111113] border border-[#27272A] rounded-lg p-0.5">
          {statusTabs.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all duration-150 ${
                filter === key ? 'bg-[#1C1C20] text-[#E4E4E7]' : 'text-[#52525B] hover:text-[#A1A1AA]'
              }`}
            >
              {label}
              <span className={`text-[10px] ${filter === key ? 'text-[#A1A1AA]' : 'text-[#3F3F46]'}`}>{count}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="p-1.5 text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#1C1C20] rounded-md transition-all duration-150">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Candidate list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader className="w-4 h-4 text-[#06B6D4] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-[13px] text-[#52525B]">No candidates yet.</p>
          <p className="text-[11px] text-[#3F3F46] mt-1">Use "Invite Candidates" to send invite links.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#1C1C20]">
          {/* Column headers */}
          <div className="grid grid-cols-[minmax(0,1fr)_120px_120px_110px_80px] gap-4 px-5 py-2 bg-[#111113]">
            {['Candidate', 'Status', 'Invited', 'Expires', ''].map((col, i) => (
              <p key={i} className={`text-[10px] font-semibold text-[#3F3F46] uppercase tracking-[0.14em] ${i === 4 ? 'text-right' : ''}`}>{col}</p>
            ))}
          </div>
          {filtered.map((c, idx) => (
            <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_120px_120px_110px_80px] gap-4 items-center px-5 py-3 hover:bg-[#111113] transition-colors duration-100">
              {/* Candidate info */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#17171A] border border-[#27272A] flex items-center justify-center text-[10px] font-bold text-[#A1A1AA] flex-shrink-0 font-display">
                  {getInitials(c.candidate_name)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#E4E4E7] truncate">{c.candidate_name || 'Unknown'}</p>
                  <p className="text-[11px] text-[#52525B] truncate">{c.candidate_email}</p>
                </div>
              </div>
              {/* Status */}
              <div><CandidateStatusBadge status={c.status} /></div>
              {/* Invited at */}
              <p className="text-[12px] text-[#52525B]">{formatDate(c.invited_at)}</p>
              {/* Expires */}
              <p className="text-[12px] text-[#52525B]">{c.expires_at ? formatDateTime(c.expires_at) : '—'}</p>
              {/* Copy email */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleCopy(c.candidate_email, idx)}
                  title="Copy email"
                  className="p-1.5 text-[#3F3F46] hover:text-[#06B6D4] hover:bg-[#083344] rounded-md transition-all duration-150"
                >
                  {copied === idx ? <CheckCircle className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Activity feed ────────────────────────────────────────────────────────────

function ActivityFeed({ assessments }) {
  // Build a flat, time-sorted list from candidate counts we already have
  // Real events would come from an events endpoint; here we derive from counts
  const events = useMemo(() => {
    const out = [];
    for (const a of assessments) {
      const c = a.candidate_counts;
      if (!c) continue;
      if (c.submitted > 0) out.push({ type: 'submitted', count: c.submitted, name: a.name, created_at: a.created_at });
      if (c.in_progress > 0) out.push({ type: 'active', count: c.in_progress, name: a.name, created_at: a.created_at });
      if (c.invited > 0) out.push({ type: 'invited', count: c.invited, name: a.name, created_at: a.created_at });
    }
    return out.slice(0, 8);
  }, [assessments]);

  const iconMap = {
    submitted: { icon: CheckCircle, color: '#10B981' },
    active:    { icon: Activity,    color: '#F59E0B' },
    invited:   { icon: Mail,        color: '#06B6D4' },
  };

  const labelMap = {
    submitted: (n, count) => `${count} candidate${count > 1 ? 's' : ''} submitted in "${n}"`,
    active:    (n, count) => `${count} actively working on "${n}"`,
    invited:   (n, count) => `${count} invited to "${n}"`,
  };

  if (events.length === 0) return (
    <div className="py-6 text-center">
      <p className="text-[12px] text-[#3F3F46]">No activity yet.</p>
      <p className="text-[11px] text-[#27272A] mt-1">Invite candidates to get started.</p>
    </div>
  );

  return (
    <div className="space-y-0 divide-y divide-[#1C1C20]">
      {events.map((ev, i) => {
        const { icon: Icon, color } = iconMap[ev.type];
        return (
          <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-[#111113] transition-colors duration-100">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-3 h-3" style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-[#A1A1AA] leading-snug">{labelMap[ev.type](ev.name, ev.count)}</p>
              <p className="text-[11px] text-[#3F3F46] mt-0.5">{formatDate(ev.created_at)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function RecruiterDashboard() {
  const navigate = useNavigate();

  const user = useMemo(() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } }, []);
  const org  = useMemo(() => { try { return JSON.parse(localStorage.getItem('org')  || '{}'); } catch { return {}; } }, []);

  const [assessments, setAssessments] = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [search,      setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId,  setExpandedId]  = useState(null); // expanded assessment id

  // Wizard
  const [showWizard,    setShowWizard]    = useState(false);
  const [wizardStep,    setWizardStep]    = useState(0);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [wizardError,   setWizardError]   = useState('');
  const [assessmentForm, setAssessmentForm] = useState({ name: '', description: '', duration_minutes: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', tags: '', source_type: 'local', git_repo_url: '', git_branch: '' });

  // Upload
  const folderInputRef = useRef(null);
  const [folderUpload,   setFolderUpload]   = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState,    setUploadState]    = useState('idle');
  const [uploadError,    setUploadError]    = useState('');

  useEffect(() => {
    fetchAssessments();
    fetchStats();
  }, []);

  const handleLogout = () => {
    ['authToken', 'refreshToken', 'user', 'userRole', 'org'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const fetchAssessments = async () => {
    setLoading(true); setError('');
    try {
      const data = await getAllAssessments();
      setAssessments(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch assessments.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await getRecruiterStats();
      setStats(data.data || data);
    } catch {
      // stats are non-critical; fail silently
    } finally {
      setStatsLoading(false);
    }
  };

  const resetUpload = () => {
    setFolderUpload(null); setUploadProgress(0); setUploadState('idle'); setUploadError('');
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  const openWizard = () => {
    setWizardStep(0); setWizardError('');
    setAssessmentForm({ name: '', description: '', duration_minutes: '' });
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
      setFolderUpload({ fileName: rootDir, fileCount: files.length, s3_key: result.s3_key });
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
    if (!taskForm.title.trim() || !taskForm.description.trim()) {
      setWizardError('Please fill in task title and description.'); return;
    }
    if (taskForm.source_type === 'git' && !taskForm.git_repo_url.trim()) {
      setWizardError('Please enter a Git repository URL.'); return;
    }
    if (taskForm.source_type === 'local' && !folderUpload?.s3_key) {
      setWizardError('Please upload a folder for the local task source.'); return;
    }
    setWizardLoading(true); setWizardError('');
    try {
      const assessmentData = await createAssessment(assessmentForm.name, assessmentForm.description, parseInt(assessmentForm.duration_minutes));
      const newAssessment = assessmentData.data || assessmentData;
      const tags = taskForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const additionalInfo = folderUpload?.s3_key ? { uploaded_folder: folderUpload.fileName, file_count: folderUpload.fileCount } : {};
      const taskData = await createTask(
        newAssessment.id, taskForm.title, taskForm.description, tags, [], additionalInfo,
        taskForm.source_type,
        taskForm.source_type === 'git' ? taskForm.git_repo_url : null,
        taskForm.source_type === 'git' ? taskForm.git_branch : null,
        folderUpload?.s3_key || null,
      );
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

  const toggleExpand = useCallback((id) => {
    setExpandedId(prev => (prev === id ? null : id));
  }, []);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const totalAssessments = assessments.length;
  const readyAssessments = assessments.filter(a => (a.tasks?.length ?? 0) > 0).length;

  const filtered = useMemo(() => assessments.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    const isReady = (a.tasks?.length ?? 0) > 0;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'ready'      && isReady)  ||
      (statusFilter === 'incomplete' && !isReady);
    return matchSearch && matchStatus;
  }), [assessments, search, statusFilter]);

  const userName = user?.full_name || user?.name || user?.email || 'Recruiter';
  const orgName  = org?.name || 'Organization';

  // Stats values — prefer API data, fall back to local derivation
  const metricsData = useMemo(() => {
    if (stats) {
      return {
        assessments: stats.assessments ?? totalAssessments,
        total:       stats.candidates?.total       ?? 0,
        invited:     stats.candidates?.invited      ?? 0,
        in_progress: stats.candidates?.in_progress  ?? 0,
        submitted:   stats.candidates?.submitted    ?? 0,
        expired:     stats.candidates?.expired      ?? 0,
      };
    }
    // Derive from local assessment data while stats load
    return assessments.reduce((acc, a) => {
      const c = a.candidate_counts || {};
      acc.total       += c.total       || 0;
      acc.invited     += c.invited     || 0;
      acc.in_progress += c.in_progress || 0;
      acc.submitted   += c.submitted   || 0;
      acc.expired     += c.expired     || 0;
      return acc;
    }, { assessments: totalAssessments, total: 0, invited: 0, in_progress: 0, submitted: 0, expired: 0 });
  }, [stats, assessments, totalAssessments]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0C0C0E] font-sans antialiased">

      {/* ━━ HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header className="sticky top-0 z-40 h-14 border-b border-[#27272A] bg-[#0C0C0E]/95 backdrop-blur-md">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center gap-3">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#0C0C0E]" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] font-bold tracking-[0.08em] text-[#FAFAFA] font-display">MUNDHU</span>
          </div>
          <div className="w-px h-4 bg-[#27272A] mx-1 flex-shrink-0" />
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#111113] border border-[#27272A] rounded-md">
            <div className="w-2 h-2 rounded-sm bg-[#06B6D4]" />
            <span className="text-[11px] font-medium text-[#A1A1AA]">{orgName}</span>
          </div>
          <div className="flex-1" />
          {/* Search */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#111113] border border-[#27272A] rounded-lg w-56 focus-within:border-[#3F3F46] transition-colors duration-150">
            <Search className="w-3.5 h-3.5 text-[#52525B] flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assessments…" className="flex-1 bg-transparent text-[12px] text-[#E4E4E7] placeholder:text-[#3F3F46] focus:outline-none" />
          </div>
          <button onClick={openWizard} className="flex items-center gap-2 px-3.5 py-2 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0C0C0E] text-[12px] font-bold rounded-lg transition-colors duration-150 active:scale-[0.97] flex-shrink-0">
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="hidden sm:block">New Assessment</span>
            <span className="sm:hidden">New</span>
          </button>
          <button onClick={handleLogout} title={`${userName} — Logout`} className="w-8 h-8 rounded-full bg-[#17171A] border border-[#27272A] flex items-center justify-center text-[11px] font-bold text-[#A1A1AA] hover:border-[#3F3F46] hover:text-[#E4E4E7] transition-all duration-150 flex-shrink-0 font-display">
            {getInitials(userName)}
          </button>
        </div>
      </header>

      {/* ━━ MAIN ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="max-w-[1280px] mx-auto px-6 py-8">

        {/* Toasts */}
        {success && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-[#022C22] border border-[#065F46] rounded-xl animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
            <p className="text-[13px] font-medium text-[#10B981]">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0" />
            <p className="text-[13px] font-medium text-[#F43F5E]">{error}</p>
          </div>
        )}

        {/* Page header */}
        <div className="flex items-start justify-between mb-7">
          <div>
            <h1 className="text-xl font-bold text-[#FAFAFA] tracking-tight font-display">Assessments</h1>
            <p className="text-[13px] text-[#52525B] mt-0.5">Configure and track technical assessments across all candidates.</p>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ─────────────────────────────────────────────────── */}
        <div className="flex gap-6 items-start">

          {/* ── LEFT: main content ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* ─── Metrics strip (5 tiles) ──────────────────────────────────────── */}
            <div className="grid grid-cols-5 gap-px bg-[#27272A] rounded-xl overflow-hidden border border-[#27272A]">
              {[
                { label: 'Assessments', value: metricsData.assessments, color: '#FAFAFA',   sub: 'total'      },
                { label: 'Invited',     value: metricsData.invited,     color: '#06B6D4',   sub: 'sent links' },
                { label: 'Active',      value: metricsData.in_progress, color: '#F59E0B',   sub: 'working now'},
                { label: 'Submitted',   value: metricsData.submitted,   color: '#10B981',   sub: 'completed'  },
                { label: 'Expired',     value: metricsData.expired,     color: '#52525B',   sub: 'timed out'  },
              ].map(({ label, value, color, sub }) => (
                <div key={label} className="bg-[#0C0C0E] px-5 py-5">
                  <p className="text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] mb-2">{label}</p>
                  <p className="text-[26px] font-bold leading-none mb-1 font-display" style={{ color: loading || statsLoading ? '#27272A' : color }}>
                    {loading || statsLoading ? '—' : value}
                  </p>
                  <p className="text-[11px] text-[#3F3F46]">{sub}</p>
                </div>
              ))}
            </div>

            {/* ─── Toolbar ──────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-3">
              <div className="flex md:hidden items-center gap-2 px-3 py-2 bg-[#111113] border border-[#27272A] rounded-lg flex-1 focus-within:border-[#3F3F46] transition-colors">
                <Search className="w-3.5 h-3.5 text-[#52525B]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="flex-1 bg-transparent text-[13px] text-[#E4E4E7] placeholder:text-[#52525B] focus:outline-none" />
              </div>
              <div className="flex items-center gap-0.5 bg-[#111113] border border-[#27272A] rounded-lg p-1">
                {[
                  { key: 'all',        label: 'All',        count: totalAssessments },
                  { key: 'ready',      label: 'Ready',      count: readyAssessments },
                  { key: 'incomplete', label: 'Incomplete',  count: totalAssessments - readyAssessments },
                ].map(({ key, label, count }) => (
                  <button key={key} onClick={() => setStatusFilter(key)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all duration-150 ${statusFilter === key ? 'bg-[#1C1C20] text-[#E4E4E7]' : 'text-[#52525B] hover:text-[#A1A1AA]'}`}>
                    {label}
                    <span className={`text-[10px] font-bold ${statusFilter === key ? 'text-[#A1A1AA]' : 'text-[#3F3F46]'}`}>{count}</span>
                  </button>
                ))}
              </div>
              <div className="ml-auto text-[11px] text-[#3F3F46]">
                {!loading && filtered.length > 0 && `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
              </div>
            </div>

            {/* ─── Loading ───────────────────────────────────────────────────────── */}
            {loading && (
              <div className="flex items-center justify-center py-24">
                <Loader className="w-5 h-5 text-[#06B6D4] animate-spin" />
              </div>
            )}

            {/* ─── Empty state ────────────────────────────────────────────────────── */}
            {!loading && assessments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
                <div className="mb-7"><EmptyGrid /></div>
                <h3 className="text-[15px] font-bold text-[#E4E4E7] font-display mb-2">No assessments yet</h3>
                <p className="text-[13px] text-[#52525B] mb-8 max-w-xs leading-relaxed">Create your first assessment and configure the task candidates will solve.</p>
                <button onClick={openWizard} className="flex items-center gap-2 px-4 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0C0C0E] text-[13px] font-bold rounded-lg transition-colors duration-150 active:scale-[0.97]">
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Create First Assessment
                </button>
              </div>
            )}

            {!loading && assessments.length > 0 && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-[13px] text-[#52525B] mb-3">No assessments match your filters.</p>
                <button onClick={() => { setSearch(''); setStatusFilter('all'); }} className="text-[12px] text-[#06B6D4] hover:underline">Clear filters</button>
              </div>
            )}

            {/* ─── Assessment table ─────────────────────────────────────────────── */}
            {!loading && filtered.length > 0 && (
              <div className="rounded-xl border border-[#27272A] overflow-hidden">
                {/* Column head */}
                <div className="hidden md:grid grid-cols-[minmax(0,1fr)_80px_160px_140px_80px_120px] gap-4 items-center px-5 py-2.5 bg-[#111113] border-b border-[#27272A]">
                  {['Assessment', 'Duration', 'Tags', 'Candidates', 'Status', ''].map((col, i) => (
                    <p key={i} className={`text-[10px] font-semibold text-[#52525B] uppercase tracking-[0.14em] ${i === 5 ? 'text-right' : ''}`}>{col}</p>
                  ))}
                </div>

                <div className="divide-y divide-[#27272A]">
                  {filtered.map((assessment, idx) => {
                    const task    = assessment.tasks?.[0];
                    const isReady = !!task;
                    const counts  = assessment.candidate_counts;
                    const isExpanded = expandedId === assessment.id;

                    return (
                      <div key={assessment.id} className="animate-rowIn" style={{ animationDelay: `${idx * 20}ms` }}>
                        {/* Main row */}
                        <div
                          className={`group flex md:grid md:grid-cols-[minmax(0,1fr)_80px_160px_140px_80px_120px] gap-4 items-center px-5 py-4 transition-colors duration-100 cursor-pointer flex-wrap ${isExpanded ? 'bg-[#111113]' : 'bg-[#0C0C0E] hover:bg-[#111113]'}`}
                          onClick={() => toggleExpand(assessment.id)}
                        >
                          {/* Name + task */}
                          <div className="min-w-0 w-full md:w-auto">
                            <div className="flex items-center gap-2 mb-0.5">
                              <ChevronDown className={`w-3 h-3 text-[#3F3F46] flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                              <p className="text-[13px] font-semibold text-[#E4E4E7] truncate">{assessment.name}</p>
                            </div>
                            {task ? (
                              <p className="flex items-center gap-1 text-[11px] text-[#52525B] ml-5 truncate">
                                <Code className="w-3 h-3 flex-shrink-0" />{task.title}
                              </p>
                            ) : (
                              <p className="text-[11px] text-[#3F3F46] italic ml-5">No task configured</p>
                            )}
                          </div>

                          {/* Duration */}
                          <div className="hidden md:flex items-center gap-1.5 text-[12px] text-[#A1A1AA]">
                            <Clock className="w-3 h-3 text-[#52525B]" />{assessment.duration_minutes}m
                          </div>

                          {/* Tags */}
                          <div className="hidden md:flex items-center gap-1.5 flex-wrap">
                            {task?.tags?.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-[#17171A] border border-[#27272A] text-[#A1A1AA]">{tag}</span>
                            ))}
                            {(task?.tags?.length ?? 0) > 2 && <span className="text-[11px] text-[#3F3F46]">+{task.tags.length - 2}</span>}
                            {!task?.tags?.length && <span className="text-[11px] text-[#3F3F46]">—</span>}
                          </div>

                          {/* Candidate funnel */}
                          <div className="hidden md:block" onClick={e => e.stopPropagation()}>
                            <FunnelBar counts={counts} />
                          </div>

                          {/* Ready badge */}
                          <div className="hidden md:block">
                            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md ${isReady ? 'bg-[#022C22] text-[#10B981] border border-[#065F46]' : 'bg-[#1C1005] text-[#F59E0B] border border-[#78350F]/60'}`}>
                              <span className={`w-1 h-1 rounded-full ${isReady ? 'bg-[#10B981]' : 'bg-[#F59E0B]'}`} />
                              {isReady ? 'Ready' : 'Draft'}
                            </span>
                          </div>

                          {/* Action */}
                          <div className="flex items-center justify-end gap-2 w-full md:w-auto" onClick={e => e.stopPropagation()}>
                            {isReady ? (
                              <button
                                onClick={() => navigate(`/${assessment.id}/invite`)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#083344] border border-[#0E7490] text-[#06B6D4] text-[11px] font-semibold rounded-lg hover:bg-[#0a3d52] hover:border-[#06B6D4] transition-all duration-150"
                              >
                                <Users className="w-3 h-3" />
                                Invite
                                <ArrowRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                              </button>
                            ) : (
                              <span className="text-[11px] text-[#3F3F46] italic pr-1 hidden md:block">Add task first</span>
                            )}
                          </div>
                        </div>

                        {/* Expandable candidate panel */}
                        {isExpanded && (
                          <CandidatePanel
                            assessmentId={assessment.id}
                            onClose={() => setExpandedId(null)}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Table footer */}
                <div className="px-5 py-3 bg-[#111113] border-t border-[#27272A] flex items-center justify-between">
                  <p className="text-[11px] text-[#3F3F46]">{filtered.length} of {totalAssessments} assessment{totalAssessments !== 1 ? 's' : ''}</p>
                  <p className="text-[11px] text-[#3F3F46]">Click any row to view candidates</p>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT: activity sidebar ────────────────────────────────────────── */}
          {assessments.length > 0 && (
            <div className="w-[280px] flex-shrink-0 space-y-4">

              {/* Completion ring panel */}
              <div className="rounded-xl border border-[#27272A] bg-[#111113] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <p className="text-[11px] font-bold text-[#E4E4E7] uppercase tracking-[0.12em]">Completion Rate</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {/* Funnel breakdown */}
                  {[
                    { label: 'Invited',     key: 'invited',     color: '#06B6D4' },
                    { label: 'Started',     key: 'in_progress', color: '#F59E0B' },
                    { label: 'Submitted',   key: 'submitted',   color: '#10B981' },
                    { label: 'Expired',     key: 'expired',     color: '#3F3F46' },
                  ].map(({ label, key, color }) => {
                    const val = metricsData[key] || 0;
                    const total = metricsData.total || 1;
                    const pct = Math.round((val / total) * 100);
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] text-[#A1A1AA]">{label}</span>
                          <span className="text-[11px] font-bold text-[#E4E4E7]">{val} <span className="font-normal text-[#52525B]">({pct}%)</span></span>
                        </div>
                        <div className="h-1 bg-[#1C1C20] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    );
                  })}

                  {metricsData.total === 0 && (
                    <p className="text-[12px] text-[#3F3F46] text-center py-2">No candidates yet.</p>
                  )}
                </div>
              </div>

              {/* Quick assessment stats */}
              <div className="rounded-xl border border-[#27272A] bg-[#111113] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <p className="text-[11px] font-bold text-[#E4E4E7] uppercase tracking-[0.12em]">Assessment Health</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { label: 'Ready to send',  value: readyAssessments,                          color: '#10B981' },
                    { label: 'Need a task',    value: totalAssessments - readyAssessments,       color: '#F59E0B' },
                    { label: 'Have candidates', value: assessments.filter(a => (a.candidate_counts?.total || 0) > 0).length, color: '#06B6D4' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-[#1C1C20] last:border-0">
                      <span className="text-[12px] text-[#A1A1AA]">{label}</span>
                      <span className="text-[13px] font-bold font-display" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity feed */}
              <div className="rounded-xl border border-[#27272A] bg-[#111113] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#27272A]">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-[#06B6D4]" />
                    <p className="text-[11px] font-bold text-[#E4E4E7] uppercase tracking-[0.12em]">Activity</p>
                  </div>
                </div>
                <ActivityFeed assessments={assessments} />
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ━━ WIZARD MODAL ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {showWizard && (
        <>
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 animate-fadeIn" onClick={closeWizard} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-[760px] bg-[#111113] border border-[#27272A] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[88vh] pointer-events-auto animate-slideInUp" onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-[#27272A] flex-shrink-0">
                <div>
                  <h2 className="text-[15px] font-bold text-[#FAFAFA] font-display">New Assessment</h2>
                  <p className="text-[11px] text-[#52525B] mt-0.5">{wizardStep === 0 ? 'Step 1 of 2 — Define assessment basics' : 'Step 2 of 2 — Configure the task'}</p>
                </div>
                <button onClick={closeWizard} className="w-8 h-8 flex items-center justify-center text-[#52525B] hover:text-[#E4E4E7] hover:bg-[#1C1C20] rounded-lg transition-all duration-150">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex flex-1 overflow-hidden min-h-0">
                {/* Left sidebar */}
                <div className="w-56 flex-shrink-0 hidden sm:flex flex-col gap-5 bg-[#0C0C0E] border-r border-[#27272A] p-5">
                  <StepTrack current={wizardStep} />
                  {wizardStep === 1 && assessmentForm.name && (
                    <div className="p-3 rounded-xl border border-[#27272A] bg-[#111113] animate-fadeIn">
                      <p className="text-[10px] font-semibold text-[#06B6D4] uppercase tracking-wider mb-2">Assessment</p>
                      <p className="text-[13px] font-semibold text-[#E4E4E7] leading-snug">{assessmentForm.name}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[#52525B]">
                        <Clock className="w-3 h-3" />{assessmentForm.duration_minutes} min
                      </div>
                    </div>
                  )}
                  <div className="flex-1" />
                  <div className="p-3 rounded-xl bg-[#111113] border border-[#27272A]">
                    <p className="text-[10px] font-semibold text-[#3F3F46] uppercase tracking-wider mb-1.5">Note</p>
                    <p className="text-[11px] text-[#3F3F46] leading-relaxed">Each assessment contains one task. Candidates receive a timed link.</p>
                  </div>
                </div>

                {/* Form panel */}
                <div className="flex-1 overflow-y-auto min-w-0">
                  <div className="p-7 space-y-6">
                    {wizardError && (
                      <div className="flex items-start gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl animate-fadeIn">
                        <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0 mt-0.5" />
                        <p className="text-[13px] text-[#F43F5E]">{wizardError}</p>
                      </div>
                    )}

                    {/* ── Step 1 ── */}
                    {wizardStep === 0 && (
                      <div className="space-y-5 animate-fadeIn">
                        <Field label="Assessment Name">
                          <FInput value={assessmentForm.name} onChange={e => setAssessmentForm({ ...assessmentForm, name: e.target.value })} placeholder="e.g., Senior Backend Engineer — Q2 2026" />
                        </Field>
                        <Field label="Description">
                          <FTextarea value={assessmentForm.description} onChange={e => setAssessmentForm({ ...assessmentForm, description: e.target.value })} placeholder="What skills and areas will this assessment evaluate?" rows={4} />
                        </Field>
                        <Field label="Duration">
                          <div className="flex gap-2 mb-3 flex-wrap">
                            {DURATION_PRESETS.map(p => (
                              <button key={p} type="button" onClick={() => setAssessmentForm({ ...assessmentForm, duration_minutes: String(p) })} className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-all duration-150 ${assessmentForm.duration_minutes === String(p) ? 'bg-[#083344] border-[#06B6D4] text-[#06B6D4]' : 'bg-transparent border-[#27272A] text-[#52525B] hover:border-[#3F3F46] hover:text-[#A1A1AA]'}`}>
                                {p}m
                              </button>
                            ))}
                          </div>
                          <FInput type="number" value={assessmentForm.duration_minutes} onChange={e => setAssessmentForm({ ...assessmentForm, duration_minutes: e.target.value })} placeholder="Or enter custom minutes…" min="1" />
                        </Field>
                      </div>
                    )}

                    {/* ── Step 2 ── */}
                    {wizardStep === 1 && (
                      <div className="space-y-5 animate-fadeIn">
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
                                <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#083344] border border-[#0E7490] text-[#06B6D4]">
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
                              <button key={value} type="button" onClick={() => { setTaskForm({ ...taskForm, source_type: value }); resetUpload(); }} className={`flex items-center justify-center gap-2 py-3 text-[13px] font-semibold rounded-xl border transition-all duration-150 ${taskForm.source_type === value ? 'bg-[#083344] border-[#06B6D4] text-[#06B6D4]' : 'bg-transparent border-[#27272A] text-[#52525B] hover:border-[#3F3F46] hover:text-[#A1A1AA]'}`}>
                                <Icon className="w-4 h-4" />{label}
                              </button>
                            ))}
                          </div>
                        </Field>

                        {taskForm.source_type === 'local' && (
                          <div className="rounded-xl border border-[#27272A] bg-[#0C0C0E] p-4">
                            <p className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-[0.14em] mb-3">Task Folder <span className="text-[#F43F5E]">*</span></p>
                            {uploadState === 'idle' && (
                              <label className="flex flex-col items-center justify-center gap-3 py-8 border border-dashed border-[#27272A] hover:border-[#06B6D4]/40 rounded-xl cursor-pointer transition-all duration-150 hover:bg-[#06B6D4]/[0.02]">
                                <div className="w-10 h-10 rounded-xl bg-[#083344] border border-[#0E7490] flex items-center justify-center">
                                  <FolderOpen className="w-5 h-5 text-[#06B6D4]" />
                                </div>
                                <div className="text-center">
                                  <span className="text-[13px] font-semibold text-[#A1A1AA] block">Select project folder</span>
                                  <span className="text-[11px] text-[#3F3F46]">All files will be compressed and uploaded securely</span>
                                </div>
                                <input ref={folderInputRef} type="file" webkitdirectory="true" multiple onChange={handleFolderSelect} className="hidden" />
                              </label>
                            )}
                            {(uploadState === 'zipping' || uploadState === 'uploading') && (
                              <div className="flex flex-col items-center gap-3 py-6">
                                <Loader className="w-5 h-5 text-[#06B6D4] animate-spin" />
                                <p className="text-[13px] font-medium text-[#A1A1AA]">{uploadState === 'zipping' ? 'Compressing files…' : `Uploading — ${uploadProgress}%`}</p>
                                {uploadState === 'uploading' && (
                                  <div className="w-full h-1 bg-[#1C1C20] rounded-full overflow-hidden">
                                    <div className="h-full bg-[#06B6D4] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                  </div>
                                )}
                              </div>
                            )}
                            {uploadState === 'done' && (
                              <div className="flex items-center gap-3 px-4 py-3 bg-[#022C22] border border-[#065F46] rounded-xl animate-fadeIn">
                                <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold text-[#E4E4E7] truncate">{folderUpload?.fileName}/</p>
                                  <p className="text-[11px] text-[#10B981]">{folderUpload?.fileCount} files uploaded</p>
                                </div>
                                <button onClick={resetUpload} className="p-1.5 text-[#52525B] hover:text-[#F43F5E] rounded-md transition-all duration-150 flex-shrink-0">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                            {uploadState === 'error' && (
                              <div className="space-y-3 animate-fadeIn">
                                <div className="flex items-start gap-3 px-4 py-3 bg-[#1C0813] border border-[#881337] rounded-xl">
                                  <AlertCircle className="w-4 h-4 text-[#F43F5E] flex-shrink-0 mt-0.5" />
                                  <p className="text-[13px] text-[#F43F5E]">{uploadError}</p>
                                </div>
                                <button onClick={resetUpload} className="flex items-center gap-2 text-[12px] text-[#06B6D4] hover:underline">
                                  <Upload className="w-3.5 h-3.5" /> Try again
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {taskForm.source_type === 'git' && (
                          <div className="rounded-xl border border-[#27272A] bg-[#0C0C0E] p-4 space-y-4 animate-fadeIn">
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

              {/* Modal footer */}
              <div className="flex items-center justify-between px-7 py-4 border-t border-[#27272A] bg-[#0C0C0E] flex-shrink-0">
                {wizardStep === 1 ? (
                  <button onClick={() => { setWizardStep(0); setWizardError(''); }} className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium text-[#A1A1AA] hover:text-[#E4E4E7] hover:bg-[#1C1C20] rounded-lg transition-all duration-150">← Back</button>
                ) : (
                  <button onClick={closeWizard} className="px-4 py-2 text-[13px] font-medium text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#1C1C20] rounded-lg transition-all duration-150">Cancel</button>
                )}
                <button onClick={wizardStep === 0 ? handleStep1Next : handleFinalCreate} disabled={wizardLoading} className="flex items-center gap-2 px-5 py-2.5 bg-[#06B6D4] hover:bg-[#0891B2] text-[#0C0C0E] text-[13px] font-bold rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed">
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


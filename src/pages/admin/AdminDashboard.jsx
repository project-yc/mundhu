// AdminDashboard — Overview page: stats + quick actions + recent assessments
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, Library, LayoutDashboard, Plus, Loader,
  AlertCircle, CheckCircle, Clock, TrendingUp, BookOpen,
  Eye, EyeOff, ArrowRight, Activity,
} from 'lucide-react';
import {
  getAllAssessments,
  createAssessment,
} from '../../api/recruiter/assessment';
import { adminGetLibraryTasks } from '../../api/admin/library';

// ── helpers ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-surface border border-border-default rounded-xl px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent ?? 'bg-brand-tint'}`}>
          <Icon className="w-4 h-4 text-brand" />
        </div>
        <TrendingUp className="w-3.5 h-3.5 text-text-muted" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-[28px] font-bold text-text-primary leading-none mt-1">{value}</p>
        {sub && <p className="text-[11px] text-text-muted mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, desc, to, onClick }) {
  const navigate = useNavigate();
  const handle = () => (onClick ? onClick() : navigate(to));
  return (
    <button
      type="button"
      onClick={handle}
      className="bg-surface border border-border-default rounded-xl px-5 py-4 flex items-center gap-4 text-left hover:border-border-strong hover:bg-surface-muted transition-all duration-150 group w-full"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-tint border border-brand-border/30 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-text-primary">{label}</p>
        <p className="text-[11px] text-text-secondary mt-0.5">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-brand transition-colors duration-150 flex-shrink-0" />
    </button>
  );
}

// ── Assessment create modal (minimal) ────────────────────────────────────────
function CreateAssessmentModal({ onClose, onCreated }) {
  const [form, setForm]   = useState({ name: '', description: '', duration_minutes: '', ai_level: 'full' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.duration_minutes) {
      setError('All fields are required.'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await createAssessment(
        form.name, form.description, parseInt(form.duration_minutes),
        { ai_level: form.ai_level }
      );
      onCreated(res.data || res);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create assessment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-text-primary/30 backdrop-blur-[2px] flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border-default shadow-xl overflow-hidden animate-fadeIn">
        <div className="px-6 py-5 border-b border-border-default">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-tint border border-brand-border/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-brand" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-text-primary">New Assessment</h2>
              <p className="text-[11px] text-text-muted">Create a new assessment template</p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Assessment Name</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Senior Full Stack Engineer"
                className="w-full px-3 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the assessment purpose..."
                rows={3}
                className="w-full px-3 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 resize-none transition-all duration-150"
              />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-text-secondary mb-1.5">Duration (minutes)</label>
              <input
                type="number"
                min="1"
                value={form.duration_minutes}
                onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
                placeholder="e.g., 90"
                className="w-full px-3 py-2.5 bg-page border border-border-default rounded-lg text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/20 transition-all duration-150"
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-error-bg border border-error-border rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 text-error flex-shrink-0" />
                <p className="text-[12px] text-error">{error}</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-border-default bg-surface-muted/40">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-lg transition-all duration-150">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-brand text-on-brand text-[13px] font-semibold rounded-lg hover:bg-brand-hover transition-all duration-150 flex items-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Create Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [libraryStats, setLibraryStats] = useState({ total: 0, published: 0, draft: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [aRes, lRes] = await Promise.all([
          getAllAssessments(),
          adminGetLibraryTasks(),
        ]);
        const a = aRes.data ?? aRes ?? [];
        const l = lRes.data ?? lRes ?? [];
        setAssessments(Array.isArray(a) ? a : []);
        const published = Array.isArray(l) ? l.filter(t => t.is_published).length : 0;
        setLibraryStats({ total: Array.isArray(l) ? l.length : 0, published, draft: (Array.isArray(l) ? l.length : 0) - published });
      } catch (err) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalTasks = assessments.reduce((s, a) => s + (a.tasks?.length || 0), 0);
  const avgDuration = assessments.length > 0
    ? Math.round(assessments.reduce((s, a) => s + (a.duration_minutes || 0), 0) / assessments.length)
    : 0;

  const recent = [...assessments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);

  return (
    <div className="flex flex-col min-h-full bg-page">
      {/* Header */}
      <div className="flex-shrink-0 px-8 py-6 border-b border-border-default bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-tint border border-brand-border/40 flex items-center justify-center">
              <LayoutDashboard className="w-4.5 h-4.5 text-brand" />
            </div>
            <div>
              <h1 className="text-[18px] font-bold text-text-primary font-display leading-none">Overview</h1>
              <p className="text-[12px] text-text-secondary mt-0.5">Platform-wide health at a glance</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-on-brand text-[13px] font-semibold rounded-xl hover:bg-brand-hover transition-all duration-150"
          >
            <Plus className="w-3.5 h-3.5" /> New Assessment
          </button>
        </div>
      </div>

      <div className="flex-1 px-8 py-6 space-y-8 max-w-5xl">
        {/* Toast */}
        {success && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-success-bg border border-success-border rounded-xl">
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
            <p className="text-[13px] text-success font-semibold">{success}</p>
          </div>
        )}
        {error && !loading && (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-error-bg border border-error-border rounded-xl">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
            <p className="text-[13px] text-error">{error}</p>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-text-muted">
            <Loader className="w-5 h-5 animate-spin" />
            <span className="text-[13px]">Loading overview…</span>
          </div>
        ) : (
          <>
            <section>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Platform Stats</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard icon={Layers}   label="Assessments"    value={assessments.length} sub={`${totalTasks} tasks total`} />
                <StatCard icon={Activity} label="Avg Duration"    value={avgDuration}        sub="minutes per assessment" />
                <StatCard icon={Eye}      label="Published Tasks" value={libraryStats.published} sub="in task library" />
                <StatCard icon={EyeOff}   label="Draft Tasks"    value={libraryStats.draft}     sub="pending publish" />
              </div>
            </section>

            {/* Quick Actions */}
            <section>
              <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <QuickAction
                  icon={Plus}
                  label="Create Assessment"
                  desc="Add a new assessment template"
                  onClick={() => setShowCreate(true)}
                />
                <QuickAction
                  icon={Layers}
                  label="Manage Assessments"
                  desc="View, edit and create tasks"
                  to="/admin/assessments"
                />
                <QuickAction
                  icon={Library}
                  label="Task Library"
                  desc="Publish tasks for recruiters"
                  to="/admin/library"
                />
              </div>
            </section>

            {/* Recent assessments */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Recent Assessments</p>
                <button
                  onClick={() => navigate('/admin/assessments')}
                  className="text-[11px] text-brand hover:underline font-semibold flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              {recent.length === 0 ? (
                <div className="bg-surface border border-border-default rounded-xl px-5 py-10 text-center">
                  <BookOpen className="w-8 h-8 text-text-muted mx-auto mb-3 opacity-40" />
                  <p className="text-[13px] font-semibold text-text-secondary">No assessments yet</p>
                  <p className="text-[12px] text-text-muted mt-1">Create your first assessment to get started.</p>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-4 px-4 py-2 bg-brand text-on-brand text-[12px] font-semibold rounded-lg hover:bg-brand-hover transition-all duration-150"
                  >
                    Create Assessment
                  </button>
                </div>
              ) : (
                <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto] bg-surface-muted/60 px-5 py-2.5 border-b border-border-default text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <span>Name</span>
                    <span className="text-right pr-8">Duration</span>
                    <span className="text-right">Tasks</span>
                  </div>
                  {recent.map((a, i) => (
                    <div
                      key={a.id}
                      className={`grid grid-cols-[1fr_auto_auto] items-center px-5 py-3 hover:bg-surface-muted/40 transition-colors cursor-pointer ${i > 0 ? 'border-t border-border-default' : ''}`}
                      onClick={() => navigate('/admin/assessments')}
                    >
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-text-primary truncate">{a.name}</p>
                        <p className="text-[11px] text-text-muted truncate mt-0.5">{a.description}</p>
                      </div>
                      <div className="pr-8">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                          <Clock className="w-3 h-3" />{a.duration_minutes}m
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-brand">
                        {a.tasks?.length || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {showCreate && (
        <CreateAssessmentModal
          onClose={() => setShowCreate(false)}
          onCreated={(a) => {
            setAssessments(prev => [a, ...prev]);
            setSuccess('Assessment created successfully.');
            setTimeout(() => setSuccess(''), 4000);
          }}
        />
      )}
    </div>
  );
}

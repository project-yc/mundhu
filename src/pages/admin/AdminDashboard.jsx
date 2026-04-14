import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, X, Loader, AlertCircle, CheckCircle, 
  Sparkles, Layers, Clock, Tag, Upload, FileText,
  LogOut, TrendingUp, Activity, Zap, Grid
} from 'lucide-react';
import { createAssessment, getAllAssessments, createTask } from '../../api/recruiter/assessment';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Assessment form
  const [assessmentForm, setAssessmentForm] = useState({
    name: '',
    description: '',
    duration_minutes: '',
  });

  // Task form
  const [taskForm, setTaskForm] = useState({
    assessment_id: '',
    title: '',
    incident_brief: '',
    reproduction: '',
    difficulty: 'mid',
    estimated_time_minutes: '',
    tags: '',
  });
  const [environmentServices, setEnvironmentServices] = useState([
    { id: 1, name: '', status: 'healthy' },
  ]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('org');
    navigate('/login');
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllAssessments();
      setAssessments(data.data || data);
    } catch (err) {
      setError(err.message || 'Failed to fetch assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    
    if (!assessmentForm.name.trim() || !assessmentForm.description.trim() || !assessmentForm.duration_minutes) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await createAssessment(
        assessmentForm.name,
        assessmentForm.description,
        parseInt(assessmentForm.duration_minutes)
      );
      
      setAssessments([...assessments, data.data || data]);
      setSuccess('Assessment created successfully! ✨');
      setAssessmentForm({ name: '', description: '', duration_minutes: '' });
      setShowCreateModal(false);
      setCreateMode('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create assessment');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!taskForm.title.trim() || !taskForm.incident_brief.trim() || !taskForm.assessment_id) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tags = taskForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const services = environmentServices
        .map((service) => ({
          name: service.name.trim(),
          status: service.status,
        }))
        .filter((service) => service.name);

      const additionalInfo = {
        reproduction: taskForm.reproduction.trim(),
        difficulty: taskForm.difficulty,
        estimated_time_minutes: taskForm.estimated_time_minutes
          ? parseInt(taskForm.estimated_time_minutes, 10)
          : null,
        environment_services: services,
      };

      const data = await createTask(
        taskForm.assessment_id,
        taskForm.title,
        taskForm.incident_brief,
        tags,
        selectedFiles,
        additionalInfo,
      );

      setAssessments(prev => prev.map(a => 
        a.id === taskForm.assessment_id 
          ? { ...a, tasks: [...(a.tasks || []), data.data || data] }
          : a
      ));

      setSuccess('Task created successfully! 🎯');
      setTaskForm({
        assessment_id: '',
        title: '',
        incident_brief: '',
        reproduction: '',
        difficulty: 'mid',
        estimated_time_minutes: '',
        tags: '',
      });
      setEnvironmentServices([{ id: Date.now(), name: '', status: 'healthy' }]);
      setSelectedFiles([]);
      setShowCreateModal(false);
      setCreateMode('');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = (mode) => {
    setCreateMode(mode);
    setShowCreateModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setCreateMode('');
    setAssessmentForm({ name: '', description: '', duration_minutes: '' });
    setTaskForm({
      assessment_id: '',
      title: '',
      incident_brief: '',
      reproduction: '',
      difficulty: 'mid',
      estimated_time_minutes: '',
      tags: '',
    });
    setEnvironmentServices([{ id: Date.now(), name: '', status: 'healthy' }]);
    setSelectedFiles([]);
    setError('');
  };

  const addEnvironmentService = () => {
    setEnvironmentServices((current) => [
      ...current,
      { id: Date.now() + Math.random(), name: '', status: 'healthy' },
    ]);
  };

  const updateEnvironmentService = (id, key, value) => {
    setEnvironmentServices((current) =>
      current.map((service) => (service.id === id ? { ...service, [key]: value } : service)),
    );
  };

  const removeEnvironmentService = (id) => {
    setEnvironmentServices((current) => {
      const next = current.filter((service) => service.id !== id);
      return next.length > 0 ? next : [{ id: Date.now(), name: '', status: 'healthy' }];
    });
  };

  // Stats calculation
  const totalTasks = assessments.reduce((sum, a) => sum + (a.tasks?.length || 0), 0);
  const avgDuration = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / assessments.length)
    : 0;

  return (
    <div className="min-h-screen bg-navy-50/40">
      {/* ── Top Navigation ─────────────────────────────── */}
      <header className="bg-white border-b border-navy-900/8 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy-900 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-navy-900 tracking-tight">Platform Admin</h1>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost text-navy-800/60 hover:text-navy-900"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Status Messages */}
        {success && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-emerald-50 border border-emerald-200/60 rounded-card animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <p className="text-sm text-emerald-800 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-2.5 px-4 py-3 bg-rose-50 border border-rose-200/60 rounded-card animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <p className="text-sm text-rose-800 font-medium">{error}</p>
          </div>
        )}

        {/* ── Metric Cards ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-surface px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-navy-100 rounded-lg flex items-center justify-center">
                <Layers className="w-4.5 h-4.5 text-navy-700" />
              </div>
              <TrendingUp className="w-4 h-4 text-navy-500" />
            </div>
            <p className="metric-label mb-1">Assessments</p>
            <p className="metric-value">{assessments.length}</p>
          </div>

          <div className="card-surface px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-navy-100 rounded-lg flex items-center justify-center">
                <Grid className="w-4.5 h-4.5 text-navy-700" />
              </div>
              <Activity className="w-4 h-4 text-navy-500" />
            </div>
            <p className="metric-label mb-1">Total Tasks</p>
            <p className="metric-value">{totalTasks}</p>
          </div>

          <div className="card-surface px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-navy-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-navy-700" />
              </div>
              <Zap className="w-4 h-4 text-navy-500" />
            </div>
            <p className="metric-label mb-1">Avg Duration</p>
            <p className="metric-value">{avgDuration}<span className="text-lg font-medium text-navy-800/40 ml-0.5">m</span></p>
          </div>
        </div>

        {/* ── Quick Actions ──────────────────────────── */}
        <div className="mb-8">
          <p className="section-label mb-3">Quick Actions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => openCreateModal('assessment')}
              className="card-surface-hover px-5 py-4 flex items-center gap-4 text-left group"
            >
              <div className="w-10 h-10 bg-navy-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-navy-900 transition-colors duration-150">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-900">Create Assessment</p>
                <p className="text-xs text-navy-800/40 mt-0.5">Design assessments with custom durations</p>
              </div>
              <Plus className="w-4 h-4 text-navy-800/20 group-hover:text-navy-700 transition-colors duration-150" />
            </button>

            <button
              onClick={() => openCreateModal('task')}
              className="card-surface-hover px-5 py-4 flex items-center gap-4 text-left group"
            >
              <div className="w-10 h-10 bg-navy-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-navy-700 transition-colors duration-150">
                <Grid className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-900">Create Task</p>
                <p className="text-xs text-navy-800/40 mt-0.5">Add tasks with tags and code uploads</p>
              </div>
              <Plus className="w-4 h-4 text-navy-800/20 group-hover:text-navy-700 transition-colors duration-150" />
            </button>
          </div>
        </div>

        {/* ── All Assessments ────────────────────────── */}
        <div>
          <p className="section-label mb-3">All Assessments</p>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-6 h-6 text-navy-500 animate-spin" />
            </div>
          )}

          {!loading && assessments.length === 0 ? (
            <div className="text-center py-20 card-surface">
              <div className="w-14 h-14 mx-auto mb-4 bg-navy-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-navy-500" />
              </div>
              <h3 className="text-lg font-semibold text-navy-900 mb-1.5">No assessments yet</h3>
              <p className="text-sm text-navy-800/40 mb-5 max-w-sm mx-auto">Start creating assessments and tasks for your platform</p>
              <button
                onClick={() => openCreateModal('assessment')}
                className="btn-primary"
              >
                <Plus className="w-4 h-4" />
                Create First Assessment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="card-surface-hover px-5 py-4">
                  <h3 className="text-[15px] font-semibold text-navy-900 mb-1">{assessment.name}</h3>
                  <p className="text-sm text-navy-800/50 leading-relaxed mb-3">{assessment.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="badge-blue">
                      <Clock className="w-3 h-3" />
                      {assessment.duration_minutes} min
                    </span>
                    <span className="badge-surface">
                      <Grid className="w-3 h-3" />
                      {assessment.tasks?.length || 0} task{(assessment.tasks?.length || 0) !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════
         CREATE MODAL
         ══════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-modal shadow-modal border border-navy-900/8 max-h-[90vh] overflow-y-auto animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-900/8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-navy-700 rounded-lg flex items-center justify-center">
                  {createMode === 'assessment' ? (
                    <Layers className="w-4 h-4 text-white" />
                  ) : (
                    <Grid className="w-4 h-4 text-white" />
                  )}
                </div>
                <h2 className="text-base font-semibold text-navy-900">
                  {createMode === 'assessment' ? 'Create Assessment' : 'Create Task'}
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 hover:bg-navy-50 rounded-md transition-colors duration-150"
              >
                <X className="w-4 h-4 text-navy-800/40" />
              </button>
            </div>

            {/* Modal Body */}
            {createMode === 'assessment' ? (
              <form onSubmit={handleCreateAssessment}>
                <div className="px-6 py-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Assessment Name</label>
                    <input
                      type="text"
                      value={assessmentForm.name}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, name: e.target.value })}
                      placeholder="e.g., Senior Full Stack Developer Assessment"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Description</label>
                    <textarea
                      value={assessmentForm.description}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
                      placeholder="Describe the assessment purpose and goals..."
                      rows="4"
                      className="textarea-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Duration (minutes)</label>
                    <input
                      type="number"
                      value={assessmentForm.duration_minutes}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, duration_minutes: e.target.value })}
                      placeholder="e.g., 90"
                      min="1"
                      className="input-field"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200/60 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <p className="text-xs text-rose-700 font-medium">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-navy-900/6 bg-navy-50/30">
                  <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? (
                      <><Loader className="w-4 h-4 animate-spin" /> Creating...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Create Assessment</>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateTask}>
                <div className="px-6 py-5 space-y-4">
                  <div className="rounded-lg border border-navy-900/10 bg-navy-50/40 p-3.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-navy-800/50">
                      Incident Context
                    </p>
                    <p className="mt-1 text-xs text-navy-800/45">
                      Description is saved as incident brief. Structured metadata is saved in additional_info.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Select Assessment</label>
                    <select
                      value={taskForm.assessment_id}
                      onChange={(e) => setTaskForm({ ...taskForm, assessment_id: e.target.value })}
                      className="input-field"
                    >
                      <option value="">Choose an assessment...</option>
                      {assessments.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Task Title</label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="e.g., Build a REST API"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Incident Brief</label>
                    <textarea
                      value={taskForm.incident_brief}
                      onChange={(e) => setTaskForm({ ...taskForm, incident_brief: e.target.value })}
                      placeholder="Write the incident brief shown to candidates..."
                      rows="4"
                      className="textarea-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Reproduction Steps</label>
                    <textarea
                      value={taskForm.reproduction}
                      onChange={(e) => setTaskForm({ ...taskForm, reproduction: e.target.value })}
                      placeholder="Add reproducible steps (optional)"
                      rows="3"
                      className="textarea-field"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-navy-900 mb-1.5">Difficulty</label>
                      <select
                        value={taskForm.difficulty}
                        onChange={(e) => setTaskForm({ ...taskForm, difficulty: e.target.value })}
                        className="input-field"
                      >
                        <option value="entry">Entry</option>
                        <option value="mid">Mid</option>
                        <option value="senior">Senior</option>
                        <option value="staff">Staff</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-navy-900 mb-1.5">Estimated Time (minutes)</label>
                      <input
                        type="number"
                        min="1"
                        value={taskForm.estimated_time_minutes}
                        onChange={(e) => setTaskForm({ ...taskForm, estimated_time_minutes: e.target.value })}
                        placeholder="e.g., 45"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="block text-sm font-medium text-navy-900">Environment Services</label>
                      <button
                        type="button"
                        onClick={addEnvironmentService}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-navy-700 hover:text-navy-900"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Service
                      </button>
                    </div>

                    <div className="space-y-2">
                      {environmentServices.map((service, index) => (
                        <div key={service.id} className="grid grid-cols-[1fr_130px_auto] gap-2">
                          <input
                            type="text"
                            value={service.name}
                            onChange={(e) => updateEnvironmentService(service.id, 'name', e.target.value)}
                            placeholder={`Service ${index + 1} (e.g., postgres)`}
                            className="input-field"
                          />

                          <select
                            value={service.status}
                            onChange={(e) => updateEnvironmentService(service.id, 'status', e.target.value)}
                            className="input-field"
                          >
                            <option value="healthy">Healthy</option>
                            <option value="degraded">Degraded</option>
                            <option value="down">Down</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => removeEnvironmentService(service.id)}
                            className="inline-flex items-center justify-center rounded-lg border border-navy-900/12 px-2 hover:bg-navy-50"
                            aria-label="Remove service"
                          >
                            <X className="w-3.5 h-3.5 text-navy-700/60" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={taskForm.tags}
                      onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                      placeholder="e.g., backend, nodejs, api, database"
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Upload Code Folder (Optional)</label>
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        multiple
                        webkitdirectory=""
                        directory=""
                        className="hidden"
                        id="folder-upload"
                      />
                      <label
                        htmlFor="folder-upload"
                        className="flex items-center justify-center gap-2.5 px-4 py-5 bg-navy-50/50 border border-dashed border-navy-900/12 hover:border-navy-500/30 rounded-lg cursor-pointer transition-colors duration-150 group"
                      >
                        <Upload className="w-4 h-4 text-navy-500 group-hover:text-navy-700 transition-colors" />
                        <span className="text-sm font-medium text-navy-800/50 group-hover:text-navy-700 transition-colors">
                          {selectedFiles.length > 0 
                            ? `${selectedFiles.length} files selected` 
                            : 'Click to upload code folder'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200/60 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                      <p className="text-xs text-rose-700 font-medium">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-navy-900/6 bg-navy-50/30">
                  <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? (
                      <><Loader className="w-4 h-4 animate-spin" /> Creating...</>
                    ) : (
                      <><Zap className="w-4 h-4" /> Create Task</>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

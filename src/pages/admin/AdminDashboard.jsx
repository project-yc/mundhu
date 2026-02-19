import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, X, Loader, AlertCircle, CheckCircle, 
  Sparkles, Layers, Clock, Tag, Upload, FileText,
  LogOut, TrendingUp, Activity, Zap, Grid
} from 'lucide-react';
import { createAssessment, getAllAssessments, createTask, uploadTaskZip } from '../../api/recruiter/assessment';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createMode, setCreateMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingZip, setUploadingZip] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedZip, setSelectedZip] = useState(null);
  const zipInputRef = useRef(null);
  
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
    description: '',
    tags: '',
  });

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
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        setError('Only .zip files are allowed');
        e.target.value = '';
        return;
      }
      setSelectedZip(file);
      setError('');
    }
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
    
    if (!taskForm.title.trim() || !taskForm.description.trim() || !taskForm.assessment_id) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    let taskZipS3Key = null;

    // Step 1: upload zip if provided
    if (selectedZip) {
      setUploadingZip(true);
      try {
        const uploadData = await uploadTaskZip(selectedZip);
        taskZipS3Key = uploadData.s3_key || uploadData.data?.s3_key;
        if (!taskZipS3Key) throw new Error('Upload succeeded but no S3 key was returned');
      } catch (err) {
        setError(err.message || 'Failed to upload zip file');
        setUploadingZip(false);
        return;
      }
      setUploadingZip(false);
    }

    // Step 2: create the task
    setLoading(true);
    try {
      const tags = taskForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const data = await createTask(
        taskForm.assessment_id,
        taskForm.title,
        taskForm.description,
        tags,
        taskZipS3Key,
      );

      setAssessments(prev => prev.map(a => 
        a.id === taskForm.assessment_id 
          ? { ...a, tasks: [...(a.tasks || []), data.data || data] }
          : a
      ));

      setSuccess('Task created successfully! 🎯');
      setTaskForm({ assessment_id: '', title: '', description: '', tags: '' });
      setSelectedZip(null);
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
    setTaskForm({ assessment_id: '', title: '', description: '', tags: '' });
    setSelectedZip(null);
    setError('');
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
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">Task Description</label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Describe the task requirements..."
                      rows="4"
                      className="textarea-field"
                    />
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
                    <label className="block text-sm font-medium text-navy-900 mb-1.5">
                      Code Zip File <span className="text-navy-800/40 font-normal">(Optional)</span>
                    </label>
                    <input
                      ref={zipInputRef}
                      type="file"
                      accept=".zip"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedZip ? (
                      <div className="flex items-center gap-3 px-4 py-3 bg-navy-50 border border-navy-900/10 rounded-lg">
                        <div className="w-8 h-8 bg-navy-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-navy-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-navy-900 truncate">{selectedZip.name}</p>
                          <p className="text-xs text-navy-800/40">{(selectedZip.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setSelectedZip(null); zipInputRef.current.value = ''; }}
                          className="p-1.5 hover:bg-navy-200/50 rounded-md transition-colors flex-shrink-0"
                        >
                          <X className="w-3.5 h-3.5 text-navy-800/50" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => zipInputRef.current?.click()}
                        className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 bg-navy-50/50 border-2 border-dashed border-navy-900/15 hover:border-navy-500/40 hover:bg-navy-50 rounded-lg transition-all duration-150 group"
                      >
                        <div className="w-9 h-9 bg-navy-100 group-hover:bg-navy-200/70 rounded-lg flex items-center justify-center transition-colors">
                          <Upload className="w-4.5 h-4.5 text-navy-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-navy-700 group-hover:text-navy-900 transition-colors">Click to upload .zip file</p>
                          <p className="text-xs text-navy-800/40 mt-0.5">Contains the starter code for this task</p>
                        </div>
                      </button>
                    )}
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
                  <button type="submit" disabled={loading || uploadingZip} className="btn-primary">
                    {uploadingZip ? (
                      <><Loader className="w-4 h-4 animate-spin" /> Uploading zip...</>
                    ) : loading ? (
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

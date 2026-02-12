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
    
    if (!taskForm.title.trim() || !taskForm.description.trim() || !taskForm.assessment_id) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tags = taskForm.tags.split(',').map(t => t.trim()).filter(Boolean);
      const data = await createTask(
        taskForm.assessment_id,
        taskForm.title,
        taskForm.description,
        tags
      );

      setAssessments(prev => prev.map(a => 
        a.id === taskForm.assessment_id 
          ? { ...a, tasks: [...(a.tasks || []), data.data || data] }
          : a
      ));

      setSuccess('Task created successfully! 🎯');
      setTaskForm({ assessment_id: '', title: '', description: '', tags: '' });
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
    setTaskForm({ assessment_id: '', title: '', description: '', tags: '' });
    setSelectedFiles([]);
    setError('');
  };

  // Stats calculation
  const totalTasks = assessments.reduce((sum, a) => sum + (a.tasks?.length || 0), 0);
  const avgDuration = assessments.length > 0 
    ? Math.round(assessments.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / assessments.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-400/10 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative backdrop-blur-2xl bg-white/80 border-b border-white/50 sticky top-0 z-50 shadow-[0_4px_24px_0_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent tracking-tight">
                  Platform Admin
                </h1>
                <p className="text-slate-600 text-sm mt-1 font-medium">Manage global assessments & tasks</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 backdrop-blur-xl bg-white/70 hover:bg-white/90 border border-white/60 text-slate-700 hover:text-slate-900 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-8 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-2xl blur-xl"></div>
            <div className="relative flex items-center gap-3 p-4 backdrop-blur-2xl bg-emerald-50/80 border border-emerald-200/50 rounded-2xl shadow-lg">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-800 font-semibold">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-red-400/10 rounded-2xl blur-xl"></div>
            <div className="relative flex items-center gap-3 p-4 backdrop-blur-2xl bg-rose-50/80 border border-rose-200/50 rounded-2xl shadow-lg">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <p className="text-sm text-rose-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Assessments */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative backdrop-blur-2xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">Assessments</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  {assessments.length}
                </p>
              </div>
            </div>
          </div>

          {/* Total Tasks */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative backdrop-blur-2xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-lg">
                  <Grid className="w-6 h-6 text-white" />
                </div>
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">Total Tasks</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {totalTasks}
                </p>
              </div>
            </div>
          </div>

          {/* Avg Duration */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="relative backdrop-blur-2xl bg-white/70 border border-white/60 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-600 text-sm font-semibold uppercase tracking-wider">Avg Duration</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {avgDuration}m
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Create Actions */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Assessment Card */}
            <div 
              onClick={() => openCreateModal('assessment')}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative backdrop-blur-2xl bg-white/60 hover:bg-white/80 border border-white/60 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      Create Assessment
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Design comprehensive assessments with custom durations and descriptions for evaluating candidates
                    </p>
                  </div>
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500 group-hover:rotate-90 transition-all duration-300" />
                </div>
              </div>
            </div>

            {/* Create Task Card */}
            <div 
              onClick={() => openCreateModal('task')}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              <div className="relative backdrop-blur-2xl bg-white/60 hover:bg-white/80 border border-white/60 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110">
                    <Grid className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      Create Task
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Add new tasks to assessments with descriptions, tags, and optional code folder uploads
                    </p>
                  </div>
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 group-hover:rotate-90 transition-all duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessments List */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
            All Assessments
          </h2>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          )}

          {!loading && assessments.length === 0 ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 rounded-3xl blur-2xl"></div>
              <div className="relative text-center py-24 backdrop-blur-2xl bg-white/50 rounded-3xl border-2 border-dashed border-slate-200">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">No assessments yet</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Start creating assessments and tasks for your platform users
                </p>
                <button
                  onClick={() => openCreateModal('assessment')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Create First Assessment
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {assessments.map((assessment) => (
                <div key={assessment.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-indigo-400/0 group-hover:from-blue-400/5 group-hover:to-indigo-400/5 rounded-3xl blur-xl transition-all duration-500"></div>
                  <div className="relative backdrop-blur-2xl bg-white/70 border border-white/60 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-slate-900 mb-3">{assessment.name}</h3>
                        <p className="text-slate-600 leading-relaxed mb-6">{assessment.description}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="flex items-center gap-2 backdrop-blur-xl bg-gradient-to-br from-blue-50 to-cyan-50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">{assessment.duration_minutes} min</span>
                          </span>
                          <span className="flex items-center gap-2 backdrop-blur-xl bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                            <Grid className="w-4 h-4 text-indigo-600" />
                            <span className="text-sm font-semibold text-indigo-700">
                              {assessment.tasks?.length || 0} task{(assessment.tasks?.length || 0) !== 1 ? 's' : ''}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-3xl blur-2xl"></div>
            
            <div className="relative backdrop-blur-3xl bg-white/90 rounded-3xl shadow-2xl border border-white/60 p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg">
                    {createMode === 'assessment' ? (
                      <Layers className="w-6 h-6 text-white" />
                    ) : (
                      <Grid className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                    {createMode === 'assessment' ? 'Create Assessment' : 'Create Task'}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2.5 hover:bg-white/80 rounded-xl transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {createMode === 'assessment' ? (
                <form onSubmit={handleCreateAssessment} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Assessment Name
                    </label>
                    <input
                      type="text"
                      value={assessmentForm.name}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, name: e.target.value })}
                      placeholder="e.g., Senior Full Stack Developer Assessment"
                      className="w-full px-5 py-4 backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Description
                    </label>
                    <textarea
                      value={assessmentForm.description}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, description: e.target.value })}
                      placeholder="Describe the assessment purpose and goals..."
                      rows="5"
                      className="w-full px-5 py-4 backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all resize-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={assessmentForm.duration_minutes}
                      onChange={(e) => setAssessmentForm({ ...assessmentForm, duration_minutes: e.target.value })}
                      placeholder="e.g., 90"
                      min="1"
                      className="w-full px-5 py-4 backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <p className="text-sm text-rose-700 font-medium">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-4 backdrop-blur-xl bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Create Assessment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-500" />
                      Select Assessment
                    </label>
                    <select
                      value={taskForm.assessment_id}
                      onChange={(e) => setTaskForm({ ...taskForm, assessment_id: e.target.value })}
                      className="w-full px-5 py-4 backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all shadow-sm"
                    >
                      <option value="">Choose an assessment...</option>
                      {assessments.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-500" />
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="e.g., Build a REST API"
                      className="w-full px-5 py-4 backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-500" />
                      Task Description
                    </label>
                    <textarea
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                      placeholder="Describe the task requirements..."
                      rows="5"
                      className="w-full px-5 py-4 backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all resize-none shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-500" />
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={taskForm.tags}
                      onChange={(e) => setTaskForm({ ...taskForm, tags: e.target.value })}
                      placeholder="e.g., backend, nodejs, api, database"
                      className="w-full px-5 py-4 backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-cyan-500" />
                      Upload Code Folder (Optional)
                    </label>
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
                        className="flex items-center justify-center gap-3 px-5 py-8 backdrop-blur-xl bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-dashed border-cyan-200 hover:border-cyan-300 rounded-2xl cursor-pointer transition-all group"
                      >
                        <Upload className="w-6 h-6 text-cyan-600 group-hover:scale-110 transition-transform" />
                        <div className="text-center">
                          <p className="text-sm font-semibold text-cyan-700">
                            {selectedFiles.length > 0 
                              ? `${selectedFiles.length} files selected` 
                              : 'Click to upload code folder'}
                          </p>
                          <p className="text-xs text-cyan-600 mt-1">Supports all file types</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-rose-600" />
                      <p className="text-sm text-rose-700 font-medium">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-6 py-4 backdrop-blur-xl bg-white/80 hover:bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
                          Create Task
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

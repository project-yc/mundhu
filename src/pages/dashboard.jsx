import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Loader, AlertCircle, CheckCircle, ChevronDown, Users, LogOut } from 'lucide-react';
import { createAssessment, getAllAssessments, createTask } from '../api/assessment';

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [expandedAssessment, setExpandedAssessment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_minutes: '',
  });

  const [taskFormData, setTaskFormData] = useState({
    taskName: '',
    taskDescription: '',
    tags: '',
  });

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Fetch all assessments on mount
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
      setError(err.message || 'Failed to fetch assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.duration_minutes) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await createAssessment(
        formData.name,
        formData.description,
        parseInt(formData.duration_minutes)
      );
      
      setAssessments([...assessments, data.data || data]);
      setSuccess('Assessment created successfully!');
      setFormData({ name: '', description: '', duration_minutes: '' });
      setShowModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    
    if (!taskFormData.taskName.trim() || !taskFormData.taskDescription.trim()) {
      setError('Please fill in all task fields');
      return;
    }

    if (!selectedAssessment) {
      setError('No assessment selected');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tags = taskFormData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const data = await createTask(
        selectedAssessment.id,
        taskFormData.taskName,
        taskFormData.taskDescription,
        tags
      );

      setAssessments(prev => prev.map(a => 
        a.id === selectedAssessment.id 
          ? { ...a, tasks: [...(a.tasks || []), data.data || data] }
          : a
      ));

      setSuccess('Task added successfully!');
      setTaskFormData({ taskName: '', taskDescription: '', tags: '' });
      setShowTaskModal(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // MAIN ASSESSMENTS PAGE
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-slate-50 to-blue-100/60 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="backdrop-blur-2xl bg-white/60 border-b border-white/20 sticky top-0 z-40 shadow-lg shadow-blue-100/20 relative">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assessments</h1>
              <p className="text-gray-600 mt-1 text-sm">Create and manage your recruitment assessments</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                Create Assessment
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/60 hover:bg-white/80 border border-white/30 text-gray-700 hover:text-gray-900 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 backdrop-blur-2xl bg-emerald-50/80 border border-emerald-200/50 rounded-2xl shadow-lg shadow-emerald-100/20 animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 font-medium">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-start gap-3 p-4 backdrop-blur-2xl bg-rose-50/80 border border-rose-200/50 rounded-2xl shadow-lg shadow-rose-100/20">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-800 font-medium">{error}</p>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {!loading && assessments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100/80 to-cyan-200/80 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-100/30 border border-white/30">
              <Plus className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No assessments yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Create your first assessment to start evaluating candidates</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Plus className="w-5 h-5" />
              Create First Assessment
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="backdrop-blur-2xl bg-white/70 rounded-3xl border border-white/30 shadow-2xl shadow-blue-100/20 hover:shadow-blue-200/30 transition-all duration-300 overflow-hidden">
                {/* Assessment Card Header */}
                <div
                  className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/40 transition-all"
                  onClick={() => setExpandedAssessment(expandedAssessment === assessment.id ? null : assessment.id)}
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{assessment.name}</h3>
                    <p className="text-gray-600 mt-1.5 text-sm">{assessment.description}</p>
                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                      <span className="flex items-center gap-2 font-semibold backdrop-blur-xl bg-blue-50/70 px-3 py-1.5 rounded-xl border border-blue-100/50">
                        <span className="text-base">⏱️</span>
                        {assessment.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-2 font-semibold backdrop-blur-xl bg-cyan-50/70 px-3 py-1.5 rounded-xl border border-cyan-100/50">
                        <span className="text-base">📋</span>
                        {assessment.tasks?.length || 0} task{(assessment.tasks?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-6">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${assessment.id}/invite`);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    >
                      <Users className="w-4 h-4" />
                      Invite
                    </button>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                        expandedAssessment === assessment.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Assessment Details - Expanded */}
                {expandedAssessment === assessment.id && (
                  <div className="border-t border-white/30 p-6 backdrop-blur-xl bg-gradient-to-br from-blue-50/40 to-cyan-50/40">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Tasks ({assessment.tasks?.length || 0})</h4>
                        <button
                          onClick={() => {
                            setSelectedAssessment(assessment);
                            setShowTaskModal(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                          <Plus className="w-4 h-4" />
                          Add Task
                        </button>
                      </div>

                      {assessment.tasks && assessment.tasks.length > 0 ? (
                        <div className="space-y-3">
                          {assessment.tasks.map((task) => (
                            <div key={task.id} className="backdrop-blur-2xl bg-white/70 p-5 rounded-2xl border border-white/30 hover:border-blue-300/50 hover:shadow-xl shadow-lg shadow-blue-50/20 transition-all">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-bold text-gray-900 text-lg">{task.title}</h5>
                                  <p className="text-sm text-gray-600 mt-1.5">{task.description}</p>
                                  {task.tags && task.tags.length > 0 && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                      {task.tags.map((tag, idx) => (
                                        <span key={idx} className="text-xs backdrop-blur-xl bg-blue-100/80 text-blue-700 px-3 py-1.5 rounded-full font-semibold border border-blue-200/50">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 backdrop-blur-2xl bg-white/50 rounded-2xl border-2 border-dashed border-blue-200/60">
                          <p className="text-gray-500 mb-3 font-medium">No tasks added yet</p>
                          <button
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setShowTaskModal(true);
                            }}
                            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50/80 backdrop-blur-xl font-semibold rounded-xl transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            Create First Task
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assessment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/30 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Create Assessment</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', description: '', duration_minutes: '' });
                  setError('');
                }}
                className="p-2 hover:bg-white/60 backdrop-blur-xl rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Senior Developer Test"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the assessment..."
                  rows="4"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all resize-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="e.g., 60"
                  min="1"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all shadow-sm"
                />
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 backdrop-blur-xl bg-rose-50/80 border border-rose-200/50 rounded-2xl shadow-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleCreateAssessment}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Create Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/30 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Task</h2>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setTaskFormData({ taskName: '', taskDescription: '', tags: '' });
                }}
                className="p-2 hover:bg-white/60 backdrop-blur-xl rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
                <input
                  type="text"
                  value={taskFormData.taskName}
                  onChange={(e) => setTaskFormData({ ...taskFormData, taskName: e.target.value })}
                  placeholder="e.g., Coding Challenge"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Task Description *</label>
                <textarea
                  value={taskFormData.taskDescription}
                  onChange={(e) => setTaskFormData({ ...taskFormData, taskDescription: e.target.value })}
                  placeholder="Describe the task..."
                  rows="4"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all resize-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={taskFormData.tags}
                  onChange={(e) => setTaskFormData({ ...taskFormData, tags: e.target.value })}
                  placeholder="e.g., backend, api, nodejs"
                  className="w-full px-4 py-3 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/80 transition-all shadow-sm"
                />
                <p className="text-xs text-gray-500 mt-1.5">Separate tags with commas</p>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-3 backdrop-blur-xl bg-rose-50/80 border border-rose-200/50 rounded-2xl shadow-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handleAddTask}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Task
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
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

      {/* Header with enhanced glass effect */}
      <div className="relative backdrop-blur-2xl bg-white/70 border-b border-white/30 sticky top-0 z-40 shadow-[0_8px_32px_0_rgba(59,130,246,0.08)]">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent tracking-tight">Assessments</h1>
              <p className="text-gray-600 mt-1 text-sm">Create and manage your recruitment assessments</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <button
                  onClick={() => setShowModal(true)}
                  className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 text-white font-semibold rounded-2xl shadow-[0_4px_20px_0_rgba(59,130,246,0.3)] hover:shadow-[0_6px_28px_0_rgba(59,130,246,0.4)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  Create Assessment
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2.5 backdrop-blur-xl bg-white/60 hover:bg-white/80 border border-white/40 text-gray-700 hover:text-gray-900 font-medium rounded-2xl shadow-[0_2px_12px_0_rgba(0,0,0,0.05)] hover:shadow-[0_4px_16px_0_rgba(0,0,0,0.08)] transition-all duration-300"
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
          <div className="mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-2xl blur-lg"></div>
            <div className="relative flex items-start gap-3 p-4 backdrop-blur-2xl bg-emerald-50/90 border border-emerald-200/60 rounded-2xl shadow-[0_4px_20px_0_rgba(16,185,129,0.15)] animate-in fade-in slide-in-from-top-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5 drop-shadow-sm" />
              <p className="text-sm text-emerald-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-red-400/10 rounded-2xl blur-lg"></div>
            <div className="relative flex items-start gap-3 p-4 backdrop-blur-2xl bg-rose-50/90 border border-rose-200/60 rounded-2xl shadow-[0_4px_20px_0_rgba(244,63,94,0.15)]">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 drop-shadow-sm" />
              <p className="text-sm text-rose-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {!loading && assessments.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-3xl blur-2xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-blue-100/80 to-cyan-200/80 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-[0_8px_32px_0_rgba(59,130,246,0.2)] border border-white/40">
                <Plus className="w-12 h-12 text-blue-600 drop-shadow-sm" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No assessments yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Create your first assessment to start evaluating candidates</p>
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <button
                onClick={() => setShowModal(true)}
                className="relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 text-white font-semibold rounded-2xl transition-all shadow-[0_6px_24px_0_rgba(59,130,246,0.3)] hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.4)] transform hover:scale-[1.02]"
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
                {/* Outer glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover:from-blue-400/10 group-hover:to-cyan-400/10 rounded-[2rem] blur-xl transition-all duration-500"></div>
                
                <div className="relative backdrop-blur-2xl bg-white/75 rounded-[2rem] border border-white/40 shadow-[0_8px_32px_0_rgba(59,130,246,0.12)] hover:shadow-[0_12px_48px_0_rgba(59,130,246,0.18)] transition-all duration-500 overflow-hidden">
                  {/* Assessment Card Header */}
                  <div
                    className="p-6 cursor-pointer flex items-center justify-between hover:bg-white/60 transition-all duration-300"
                    onClick={() => setExpandedAssessment(expandedAssessment === assessment.id ? null : assessment.id)}
                  >
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{assessment.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{assessment.description}</p>
                      <div className="flex items-center gap-4 mt-4">
                        <span className="flex items-center gap-2 font-semibold backdrop-blur-xl bg-gradient-to-br from-blue-50/90 to-cyan-50/70 px-4 py-2 rounded-2xl border border-blue-100/60 shadow-[0_2px_8px_0_rgba(59,130,246,0.08)]">
                          <span className="text-lg">⏱️</span>
                          <span className="text-sm text-blue-700">{assessment.duration_minutes} min</span>
                        </span>
                        <span className="flex items-center gap-2 font-semibold backdrop-blur-xl bg-gradient-to-br from-cyan-50/90 to-blue-50/70 px-4 py-2 rounded-2xl border border-cyan-100/60 shadow-[0_2px_8px_0_rgba(6,182,212,0.08)]">
                          <span className="text-lg">📋</span>
                          <span className="text-sm text-cyan-700">{assessment.tasks?.length || 0} task{(assessment.tasks?.length || 0) !== 1 ? 's' : ''}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                      <div className="relative group/btn">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur-md opacity-40 group-hover/btn:opacity-60 transition-opacity"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${assessment.id}/invite`);
                          }}
                          className="relative flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-600 text-white font-semibold rounded-2xl transition-all shadow-[0_4px_16px_0_rgba(16,185,129,0.25)] hover:shadow-[0_6px_24px_0_rgba(16,185,129,0.35)] transform hover:scale-[1.02]"
                        >
                          <Users className="w-4 h-4" />
                          Invite
                        </button>
                      </div>
                      <ChevronDown
                        className={`w-6 h-6 text-gray-400 transition-transform duration-500 ${
                          expandedAssessment === assessment.id ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                {/* Assessment Details - Expanded */}
                {expandedAssessment === assessment.id && (
                  <div className="border-t border-white/30 p-6 backdrop-blur-xl bg-gradient-to-br from-blue-50/40 to-cyan-50/40">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-5">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                          <span className="w-1 h-4 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></span>
                          Tasks ({assessment.tasks?.length || 0})
                        </h4>
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          <button
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setShowTaskModal(true);
                            }}
                            className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 text-white text-sm font-semibold rounded-xl transition-all shadow-[0_4px_16px_0_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_0_rgba(59,130,246,0.35)] transform hover:scale-[1.02]"
                          >
                            <Plus className="w-4 h-4" />
                            Add Task
                          </button>
                        </div>
                      </div>

                      {assessment.tasks && assessment.tasks.length > 0 ? (
                        <div className="space-y-3">
                          {assessment.tasks.map((task) => (
                            <div key={task.id} className="relative group/task">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-cyan-400/0 group-hover/task:from-blue-400/5 group-hover/task:to-cyan-400/5 rounded-2xl transition-all duration-300"></div>
                              <div className="relative backdrop-blur-2xl bg-white/75 p-5 rounded-2xl border border-white/40 hover:border-blue-200/60 shadow-[0_4px_16px_0_rgba(59,130,246,0.08)] hover:shadow-[0_8px_24px_0_rgba(59,130,246,0.12)] transition-all duration-300">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-bold text-gray-900 text-lg mb-1">{task.title}</h5>
                                    <p className="text-sm text-gray-600 leading-relaxed">{task.description}</p>
                                    {task.tags && task.tags.length > 0 && (
                                      <div className="flex gap-2 mt-3 flex-wrap">
                                        {task.tags.map((tag, idx) => (
                                          <span key={idx} className="text-xs backdrop-blur-xl bg-gradient-to-r from-blue-100/90 to-cyan-100/70 text-blue-700 px-3 py-1.5 rounded-full font-semibold border border-blue-200/50 shadow-sm">
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-cyan-400/5 rounded-2xl blur-xl"></div>
                          <div className="relative text-center py-12 backdrop-blur-2xl bg-white/60 rounded-2xl border-2 border-dashed border-blue-200/60">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100/80 to-cyan-100/60 rounded-2xl flex items-center justify-center shadow-lg">
                              <Plus className="w-8 h-8 text-blue-600" />
                            </div>
                            <p className="text-gray-600 mb-4 font-medium">No tasks added yet</p>
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
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Assessment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="relative max-w-md w-full">
            {/* Modal glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-[2rem] blur-2xl"></div>
            
            <div className="relative backdrop-blur-2xl bg-white/85 rounded-[2rem] shadow-[0_8px_48px_0_rgba(59,130,246,0.25)] border border-white/40 p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">Create Assessment</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ name: '', description: '', duration_minutes: '' });
                    setError('');
                  }}
                  className="p-2.5 hover:bg-white/60 backdrop-blur-xl rounded-xl transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Assessment Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Senior Developer Test"
                    className="w-full px-4 py-3.5 backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/90 hover:bg-white/80 transition-all shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[inset_0_2px_12px_0_rgba(59,130,246,0.08)]"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the assessment..."
                    rows="4"
                    className="w-full px-4 py-3.5 backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 focus:bg-white/90 hover:bg-white/80 transition-all resize-none shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[inset_0_2px_12px_0_rgba(6,182,212,0.08)]"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    placeholder="e.g., 60"
                    min="1"
                    className="w-full px-4 py-3.5 backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 focus:bg-white/90 hover:bg-white/80 transition-all shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[inset_0_2px_12px_0_rgba(99,102,241,0.08)]"
                  />
                </div>

                {error && (
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-red-400/10 rounded-2xl blur-lg"></div>
                    <div className="relative flex items-start gap-3 p-3.5 backdrop-blur-xl bg-rose-50/90 border border-rose-200/60 rounded-2xl shadow-[0_4px_16px_0_rgba(244,63,94,0.12)]">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 drop-shadow-sm" />
                      <p className="text-xs text-rose-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <button
                      onClick={handleCreateAssessment}
                      disabled={loading}
                      className="relative w-full py-4 px-4 bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 hover:from-blue-600 hover:via-blue-700 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_24px_0_rgba(59,130,246,0.25)] hover:shadow-[0_12px_32px_0_rgba(59,130,246,0.35)] disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
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
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-black/20 via-black/30 to-black/20 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="relative max-w-md w-full">
            {/* Modal glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-[2rem] blur-2xl"></div>
            
            <div className="relative backdrop-blur-2xl bg-white/85 rounded-[2rem] shadow-[0_8px_48px_0_rgba(6,182,212,0.25)] border border-white/40 p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-cyan-900 to-blue-900 bg-clip-text text-transparent">Add Task</h2>
                <button
                  onClick={() => {
                    setShowTaskModal(false);
                    setTaskFormData({ taskName: '', taskDescription: '', tags: '' });
                  }}
                  className="p-2.5 hover:bg-white/60 backdrop-blur-xl rounded-xl transition-all hover:rotate-90 duration-300"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-5">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={taskFormData.taskName}
                    onChange={(e) => setTaskFormData({ ...taskFormData, taskName: e.target.value })}
                    placeholder="e.g., Coding Challenge"
                    className="w-full px-4 py-3.5 backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 focus:bg-white/90 hover:bg-white/80 transition-all shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[inset_0_2px_12px_0_rgba(6,182,212,0.08)]"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    Task Description *
                  </label>
                  <textarea
                    value={taskFormData.taskDescription}
                    onChange={(e) => setTaskFormData({ ...taskFormData, taskDescription: e.target.value })}
                    placeholder="Describe the task..."
                    rows="4"
                    className="w-full px-4 py-3.5 backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 focus:bg-white/90 hover:bg-white/80 transition-all resize-none shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[inset_0_2px_12px_0_rgba(59,130,246,0.08)]"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={taskFormData.tags}
                    onChange={(e) => setTaskFormData({ ...taskFormData, tags: e.target.value })}
                    placeholder="e.g., backend, api, nodejs"
                    className="w-full px-4 py-3.5 backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 focus:bg-white/90 hover:bg-white/80 transition-all shadow-[inset_0_2px_8px_0_rgba(0,0,0,0.04)] hover:shadow-[inset_0_2px_12px_0_rgba(20,184,166,0.08)]"
                  />
                  <p className="text-xs text-gray-500 mt-2 ml-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                    Separate tags with commas
                  </p>
                </div>

                {error && (
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-red-400/10 rounded-2xl blur-lg"></div>
                    <div className="relative flex items-start gap-3 p-3.5 backdrop-blur-xl bg-rose-50/90 border border-rose-200/60 rounded-2xl shadow-[0_4px_16px_0_rgba(244,63,94,0.12)]">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 drop-shadow-sm" />
                      <p className="text-xs text-rose-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <button
                      onClick={handleAddTask}
                      disabled={loading}
                      className="relative w-full py-4 px-4 bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-500 hover:from-cyan-600 hover:via-cyan-700 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-2xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_8px_24px_0_rgba(6,182,212,0.25)] hover:shadow-[0_12px_32px_0_rgba(6,182,212,0.35)] disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100"
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
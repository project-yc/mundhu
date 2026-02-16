import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Loader, AlertCircle, CheckCircle, ChevronDown, Users, LogOut } from 'lucide-react';
import { createAssessment, getAllAssessments, createTask } from '../../api/recruiter/assessment';

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
    localStorage.removeItem('userRole');
    localStorage.removeItem('org');
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
    <div className="min-h-screen bg-navy-50/40">
      {/* ── Top Navigation Bar ────────────────────────── */}
      <header className="bg-white border-b border-navy-900/8 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-navy-900 tracking-tight">Assessments</h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create Assessment
            </button>
            <button
              onClick={handleLogout}
              className="btn-ghost text-navy-800/60 hover:text-navy-900"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content Area ─────────────────────────── */}
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-6 h-6 text-navy-500 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && assessments.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 mx-auto mb-5 bg-navy-100 rounded-xl flex items-center justify-center">
              <Plus className="w-7 h-7 text-navy-500" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-1.5">No assessments yet</h3>
            <p className="text-sm text-navy-800/50 mb-6 max-w-sm mx-auto">Create your first assessment to start evaluating candidates</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              Create First Assessment
            </button>
          </div>
        ) : (
          /* ── Assessment Cards ─────────────────────── */
          <div className="space-y-3">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="card-surface-hover">
                {/* Card Header — clickable to expand */}
                <div
                  className="px-5 py-4 cursor-pointer flex items-center justify-between group"
                  onClick={() => setExpandedAssessment(expandedAssessment === assessment.id ? null : assessment.id)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-navy-900 mb-1 truncate">{assessment.name}</h3>
                    <p className="text-sm text-navy-800/50 line-clamp-1">{assessment.description}</p>
                    <div className="flex items-center gap-3 mt-2.5">
                      <span className="badge-blue">
                        ⏱ {assessment.duration_minutes} min
                      </span>
                      <span className="badge-surface">
                        📋 {assessment.tasks?.length || 0} task{(assessment.tasks?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${assessment.id}/invite`);
                      }}
                      className="btn-primary py-2 px-3.5 text-xs"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Invite
                    </button>
                    <ChevronDown
                      className={`w-5 h-5 text-navy-800/30 transition-transform duration-200 ease-out ${
                        expandedAssessment === assessment.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* ── Expanded Task Section ──────────── */}
                {expandedAssessment === assessment.id && (
                  <div className="border-t border-navy-900/6 bg-navy-50/30 px-5 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="section-label">Tasks ({assessment.tasks?.length || 0})</p>
                      <button
                        onClick={() => {
                          setSelectedAssessment(assessment);
                          setShowTaskModal(true);
                        }}
                        className="btn-secondary py-1.5 px-3 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Task
                      </button>
                    </div>

                    {assessment.tasks && assessment.tasks.length > 0 ? (
                      <div className="space-y-2">
                        {assessment.tasks.map((task) => (
                          <div key={task.id} className="bg-white border border-navy-900/6 rounded-lg px-4 py-3 hover:border-navy-500/20 transition-colors duration-150">
                            <h5 className="text-sm font-semibold text-navy-900 mb-0.5">{task.title}</h5>
                            <p className="text-xs text-navy-800/50 leading-relaxed">{task.description}</p>
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex gap-1.5 mt-2 flex-wrap">
                                {task.tags.map((tag, idx) => (
                                  <span key={idx} className="text-[11px] font-medium bg-navy-100 text-navy-700 px-2 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-navy-900/10 rounded-lg bg-white/60">
                        <p className="text-sm text-navy-800/40 mb-2">No tasks added yet</p>
                        <button
                          onClick={() => {
                            setSelectedAssessment(assessment);
                            setShowTaskModal(true);
                          }}
                          className="btn-ghost text-xs text-navy-500"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Create First Task
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════
         CREATE ASSESSMENT MODAL
         ══════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-modal shadow-modal border border-navy-900/8 animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-900/8">
              <h2 className="text-base font-semibold text-navy-900">Create Assessment</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', description: '', duration_minutes: '' });
                  setError('');
                }}
                className="p-1.5 hover:bg-navy-50 rounded-md transition-colors duration-150"
              >
                <X className="w-4 h-4 text-navy-800/40" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Assessment Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Senior Developer Test"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the assessment..."
                  rows="3"
                  className="textarea-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="e.g., 60"
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

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-navy-900/6 bg-navy-50/30">
              <button
                onClick={() => {
                  setShowModal(false);
                  setFormData({ name: '', description: '', duration_minutes: '' });
                  setError('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAssessment}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Create Assessment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
         ADD TASK MODAL
         ══════════════════════════════════════════════════ */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-navy-900/40 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-modal shadow-modal border border-navy-900/8 animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-900/8">
              <h2 className="text-base font-semibold text-navy-900">Add Task</h2>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setTaskFormData({ taskName: '', taskDescription: '', tags: '' });
                }}
                className="p-1.5 hover:bg-navy-50 rounded-md transition-colors duration-150"
              >
                <X className="w-4 h-4 text-navy-800/40" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Task Title</label>
                <input
                  type="text"
                  value={taskFormData.taskName}
                  onChange={(e) => setTaskFormData({ ...taskFormData, taskName: e.target.value })}
                  placeholder="e.g., Coding Challenge"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Task Description</label>
                <textarea
                  value={taskFormData.taskDescription}
                  onChange={(e) => setTaskFormData({ ...taskFormData, taskDescription: e.target.value })}
                  placeholder="Describe the task..."
                  rows="3"
                  className="textarea-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">Tags</label>
                <input
                  type="text"
                  value={taskFormData.tags}
                  onChange={(e) => setTaskFormData({ ...taskFormData, tags: e.target.value })}
                  placeholder="e.g., backend, api, nodejs"
                  className="input-field"
                />
                <p className="text-[11px] text-navy-800/40 mt-1.5">Separate tags with commas</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200/60 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  <p className="text-xs text-rose-700 font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-navy-900/6 bg-navy-50/30">
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setTaskFormData({ taskName: '', taskDescription: '', tags: '' });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
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
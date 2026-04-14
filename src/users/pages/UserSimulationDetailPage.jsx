import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';
import SimulationDetailTaskRow from '../components/simulations/SimulationDetailTaskRow';
import SimulationDetailSkeleton from '../components/simulations/SimulationDetailSkeleton';
import TaskAnalysisPanel from '../components/simulations/TaskAnalysisPanel';
import {
  getPublicAssessmentTasks,
  getUserSimulationById,
} from '../services/dashboardService';

const MONO_STYLE = { fontFamily: '"JetBrains Mono", monospace' };

const normalizeTaskStatus = (value) => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (normalized === 'completed' || normalized === 'submitted' || normalized === 'done') {
    return 'completed';
  }

  if (normalized === 'in_progress' || normalized === 'inprogress' || normalized === 'active') {
    return 'in_progress';
  }

  return 'not_started';
};

const formatDurationChip = (durationMinutes) => {
  if (typeof durationMinutes !== 'number' || Number.isNaN(durationMinutes)) {
    return '';
  }

  if (durationMinutes >= 60) {
    const hours = durationMinutes / 60;
    const rounded = Number.isInteger(hours) ? String(hours) : hours.toFixed(1);
    return `~${rounded}h`;
  }

  return `~${durationMinutes}m`;
};

export default function UserSimulationDetailPage() {
  const { id: simulationId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [simulation, setSimulation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTaskId, setActiveTaskId] = useState('');

  const fetchData = useCallback(async () => {
    if (!simulationId) {
      setError('Simulation id is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [detail, taskList] = await Promise.all([
        getUserSimulationById(simulationId),
        getPublicAssessmentTasks(simulationId),
      ]);

      setSimulation(detail || null);
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load simulation data.');
      setSimulation(null);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [simulationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mappedTasks = useMemo(() => {
    return tasks.map((task) => {
      const hasTaskStatus = Object.prototype.hasOwnProperty.call(task || {}, 'status');
      const hasAttemptStatus = Object.prototype.hasOwnProperty.call(task || {}, 'attempt_status');

      let status = 'not_started';
      if (hasTaskStatus) {
        status = normalizeTaskStatus(task?.status);
      } else if (hasAttemptStatus) {
        status = normalizeTaskStatus(task?.attempt_status);
      }

      return {
        ...task,
        uiStatus: status,
      };
    });
  }, [tasks]);

  const completedTasks = mappedTasks.filter((task) => task.uiStatus === 'completed').length;
  const totalTasks = mappedTasks.length;
  const completionPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const progressFillColor =
    completionPercent >= 100 ? '#10B981' : completionPercent > 0 ? '#F59E0B' : '#0F1A2E';

  const openTask = (task) => {
    const taskId = task?.id;
    if (!taskId || !simulationId) {
      return;
    }

    setActiveTaskId(String(taskId));
  };

  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="Simulations" showSignalCard={false} showUserFooter />}
      topbar={<UserTopbar title="Simulations" searchPlaceholder="Global search..." />}
    >
      <style>{`
        @keyframes detailShimmer {
          0% { background-color: #0A0F1E; }
          50% { background-color: #0D1420; }
          100% { background-color: #0A0F1E; }
        }
        .shimmer-block {
          animation: detailShimmer 1.3s ease-in-out infinite;
        }
        @keyframes taskPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        .task-row {
          border: 1px solid #0F1A2E;
          border-left-width: 3px;
          border-left-color: var(--left-accent-color);
          transition: border-color 0.15s ease;
        }
        .task-row:hover {
          border-color: #06B6D4;
          border-left-color: var(--left-accent-color);
        }
      `}</style>

      <main className="min-h-full bg-[#040914]">
        <div className="w-full border-b border-[#0F1A2E] bg-[#040914] px-6 py-3" style={MONO_STYLE}>
          <button
            type="button"
            onClick={() => navigate('/simulations')}
            className="text-[12px] text-[#06B6D4] transition hover:underline"
          >
            Simulations
          </button>
          <span className="text-[12px] text-[#4B5563]"> // </span>
          <span className="text-[12px] text-[#94A3B8]">{simulation?.name || 'Simulation Detail'}</span>
        </div>

        {loading ? (
          <div className="bg-[#040914] px-6 pb-6 pt-5">
            <SimulationDetailSkeleton />
          </div>
        ) : error ? (
          <div className="bg-[#040914] px-6 py-6">
            <p className="text-[14px] text-[#EF4444]" style={MONO_STYLE}>// Failed to load simulation data.</p>
            <button
              type="button"
              onClick={fetchData}
              className="mt-3 rounded-[8px] border border-[#EF4444] bg-transparent px-[14px] py-[5px] text-[11px] text-[#EF4444]"
              style={MONO_STYLE}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <section className="border-b border-[#0F1A2E] bg-[#060B18] px-6 py-5">
              <h2 className="text-[22px] font-bold text-[#F1F5F9]">{simulation?.name || 'Untitled Simulation'}</h2>

              {simulation?.description ? (
                <p className="mt-1 text-[13px] text-[#94A3B8]">{simulation.description}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-3" style={MONO_STYLE}>
                {simulation?.domain ? (
                  <span className="rounded-[4px] border border-[#0F1A2E] bg-[#0A0F1E] px-[10px] py-[3px] text-[11px] text-[#94A3B8]">
                    {simulation.domain}
                  </span>
                ) : null}

                {simulation?.difficulty ? (
                  <span className="rounded-[4px] border border-[#0F1A2E] bg-[#0A0F1E] px-[10px] py-[3px] text-[11px] text-[#94A3B8]">
                    {simulation.difficulty}
                  </span>
                ) : null}

                <span className="rounded-[4px] border border-[#0F1A2E] bg-[#0A0F1E] px-[10px] py-[3px] text-[11px] text-[#94A3B8]">
                  {completedTasks} / {totalTasks} tasks
                </span>

                {typeof simulation?.duration_minutes === 'number' ? (
                  <span className="rounded-[4px] border border-[#0F1A2E] bg-[#0A0F1E] px-[10px] py-[3px] text-[11px] text-[#94A3B8]">
                    {formatDurationChip(simulation.duration_minutes)}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 h-[3px] w-full bg-[#0F1A2E]">
                <div
                  className="h-[3px]"
                  style={{
                    width: `${Math.max(0, Math.min(100, completionPercent))}%`,
                    backgroundColor: progressFillColor,
                    borderRadius: 0,
                  }}
                />
              </div>
            </section>

            <section className="bg-[#040914] px-6 pb-6 pt-5">
              <div className="mb-4 flex items-center justify-between" style={MONO_STYLE}>
                <p className="text-[11px] uppercase text-[#4B5563]">// TASK LIST</p>
                <p className="text-[11px] text-[#4B5563]">{totalTasks} tasks · pick any</p>
              </div>

              {totalTasks === 0 ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
                  <p className="text-[14px] font-medium text-[#94A3B8]">No tasks found for this simulation.</p>
                  <p className="mt-1 text-[12px] italic text-[#4B5563]" style={MONO_STYLE}>
                    // Check back later or contact your administrator.
                  </p>
                </div>
              ) : (
                mappedTasks.map((task, index) => (
                  <SimulationDetailTaskRow
                    key={task?.id || `task-${index}`}
                    task={task}
                    index={index}
                    status={task.uiStatus}
                    onOpen={() => openTask(task)}
                  />
                ))
              )}
            </section>
          </>
        )}
      </main>

      {activeTaskId ? (
        <TaskAnalysisPanel
          taskId={activeTaskId}
          simId={simulationId}
          onClose={() => setActiveTaskId('')}
        />
      ) : null}
    </UserPageLayout>
  );
}

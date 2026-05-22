// RecruiterDashboard — slim orchestrator, delegates to sub-components
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckCircle, AlertCircle, Search, Zap } from 'lucide-react';
import { getAllAssessments, getRecruiterStats } from '../../../api/recruiter/assessment.jsx';
import MetricsStrip      from './MetricsStrip.jsx';
import AssessmentTable   from './AssessmentTable.jsx';
import ActivitySidebar   from './ActivitySidebar.jsx';



export default function RecruiterDashboard() {
  const navigate = useNavigate();

  const [assessments,   setAssessments]   = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [statsLoading,  setStatsLoading]  = useState(false);
  const [error,         setError]         = useState('');



  const totalAssessments = assessments.length;
  const readyAssessments = assessments.filter(a => (a.tasks?.length ?? 0) > 0 || (a.library_task_attachments?.length ?? 0) > 0).length;

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

  useEffect(() => { fetchAssessments(); fetchStats(); }, []);

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
    } catch { /* non-critical */ }
    finally { setStatsLoading(false); }
  };



  return (
    <div className="p-6 md:p-8 space-y-6">

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-error-bg border border-error-border rounded-xl animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
          <p className="text-[13px] font-medium text-error">{error}</p>
        </div>
      )}

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight font-display">Assessments</h1>
          <p className="text-[13px] text-text-secondary mt-0.5">Configure and track technical assessments across all candidates.</p>
        </div>
        <button
          onClick={() => navigate('/recruiter/assessments/new')}
          className="flex items-center gap-2 px-3.5 py-2 bg-brand hover:bg-brand-hover text-on-brand text-[12px] font-bold rounded-lg transition-colors duration-150 active:scale-[0.97] flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          New Assessment
        </button>
      </div>

      {/* Metrics */}
      <MetricsStrip metricsData={metricsData} loading={loading || statsLoading} />

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <AssessmentTable
            assessments={assessments}
            loading={loading}
            onOpenWizard={() => navigate('/recruiter/assessments/new')}
          />
        </div>
        {assessments.length > 0 && (
          <ActivitySidebar
            assessments={assessments}
            metricsData={metricsData}
            totalAssessments={totalAssessments}
            readyAssessments={readyAssessments}
          />
        )}
      </div>


    </div>
  );
}

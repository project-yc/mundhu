import { authAxios } from '../../lib/axios';

export const getDashboardStats = async ({ month } = {}) => {
  const qs = month ? `?month=${month}` : '';
  return authAxios.get(`/api/v1/recruiter/stats${qs}`);
};

export const getDashboardAssessments = async ({ page = 1, pageSize = 10 } = {}) => {
  return authAxios.get(`/api/assessments/all?page=${page}&page_size=${pageSize}`);
};

export const getDashboardCandidateMetrics = async ({ month } = {}) => {
  const qs = month ? `?month=${month}` : '';
  return authAxios.get(`/api/v1/recruiter/dashboard/candidate-metrics${qs}`);
};

export const getDashboardAssessmentsList = async () => {
  return authAxios.get('/api/v1/assessments/list');
};

export const getDashboardScoreDistribution = async ({ assessmentId, month } = {}) => {
  const params = new URLSearchParams();
  if (assessmentId) params.set('assessment_id', assessmentId);
  if (month) params.set('month', month);
  const qs = params.toString();
  return authAxios.get(`/api/v1/recruiter/dashboard/score-distribution${qs ? `?${qs}` : ''}`);
};

export const getDashboardPipelineFunnel = async ({ assessmentId, month } = {}) => {
  const params = new URLSearchParams();
  if (assessmentId) params.set('assessment_id', assessmentId);
  if (month) params.set('month', month);
  const qs = params.toString();
  return authAxios.get(`/api/v1/recruiter/dashboard/pipeline-funnel${qs ? `?${qs}` : ''}`);
};

export const getDashboardActivity = async ({ page = 1, pageSize = 10 } = {}) => {
  return authAxios.get(`/api/v1/recruiter/dashboard/activity?page=${page}&page_size=${pageSize}`);
};

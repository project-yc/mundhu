import userApi from './api';

export const getUserDashboard = async () => {
  const response = await userApi.get('/api/v1/user/dashboard');
  return response.data?.data;
};

export const getUserSessions = async () => {
  const response = await userApi.get('/api/v1/user/sessions');
  return response.data?.data || [];
};

export const getUserSimulations = async (query = {}) => {
  const response = await userApi.get('/api/v1/user/simulations', {
    params: query,
  });

  return response.data?.data;
};

export const getUserSimulationById = async (assessmentId) => {
  const response = await userApi.get(`/api/v1/user/simulations/${assessmentId}`);
  return response.data?.data;
};

export const getPublicAssessmentTasks = async (assessmentId) => {
  const response = await userApi.get(`/api/v1/public/assessments/${assessmentId}/tasks`);
  return response.data?.data || [];
};

export const startUserSimulation = async (assessmentId, taskId) => {
  const response = await userApi.post(
    `/api/v1/public/assessments/${assessmentId}/tasks/${taskId}/start`,
  );
  return response.data;
};

export const launchUserSimulation = async (assessmentId) => {
  const tasks = await getPublicAssessmentTasks(assessmentId);
  const firstTask = tasks[0];
  const taskId = firstTask?.id || firstTask?.task_id;

  if (!taskId) {
    throw new Error('No tasks available for this simulation.');
  }

  return startUserSimulation(assessmentId, taskId);
};

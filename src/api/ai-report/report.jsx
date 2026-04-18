import userApi from '../../users/services/api';

export const getSessionAnalyticsReport = async (sessionId) => {
  const response = await userApi.get(`/api/v1/analytics/reports/${sessionId}`);

  return response.data?.data ?? response.data;
};
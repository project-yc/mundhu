import { useCallback, useEffect, useState } from 'react';
import { getUserDashboard, getUserSessions } from '../services/dashboardService';

export const useUserDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [dashboardData, sessionsData] = await Promise.all([
        getUserDashboard(),
        getUserSessions(),
      ]);

      setDashboard(dashboardData);
      setSessions(sessionsData);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboard,
    sessions,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

import { useEffect, useState } from 'react';
import { listAssessments } from '../../../../api/recruiter/reports';
import { normalizeList } from '../utils/reportRows';

/**
 * Loads the assessment picker options and selects the first one.
 * @returns {{ assessments, selectedId, setSelectedId, loading, error }}
 */
export function useAssessmentOptions() {
  const [assessments, setAssessments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    listAssessments({ signal: controller.signal })
      .then(payload => {
        const list = normalizeList(payload);
        setAssessments(list);
        if (list.length > 0) setSelectedId(String(list[0].id));
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setError(err?.message || 'Failed to load assessments.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { assessments, selectedId, setSelectedId, loading, error };
}

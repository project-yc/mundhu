import { useEffect, useState } from 'react';
import { getFreeTextSectionReport } from '../../../../api/recruiter/reports';

/** Loads the free-text breakdown when its panel opens. */
export function useFreeTextSectionReport(assessmentInstanceId, sectionId) {
  const [result, setResult] = useState({ sectionId: null, data: null });
  const [failure, setFailure] = useState({ sectionId: null, message: '' });

  const ready = Boolean(assessmentInstanceId && sectionId);
  const isCurrent = result.sectionId === sectionId;
  const error = failure.sectionId === sectionId ? failure.message : '';
  const loading = ready && !isCurrent && !error;

  useEffect(() => {
    if (!ready) return undefined;
    const controller = new AbortController();

    getFreeTextSectionReport(assessmentInstanceId, sectionId, { signal: controller.signal })
      .then(payload => {
        if (controller.signal.aborted) return;
        setResult({ sectionId, data: payload?.data ?? payload });
      })
      .catch(err => {
        if (controller.signal.aborted) return;
        setFailure({ sectionId, message: err?.message || 'Failed to load answers.' });
      });

    return () => controller.abort();
  }, [assessmentInstanceId, sectionId, ready]);

  return { data: isCurrent ? result.data : null, loading, error };
}

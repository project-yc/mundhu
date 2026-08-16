import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AssessmentBuilderProvider } from './context/AssessmentBuilderContext';
import { useAssessmentBuilder } from './context/AssessmentBuilderContext';
import { hydrateBuilderState } from './context/hydrateBuilderState';
import { getBuilderState } from './api/assessmentBuilderApi';
import { AssessmentDetailsStep } from './steps/AssessmentDetailsStep';
import { AssessmentBuilderStep } from './steps/AssessmentBuilderStep';
import { AssessmentReviewStep } from './steps/AssessmentReviewStep';
import { AskAnythingBar } from '../../../../components/recruiter/AskAnythingBar';
import { Toaster } from '../../../../components/ui/sonner';

function BuilderLayout() {
  const { state, dispatch, ACTIONS } = useAssessmentBuilder();
  const navigate = useNavigate();
  // `/recruiter/assessments/:id/edit` resumes a draft; `/new` starts blank.
  const { id: assessmentId } = useParams();

  const [loading, setLoading] = useState(Boolean(assessmentId));
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!assessmentId) return undefined;

    // `loading` is already seeded from `assessmentId`, so the effect only ever
    // clears it — setting it here again would be a synchronous setState in an
    // effect body for no benefit.
    let cancelled = false;

    getBuilderState(assessmentId)
      .then(res => {
        if (cancelled) return;
        const payload = res?.data ?? res;
        dispatch({ type: ACTIONS.HYDRATE, payload: hydrateBuilderState(payload) });
      })
      .catch(err => {
        if (cancelled) return;
        setLoadError(err?.message || 'Could not load this assessment.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [assessmentId, dispatch, ACTIONS]);

  const handleCancel = () => navigate('/recruiter/assessments');

  if (loading) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-page">
        <p className="text-[14px] text-text-secondary">Loading assessment…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-3 bg-page">
        <p className="text-[14px] text-error">{loadError}</p>
        <button
          type="button"
          onClick={handleCancel}
          className="h-10 rounded-[8px] border border-border-default bg-surface px-4 text-[14px] font-medium text-text-primary"
        >
          Back to assessments
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <Toaster />
      <AskAnythingBar />
      <div className="min-h-0 flex-1 p-3 pt-0 md:pt-0">
        <div className="h-full min-h-0 overflow-hidden rounded-[10px] border border-border-subtle bg-surface">
          {state.currentStep === 1 && (
            <AssessmentDetailsStep onCancel={handleCancel} />
          )}
          {state.currentStep === 2 && (
            <AssessmentBuilderStep />
          )}
          {state.currentStep === 3 && (
            <AssessmentReviewStep />
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssessmentBuilderPage() {
  return (
    <AssessmentBuilderProvider>
      <BuilderLayout />
    </AssessmentBuilderProvider>
  );
}

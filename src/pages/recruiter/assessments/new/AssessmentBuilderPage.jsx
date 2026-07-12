import { useNavigate } from 'react-router-dom';
import { AssessmentBuilderProvider } from './context/AssessmentBuilderContext';
import { useAssessmentBuilder } from './context/AssessmentBuilderContext';
import { AssessmentDetailsStep } from './steps/AssessmentDetailsStep';
import { AssessmentBuilderStep } from './steps/AssessmentBuilderStep';
import { AssessmentReviewStep } from './steps/AssessmentReviewStep';
import { AskAnythingBar } from '../../../../components/recruiter/AskAnythingBar';

function BuilderLayout() {
  const { state } = useAssessmentBuilder();
  const navigate = useNavigate();

  const handleCancel = () => navigate('/recruiter/assessments');

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
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

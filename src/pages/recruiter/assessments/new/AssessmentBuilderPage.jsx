import { useNavigate } from 'react-router-dom';
import { AssessmentBuilderProvider } from './context/AssessmentBuilderContext';
import { useAssessmentBuilder } from './context/AssessmentBuilderContext';
import { AssessmentDetailsStep } from './steps/AssessmentDetailsStep';
import { AssessmentBuilderStep } from './steps/AssessmentBuilderStep';
import { AssessmentReviewStep } from './steps/AssessmentReviewStep';

const STEPS = [
  { number: 1, label: 'Details' },
  { number: 2, label: 'Build' },
  { number: 3, label: 'Review' },
];

function StepperBar({ currentStep, onCancel }) {
  return (
    <div className="flex-shrink-0 h-14 flex items-center justify-between px-6 bg-surface border-b border-border-default">
      {/* Step indicators */}
      <div className="flex items-center gap-1">
        {STEPS.map((step, idx) => {
          const isPast = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isFuture = currentStep < step.number;
          return (
            <div key={step.number} className="flex items-center gap-1">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                    isActive
                      ? 'bg-brand text-on-brand'
                      : isPast
                      ? 'bg-success text-white'
                      : 'bg-surface-muted text-text-muted border border-border-default'
                  }`}
                >
                  {isPast ? (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 2.5L9 1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`text-[13px] font-semibold ${
                  isActive ? 'text-text-primary' : isFuture ? 'text-text-muted' : 'text-text-secondary'
                }`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-1 ${isPast ? 'bg-success' : 'bg-border-default'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-muted px-3 py-1.5 rounded-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}

function BuilderLayout() {
  const { state } = useAssessmentBuilder();
  const navigate = useNavigate();

  const handleCancel = () => navigate('/recruiter/assessments');

  return (
    <div className="h-full flex flex-col">
      <StepperBar currentStep={state.currentStep} onCancel={handleCancel} />
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
  );
}

export default function AssessmentBuilderPage() {
  return (
    <AssessmentBuilderProvider>
      <BuilderLayout />
    </AssessmentBuilderProvider>
  );
}

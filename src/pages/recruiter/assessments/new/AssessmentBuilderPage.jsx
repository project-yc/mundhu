import { useNavigate } from 'react-router-dom';
import { Image, Mic, Search } from 'lucide-react';
import { AssessmentBuilderProvider } from './context/AssessmentBuilderContext';
import { useAssessmentBuilder } from './context/AssessmentBuilderContext';
import { AssessmentDetailsStep } from './steps/AssessmentDetailsStep';
import { AssessmentBuilderStep } from './steps/AssessmentBuilderStep';
import { AssessmentReviewStep } from './steps/AssessmentReviewStep';
import { Input } from '../../../../components/ui/input';

function BuilderLayout() {
  const { state } = useAssessmentBuilder();
  const navigate = useNavigate();

  const handleCancel = () => navigate('/recruiter/assessments');

  return (
    <div className="flex h-full min-h-0 flex-col bg-page">
      <div className="hidden h-[58px] flex-shrink-0 items-center border-b border-border-subtle bg-page px-3 md:flex">
        <div className="relative flex h-[32px] w-full items-center rounded-[8px] border border-border-default bg-surface shadow-sm">
          <Search className="pointer-events-none absolute left-[11px] h-[17px] w-[17px] text-text-secondary" strokeWidth={1.8} />
          <Input
            aria-label="Global search"
            placeholder="Ask anything..."
            className="h-full border-0 bg-transparent pl-[33px] pr-[72px] shadow-none focus-visible:ring-0"
          />
          <div className="absolute right-[10px] flex items-center gap-[12px] text-text-primary">
            <button type="button" className="transition-opacity hover:opacity-70" aria-label="Voice input">
              <Mic className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </button>
            <button type="button" className="transition-opacity hover:opacity-70" aria-label="Attach image">
              <Image className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </div>
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

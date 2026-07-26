import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { RecruiterThemeProvider } from '../../../theme/RecruiterThemeProvider';
import OnboardingLayout from './OnboardingLayout';
import Step1OrgDetails  from './steps/Step1OrgDetails';
import Step2Branding    from './steps/Step2Branding';
import Step3InviteTeam  from './steps/Step3InviteTeam';
import Step4Review      from './steps/Step4Review';
import { saveOrgDetails, sendInvites, launchWorkspace } from '../../../api/recruiter/onboarding';

const TOTAL = 4;

const STEP_WIDTH = {
  1: 'max-w-[440px]',
  2: 'max-w-[680px]',
  3: 'max-w-[480px]',
  4: 'max-w-[440px]',
};

function NavButtons({ step, onBack, onNext, onSkip, loading, nextLabel }) {
  return (
    <div className="w-full mt-10 flex items-center justify-between">
      {step === 1 ? (
        <Button
          type="button" variant="outline" onClick={onSkip}
          className="h-11 px-5 rounded-[10px] text-[13px] font-semibold text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]"
        >
          Skip for now
        </Button>
      ) : step === 3 ? (
        <Button
          type="button" variant="ghost" onClick={onSkip}
          className="h-11 px-2 text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-transparent"
        >
          Skip, I'll invite later
        </Button>
      ) : (
        <Button
          type="button" variant="outline" onClick={onBack}
          className="h-11 px-5 rounded-[10px] text-[13px] font-semibold text-[#64748B] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
      )}

      <Button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="h-11 px-6 rounded-[10px] text-[13px] font-semibold gap-2 bg-[#FB7414] hover:bg-[#E2650F] text-white shadow-[0_4px_12px_-2px_rgba(251,116,20,0.4)] disabled:opacity-60"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : step === TOTAL ? (
          <Rocket className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {loading ? 'Saving…' : (nextLabel || 'Continue')}
      </Button>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [step1, setStep1] = useState({ company_name: '', company_size: '', industry: '', website: '' });
  const [step2, setStep2] = useState({ logo: null, brand_color: '#FB7414', candidate_name: '', tagline: '' });
  const [step3, setStep3] = useState({ invites: [] });

  const goNext = () => { setError(''); setStep(s => Math.min(s + 1, TOTAL)); };
  const goBack = () => { setError(''); setStep(s => Math.max(s - 1, 1)); };

  const handleStep1Next = async () => {
    if (!step1.company_name.trim()) {
      setError('Company name is required.');
      return;
    }
    setLoading(true);
    try {
      await saveOrgDetails({
        company_name: step1.company_name,
        company_size: step1.company_size,
        industry:     step1.industry,
        website:      step1.website,
      });
      const org = (() => { try { return JSON.parse(localStorage.getItem('org') || '{}'); } catch { return {}; } })();
      localStorage.setItem('org', JSON.stringify({ ...org, name: step1.company_name }));
      goNext();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = () => goNext();
  const handleStep3Next = () => goNext();

  const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleLaunch = async () => {
    setLoading(true);
    try {
      if (step3.invites.length > 0) {
        await sendInvites(step3.invites);
      }

      const logoDataUrl = step2.logo ? await readAsDataUrl(step2.logo) : null;

      const result = await launchWorkspace({
        logo:           step2.logo,
        brand_color:    step2.brand_color,
        candidate_name: step2.candidate_name,
        tagline:        step2.tagline,
      });

      const org = (() => { try { return JSON.parse(localStorage.getItem('org') || '{}'); } catch { return {}; } })();
      localStorage.setItem('org', JSON.stringify({
        ...org,
        is_onboarded: true,
        branding: { ...result.branding, logo_url: logoDataUrl || result.branding?.logo_url || '' },
      }));
      navigate('/recruiter/dashboard', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const nextActions = [handleStep1Next, handleStep2Next, handleStep3Next, handleLaunch];
  const nextLabels  = ['Continue', 'Continue', 'Continue', 'Launch my workspace →'];
  const skipActions = [() => goNext(), null, () => goNext(), null];

  return (
    <RecruiterThemeProvider>
      <OnboardingLayout currentStep={step}>
        <div className={`w-full ${STEP_WIDTH[step]}`}>
          {step === 1 && <Step1OrgDetails data={step1} onChange={setStep1} />}
          {step === 2 && <Step2Branding   data={step2} onChange={setStep2} />}
          {step === 3 && <Step3InviteTeam data={step3} onChange={setStep3} />}
          {step === 4 && <Step4Review data={{ step1, step2, step3 }} loading={loading} error={error} />}

          {error && step < 4 && (
            <div className="w-full mt-4 px-4 py-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[10px] text-[13px] text-[#DC2626]">
              {error}
            </div>
          )}

          <NavButtons
            step={step}
            onBack={goBack}
            onNext={nextActions[step - 1]}
            onSkip={skipActions[step - 1]}
            loading={loading}
            nextLabel={nextLabels[step - 1]}
          />

          <p className="mt-6 text-[11px] text-[#94A3B8] text-center">
            &copy; {new Date().getFullYear()} Trudev
          </p>
        </div>
      </OnboardingLayout>
    </RecruiterThemeProvider>
  );
}
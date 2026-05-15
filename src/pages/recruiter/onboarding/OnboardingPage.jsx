import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Rocket } from 'lucide-react';
import { RecruiterThemeProvider } from '../../../theme/RecruiterThemeProvider';
import OnboardingLayout from './OnboardingLayout';
import Step1OrgDetails  from './steps/Step1OrgDetails';
import Step2Branding    from './steps/Step2Branding';
import Step3InviteTeam  from './steps/Step3InviteTeam';
import Step4Review      from './steps/Step4Review';
import { saveOrgDetails, sendInvites, launchWorkspace } from '../../../api/recruiter/onboarding';

const TOTAL = 4;

function NavButtons({ step, onBack, onNext, onSkip, loading, nextLabel }) {
  return (
    <div className="w-full max-w-lg mt-5 flex items-center justify-between">
      {step === 1 ? (
        <button
          type="button"
          onClick={onSkip}
          className="h-10 px-5 border border-[#E2E8F0] rounded-[8px] text-[13px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors bg-white"
        >
          Skip for now
        </button>
      ) : step === 3 ? (
        <button
          type="button"
          onClick={onSkip}
          className="h-10 text-[13px] font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          Skip, I'll invite later
        </button>
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="h-10 px-5 border border-[#E2E8F0] rounded-[8px] text-[13px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition-colors bg-white flex items-center gap-1.5"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      )}

      <button
        type="button"
        onClick={onNext}
        disabled={loading}
        className="h-10 px-6 bg-[#22D3EE] hover:bg-[#06B6D4] text-[#0C4A6E] text-[13px] font-semibold rounded-[8px] transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_1px_2px_0_rgba(28,77,141,0.12)]"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-[#0C4A6E]/30 border-t-[#0C4A6E] rounded-full animate-spin" />
        ) : step === TOTAL ? (
          <Rocket className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {loading ? 'Saving…' : (nextLabel || 'Continue')}
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const [step1, setStep1] = useState({
    company_name: '',
    company_size: '',
    industry:     '',
    website:      '',
  });

  const [step2, setStep2] = useState({
    logo:           null,
    brand_color:    '#22D3EE',
    candidate_name: '',
    tagline:        '',
  });

  const [step3, setStep3] = useState({ invites: [] });

  // ── Helpers ───────────────────────────────────────────────────
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
      // Update org name in localStorage so layout picks it up
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

  // Convert a File to a base64 data URL so the logo can be displayed
  // directly from localStorage without needing a public S3 URL.
  const readAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleLaunch = async () => {
    setLoading(true);
    try {
      // 1. Send invites if any
      if (step3.invites.length > 0) {
        await sendInvites(step3.invites);
      }

      // 2. Convert logo to data URL BEFORE the API call so we always have
      //    a locally-renderable copy — the S3 URL may not be publicly readable.
      const logoDataUrl = step2.logo ? await readAsDataUrl(step2.logo) : null;

      // 3. Launch (uploads logo + branding → sets is_onboarded)
      const result = await launchWorkspace({
        logo:           step2.logo,
        brand_color:    step2.brand_color,
        candidate_name: step2.candidate_name,
        tagline:        step2.tagline,
      });

      // 4. Update localStorage — prefer the local data URL for the logo so the
      //    sidebar renders it immediately regardless of S3 bucket permissions.
      const org = (() => { try { return JSON.parse(localStorage.getItem('org') || '{}'); } catch { return {}; } })();
      localStorage.setItem('org', JSON.stringify({
        ...org,
        is_onboarded: true,
        branding: {
          ...result.branding,
          logo_url: logoDataUrl || result.branding?.logo_url || '',
        },
      }));
      navigate('/recruiter/dashboard', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Step handlers ─────────────────────────────────────────────
  const nextActions = [handleStep1Next, handleStep2Next, handleStep3Next, handleLaunch];
  const nextLabels  = ['Continue', 'Continue', 'Continue', 'Launch my workspace →'];
  const skipActions = [() => goNext(), null, () => goNext(), null];

  return (
    <RecruiterThemeProvider>
      <OnboardingLayout currentStep={step}>
        {/* Step content */}
        {step === 1 && <Step1OrgDetails data={step1} onChange={setStep1} />}
        {step === 2 && <Step2Branding   data={step2} onChange={setStep2} />}
        {step === 3 && <Step3InviteTeam data={step3} onChange={setStep3} />}
        {step === 4 && <Step4Review data={{ step1, step2, step3 }} loading={loading} error={error} />}

        {/* Inline error for steps 1–3 */}
        {error && step < 4 && (
          <div className="w-full max-w-lg mt-3 px-4 py-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] text-[13px] text-[#DC2626]">
            {error}
          </div>
        )}

        {/* Navigation */}
        <NavButtons
          step={step}
          onBack={goBack}
          onNext={nextActions[step - 1]}
          onSkip={skipActions[step - 1]}
          loading={loading}
          nextLabel={nextLabels[step - 1]}
        />

        {/* Footer note */}
        <p className="mt-6 text-[11px] text-[#94A3B8]">
          &copy; {new Date().getFullYear()} Venaka &middot; Developer Portal
        </p>
      </OnboardingLayout>
    </RecruiterThemeProvider>
  );
}

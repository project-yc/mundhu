// AssessmentSuccessStep — confetti "You're all set!" screen shown after publish.
// Figma: https://www.figma.com/design/qZ0WSdI5uIafjFlXBHJ9Pv/TruDev-Designs?node-id=329-5401
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Button } from '../../../../../components/ui/button';
import burst1 from '../../../../../assets/recruiter/images/assessment-success/burst-1.svg';
import burst2 from '../../../../../assets/recruiter/images/assessment-success/burst-2.svg';
import glow from '../../../../../assets/recruiter/images/assessment-success/glow.svg';
import checkFat from '../../../../../assets/recruiter/images/assessment-success/check.svg';

// Brand-orange confetti, matching --color-assessment-cta (#FF8528).
const CONFETTI_COLORS = ['#FF8528', '#FFB27A', '#0A0D13', '#FFFFFF'];

export function AssessmentSuccessStep({ assessmentId }) {
  const navigate = useNavigate();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const end = Date.now() + 700;
    (function frame() {
      confetti({
        particleCount: 3,
        startVelocity: 38,
        spread: 70,
        ticks: 200,
        gravity: 0.9,
        origin: { x: 0, y: 0.5 },
        colors: CONFETTI_COLORS,
      });
      confetti({
        particleCount: 3,
        startVelocity: 38,
        spread: 70,
        ticks: 200,
        gravity: 0.9,
        origin: { x: 1, y: 0.5 },
        colors: CONFETTI_COLORS,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();

    confetti({
      particleCount: 90,
      spread: 100,
      startVelocity: 45,
      gravity: 0.85,
      origin: { x: 0.5, y: 0.4 },
      colors: CONFETTI_COLORS,
    });
  }, []);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col items-center justify-center overflow-hidden bg-surface px-6">
      {/* Decorative sunburst behind the check icon */}
      <div className="pointer-events-none absolute left-1/2 top-[36%] h-0 w-0" aria-hidden="true">
        <img
          src={burst2}
          alt=""
          className="absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rotate-[44deg] opacity-90"
        />
        <img
          src={burst1}
          alt=""
          className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2"
        />
        <img
          src={glow}
          alt=""
          className="absolute left-1/2 top-1/2 h-[72px] w-[72px] -translate-y-[190px] translate-x-[80px]"
        />
      </div>

      <div className="relative z-[1] flex flex-col items-center">
        <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[var(--color-assessment-cta)] shadow-[0_18px_30px_-8px_rgba(255,133,40,0.55)]">
          <img src={checkFat} alt="" className="h-[32px] w-[32px]" />
        </div>

        <div className="mt-[25px] flex max-w-[515px] flex-col items-center gap-[16px] text-center">
          <h2 className="text-[24px] font-semibold leading-[normal] text-text-primary">You&apos;re all set!</h2>
          <p className="text-[16px] leading-[22px] text-text-secondary">
            We&apos;re excited to announce that your assessment is now officially live! You can start sharing it
            with candidates right away.
          </p>
        </div>

        <div className="mt-[25px] flex w-[195px] flex-col items-center gap-[10px]">
          <Button
            type="button"
            variant="secondary"
            className="h-[41px] w-full text-[14px] font-medium"
            onClick={() => navigate('/recruiter/dashboard')}
          >
            Go to dashboard
          </Button>
          <Button
            type="button"
            variant="cta"
            className="h-[41px] w-full text-[14px] font-bold"
            onClick={() => navigate(`/recruiter/invite/candidates${assessmentId ? `?assessmentId=${assessmentId}` : ''}`)}
          >
            Invite candidates
          </Button>
        </div>
      </div>
    </div>
  );
}

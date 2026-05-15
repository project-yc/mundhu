import { Zap, Check } from 'lucide-react';

const STEPS = [
  { n: 1, label: 'Organization Details' },
  { n: 2, label: 'Brand Your Workspace' },
  { n: 3, label: 'Invite Your Team'     },
  { n: 4, label: 'Review & Launch'      },
];

export default function OnboardingLayout({ currentStep, children }) {
  const progress = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* ── Top Navbar ──────────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-[#E2E8F0] flex items-center px-6 flex-shrink-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#22D3EE] flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-[#0C4A6E]" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold tracking-[0.06em] text-[#0F172A] font-display">
            MUNDHU
          </span>
        </div>
        <div className="ml-auto text-[13px] text-[#94A3B8]">
          Setting up your workspace
        </div>
      </header>

      {/* ── Progress bar (full-width) ────────────────────────────── */}
      <div className="h-0.5 bg-[#E2E8F0] flex-shrink-0">
        <div
          className="h-full bg-[#22D3EE] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside className="w-56 bg-white border-r border-[#E2E8F0] flex-shrink-0 py-8 px-5 hidden md:flex flex-col">
          <p className="text-[10px] font-semibold tracking-[1.4px] uppercase text-[#94A3B8] mb-1.5">
            Progress
          </p>
          <p className="text-[13px] font-semibold text-[#0F172A] mb-6">
            Onboarding Steps
          </p>

          <ol className="space-y-1 flex-1">
            {STEPS.map(({ n, label }) => {
              const done    = n < currentStep;
              const active  = n === currentStep;
              const pending = n > currentStep;

              return (
                <li
                  key={n}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                    active  ? 'bg-[#CFFAFE]'           :
                    done    ? 'bg-transparent'          :
                    'bg-transparent'
                  }`}
                >
                  {/* Step circle */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all ${
                      done    ? 'bg-[#22D3EE] text-[#0C4A6E]'   :
                      active  ? 'bg-[#22D3EE] text-[#0C4A6E]'   :
                      'bg-[#F1F5F9] text-[#94A3B8]'
                    }`}
                  >
                    {done ? <Check className="w-3 h-3" strokeWidth={3} /> : n}
                  </div>

                  <span
                    className={`text-[13px] leading-tight ${
                      active  ? 'font-semibold text-[#0E7490]' :
                      done    ? 'font-medium text-[#64748B]'   :
                      'font-medium text-[#94A3B8]'
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="text-[11px] text-[#CBD5E1] mt-4">
            Step {currentStep} of {STEPS.length}
          </p>
        </aside>

        {/* ── Main content ────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto flex flex-col items-center justify-start py-10 px-4">
          {children}
        </main>

      </div>
    </div>
  );
}

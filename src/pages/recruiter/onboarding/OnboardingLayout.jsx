import { Check, Zap } from 'lucide-react';
import ladyLaptop from '../../../assets/recruiter/images/lady_laptop.svg';

const STEPS = [
  { n: 1, label: 'Organization Details' },
  { n: 2, label: 'Brand Your Workspace' },
  { n: 3, label: 'Invite Your Team'     },
  { n: 4, label: 'Workspace Ready'      },
];

export default function OnboardingLayout({ currentStep, children }) {
  return (
    <div
      className="h-screen min-h-screen flex overflow-hidden bg-[#FAFAFA]"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-[300px] flex-shrink-0 h-full bg-[#FB7414]">
        <div className="px-8 pt-9 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#FB7414]" strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-bold tracking-[0.04em] text-white">Trudev</span>
        </div>

        <div className="px-8 mt-10 mb-8">
          <p className="text-[12px] font-semibold text-white/75 uppercase tracking-[0.16em] mb-2">
            Set up workspace
          </p>
          <div className="w-9 h-[3px] rounded-full bg-white" />
        </div>

        <ol className="px-8 flex-shrink-0">
          {STEPS.map(({ n, label }, idx) => {
            const done   = n < currentStep;
            const active = n === currentStep;
            return (
              <li key={n} className="relative flex items-start gap-3.5 pb-9 last:pb-0">
                {idx < STEPS.length - 1 && (
                  <span
                    className={`absolute left-[13px] top-7 w-px h-[calc(100%-4px)] ${
                      done ? 'bg-white/80' : 'bg-white/25'
                    }`}
                  />
                )}
                <div
                  className={`relative z-10 w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all ${
                    done   ? 'bg-white text-[#FB7414]' :
                    active ? 'bg-white text-[#FB7414] ring-4 ring-white/30' :
                    'bg-white/15 text-white/70 border border-white/40'
                  }`}
                >
                  {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : n}
                </div>
                <span
                  className={`text-[13.5px] leading-tight pt-[3px] ${
                    active ? 'font-semibold text-white' :
                    done   ? 'font-medium text-white/90' :
                    'font-medium text-white/55'
                  }`}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>

        <div className="mt-auto flex justify-center px-6 pb-8 pt-6">
          <img src={ladyLaptop} alt="" className="w-full max-w-[250px] h-auto select-none pointer-events-none" draggable={false} />
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-20 bg-[#FB7414]">
        <div className="h-14 flex items-center px-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-[#FB7414]" strokeWidth={2.5} />
            </div>
            <span className="text-[14px] font-bold text-white">Trudev</span>
          </div>
          <span className="ml-auto text-[12px] text-white/80">Step {currentStep} of {STEPS.length}</span>
        </div>
        <div className="h-1 bg-white/25">
          <div className="h-full bg-white transition-all duration-500 ease-out" style={{ width: `${(currentStep / STEPS.length) * 100}%` }} />
        </div>
      </div>

      {/* Main content — fixed top offset, consistent across every step */}
      <main className="flex-1 h-full overflow-y-auto">
        <div className="min-h-full w-full flex flex-col items-center px-6 pt-24 lg:pt-20 pb-16">
          {children}
        </div>
      </main>
    </div>
  );
}
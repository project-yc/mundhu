import { useMemo } from 'react';
import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';
import { useUserSimulations } from '../hooks/useUserSimulations';

const MONO_STYLE = { fontFamily: "'JetBrains Mono', monospace" };

const ROADMAP_ITEMS = [
  {
    title: 'Signal Baseline',
    subtitle: '// Complete 1 simulation to unlock',
    threshold: 1,
  },
  {
    title: 'Domain Proficiency',
    subtitle: '// Complete 3 simulations to unlock',
    threshold: 3,
  },
  {
    title: 'Staff Engineer Track',
    subtitle: '// Complete 5 simulations to unlock',
    threshold: 5,
  },
];

export default function UserSkillRoadmapPage() {
  const { rows, loading, error } = useUserSimulations();

  const completedSimulationCount = useMemo(() => {
    if (loading || error) {
      return null;
    }

    return rows.filter((row) => row.status === 'COMPLETED').length;
  }, [rows, loading, error]);

  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="Skill Roadmap" showSignalCard={false} showUserFooter />}
      topbar={<UserTopbar title="Skill Roadmap" searchPlaceholder="Global search..." />}
    >
      <main className="flex min-h-full items-center justify-center bg-[#040914] px-4 py-6">
        <section className="w-full max-w-[520px]">
          <p className="mb-5 text-center text-[11px] uppercase tracking-[0.1em] text-[#06B6D4]" style={MONO_STYLE}>
            // SKILL_ROADMAP
          </p>

          <h2 className="text-center text-[20px] font-bold leading-[1.4] text-[#F1F5F9]">
            Your personalized engineering roadmap
            <br />
            unlocks as you resolve incidents.
          </h2>

          <div className="mt-8">
            {ROADMAP_ITEMS.map((item) => {
              const isUnlocked =
                typeof completedSimulationCount === 'number' && completedSimulationCount >= item.threshold;

              return (
                <article
                  key={item.title}
                  className="mb-2 flex items-center gap-4 rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E] px-5 py-4"
                >
                  <span
                    className={`text-[20px] ${isUnlocked ? 'text-[#10B981]' : 'text-[#4B5563]'}`}
                    style={MONO_STYLE}
                  >
                    {isUnlocked ? '✓' : '▣'}
                  </span>
                  <div>
                    <p className={`text-[14px] font-semibold ${isUnlocked ? 'text-[#F1F5F9]' : 'text-[#4B5563]'}`}>
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[12px] italic text-[#4B5563]" style={MONO_STYLE}>
                      {item.subtitle}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-6 text-center text-[11px] italic text-[#4B5563]" style={MONO_STYLE}>
            // Full roadmap generates after sufficient signal data.
          </p>
        </section>
      </main>
    </UserPageLayout>
  );
}

import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';

const MONO_STYLE = { fontFamily: "'JetBrains Mono', monospace" };

const LOCKED_METRICS = ['SIGNAL SCORE', 'TASKS RESOLVED', 'AVG. RESOLUTION'];

export default function UserAnalyticsPlaceholderPage() {
  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="Analytics" showSignalCard={false} showUserFooter />}
      topbar={<UserTopbar title="Analytics" searchPlaceholder="Global search..." />}
    >
      <main className="flex min-h-full items-center justify-center bg-[#040914] px-4 py-6">
        <section className="w-full max-w-[720px] text-center">
          <p
            className="mb-5 text-[11px] uppercase tracking-[0.1em] text-[#06B6D4]"
            style={MONO_STYLE}
          >
            // ANALYTICS
          </p>

          <h2 className="mx-auto max-w-[380px] text-[20px] font-bold leading-[1.4] text-[#F1F5F9]">
            Your engineering performance data
            <br />
            is being instrumented.
          </h2>

          <p className="mt-3 text-[13px] text-[#94A3B8]">
            Full analytics unlock after your first completed simulation.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {LOCKED_METRICS.map((label) => (
              <article
                key={label}
                className="w-[160px] rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E] p-5 text-center"
              >
                <p className="text-[28px] font-bold text-[#4B5563]" style={MONO_STYLE}>
                  ??
                </p>
                <p className="mt-2 text-[11px] uppercase text-[#4B5563]" style={MONO_STYLE}>
                  {label}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-[11px] italic text-[#4B5563]" style={MONO_STYLE}>
            // v2 feature - active development
          </p>
        </section>
      </main>
    </UserPageLayout>
  );
}

import { useState } from 'react';
import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';

const MONO_STYLE = { fontFamily: "'JetBrains Mono', monospace" };
const WAITLIST_KEY = 'signal_waitlist_email';

const DESCRIPTORS = [
  '// Pattern recognition across all your simulations',
  '// Blind spot detection in your decision-making',
  '// Personalized skill gap analysis',
];

export default function UserAIInsightsPage() {
  const initialEmail = localStorage.getItem(WAITLIST_KEY) || '';
  const [email, setEmail] = useState(initialEmail);
  const [isRegistered, setIsRegistered] = useState(Boolean(initialEmail));

  const handleJoinWaitlist = () => {
    const sanitizedEmail = email.trim();
    if (!sanitizedEmail) {
      return;
    }

    // TODO: wire to waitlist API endpoint.
    localStorage.setItem(WAITLIST_KEY, sanitizedEmail);
    setIsRegistered(true);
  };

  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="AI Insights" showSignalCard={false} showUserFooter />}
      topbar={<UserTopbar title="AI Insights" searchPlaceholder="Global search..." />}
    >
      <main className="flex min-h-full items-center justify-center bg-[#040914] px-4 py-6">
        <section className="w-full max-w-[480px] text-center">
          <p className="mb-5 text-[11px] uppercase tracking-[0.1em] text-[#06B6D4]" style={MONO_STYLE}>
            // AI_INSIGHTS
          </p>

          <h2 className="text-[22px] font-bold leading-[1.4] text-[#F1F5F9]">
            Signal is building an AI layer that thinks
            <br />
            like your best senior engineer.
          </h2>

          <div className="mx-auto mt-4 inline-block text-left">
            {DESCRIPTORS.map((line, index) => (
              <p
                key={line}
                className={`text-[12px] text-[#4B5563] ${index > 0 ? 'mt-1.5' : ''}`}
                style={MONO_STYLE}
              >
                {line}
              </p>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            {isRegistered ? (
              <p className="text-[12px] text-[#10B981]" style={MONO_STYLE}>
                // Registered. We'll be in touch.
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="your@email.com"
                  className="w-[260px] rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E] px-4 py-2.5 text-[12px] text-[#F1F5F9] placeholder:text-[#4B5563] focus:border-[#06B6D4] focus:outline-none"
                  style={MONO_STYLE}
                />
                <button
                  type="button"
                  onClick={handleJoinWaitlist}
                  className="whitespace-nowrap rounded-[8px] bg-[#06B6D4] px-4 py-2.5 text-[11px] font-bold uppercase text-[#040914] transition hover:shadow-[0_0_16px_#06B6D440]"
                  style={MONO_STYLE}
                >
                  JOIN EARLY ACCESS
                </button>
              </div>
            )}
          </div>

          <p className="mt-10 text-[11px] text-[#4B5563]" style={MONO_STYLE}>
            // Expected in Signal v2
          </p>
        </section>
      </main>
    </UserPageLayout>
  );
}

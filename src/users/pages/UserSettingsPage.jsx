import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from '../components/layout/UserSidebar';
import UserTopbar from '../components/layout/UserTopbar';
import UserPageLayout from '../components/layout/UserPageLayout';

const MONO_STYLE = { fontFamily: "'JetBrains Mono', monospace" };

const parseStoredUser = () => {
  try {
    const rawUser = localStorage.getItem('user');
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
};

const getDisplayName = (user) => {
  const firstName = user?.first_name || user?.firstName || '';
  const lastName = user?.last_name || user?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();

  if (fullName) {
    return fullName;
  }

  if (user?.name) {
    return user.name;
  }

  // TODO: replace fallback with user profile context when guaranteed by auth bootstrap.
  return 'Alex Rivera';
};

const getSignalScore = (user) => {
  const score =
    user?.signal_score ||
    user?.signalScore ||
    user?.profile?.signal_score ||
    user?.profile?.signalScore;

  if (typeof score === 'number') {
    return score;
  }

  // TODO: replace fallback with score from authenticated user state.
  return 892;
};

const getInitials = (name) => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return 'AR';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export default function UserSettingsPage() {
  const navigate = useNavigate();
  const storedUser = useMemo(() => parseStoredUser(), []);
  const name = getDisplayName(storedUser);
  const score = getSignalScore(storedUser);
  const initials = getInitials(name);

  const handleSignOut = () => {
    // TODO: align sign-out clearing with centralized auth store once available.
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('org');
    navigate('/login');
  };

  return (
    <UserPageLayout
      sidebar={<UserSidebar activeItem="Settings" showSignalCard={false} showUserFooter />}
      topbar={<UserTopbar title="Settings" searchPlaceholder="Global search..." />}
    >
      <main className="min-h-full bg-[#040914] p-5">
        <p className="text-[11px] text-[#4B5563]" style={MONO_STYLE}>
          // Account and preferences
        </p>

        <section className="mt-6 w-full max-w-[480px] rounded-[8px] border border-[#0F1A2E] bg-[#0A0F1E] p-6">
          <p className="text-[11px] uppercase text-[#4B5563]" style={MONO_STYLE}>
            // PROFILE
          </p>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#06B6D4] bg-[#0A0F1E] text-[16px] font-bold text-[#06B6D4]" style={MONO_STYLE}>
              {initials}
            </div>
            <div>
              <p className="text-[16px] font-semibold text-[#F1F5F9]">{name}</p>
              <p className="mt-0.5 text-[12px] text-[#06B6D4]" style={MONO_STYLE}>
                SIGNAL: {score}
              </p>
            </div>
          </div>

          <div className="my-5 border-t border-[#0F1A2E]" />

          <p className="text-[11px] uppercase text-[#4B5563]" style={MONO_STYLE}>
            // PREFERENCES
          </p>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-[14px] text-[#F1F5F9]">Theme</p>
            <p className="text-[12px] text-[#4B5563]" style={MONO_STYLE}>
              Dark - Signal OS
            </p>
          </div>

          <div className="my-5 border-t border-[#0F1A2E]" />

          <p className="text-[11px] uppercase text-[#EF4444]" style={MONO_STYLE}>
            // DANGER ZONE
          </p>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-4 rounded-[8px] border border-[#3D1212] bg-transparent px-4 py-2 text-[11px] uppercase text-[#EF4444]"
            style={MONO_STYLE}
          >
            Sign out
          </button>
        </section>
      </main>
    </UserPageLayout>
  );
}

import {
  BarChart3,
  Bot,
  Compass,
  Gauge,
  LayoutDashboard,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
  { label: 'Simulations', icon: Compass, path: '/user/simulations' },
  { label: 'My Sessions', icon: Gauge },
  { label: 'Analytics', icon: BarChart3 },
  { label: 'AI Insights', icon: Bot },
  { label: 'Skill Roadmap', icon: Sparkles },
];

export default function UserSidebar({
  signalScore,
  activeItem = 'Dashboard',
  showSignalCard = true,
  showUserFooter = false,
}) {
  const navigate = useNavigate();
  const clampedSignalScore = Math.max(0, Math.min(100, signalScore || 0));

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-[174px] flex-col overflow-hidden border-r border-[#121f38] bg-[#040914] md:flex">
      <div className="flex h-[58px] items-center border-b border-[#101d35] px-4">
        <Zap className="mr-2 h-3.5 w-3.5 text-[#18d3ff]" />
        <span className="text-sm font-semibold tracking-[0.08em] text-[#eaf3ff]">SIGNAL</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.path && navigate(item.path)}
              className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[13px] transition ${
                item.label === activeItem
                  ? 'bg-[#101c32] text-[#dfeaff]'
                  : 'text-[#7f8fb0] hover:bg-[#0c1629] hover:text-[#c9d8f6]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {showSignalCard && (
        <div className="px-3 pb-3">
          <div className="rounded border border-[#101d35] bg-[#060b17] p-2.5">
            <p className="text-[10px] tracking-[0.18em] text-[#6c7da0]">SIGNAL SCORE</p>
            <progress
              value={clampedSignalScore}
              max="100"
              className="mt-1 h-1.5 w-full overflow-hidden rounded bg-[#0f1a2f] align-middle [&::-moz-progress-bar]:bg-[#18d3ff] [&::-webkit-progress-bar]:bg-[#0f1a2f] [&::-webkit-progress-value]:bg-[#18d3ff]"
            />
            <p className="mt-1 text-right text-[11px] text-[#18d3ff]">{clampedSignalScore}/100</p>
          </div>
        </div>
      )}

      {showUserFooter && (
        <div className="border-t border-[#101d35] px-3 pb-3 pt-2">
          <button
            type="button"
            className="mb-2 flex w-full items-center gap-2 rounded px-2 py-2 text-left text-[13px] text-[#7f8fb0] transition hover:bg-[#0c1629] hover:text-[#c9d8f6]"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>

          <div className="flex items-center gap-2 rounded border border-[#101d35] bg-[#060b17] p-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1d6bf] text-[10px] font-semibold text-[#7d5c42]">
              A
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#d9e7ff]">Alex Rivera</p>
              <p className="text-[10px] font-semibold tracking-[0.08em] text-[#16d2ff]">SIGNAL: 892</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

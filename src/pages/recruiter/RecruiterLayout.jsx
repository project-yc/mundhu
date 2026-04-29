// RecruiterLayout — persistent sidebar shell for all recruiter screens
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Zap, LayoutDashboard, ClipboardList, Users, FileText,
  UserPlus, Settings, LogOut, ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react';

const NAV = [
  { to: '/recruiter/dashboard',  icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/recruiter/assessments', icon: ClipboardList,   label: 'Assessments' },
  { to: '/recruiter/candidates',  icon: Users,           label: 'Candidates'  },
  { to: '/recruiter/reports',     icon: FileText,        label: 'Reports'     },
  { to: '/recruiter/invite',      icon: UserPlus,        label: 'Invite'      },
];

export default function RecruiterLayout({ children }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();
  const org  = (() => { try { return JSON.parse(localStorage.getItem('org')  || '{}'); } catch { return {}; } })();

  const orgName  = org?.name || 'Organization';
  const userName = user?.full_name || user?.name || user?.email || 'Recruiter';
  const initials = userName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = () => {
    ['authToken', 'refreshToken', 'user', 'userRole', 'org'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-[#27272A] flex-shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-[#06B6D4] flex items-center justify-center flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-[#0C0C0E]" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold tracking-[0.08em] text-[#FAFAFA] font-display leading-none">MUNDHU</p>
            <p className="text-[10px] text-[#52525B] truncate mt-0.5">{orgName}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-[#083344] text-[#06B6D4] border border-[#0E7490]/60'
                  : 'text-[#52525B] hover:text-[#A1A1AA] hover:bg-[#111113]'
              } ${collapsed ? 'justify-center px-0 w-10 mx-auto' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 border-t border-[#27272A] space-y-0.5 flex-shrink-0">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[13px] font-semibold text-[#52525B] hover:text-[#F43F5E] hover:bg-[#1C0813] transition-all duration-150 ${collapsed ? 'justify-center px-0 w-10 mx-auto' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User chip */}
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl bg-[#111113] border border-[#27272A]">
            <div className="w-6 h-6 rounded-full bg-[#17171A] border border-[#27272A] flex items-center justify-center text-[10px] font-bold text-[#A1A1AA] flex-shrink-0 font-display">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-semibold text-[#E4E4E7] truncate leading-none">{userName}</p>
              <p className="text-[10px] text-[#52525B] truncate mt-0.5">Recruiter</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0C0C0E] font-sans antialiased overflow-hidden">

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-[#0C0C0E] border-r border-[#27272A] flex-shrink-0 transition-all duration-200 ${collapsed ? 'w-[52px]' : 'w-[220px]'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute bottom-[112px] -right-3 z-10 w-6 h-6 rounded-full bg-[#111113] border border-[#27272A] flex items-center justify-center text-[#52525B] hover:text-[#E4E4E7] hover:border-[#3F3F46] transition-all duration-150"
          style={{ left: collapsed ? 40 : 208 }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[220px] bg-[#0C0C0E] border-r border-[#27272A] z-10">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-3 p-1.5 text-[#52525B] hover:text-[#E4E4E7]">
              <X className="w-4 h-4" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 h-12 px-4 border-b border-[#27272A] flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 text-[#52525B] hover:text-[#E4E4E7]">
            <Menu className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#06B6D4] flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-[#0C0C0E]" strokeWidth={2.5} />
            </div>
            <span className="text-[12px] font-bold tracking-[0.08em] text-[#FAFAFA] font-display">MUNDHU</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Users, Plus, X, ChevronDown } from 'lucide-react';

const ROLES = ['ADMIN', 'REVIEWER', 'OBSERVER'];

const ROLE_LABELS = { ADMIN: 'Admin', REVIEWER: 'Reviewer', OBSERVER: 'Observer' };

const ROLE_DESCRIPTIONS = {
  ADMIN:    'Full access to manage environments, billing, and team settings.',
  REVIEWER: 'Can comment on assessments, approve results, and view analytics.',
  OBSERVER: 'Read-only access to dashboards, logs, and project status.',
};

const ROLE_COLORS = {
  ADMIN:    'bg-[#CFFAFE] text-[#0E7490]',
  REVIEWER: 'bg-[#F1F5F9] text-[#64748B]',
  OBSERVER: 'bg-[#F1F5F9] text-[#64748B]',
};

export default function Step3InviteTeam({ data, onChange }) {
  const [email, setEmail]   = useState('');
  const [role, setRole]     = useState('REVIEWER');
  const [emailErr, setEmailErr] = useState('');

  const addInvite = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailErr('Enter a valid email address');
      return;
    }
    if (data.invites.some(i => i.email === trimmed)) {
      setEmailErr('Already added');
      return;
    }
    onChange({ ...data, invites: [...data.invites, { email: trimmed, role }] });
    setEmail('');
    setEmailErr('');
  };

  const removeInvite = (idx) => {
    onChange({ ...data, invites: data.invites.filter((_, i) => i !== idx) });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addInvite(); }
  };

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white border border-[#E2E8F0] rounded-[14px] shadow-[0_1px_3px_0_rgba(15,40,84,0.04),0_1px_2px_-1px_rgba(15,40,84,0.06)] overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#E2E8F0]">
          <div className="w-10 h-10 rounded-xl bg-[#CFFAFE] flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-[#0E7490]" />
          </div>
          <h1 className="text-[20px] font-bold text-[#0F172A] tracking-tight">
            Invite your team
          </h1>
          <p className="text-[14px] text-[#64748B] mt-1.5">
            Invites are sent immediately after you launch.
          </p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-6">

          {/* Email + Role + Add */}
          <div>
            <div className="flex items-start gap-2">
              {/* Email input */}
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0F172A] mb-1.5">
                  <span className="w-0.5 h-3.5 rounded-full bg-[#22D3EE] inline-block" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                  onKeyDown={handleKey}
                  className={`w-full h-10 px-3.5 bg-[#F1F5F9] border rounded-[8px] text-[14px] text-[#0F172A] placeholder-[#94A3B8] outline-none focus:bg-white transition-colors ${
                    emailErr ? 'border-[#FCA5A5] focus:border-[#EF4444]' : 'border-[#E2E8F0] focus:border-[#22D3EE]'
                  }`}
                />
                {emailErr && <p className="text-[12px] text-[#DC2626] mt-1">{emailErr}</p>}
              </div>

              {/* Role picker */}
              <div className="w-32">
                <label className="block text-[13px] font-semibold text-[#0F172A] mb-1.5">Role</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full h-10 px-3 pr-8 bg-[#F1F5F9] border border-[#E2E8F0] rounded-[8px] text-[13px] text-[#0F172A] outline-none focus:border-[#22D3EE] appearance-none cursor-pointer"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
                </div>
              </div>

              {/* Add button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={addInvite}
                  className="h-10 px-4 bg-white border border-[#E2E8F0] rounded-[8px] text-[13px] font-semibold text-[#0E7490] hover:bg-[#E0F9FC] hover:border-[#22D3EE] transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Invited chips */}
          {data.invites.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.invites.map((inv, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full pl-3 pr-2 py-1"
                >
                  <span className="text-[12px] text-[#0F172A]">{inv.email}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${ROLE_COLORS[inv.role]}`}>
                    {ROLE_LABELS[inv.role]}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeInvite(idx)}
                    className="w-4 h-4 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Role description table */}
          <div className="border border-[#E2E8F0] rounded-[10px] overflow-hidden">
            {ROLES.map((r, idx) => (
              <div
                key={r}
                className={`flex items-start gap-4 px-4 py-3.5 ${idx < ROLES.length - 1 ? 'border-b border-[#E2E8F0]' : ''}`}
              >
                <div className="w-20 flex-shrink-0 text-[13px] font-semibold text-[#0F172A] pt-0.5">
                  {ROLE_LABELS[r]}
                </div>
                <div className="text-[13px] text-[#64748B] leading-relaxed">
                  {ROLE_DESCRIPTIONS[r]}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

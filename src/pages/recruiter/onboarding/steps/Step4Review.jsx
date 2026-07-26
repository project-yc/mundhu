import { useMemo } from 'react';
import { Mail, Server, Users, ShieldCheck } from 'lucide-react';
import { Separator } from '../../../../components/ui/separator';

const NEXT_STEPS = [
  { Icon: Mail,   title: 'Verification email', desc: "We'll send a confirmation link to your registered email." },
  { Icon: Server, title: 'Provisioning',        desc: 'Your dedicated workspace will be set up within 5 minutes.' },
  { Icon: Users,  title: 'Invite your team',    desc: 'You can start inviting team members immediately after launch.' },
];

export default function Step4Review({ data, loading, error }) {
  const org = (() => { try { return JSON.parse(localStorage.getItem('org') || '{}'); } catch { return {}; } })();
  const orgSlug = (data.step1.company_name || org.name || 'your-workspace')
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const summary = useMemo(() => ([
    { label: 'Company name',  value: data.step1.company_name || org.name || '—' },
    { label: 'Brand color',   value: data.step2.brand_color, accent: true },
    { label: 'Team size',     value: data.step1.company_size || '—' },
    { label: 'Workspace URL', value: `${orgSlug}.trudev.io`, brand: true },
  ]), [data, org, orgSlug]);

  return (
    <div className="w-full">
      <style>{`
        @keyframes wr-glow-pulse { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.08); } }
        @keyframes wr-ring-draw  { to { stroke-dashoffset: 0; } }
        @keyframes wr-check-draw { to { stroke-dashoffset: 0; } }
      `}</style>

      {/* Hero motif */}
      <div className="relative w-[96px] h-[96px] mx-auto mb-8">
        <div
          className="absolute inset-0 rounded-full blur-2xl"
          style={{ backgroundColor: '#FB7414', animation: 'wr-glow-pulse 3s ease-in-out infinite' }}
        />
        <svg viewBox="0 0 100 100" className="relative w-full h-full">
          <circle cx="50" cy="50" r="45" fill="white" stroke="#FFEDE0" strokeWidth="4" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke="#FB7414" strokeWidth="4" strokeLinecap="round"
            strokeDasharray="283" strokeDashoffset="283" transform="rotate(-90 50 50)"
            style={{ animation: 'wr-ring-draw 1s cubic-bezier(0.65,0,0.35,1) forwards' }}
          />
          <path
            d="M32 51 L45 64 L70 34" fill="none" stroke="#FB7414" strokeWidth="5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="58" strokeDashoffset="58"
            style={{ animation: 'wr-check-draw 0.45s ease-out 0.85s forwards' }}
          />
        </svg>
      </div>

      <h1 className="text-[28px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight text-center">
        Welcome to Trudev
      </h1>
      <p className="text-[15px] text-[#475569] mt-2.5 mb-10 leading-relaxed text-center">
        Your workspace is fully configured and ready to go live.
      </p>

      {/* Summary */}
      <div className="space-y-4">
        {summary.map((row, idx) => (
          <div key={row.label}>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[#64748B]">{row.label}</span>
              {row.accent ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-[#E2E8F0]" style={{ backgroundColor: row.value }} />
                  <span className="text-[13px] font-semibold text-[#0F172A] font-mono">{row.value}</span>
                </span>
              ) : (
                <span className={`text-[13px] font-semibold ${row.brand ? 'text-[#FB7414]' : 'text-[#0F172A]'}`}>
                  {row.value}
                </span>
              )}
            </div>
            {idx < summary.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </div>

      <Separator className="my-8" />

      {/* Timeline */}
      <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-[0.1em] mb-5">What happens next</p>
      <div className="relative">
        {NEXT_STEPS.map(({ Icon, title, desc }, idx) => (
          <div key={title} className="relative flex gap-4 pb-7 last:pb-0">
            {idx < NEXT_STEPS.length - 1 && (
              <span className="absolute left-[15px] top-8 w-px h-[calc(100%-14px)] bg-[#E2E8F0]" />
            )}
            <div className="relative z-10 w-8 h-8 rounded-full bg-[#FFEDE0] border border-[#FDE3CC] flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-[#FB7414]" />
            </div>
            <div className="pt-1">
              <p className="text-[13.5px] font-semibold text-[#0F172A]">{title}</p>
              <p className="text-[13px] text-[#64748B] mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {data.step3.invites.length > 0 && (
        <>
          <Separator className="my-2" />
          <div className="pt-5">
            <p className="text-[13px] font-semibold text-[#0F172A] mb-2.5">
              Pending invites ({data.step3.invites.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.step3.invites.map((inv, i) => (
                <span key={i} className="text-[12px] bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-3 py-1 text-[#64748B]">
                  {inv.email}
                </span>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="mt-6 px-4 py-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[10px] text-[13px] text-[#DC2626]">
          {error}
        </div>
      )}

      <p className="flex items-center justify-center gap-1.5 text-[12.5px] text-[#94A3B8] mt-9 text-center">
        <ShieldCheck className="w-3.5 h-3.5" />
        Your data is encrypted and your workspace is private by default.
      </p>
    </div>
  );
}
import { CheckCircle2, Mail, Server, Users } from 'lucide-react';

function ReviewTile({ label, value, accent }) {
  return (
    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-5 py-4">
      <p className="text-[10px] font-semibold tracking-[1.3px] uppercase text-[#94A3B8] mb-1.5">{label}</p>
      {accent ? (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full border border-[#E2E8F0]" style={{ backgroundColor: value }} />
          <span className="text-[14px] font-semibold text-[#0F172A] font-mono">{value}</span>
        </div>
      ) : (
        <p className="text-[15px] font-semibold text-[#0F172A] leading-snug">{value || '—'}</p>
      )}
    </div>
  );
}

const NEXT_STEPS = [
  {
    Icon: Mail,
    title: 'Verification Email',
    desc: "We'll send a confirmation link to your registered email.",
  },
  {
    Icon: Server,
    title: 'Provisioning',
    desc: 'Your dedicated workspace will be set up within 5 minutes.',
  },
  {
    Icon: Users,
    title: 'Invite Team',
    desc: 'You can start inviting team members immediately after launch.',
  },
];

export default function Step4Review({ data, loading, error }) {
  const org    = (() => { try { return JSON.parse(localStorage.getItem('org') || '{}'); } catch { return {}; } })();
  const user   = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  const orgSlug = (data.step1.company_name || org.name || 'your-workspace')
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="w-full max-w-lg">
      <div className="bg-white border border-[#E2E8F0] rounded-[14px] shadow-[0_1px_3px_0_rgba(15,40,84,0.04),0_1px_2px_-1px_rgba(15,40,84,0.06)] overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#E2E8F0] text-center">
          <div className="w-14 h-14 rounded-full bg-[#CFFAFE] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-[#0E7490]" strokeWidth={2} />
          </div>
          <h1 className="text-[22px] font-bold text-[#0F172A] tracking-tight">You're ready</h1>
          <p className="text-[14px] text-[#64748B] mt-1.5">
            Review your configuration before launching your workspace.
          </p>
        </div>

        {/* Config grid */}
        <div className="px-8 pt-6 pb-4 grid grid-cols-2 gap-3">
          <ReviewTile label="Company Name"  value={data.step1.company_name || org.name} />
          <ReviewTile label="Brand Color"   value={data.step2.brand_color}  accent />
          <ReviewTile label="Team Size"     value={data.step1.company_size} />
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-5 py-4">
            <p className="text-[10px] font-semibold tracking-[1.3px] uppercase text-[#94A3B8] mb-1.5">
              Workspace URL
            </p>
            <p className="text-[13px] font-semibold text-[#22D3EE] truncate">
              {orgSlug}.trudev.io
            </p>
          </div>
        </div>

        {/* What happens next */}
        <div className="px-8 pb-6">
          <p className="text-[13px] font-semibold text-[#0F172A] mb-3">What happens next</p>
          <div className="space-y-2.5">
            {NEXT_STEPS.map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-4 py-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-[#64748B]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#0F172A]">{title}</p>
                  <p className="text-[12px] text-[#64748B] mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invites summary */}
        {data.step3.invites.length > 0 && (
          <div className="px-8 pb-6">
            <p className="text-[13px] font-semibold text-[#0F172A] mb-2">
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
        )}

        {/* Error */}
        {error && (
          <div className="mx-8 mb-4 px-4 py-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-[8px] text-[13px] text-[#DC2626]">
            {error}
          </div>
        )}

        {/* Divider + footer note */}
        <div className="px-8 pb-6 border-t border-[#E2E8F0] pt-4 text-center">
          <p className="text-[11px] text-[#94A3B8]">
            By launching, you agree to our{' '}
            <a href="#" className="text-[#64748B] underline">Terms of Service</a> and{' '}
            <a href="#" className="text-[#64748B] underline">Privacy Policy</a>
          </p>
        </div>

      </div>
    </div>
  );
}

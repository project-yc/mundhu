import { useState } from 'react';
import { Users, Plus, X } from 'lucide-react';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Separator } from '../../../../components/ui/separator';

const ROLES = ['RECRUITER', 'REVIEWER', 'OBSERVER'];
const ROLE_LABELS = { RECRUITER: 'Recruiter', REVIEWER: 'Reviewer', OBSERVER: 'Observer' };
const ROLE_DESCRIPTIONS = {
  RECRUITER: 'Can create and manage assessments, invite candidates, and view results.',
  REVIEWER:  'Can comment on assessments, approve results, and view analytics.',
  OBSERVER:  'Read-only access to dashboards, logs, and project status.',
};

export default function Step3InviteTeam({ data, onChange }) {
  const [email, setEmail] = useState('');
  const [role, setRole]   = useState('RECRUITER');
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

  const removeInvite = (idx) => onChange({ ...data, invites: data.invites.filter((_, i) => i !== idx) });
  const handleKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); addInvite(); } };

  return (
    <div className="w-full">
      <div className="w-12 h-12 rounded-xl bg-[#FFEDE0] flex items-center justify-center mb-6">
        <Users className="w-[22px] h-[22px] text-[#FB7414]" />
      </div>

      <h1 className="text-[28px] font-bold text-[#0F172A] tracking-[-0.02em] leading-tight">
        Bring your team in
      </h1>
      <p className="text-[15px] text-[#475569] mt-2.5 mb-9 leading-relaxed">
        Invite the people who'll manage hiring with you — you can always add more later.
      </p>

      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-2">
          <Label className="text-[13px] font-semibold text-[#334155]">Email address</Label>
          <Input
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
            onKeyDown={handleKey}
            className={`h-11 rounded-[10px] ${emailErr ? 'border-[#FCA5A5] focus-visible:ring-[#EF4444]/20' : 'border-[#E2E8F0] focus-visible:ring-[#FB7414]/25 focus-visible:border-[#FB7414]'}`}
          />
        </div>

        <div className="w-32 space-y-2">
          <Label className="text-[13px] font-semibold text-[#334155]">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="h-11 rounded-[10px] border-[#E2E8F0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map(r => <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={addInvite}
          className="h-11 rounded-[10px] gap-1.5 text-[13px] font-semibold text-[#FB7414] border-[#E2E8F0] hover:bg-[#FFF3EA] hover:border-[#FB7414]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>
      {emailErr && <p className="text-[12px] text-[#DC2626] mt-1.5">{emailErr}</p>}

      {data.invites.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {data.invites.map((inv, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="pl-3 pr-2 py-1.5 rounded-full bg-white border border-[#E2E8F0] font-normal gap-2 hover:bg-white"
            >
              <span className="text-[12px] text-[#0F172A]">{inv.email}</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#C2560B]">{ROLE_LABELS[inv.role]}</span>
              <button
                type="button"
                onClick={() => removeInvite(idx)}
                className="w-4 h-4 rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#64748B] hover:bg-[#E2E8F0]"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Separator className="mt-9" />

      <div>
        {ROLES.map((r, idx) => (
          <div key={r}>
            <div className="flex items-start gap-4 py-4">
              <div className="w-24 flex-shrink-0 text-[13px] font-semibold text-[#0F172A] pt-0.5">
                {ROLE_LABELS[r]}
              </div>
              <div className="text-[13px] text-[#64748B] leading-relaxed">
                {ROLE_DESCRIPTIONS[r]}
              </div>
            </div>
            {idx < ROLES.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
}
// TeamInviteScreen — invite teammates into the org with a role (RECRUITER / REVIEWER / OBSERVER).
// New page mapped to /recruiter/invite; the original per-assessment candidate
// invite flow (pages/recruiter/invite/index.jsx) still lives at
// /recruiter/invite/candidates and is untouched.
import { useState } from 'react';
import { AlertCircle, Briefcase, CheckCircle2, Eye, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import { AskAnythingBar } from '../../../components/recruiter/AskAnythingBar.jsx';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Badge } from '../../../components/ui/badge';
import { sendInvites } from '../../../api/recruiter/onboarding';

// Mirrors ROLE_PERMISSIONS in venaka/core/accounts/constants.py — ORG_ADMIN is
// deliberately excluded (server rejects a non-admin inviting another admin).
const ROLES = [
  {
    value: 'RECRUITER',
    label: 'Recruiter',
    icon: Briefcase,
    description: 'Can create and manage assessments, invite candidates and teammates, and view analytics.',
  },
  {
    value: 'REVIEWER',
    label: 'Reviewer',
    icon: ShieldCheck,
    description: 'Can view candidates, reports, and analytics. Cannot create assessments or invite others.',
  },
  {
    value: 'OBSERVER',
    label: 'Observer',
    icon: Eye,
    description: 'Read-only access to dashboards and reports. Cannot create assessments or invite others.',
  },
];
const ROLE_BY_VALUE = Object.fromEntries(ROLES.map(r => [r.value, r]));
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PendingInviteRow({ invite, onRemove }) {
  const role = ROLE_BY_VALUE[invite.role];
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-border-subtle px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium text-text-primary">{invite.email}</p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
          {role.label}
        </Badge>
        <button
          type="button"
          onClick={() => onRemove(invite.email)}
          className="text-text-secondary hover:text-error"
          aria-label={`Remove ${invite.email}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const RESULT_LABEL = { invited: 'Invited', skipped: 'Already a member', error: 'Failed' };
const RESULT_VARIANT = { invited: 'success', skipped: 'secondary', error: 'error' };

function SendResults({ results, onReset }) {
  const invitedCount = results.filter(r => r.status === 'invited').length;
  return (
    <div className="rounded-[10px] border border-success-border bg-success-bg p-5">
      <div className="mb-3 flex items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
        <div>
          <h2 className="text-[16px] font-semibold text-text-primary">Invites sent</h2>
          <p className="text-[13px] text-text-secondary">
            {invitedCount} of {results.length} teammate{results.length === 1 ? '' : 's'} invited.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {results.map(r => (
          <div key={r.email} className="flex items-center justify-between rounded-[8px] border border-border-subtle bg-surface px-3 py-2">
            <p className="truncate text-[13px] font-medium text-text-primary">{r.email}</p>
            <Badge variant={RESULT_VARIANT[r.status] || 'secondary'} className="text-[11px]">
              {RESULT_LABEL[r.status] || r.status}
            </Badge>
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={onReset} className="mt-4 h-10 rounded-[8px] px-4 text-[13px] font-medium">
        Invite more teammates
      </Button>
    </div>
  );
}

export default function TeamInviteScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('RECRUITER');
  const [emailError, setEmailError] = useState('');
  const [invites, setInvites] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const addInvite = () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    if (!EMAIL_RE.test(trimmed)) { setEmailError('Enter a valid email address.'); return; }
    if (invites.some(i => i.email === trimmed)) { setEmailError('Already added.'); return; }
    setInvites(list => [...list, { email: trimmed, role }]);
    setEmail('');
    setEmailError('');
  };

  const removeInvite = (targetEmail) => setInvites(list => list.filter(i => i.email !== targetEmail));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addInvite(); }
  };

  const handleSend = async () => {
    if (invites.length === 0) return;
    setSending(true);
    setError('');
    try {
      const res = await sendInvites(invites.map(i => ({ email: i.email, role: i.role })));
      const data = res.data || res;
      setResults(Array.isArray(data.results) && data.results.length > 0
        ? data.results
        : invites.map(i => ({ email: i.email, status: 'invited' })));
      setInvites([]);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to send invites.');
    } finally {
      setSending(false);
    }
  };

  const reset = () => { setResults(null); setError(''); };

  return (
    <div className="flex min-h-full flex-col bg-page">
      <AskAnythingBar />

      <div className="min-h-0 flex-1 p-3 pt-0">
        <section className="min-h-[calc(100vh-76px)] rounded-[10px] border border-border-subtle bg-surface px-[39px] pb-[24px] pt-[42px]">
          <div className="mx-auto max-w-[760px]">
            <div className="mb-[26px]">
              <h1 className="text-[20px] font-semibold text-text-primary">Invite your team</h1>
              <p className="mt-[5px] text-[14px] text-text-secondary">
                Bring recruiters, reviewers, and observers into your organization. Each teammate gets an email invite with a secure sign-up link.
              </p>
            </div>

            {error && (
              <div role="alert" className="mb-5 flex items-center gap-3 rounded-[8px] border border-error-border bg-error-bg px-4 py-3">
                <AlertCircle className="h-4 w-4 flex-shrink-0 text-error" />
                <p className="text-[13px] text-error">{error}</p>
              </div>
            )}

            {results ? (
              <SendResults results={results} onReset={reset} />
            ) : (
              <>
                <div className="rounded-[10px] border border-border-subtle bg-white p-4">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label htmlFor="teammate-email" className="mb-2 block text-[13px] font-medium text-text-primary">
                        Email address
                      </label>
                      <Input
                        id="teammate-email"
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                        onKeyDown={handleKeyDown}
                        placeholder="teammate@company.com"
                        className={`h-10 rounded-[8px] text-[14px] ${emailError ? 'border-error-border' : ''}`}
                      />
                    </div>

                    <div className="w-[180px]">
                      <label className="mb-2 block text-[13px] font-medium text-text-primary">Role</label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="h-10 rounded-[8px] text-[14px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button type="button" onClick={addInvite} className="h-10 rounded-[8px] px-4 text-[13px] font-medium">
                      <UserPlus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                  {emailError && <p className="mt-1.5 text-[12px] text-error">{emailError}</p>}
                </div>

                {invites.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {invites.map(inv => (
                      <PendingInviteRow key={inv.email} invite={inv} onRemove={removeInvite} />
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-[12px] text-text-secondary">
                    {invites.length} teammate{invites.length === 1 ? '' : 's'} ready to invite
                  </p>
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={invites.length === 0 || sending}
                    className="h-10 rounded-[8px] px-4 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? 'Sending...' : 'Send invites'}
                  </Button>
                </div>

                <div className="mt-8 rounded-[10px] border border-border-subtle">
                  {ROLES.map((r, idx) => (
                    <div
                      key={r.value}
                      className={`flex items-start gap-3 px-4 py-4 ${idx < ROLES.length - 1 ? 'border-b border-border-subtle' : ''}`}
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[8px] bg-surface-muted text-text-secondary">
                        <r.icon className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-text-primary">{r.label}</p>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{r.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

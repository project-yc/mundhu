import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../../auth/authContext';
import AuthShell, { buttonClass, fieldClass } from './AuthShell';

/**
 * Landing page for org invite emails.
 *
 * The backend minted `/accept-invite?token=…` links and emailed them, but no
 * such route existed and no endpoint consumed the token — invited teammates
 * were created inactive and could never sign in. See audit H4.
 */
export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const token = searchParams.get('token');

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthShell
        title="Invitation not valid"
        subtitle="This link is missing its token. Ask your admin to resend the invite."
        footer={<Link to="/login" className="underline">Back to sign in</Link>}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Use at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Those passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/v1/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, name: name.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = Array.isArray(data.password)
          ? data.password.join(' ')
          : data.detail || 'Could not accept this invitation.';
        throw new Error(detail);
      }
      // The API signs them in as part of accepting, so go straight in.
      login(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Join your team"
      subtitle="Set a password to finish setting up your account."
      error={error}
      footer={<Link to="/login" className="underline">Already have an account?</Link>}
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          autoComplete="name"
          className={fieldClass}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="new-password"
          className={fieldClass}
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm password"
          autoComplete="new-password"
          className={fieldClass}
        />
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? 'Setting up…' : 'Accept invitation'}
        </button>
      </form>
    </AuthShell>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import AuthShell, { buttonClass, fieldClass } from './AuthShell';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthShell
        title="Link not valid"
        subtitle="This reset link is missing its token. Request a new one."
        footer={<Link to="/forgot-password" className="underline">Request a new link</Link>}
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
      const res = await fetch('/api/auth/v1/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // The server runs Django's password validators, so surface its list
        // rather than a generic message — it says exactly what is wrong.
        const detail = Array.isArray(data.password)
          ? data.password.join(' ')
          : data.detail || 'Could not reset your password.';
        throw new Error(detail);
      }
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick something you haven't used before."
      error={error}
      footer={<Link to="/login" className="underline">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          className={fieldClass}
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          className={fieldClass}
        />
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </AuthShell>
  );
}

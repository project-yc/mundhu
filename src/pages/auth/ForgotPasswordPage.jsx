import { useState } from 'react';
import { Link } from 'react-router-dom';

import AuthShell, { buttonClass, fieldClass } from './AuthShell';

/**
 * `/forgot-password` was linked from the login page but had no route, so the
 * link fell through the catch-all back to /login. See audit L7.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter the email address for your account.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/v1/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) throw new Error('Something went wrong. Try again.');
      // The API answers identically whether or not the address exists, so the
      // UI must not imply anything either.
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        subtitle={`If ${email.trim()} has an account, a reset link is on its way. It expires in an hour.`}
        footer={<Link to="/login" className="underline">Back to sign in</Link>}
      />
    );
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a link to choose a new one."
      error={error}
      footer={<Link to="/login" className="underline">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          className={fieldClass}
        />
        <button type="submit" disabled={loading} className={buttonClass}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  );
}

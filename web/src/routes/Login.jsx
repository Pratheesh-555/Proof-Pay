import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Login() {
  const { user, login, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to={location.state?.from ?? '/'} replace />;

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(email, password); }
    catch (e) { setError(e.message || 'Sign in failed. Check your email and password.'); }
    finally { setBusy(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-canvas px-5 py-12">
    <section className="page-enter w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-panel sm:p-10">
      <div className="brand-mark mb-6">P</div>
      <p className="eyebrow">FREELANCER WORKSPACE</p>
      <h1 className="page-title mt-2">Welcome back</h1>
      <p className="mt-2 text-sm leading-6 text-muted">Sign in to manage approvals, PayPal invoices, and dispute evidence.</p>
      <form className="mt-8 space-y-4" onSubmit={submit}>
        <label className="field-label">Email<input autoComplete="username" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field-input" /></label>
        <label className="field-label">Password<input autoComplete="current-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field-input" /></label>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <button className="primary-button w-full !py-3" disabled={busy || loading}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-5 text-xs leading-5 text-muted">Judge access: use the demo credentials listed in the project README.</p>
    </section>
  </main>;
}

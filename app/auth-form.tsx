'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sparkles, UserRound } from 'lucide-react';
import { createClient } from '../lib/supabase/client';
import { getSupabasePublicConfig, supabaseSetupMessage } from '../lib/supabase/config';

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const config = getSupabasePublicConfig();
  const configured = config.status === 'ready';
  const setupMessage = process.env.NODE_ENV === 'development'
    ? supabaseSetupMessage(config.status)
    : 'Sign-in is temporarily unavailable. Please try again later.';
  const title = mode === 'login' ? 'Welcome back.' : mode === 'signup' ? 'A better way to cook.' : mode === 'forgot' ? 'Reset your password.' : 'Choose a new password.';
  const subtitle = mode === 'login' ? 'Sign in to find your saved recipes and pantry.' : mode === 'signup' ? 'Create an account to keep your kitchen in sync.' : mode === 'forgot' ? 'We’ll email you a secure password reset link.' : 'Choose a new password for your FridgeChef account.';
  const passwordValid = password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(''); setError('');
    if (!configured) { setError(setupMessage); return; }
    if (mode !== 'reset' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    if (mode === 'signup' && !name.trim()) { setError('Enter your full name.'); return; }
    if ((mode === 'login' || mode === 'reset') && !password) { setError('Enter your password.'); return; }
    if ((mode === 'signup' || mode === 'reset') && !passwordValid) { setError('Use at least 8 characters, including an uppercase letter, a lowercase letter and a number.'); return; }
    if ((mode === 'signup' || mode === 'reset') && password !== confirmation) { setError('Those passwords do not match.'); return; }
    setLoading(true);
    try {
      const supabase = createClient();
      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (authError) throw authError;
        const next = new URLSearchParams(window.location.search).get('next') || '/';
        router.replace(next.startsWith('/') && !next.startsWith('//') ? next : '/');
        router.refresh();
        return;
      }
      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/` } });
        if (authError) throw authError;
        setMessage(data.session ? 'Your account is ready. Welcome to FridgeChef!' : 'Account created. Check your email to confirm your address, then sign in.');
      } else if (mode === 'forgot') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback?next=/reset-password` });
        if (authError) throw authError;
        setMessage('If an account exists for that address, a secure reset link is on its way.');
      } else {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw authError;
        setMessage('Password updated. You can now continue cooking.');
      }
    } catch (cause) { setError(readableAuthError(cause)); }
    finally { setLoading(false); }
  }

  return <main className="auth-screen"><Link href="/" className="auth-brand"><span className="brand-mark"><Sparkles size={19}/></span><span>fridge<span>chef</span><small>GOOD FOOD STARTS HERE</small></span></Link><section className="auth-card"><Link href="/" className="auth-back"><ArrowLeft size={14}/> Back to FridgeChef</Link><div className="eyebrow muted">YOUR KITCHEN, YOUR ACCOUNT</div><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>
    <form onSubmit={submit} className="auth-form" noValidate>
      {mode === 'signup' && <label>Full name<span className="auth-input"><UserRound size={16}/><input autoComplete="name" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></span></label>}
      {(mode !== 'reset') && <label>Email address<span className="auth-input"><Mail size={16}/><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></span></label>}
      {(mode !== 'forgot') && <label>{mode === 'reset' ? 'New password' : 'Password'}<span className="auth-input"><LockKeyhole size={16}/><input type={showPassword?'text':'password'} autoComplete={mode==='login'?'current-password':'new-password'} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/><button type="button" className="password-toggle" aria-label={showPassword?'Hide password':'Show password'} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={16}/>:<Eye size={16}/>}</button></span></label>}
      {(mode === 'signup' || mode === 'reset') && <><label>Confirm password<span className="auth-input"><LockKeyhole size={16}/><input type={showPassword?'text':'password'} autoComplete="new-password" required value={confirmation} onChange={e=>setConfirmation(e.target.value)} placeholder="Enter it again"/></span></label><small className="password-hint">8+ characters with uppercase, lowercase and a number.</small></>}
      {mode==='login'&&<div className="auth-inline"><span>Good to see you again</span><Link href="/forgot-password">Forgot password?</Link></div>}
      {error&&<p role="alert" className="auth-message error">{error}</p>}{message&&<p role="status" className="auth-message success">{message}</p>}
      <button className="primary-button auth-submit" disabled={loading}>{loading?<><span className="spinner"/> Please wait…</>:mode==='login'?'Log in':mode==='signup'?'Create account':mode==='forgot'?'Send reset link':'Update password'}</button>
    </form>
    {mode==='login'&&<p className="auth-switch">New to FridgeChef? <Link href="/signup">Create an account</Link></p>}
    {mode==='signup'&&<p className="auth-switch">Already have an account? <Link href="/login">Log in</Link></p>}
    {(mode==='forgot'||mode==='reset')&&<p className="auth-switch"><Link href="/login">Return to log in</Link></p>}
    {!configured&&process.env.NODE_ENV==='development'&&<p className="auth-config-hint" role="status">{setupMessage}</p>}
  </section><p className="auth-footer">Fresh ideas. Less food waste. A little more joy at the table.</p></main>;
}

function readableAuthError(cause: unknown): string {
  const message = cause instanceof Error ? cause.message : '';
  if (/invalid login credentials/i.test(message)) return 'That email and password do not match. Check them and try again.';
  if (/email not confirmed/i.test(message)) return 'Please confirm your email address using the link we sent before signing in.';
  if (/already registered|user already exists/i.test(message)) return 'An account already uses that email. Try logging in instead.';
  if (/invalid api key|invalid.*key|unauthorized/i.test(message)) return 'Supabase rejected the configured public key. Check the project URL and publishable key in your environment settings.';
  if (/fetch failed|network|failed to fetch|timeout/i.test(message)) return 'We couldn’t reach Supabase. Check your connection and project URL, then try again.';
  return 'We couldn’t complete sign-in. Please check your details and try again.';
}

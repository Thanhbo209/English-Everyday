import { useState, type FormEvent } from 'react';
import googleLogo from '../../assets/google.svg';
import { Link, useNavigate } from 'react-router-dom';
import { User, EnvelopeSimple, Lock, ArrowRight, WarningCircle } from '@phosphor-icons/react';
import { useAuth } from '@/features/auth';
import { getApiError } from '../../shared/errors/api-error';
import { Button, Input } from '@/shared/components';

export default function Register() {
  const { registerUser } = useAuth();
  const navigate         = useNavigate();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await registerUser(email, password, name);
      navigate('/login', { replace: true });
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-md">
            <span className="text-primary-foreground font-extrabold text-xl leading-none">E</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start learning English today</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            <Input
              id="name"
              label="Full name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              leftIcon={<User size={16} />}
              autoComplete="name"
              required
            />

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              leftIcon={<EnvelopeSimple size={16} />}
              autoComplete="email"
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
              autoComplete="new-password"
              required
              helperText="At least 8 characters"
            />

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 bg-destructive/10 border border-destructive/25 rounded-lg px-3.5 py-3">
                <WarningCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" size="md">
              Create Account
              {!loading && <ArrowRight size={15} className="ml-1" />}
            </Button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Google button */}
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 h-9 mt-2 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
          onClick={() => alert('Google OAuth — coming soon!')}
        >
          <img src={googleLogo} alt="Google" className="w-4 h-4" />
          Sign up with Google
        </button>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

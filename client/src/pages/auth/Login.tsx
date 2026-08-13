import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/authContext';
import { loginWithGoogle } from '../../services/auth.services';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(credential: string | undefined) {
    if (!credential) {
      setError('Google sign-in failed — no credential returned.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await loginWithGoogle(credential);
      login(token, user);
      navigate('/files');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500">Access your organization's files</p>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(res) => handleGoogleSuccess(res.credential)}
            onError={() => setError('Google sign-in failed.')}
          />
        </div>

        {loading && <p className="text-center text-sm text-slate-400">Signing you in…</p>}

        <p className="text-center text-sm text-slate-500">
          Setting up a new organization?{' '}
          <Link to="/signup" className="font-medium text-brand-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/authContext';
import { Input } from '../../components/UI/Input';
import { bootstrapTenant } from '../../services/auth.services';


export function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formValid = companyName.trim().length > 0 && /^[a-z0-9-]+$/.test(subdomain);

  async function handleGoogleSuccess(credential: string | undefined) {
    if (!credential) {
      setError('Google sign-in failed — no credential returned.');
      return;
    }
    if (!formValid) {
      setError('Please fill in your organization name and subdomain first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { token, user } = await bootstrapTenant({
        credential,
        company_name: companyName.trim(),
        subdomain: subdomain.trim().toLowerCase(),
      });
      login(token, user);
      navigate('/files');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not create your organization.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold text-slate-900">Create your organization</h1>
          <p className="text-sm text-slate-500">Set up your file portal in a minute</p>
        </div>

        {error && (
          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            id="company_name"
            label="Organization name"
            placeholder="Acme University"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <div className="space-y-1">
            <label htmlFor="subdomain" className="block text-sm font-medium text-slate-700">
              Subdomain
            </label>
            <div className="flex items-center overflow-hidden rounded border border-slate-300 focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary">
              <input
                id="subdomain"
                className="flex-1 px-3 py-2 text-sm outline-none"
                placeholder="acme"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
              />
              <span className="whitespace-nowrap bg-slate-50 px-3 py-2 text-sm text-slate-400">
                .yourapp.com
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(res) => handleGoogleSuccess(res.credential)}
            onError={() => setError('Google sign-in failed.')}
          />
        </div>

        {loading && <p className="text-center text-sm text-slate-400">Creating your organization…</p>}

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
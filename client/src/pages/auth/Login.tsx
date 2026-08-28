// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
// import { useAuth } from '../../context/authContext';
// import { loginWithGoogle } from '../../services/auth.services';

// export function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);

//   async function handleGoogleSuccess(credential: string | undefined) {
//     if (!credential) {
//       setError('Google sign-in failed — no credential returned.');
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const { token, user } = await loginWithGoogle(credential);
//       login(token, user);
//       navigate('/files');
//     } catch (err: any) {
//       setError(err?.response?.data?.error || 'Sign-in failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
//       <div className="w-full max-w-sm space-y-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
//         <div className="space-y-1 text-center">
//           <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
//           <p className="text-sm text-slate-500">Access your organization's files</p>
//         </div>

//         {error && (
//           <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         <div className="flex justify-center">
//           <GoogleLogin
//             onSuccess={(res) => handleGoogleSuccess(res.credential)}
//             onError={() => setError('Google sign-in failed.')}
//           />
//         </div>

//         {loading && <p className="text-center text-sm text-slate-400">Signing you in…</p>}

//         <p className="text-center text-sm text-slate-500">
//           Setting up a new organization?{' '}
//           <Link to="/signup" className="font-medium text-brand-primary hover:underline">
//             Create one
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Folder, Lock, UploadCloud, Users, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/authContext';
import { loginWithGoogle } from '../../services/auth.services';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

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
    <div className="grid min-h-screen lg:grid-cols-2 bg-white dark:bg-slate-950">
      {/* branding panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-teal-500 to-teal-800 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 text-sm font-bold">
            F
          </span>
          File Portal
        </Link>

        <div className="relative">
          <span className="absolute -left-6 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <span className="absolute -bottom-24 -right-10 h-48 w-48 rounded-full bg-black/10 blur-2xl" />
          <Users size={220} className="absolute -bottom-16 -right-6 rotate-[-8deg] text-white/10" strokeWidth={1} />

          <div className="relative">
            <div className="absolute left-0 top-0 h-24 w-32 rotate-[-8deg] rounded-lg bg-white/15" />
            <div className="absolute left-3 top-4 h-24 w-32 rotate-[-2deg] rounded-lg bg-white/25" />
            <div className="relative flex h-24 w-32 translate-x-6 translate-y-8 rotate-[4deg] items-center justify-center rounded-lg bg-white shadow-lg">
              <Folder size={40} className="text-teal-600" strokeWidth={1.75} />
            </div>
            <div className="absolute left-40 top-2 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
              <Lock size={22} className="text-teal-700" strokeWidth={2} />
            </div>
            <div className="absolute left-24 top-32 flex h-16 w-16 items-center justify-center rounded-full bg-amber-400 shadow-lg">
              <UploadCloud size={26} className="text-slate-900" strokeWidth={2} />
            </div>
          </div>
        </div>

        <div className="max-w-xs text-teal-50">
          <p className="text-lg font-medium">One organized space for every file your team touches.</p>
          <p className="mt-2 text-sm text-teal-100/80">
            Role-based access, public upload links, and a full audit trail — all in one place.
          </p>
        </div>
      </div>

      {/* form panel */}
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12">
        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-semibold text-slate-900 lg:hidden dark:text-white">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600 text-sm font-bold text-white dark:bg-teal-500">
              F
            </span>
            File Portal
          </Link>

          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Sign in</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Access your organization's files</p>
          </div>

          {error && (
            <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(res) => handleGoogleSuccess(res.credential)}
                onError={() => setError('Google sign-in failed.')}
                theme={isDark ? 'filled_black' : 'outline'}
              />
            </div>

            {loading && (
              <p className="mt-4 text-center text-sm text-slate-400 dark:text-slate-500">Signing you in…</p>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Setting up a new organization?{' '}
            <Link to="/signup" className="font-medium text-teal-600 hover:underline dark:text-teal-400">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Folder,
    Users,
    Globe,
    ShieldCheck,
    Webhook,
    ScrollText,
    ArrowRight,
    Sun,
    Moon,
    UploadCloud,
    CheckCircle2,
    Lock,
} from 'lucide-react';

const features = [
    {
        icon: Folder,
        title: 'Organized file management',
        description: 'A familiar folder structure with roles, permissions, and per-folder access control for your whole team.',
    },
    {
        icon: Globe,
        title: 'Public upload links',
        description: 'Let visitors upload files to a specific folder — no account required — secured with short-lived, single-use tokens.',
    },
    {
        icon: ShieldCheck,
        title: 'Granular roles & permissions',
        description: 'Define exactly what each team member can see and do, down to individual folders.',
    },
    {
        icon: Webhook,
        title: 'Developer-friendly API',
        description: 'A scoped, read-only API and webhooks let your own website pull a curated view of your files.',
    },
    {
        icon: ScrollText,
        title: 'Full audit trail',
        description: 'Every action — uploads, deletions, permission changes — is logged and searchable.',
    },
    {
        icon: Users,
        title: 'Built for organizations',
        description: 'Each organization gets its own isolated space, branding, and team — powered by a single platform.',
    },
];

const steps = [
    { step: '1', title: 'Sign up with Google', description: 'Create your organization in seconds — no passwords to manage.' },
    { step: '2', title: 'Invite your team', description: 'Assign roles and permissions so everyone sees exactly what they need.' },
    { step: '3', title: 'Manage & share files', description: 'Organize folders, upload files, and optionally expose a public upload link or a developer catalog.' },
];

export function LandingPage() {
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

    return (
        <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            {/* nav */}
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
                    <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600 text-sm font-bold text-white dark:bg-teal-500">
                            F
                        </span>
                        File Portal
                    </span>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => setIsDark((prev) => !prev)}
                            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <Link
                            to="/login"
                            className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        >
                            Sign in
                        </Link>
                        <Link
                            to="/signup"
                            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </header>

            {/* hero */}
            <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                            Multi-tenant asset management
                        </span>
                        <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
                            File management, built for your whole organization
                        </h1>
                        <p className="mt-5 max-w-md text-lg text-slate-600 dark:text-slate-400">
                            Give your team a secure, organized space to manage files — with public upload links,
                            role-based access, and a developer API, all in one place.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link
                                to="/signup"
                                className="flex items-center gap-1.5 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
                            >
                                Create your organization <ArrowRight size={16} />
                            </Link>
                            <Link
                                to="/login"
                                className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>

                    {/* illustrated hero panel */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-teal-800 shadow-xl shadow-teal-900/10">
                        {/* ambient shapes */}
                        <span className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                        <span className="absolute -bottom-14 -right-8 h-48 w-48 rounded-full bg-black/10 blur-2xl" />

                        {/* background texture icon */}
                        <Users
                            size={220}
                            className="absolute -bottom-10 -right-10 rotate-[-8deg] text-white/10"
                            strokeWidth={1}
                        />

                        {/* folder stack */}
                        <div className="absolute left-8 top-10 h-24 w-32 rotate-[-8deg] rounded-lg bg-white/15" />
                        <div className="absolute left-11 top-14 h-24 w-32 rotate-[-2deg] rounded-lg bg-white/25" />
                        <div className="absolute left-14 top-[4.5rem] flex h-24 w-32 rotate-[4deg] items-center justify-center rounded-lg bg-white shadow-lg">
                            <Folder size={40} className="text-teal-600" strokeWidth={1.75} />
                        </div>

                        {/* upload badge */}
                        <div className="absolute bottom-10 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 shadow-lg">
                            <UploadCloud size={26} className="text-slate-900" strokeWidth={2} />
                        </div>

                        {/* security badge */}
                        <div className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
                            <Lock size={22} className="text-teal-700" strokeWidth={2} />
                        </div>
                    </div>
                </div>
            </section>

            {/* features */}
            <section className="border-t border-slate-200 bg-slate-50 px-6 py-20 sm:px-10 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-center text-2xl font-semibold tracking-tight">Everything your team needs</h2>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                            >
                                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 dark:bg-teal-500/10">
                                    <Icon size={18} className="text-teal-600 dark:text-teal-400" />
                                </span>
                                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* how it works */}
            <section className="px-6 py-20 sm:px-10">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
                    <div className="mt-12 grid gap-8 sm:grid-cols-3">
                        {steps.map(({ step, title, description }) => (
                            <div key={step} className="text-center">
                                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 border-teal-600 text-sm font-semibold text-teal-600 dark:border-teal-400 dark:text-teal-400">
                                    {step}
                                </div>
                                <h3 className="mt-3 text-sm font-semibold">{title}</h3>
                                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-slate-200 bg-gradient-to-br from-slate-900 to-teal-950 px-6 py-16 sm:px-10 dark:border-slate-800">
                <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.2fr_auto]">
                    <div>
                        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Bring every file into one place</h2>
                        <p className="mt-2 max-w-md text-slate-400">
                            Create your organization and invite your team in minutes.
                        </p>
                        <ul className="mt-5 space-y-2">
                            {steps.map(({ step, title }) => (
                                <li key={step} className="flex items-center gap-2 text-sm text-slate-300">
                                    <CheckCircle2 size={16} className="text-teal-400" />
                                    {title}
                                </li>
                            ))}
                        </ul>
                        <Link
                            to="/signup"
                            className="mt-7 inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-amber-400"
                        >
                            Create your organization <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-full bg-white/10 lg:flex">
                        <UploadCloud size={48} className="text-teal-300" strokeWidth={1.5} />
                    </div>
                </div>
            </section>

            {/* footer */}
            <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:px-10 dark:border-slate-800 dark:text-slate-400">
                <span>© {new Date().getFullYear()} File Portal. All rights reserved.</span>
                <div className="flex gap-4">
                    <Link to="/login" className="hover:text-slate-900 dark:hover:text-white">Sign in</Link>
                    <span>Documentation available after sign-in</span>
                </div>
            </footer>
        </div>
    );
}
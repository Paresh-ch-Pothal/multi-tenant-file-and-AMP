import { Link } from 'react-router-dom';
import { Folder, Users, Globe, ShieldCheck, Webhook, ScrollText, ArrowRight } from 'lucide-react';

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
    return (
        <div className="min-h-screen bg-white">
            {/* nav */}
            <header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 sm:px-10">
                <span className="text-lg font-semibold text-slate-900">File Portal</span>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                        Sign in
                    </Link>
                    <Link
                        to="/signup"
                        className="rounded bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                        Get started
                    </Link>
                </div>
            </header>

            {/* hero */}
            <section className="mx-auto max-w-3xl px-6 py-24 text-center sm:px-10">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                    File management, built for your whole organization
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-lg text-slate-500">
                    Give your team a secure, organized space to manage files — with public upload links,
                    role-based access, and a developer API, all in one place.
                </p>
                <div className="mt-8 flex items-center justify-center gap-3">
                    <Link
                        to="/signup"
                        className="flex items-center gap-1.5 rounded bg-brand-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                    >
                        Create your organization <ArrowRight size={16} />
                    </Link>
                    <Link
                        to="/login"
                        className="rounded border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        Sign in
                    </Link>
                </div>
            </section>

            {/* features */}
            <section className="border-t border-slate-100 bg-slate-50 px-6 py-20 sm:px-10">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-center text-2xl font-semibold text-slate-900">Everything your team needs</h2>
                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div key={title} className="rounded-lg border border-slate-200 bg-white p-5">
                                <Icon size={22} className="text-brand-primary" />
                                <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
                                <p className="mt-1.5 text-sm text-slate-500">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* how it works */}
            <section className="px-6 py-20 sm:px-10">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-center text-2xl font-semibold text-slate-900">How it works</h2>
                    <div className="mt-12 grid gap-8 sm:grid-cols-3">
                        {steps.map(({ step, title, description }) => (
                            <div key={step} className="text-center">
                                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-semibold text-brand-primary">
                                    {step}
                                </div>
                                <h3 className="mt-3 text-sm font-semibold text-slate-900">{title}</h3>
                                <p className="mt-1.5 text-sm text-slate-500">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="border-t border-slate-100 bg-slate-900 px-6 py-16 text-center sm:px-10">
                <h2 className="text-2xl font-semibold text-white">Ready to get started?</h2>
                <p className="mt-2 text-slate-400">Set up your organization in under a minute.</p>
                <Link
                    to="/signup"
                    className="mt-6 inline-flex items-center gap-1.5 rounded bg-brand-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
                >
                    Create your organization <ArrowRight size={16} />
                </Link>
            </section>

            {/* footer */}
            <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-8 text-sm text-slate-400 sm:flex-row sm:px-10">
                <span>© {new Date().getFullYear()} File Portal. All rights reserved.</span>
                <div className="flex gap-4">
                    <Link to="/login" className="hover:text-slate-600">Sign in</Link>
                    <span>Documentation available after sign-in</span>
                </div>
            </footer>
        </div>
    );
}
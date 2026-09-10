// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import {
//     Folder,
//     Users,
//     Globe,
//     ShieldCheck,
//     Webhook,
//     ScrollText,
//     ArrowRight,
//     Sun,
//     Moon,
//     UploadCloud,
//     CheckCircle2,
//     Lock,
// } from 'lucide-react';

// const features = [
//     {
//         icon: Folder,
//         title: 'Organized file management',
//         description: 'A familiar folder structure with roles, permissions, and per-folder access control for your whole team.',
//     },
//     {
//         icon: Globe,
//         title: 'Public upload links',
//         description: 'Let visitors upload files to a specific folder — no account required — secured with short-lived, single-use tokens.',
//     },
//     {
//         icon: ShieldCheck,
//         title: 'Granular roles & permissions',
//         description: 'Define exactly what each team member can see and do, down to individual folders.',
//     },
//     {
//         icon: Webhook,
//         title: 'Developer-friendly API',
//         description: 'A scoped, read-only API and webhooks let your own website pull a curated view of your files.',
//     },
//     {
//         icon: ScrollText,
//         title: 'Full audit trail',
//         description: 'Every action — uploads, deletions, permission changes — is logged and searchable.',
//     },
//     {
//         icon: Users,
//         title: 'Built for organizations',
//         description: 'Each organization gets its own isolated space, branding, and team — powered by a single platform.',
//     },
// ];

// const steps = [
//     { step: '1', title: 'Sign up with Google', description: 'Create your organization in seconds — no passwords to manage.' },
//     { step: '2', title: 'Invite your team', description: 'Assign roles and permissions so everyone sees exactly what they need.' },
//     { step: '3', title: 'Manage & share files', description: 'Organize folders, upload files, and optionally expose a public upload link or a developer catalog.' },
// ];

// export function LandingPage() {
//     const [isDark, setIsDark] = useState(() => {
//         if (typeof window === 'undefined') return false;
//         const stored = window.localStorage.getItem('theme');
//         if (stored === 'light' || stored === 'dark') return stored === 'dark';
//         return window.matchMedia('(prefers-color-scheme: dark)').matches;
//     });

//     useEffect(() => {
//         document.documentElement.classList.toggle('dark', isDark);
//         window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
//     }, [isDark]);

//     return (
//         <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
//             {/* nav */}
//             <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
//                 <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
//                     <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
//                         <span className="flex h-7 w-7 items-center justify-center rounded-md  text-sm font-bold text-white">
//                             <img
//                                 src="/logo.png"
//                                 alt="FileCraft Logo"
//                                 className="h-7 w-7 rounded-md object-contain"
//                             />
//                         </span>
//                         FileCraft
//                     </span>
//                     <div className="flex items-center gap-2 sm:gap-4">
//                         <button
//                             type="button"
//                             onClick={() => setIsDark((prev) => !prev)}
//                             aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
//                             className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
//                         >
//                             {isDark ? <Sun size={16} /> : <Moon size={16} />}
//                         </button>
//                         <Link
//                             to="/login"
//                             className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
//                         >
//                             Sign in
//                         </Link>
//                         <Link
//                             to="/signup"
//                             className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
//                         >
//                             Get started
//                         </Link>
//                     </div>
//                 </div>
//             </header>

//             {/* hero */}
//             <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
//                 <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
//                     <div>
//                         <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
//                             Multi-tenant asset management
//                         </span>
//                         <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
//                             File management, built for your whole organization
//                         </h1>
//                         <p className="mt-5 max-w-md text-lg text-slate-600 dark:text-slate-400">
//                             Give your team a secure, organized space to manage files — with public upload links,
//                             role-based access, and a developer API, all in one place.
//                         </p>
//                         <div className="mt-8 flex flex-wrap items-center gap-3">
//                             <Link
//                                 to="/signup"
//                                 className="flex items-center gap-1.5 rounded-md bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400"
//                             >
//                                 Create your organization <ArrowRight size={16} />
//                             </Link>
//                             <Link
//                                 to="/login"
//                                 className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
//                             >
//                                 Sign in
//                             </Link>
//                         </div>
//                     </div>

//                     {/* illustrated hero panel */}
//                     <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-teal-800 shadow-xl shadow-teal-900/10">
//                         {/* ambient shapes */}
//                         <span className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
//                         <span className="absolute -bottom-14 -right-8 h-48 w-48 rounded-full bg-black/10 blur-2xl" />

//                         {/* background texture icon */}
//                         <Users
//                             size={220}
//                             className="absolute -bottom-10 -right-10 rotate-[-8deg] text-white/10"
//                             strokeWidth={1}
//                         />

//                         {/* folder stack */}
//                         <div className="absolute left-8 top-10 h-24 w-32 rotate-[-8deg] rounded-lg bg-white/15" />
//                         <div className="absolute left-11 top-14 h-24 w-32 rotate-[-2deg] rounded-lg bg-white/25" />
//                         <div className="absolute left-14 top-[4.5rem] flex h-24 w-32 rotate-[4deg] items-center justify-center rounded-lg bg-white shadow-lg">
//                             <Folder size={40} className="text-teal-600" strokeWidth={1.75} />
//                         </div>

//                         {/* upload badge */}
//                         <div className="absolute bottom-10 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-amber-400 shadow-lg">
//                             <UploadCloud size={26} className="text-slate-900" strokeWidth={2} />
//                         </div>

//                         {/* security badge */}
//                         <div className="absolute right-8 top-8 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg">
//                             <Lock size={22} className="text-teal-700" strokeWidth={2} />
//                         </div>
//                     </div>
//                 </div>
//             </section>

//             {/* features */}
//             <section className="border-t border-slate-200 bg-slate-50 px-6 py-20 sm:px-10 dark:border-slate-800 dark:bg-slate-900/40">
//                 <div className="mx-auto max-w-5xl">
//                     <h2 className="text-center text-2xl font-semibold tracking-tight">Everything your team needs</h2>
//                     <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//                         {features.map(({ icon: Icon, title, description }) => (
//                             <div
//                                 key={title}
//                                 className="rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
//                             >
//                                 <span className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-50 dark:bg-teal-500/10">
//                                     <Icon size={18} className="text-teal-600 dark:text-teal-400" />
//                                 </span>
//                                 <h3 className="mt-3 text-sm font-semibold">{title}</h3>
//                                 <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* how it works */}
//             <section className="px-6 py-20 sm:px-10">
//                 <div className="mx-auto max-w-4xl">
//                     <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
//                     <div className="mt-12 grid gap-8 sm:grid-cols-3">
//                         {steps.map(({ step, title, description }) => (
//                             <div key={step} className="text-center">
//                                 <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border-2 border-teal-600 text-sm font-semibold text-teal-600 dark:border-teal-400 dark:text-teal-400">
//                                     {step}
//                                 </div>
//                                 <h3 className="mt-3 text-sm font-semibold">{title}</h3>
//                                 <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             </section>

//             {/* CTA */}
//             <section className="border-t border-slate-200 bg-gradient-to-br from-slate-900 to-teal-950 px-6 py-16 sm:px-10 dark:border-slate-800">
//                 <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.2fr_auto]">
//                     <div>
//                         <h2 className="text-2xl font-semibold text-white sm:text-3xl">Bring every file into one place</h2>
//                         <p className="mt-2 max-w-md text-slate-400">
//                             Create your organization and invite your team in minutes.
//                         </p>
//                         <ul className="mt-5 space-y-2">
//                             {steps.map(({ step, title }) => (
//                                 <li key={step} className="flex items-center gap-2 text-sm text-slate-300">
//                                     <CheckCircle2 size={16} className="text-teal-400" />
//                                     {title}
//                                 </li>
//                             ))}
//                         </ul>
//                         <Link
//                             to="/signup"
//                             className="mt-7 inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-amber-400"
//                         >
//                             Create your organization <ArrowRight size={16} />
//                         </Link>
//                     </div>
//                     <div className="hidden h-32 w-32 shrink-0 items-center justify-center rounded-full bg-white/10 lg:flex">
//                         <UploadCloud size={48} className="text-teal-300" strokeWidth={1.5} />
//                     </div>
//                 </div>
//             </section>

//             {/* footer */}
//             <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:px-10 dark:border-slate-800 dark:text-slate-400">
//                 <span>© {new Date().getFullYear()} File Portal. All rights reserved.</span>
//                 <div className="flex gap-4">
//                     <Link to="/login" className="hover:text-slate-900 dark:hover:text-white">Sign in</Link>
//                     <span>Documentation available after sign-in</span>
//                 </div>
//             </footer>
//         </div>
//     );
// }


import { useEffect, useState } from "react";
import {
    Folder,
    FolderOpen,
    Users,
    Globe,
    ShieldCheck,
    Webhook,
    ScrollText,
    ArrowRight,
    Sun,
    Moon,
    GitBranch,
    CheckCircle2,
    UploadCloud,
    FileText,
} from "lucide-react";
import { Link } from "react-router-dom";

const FONT_HEAD = "'Space Grotesk', 'Inter', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', 'Menlo', monospace";

const ledger = [
    {
        code: "node:read / node:edit",
        icon: Folder,
        title: "One tree, every file and folder",
        description:
            "Folders and files live in the same structure, scoped per organization, with fast subtree lookups no matter how deep it goes.",
    },
    {
        code: "node:upload_file — public",
        icon: Globe,
        title: "Upload links with no account needed",
        description:
            "Turn on public uploads for a single folder and share the link. Nothing else in the tree is reachable from it.",
    },
    {
        code: "scoped_folder_ids",
        icon: ShieldCheck,
        title: "Roles scoped to a folder, not the whole tree",
        description:
            "Give a reviewer access to one subfolder and they see exactly that branch — nothing above it, everything below it.",
    },
    {
        code: "X-API-KEY / X-API-SECRET",
        icon: Webhook,
        title: "A real API for your own systems",
        description:
            "Server-to-server access with key and secret auth, so your website or internal tools can read the same tree.",
    },
    {
        code: "audit_logs",
        icon: ScrollText,
        title: "Every change, kept and searchable",
        description:
            "Uploads, moves, deletions, permission changes — each one is written to a queryable trail your admins can open anytime.",
    },
    {
        code: "client_id",
        icon: Users,
        title: "A separate space per organization",
        description:
            "Every query is filtered to one tenant. Teams never see, share, or collide with another organization's files.",
    },
];

const steps = [
    {
        step: "1",
        title: "Create your organization",
        description: "Sign in and set up your workspace in under a minute — no server to configure.",
    },
    {
        step: "2",
        title: "Invite your team",
        description: "Assign a role and, if needed, scope it to a single folder before they ever log in.",
    },
    {
        step: "3",
        title: "Organize, share, and track",
        description: "Build out folders, hand out an upload link, and watch the audit trail fill in on its own.",
    },
];

const logRows = [
    { action: "node.upload_file", actor: "reviewer@acme.edu", status: "success" },
    { action: "node.cascade_delete", actor: "admin@acme.edu", status: "success" },
    { action: "apikey.create", actor: "system", status: "success" },
    { action: "user.role_change", actor: "admin@acme.edu", status: "success" },
];

const sidebarFolders = [
    { name: "Class 11", depth: 0 },
    { name: "Student", depth: 1 },
    { name: "resumes", depth: 2, active: true },
];

const existingFiles = ["cover_letter.pdf", "transcript.pdf"];

function ProductPreview() {
    return (
        <div className="w-full max-w-md overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-2xl shadow-black/40">
            <style>{`
        @keyframes pv-upload   { 0%,4%{opacity:0;transform:translateY(-14px)} 8%{opacity:1;transform:translateY(-14px)} 26%{opacity:1;transform:translateY(30px)} 33%{opacity:0;transform:translateY(36px)} 100%{opacity:0} }
        @keyframes pv-folder   { 0%,26%{box-shadow:0 0 0 0 rgba(34,211,238,0)} 34%{box-shadow:0 0 0 2px rgba(34,211,238,0.55)} 60%{box-shadow:0 0 0 0 rgba(34,211,238,0)} 100%{box-shadow:0 0 0 0 rgba(34,211,238,0)} }
        @keyframes pv-row      { 0%,28%{opacity:0;transform:translateX(-8px)} 36%{opacity:1;transform:translateX(0)} 92%{opacity:1} 98%,100%{opacity:0} }
        @keyframes pv-log      { 0%,42%{opacity:0;transform:translateY(5px)} 50%{opacity:1;transform:translateY(0)} 94%{opacity:1} 99%,100%{opacity:0} }
        .pv-upload{ animation: pv-upload 6.5s ease-in-out infinite; }
        .pv-folder{ animation: pv-folder 6.5s ease-in-out infinite; }
        .pv-row{ animation: pv-row 6.5s ease-in-out infinite; }
        .pv-log{ animation: pv-log 6.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .pv-upload{ animation: none; opacity: 0; }
          .pv-folder{ animation: none; }
          .pv-row{ animation: none; opacity: 1; transform: none; }
          .pv-log{ animation: none; opacity: 1; transform: none; }
        }
      `}</style>

            {/* title bar */}
            <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                <span className="ml-2 truncate text-xs text-slate-500" style={{ fontFamily: FONT_MONO }}>
                    Acme University / Class 11 / Student / resumes
                </span>
            </div>

            <div className="flex">
                {/* sidebar */}
                <div className="w-32 shrink-0 border-r border-slate-800 px-3 py-4">
                    {sidebarFolders.map((f) => (
                        <div
                            key={f.name}
                            className={`mb-1 flex items-center gap-1.5 rounded px-1.5 py-1 text-xs ${f.active ? "pv-folder text-cyan-300" : "text-slate-400"
                                }`}
                            style={{ paddingLeft: `${6 + f.depth * 10}px` }}
                        >
                            {f.active ? <FolderOpen size={13} /> : <Folder size={13} />}
                            <span className="truncate">{f.name}</span>
                        </div>
                    ))}
                    <div className="mt-2 flex items-center gap-1.5 rounded bg-amber-500/10 px-1.5 py-1 text-xs text-amber-300">
                        <Globe size={12} />
                        <span>public</span>
                    </div>
                </div>

                {/* main panel */}
                <div className="relative flex-1 px-4 py-4">
                    {/* upload icon dropping in */}
                    <div className="pv-upload pointer-events-none absolute right-6 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 shadow-md">
                        <UploadCloud size={14} className="text-slate-950" />
                    </div>

                    <div className="space-y-2">
                        {existingFiles.map((name) => (
                            <div key={name} className="flex items-center gap-2 text-xs text-slate-300">
                                <FileText size={13} className="text-slate-500" />
                                <span style={{ fontFamily: FONT_MONO }}>{name}</span>
                            </div>
                        ))}
                        <div className="pv-row flex items-center gap-2 text-xs text-cyan-200">
                            <FileText size={13} className="text-cyan-400" />
                            <span style={{ fontFamily: FONT_MONO }}>resume_final.pdf</span>
                        </div>
                    </div>

                    {/* audit strip */}
                    <div className="pv-log mt-5 flex items-center gap-2 border-t border-slate-800 pt-3 text-[11px]">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400" style={{ fontFamily: FONT_MONO }}>node.upload_file</span>
                        <span className="truncate text-slate-500" style={{ fontFamily: FONT_MONO }}>reviewer@acme.edu</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LandingPage() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", isDark);
    }, [isDark]);

    const gridBg = {
        backgroundImage:
            "linear-gradient(rgba(103,232,249,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.08) 1px, transparent 1px)",
        backgroundSize: "36px 36px",
    };

    return (
        <div
            className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
            style={{ fontFamily: FONT_BODY }}
        >
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

            {/* nav */}
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
                    <span className="flex items-center gap-2" style={{ fontFamily: FONT_HEAD }}>
                        <span className="flex h-8 w-8 items-center justify-center rounded border border-cyan-500/40 bg-slate-950 dark:bg-slate-900">
                            <GitBranch size={16} className="text-cyan-400" strokeWidth={1.75} />
                        </span>
                        <span className="text-lg font-semibold tracking-tight">FileCraft</span>
                    </span>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => setIsDark((prev) => !prev)}
                            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
                            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400"
                        >
                            Get started
                        </Link>
                    </div>
                </div>
            </header>

            {/* hero */}
            <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 dark:border-slate-900">
                <div className="absolute inset-0" style={gridBg} />
                <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-2 lg:gap-16">
                    <div>
                        <h1
                            className="text-4xl font-semibold leading-[1.12] tracking-tight text-white sm:text-5xl"
                            style={{ fontFamily: FONT_HEAD }}
                        >
                            Every file, folder, and permission — mapped and accounted for
                        </h1>
                        <p className="mt-5 max-w-md text-lg text-slate-400">
                            FileCraft gives your organization one file tree with role-based access,
                            public upload links, and a complete audit trail of who touched what.
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link
                                to="/signup"
                                className="flex items-center gap-1.5 rounded-md bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400"
                            >
                                Create your organization <ArrowRight size={16} />
                            </Link>
                            <Link
                                to="/login"
                                className="rounded-md border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-900"
                            >
                                Sign in
                            </Link>
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-end">
                        <ProductPreview />
                    </div>
                </div>
            </section>

            {/* ledger / features */}
            <section className="px-6 py-20 sm:px-10">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: FONT_HEAD }}>
                        What's actually in the tree
                    </h2>
                    <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-400">
                        Six permissions your team already relies on, and what each one does in practice.
                    </p>

                    <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                        {ledger.map(({ code, icon: Icon, title, description }, i) => (
                            <div
                                key={code}
                                className={`flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:gap-8 ${i % 2 === 1 ? "bg-slate-50 dark:bg-slate-900/40" : ""
                                    }`}
                            >
                                <div className="flex shrink-0 items-center gap-3 sm:w-56">
                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-slate-200 dark:border-slate-700">
                                        <Icon size={15} className="text-cyan-600 dark:text-cyan-400" />
                                    </span>
                                    <code
                                        className="text-xs text-slate-500 dark:text-slate-500"
                                        style={{ fontFamily: FONT_MONO }}
                                    >
                                        {code}
                                    </code>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">{title}</h3>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* audit log spotlight */}
            <section className="border-y border-slate-200 bg-slate-50 px-6 py-20 sm:px-10 dark:border-slate-900 dark:bg-slate-900/40">
                <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: FONT_HEAD }}>
                            A trail, not just a log
                        </h2>
                        <p className="mt-3 max-w-md text-slate-600 dark:text-slate-400">
                            Uploads, moves, deletions, invites, role changes — every mutation is written
                            to a queryable trail the moment it happens. Nothing is inferred after the fact.
                        </p>
                        <ul className="mt-6 space-y-2.5">
                            {["Filter by folder, action, or date range", "Cross-reference any entry back to the request that caused it", "Kept per organization — never mixed across tenants"].map(
                                (item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-600 dark:text-cyan-400" />
                                        {item}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
                        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5">
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                            <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                            <span className="ml-2 text-xs text-slate-500" style={{ fontFamily: FONT_MONO }}>
                                audit_logs
                            </span>
                        </div>
                        <div className="p-4" style={{ fontFamily: FONT_MONO }}>
                            {logRows.map((row) => (
                                <div key={row.action} className="flex items-center gap-3 py-1.5 text-xs">
                                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                                    <span className="w-40 shrink-0 text-cyan-300">{row.action}</span>
                                    <span className="flex-1 truncate text-slate-500">{row.actor}</span>
                                    <span className="shrink-0 text-emerald-400">{row.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* how it works */}
            <section className="px-6 py-20 sm:px-10">
                <div className="mx-auto max-w-4xl">
                    <h2 className="text-2xl font-semibold tracking-tight" style={{ fontFamily: FONT_HEAD }}>
                        Set up in three steps
                    </h2>
                    <div className="relative mt-12 grid gap-10 sm:grid-cols-3">
                        <div className="absolute left-0 right-0 top-[18px] hidden h-px bg-slate-200 dark:bg-slate-800 sm:block" />
                        {steps.map(({ step, title, description }) => (
                            <div key={step} className="relative">
                                <div className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
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
            <section className="border-t border-slate-200 bg-slate-950 px-6 py-16 sm:px-10 dark:border-slate-900">
                <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: FONT_HEAD }}>
                            Bring every file into one tree
                        </h2>
                        <p className="mt-2 max-w-md text-slate-400">
                            Set up your organization and invite your team in minutes.
                        </p>
                    </div>
                    <Link
                        to="/signup"
                        className="flex shrink-0 items-center gap-1.5 rounded-md bg-amber-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-amber-400"
                    >
                        Create your organization <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* footer */}
            <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:px-10 dark:border-slate-800 dark:text-slate-400">
                <span>© {new Date().getFullYear()} FileCraft. All rights reserved.</span>
                <div className="flex gap-4">
                    <Link to="/login" className="hover:text-slate-900 dark:hover:text-white">Sign in</Link>
                    <span>Documentation available after sign-in</span>
                </div>
            </footer>
        </div>
    );
}
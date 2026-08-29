import { useState } from 'react';
import {
    Users, FolderPlus, Shield, Globe, KeyRound, Code2, Webhook as WebhookIcon,
    ChevronRight, Copy, Check,
} from 'lucide-react';
import { Card } from '../../components/UI/Card';


type Tab = 'client' | 'developer';

function CodeBlock({ children }: { children: string }) {
    const [copied, setCopied] = useState(false);

    function copy() {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    }

    return (
        <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
                <code>{children}</code>
            </pre>
            <button
                onClick={copy}
                className="absolute right-2 top-2 rounded bg-slate-800 p-1.5 text-slate-400 hover:text-white"
            >
                {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
            </button>
        </div>
    );
}

function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card className="space-y-3">
            <div className="flex items-center gap-2">
                <Icon size={18} className="text-brand-primary" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {children}
            </div>
        </Card>
    );
}

export function DocsPage() {
    const [tab, setTab] = useState<Tab>('client');

    return (
        <div className="max-w-3xl space-y-6">
            <div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Documentation</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Guides for your team and for developers integrating with your organization's files.
                </p>
            </div>

            {/* tab switcher */}
            <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
                <button
                    onClick={() => setTab('client')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors ${tab === 'client'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                >
                    <Users size={15} /> For your team
                </button>
                <button
                    onClick={() => setTab('developer')}
                    className={`flex flex-1 items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium transition-colors ${tab === 'developer'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                >
                    <Code2 size={15} /> For developers
                </button>
            </div>

            {tab === 'client' ? <ClientDocs /> : <DeveloperDocs />}
        </div>
    );
}

function ClientDocs() {
    return (
        <div className="space-y-4">
            <Section icon={Users} title="Inviting team members">
                <p>
                    Go to <strong>Team</strong> in the sidebar and click <strong>Invite member</strong>. Enter
                    their email and pick a role. They'll be able to sign in with that email using Google —
                    no password is ever needed.
                </p>
                <p>
                    Until they sign in for the first time, their status will show as <em>invited</em>. Once
                    they sign in with Google using that exact email, their account activates automatically.
                </p>
            </Section>

            <Section icon={Shield} title="Roles and permissions">
                <p>
                    Roles determine what a team member can do. Go to <strong>Roles</strong> to create one —
                    for example, a "Reviewer" role that can only view and upload files, but not delete
                    anything or manage other team members.
                </p>
                <p>
                    You can also restrict a specific person to only see certain folders, regardless of their
                    role, by setting their scoped folders when editing their profile under <strong>Team</strong>.
                </p>
                <p>
                    If you delete a role that's currently assigned to someone, that person will show as
                    "No role assigned" and lose access until you give them a new role — they are never
                    automatically deleted.
                </p>
            </Section>

            <Section icon={FolderPlus} title="Organizing files and folders">
                <p>
                    Use <strong>Files</strong> to create folders, upload files, and organize your content.
                    Each folder or file can have a description, tags, and a thumbnail image to make it easier
                    to browse.
                </p>
                <p>
                    Use the <strong>rename</strong> and <strong>delete</strong> icons on any item to manage
                    it. Deleting a folder removes everything inside it — you'll be asked to confirm first.
                </p>
            </Section>

            <Section icon={Globe} title="Public upload links">
                <p>
                    Any folder can be turned into a public drop-box — visitors can upload a file to it
                    without logging in at all. Toggle the globe icon next to a folder to turn this on or off.
                </p>
                <p>
                    Public upload links are protected by short-lived, single-use tokens generated by your
                    developer's backend — a plain folder link on its own cannot be used to upload anything
                    without a valid token.
                </p>
            </Section>

            <Section icon={Shield} title="Audit log">
                <p>
                    Every meaningful action — uploads, deletions, role changes, invites — is recorded in the{' '}
                    <strong>Audit Log</strong>. You can filter by action type or date range to see exactly
                    what happened and who did it.
                </p>
            </Section>
        </div>
    );
}

function DeveloperDocs() {
    return (
        <div className="space-y-4">
            <Section icon={KeyRound} title="Getting an API key">
                <p>
                    Go to <strong>API Keys</strong> and create one. You'll be shown a{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">key_id</code>{' '}
                    and a <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">secret</code> —
                    <strong> the secret is shown only once</strong>. Store it securely on your server; it
                    should never be exposed in frontend/browser code.
                </p>
                <p>API keys are read-only — they can list files and folders, but cannot create, edit, or delete anything.</p>
            </Section>

            <Section icon={Code2} title="Reading the file catalog">
                <p>
                    Only files and folders explicitly marked <em>"visible in external catalog"</em> by an
                    admin are returned here — this lets the organization choose exactly what to expose on
                    your website.
                </p>
                <CodeBlock>{`curl "https://multi-tenant-file-and-amp.onrender.com/v1/catalog" \\
  -H "X-API-KEY: client_key_live_xxxx" \\
  -H "X-API-SECRET: xxxxxxxxxxxxxxxx"`}</CodeBlock>
                <p>Each item includes a resolved, human-readable path from the root:</p>
                <CodeBlock>{`{
  "nodes": [
    {
      "id": "66f1...",
      "type": "file",
      "name": "resume.pdf",
      "description": "Final approved resume",
      "tags": ["approved"],
      "thumbnail_url": "https://.../resume-thumb.png",
      "path": [
        { "id": "...", "name": "Class 11" },
        { "id": "...", "name": "resumes" }
      ]
    }
  ]
}`}</CodeBlock>
            </Section>

            <Section icon={Globe} title="Enabling a public upload widget">
                <p>
                    Public upload links require a short-lived token generated by your own backend — never
                    expose your API secret in a browser. Request a token for the target folder:
                </p>
                <CodeBlock>{`curl -X POST "https://multi-tenant-file-and-amp.onrender.com/v1/nodes/<folder_id>/upload-token" \\
  -H "X-API-KEY: client_key_live_xxxx" \\
  -H "X-API-SECRET: xxxxxxxxxxxxxxxx"

# → { "upload_token": "eyJ...", "expires_in_seconds": 900 }`}</CodeBlock>
                <p>
                    Then send visitors to your upload page with that token attached, e.g.{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
                        /upload/&lt;folder_id&gt;?token=eyJ...
                    </code>{' '}
                    — the token expires after 15 minutes and only works for that one folder.
                </p>
            </Section>

            <Section icon={WebhookIcon} title="Webhooks">
                <p>
                    Register a webhook under <strong>Webhooks</strong> to get notified at your own server
                    whenever a public upload happens. You'll receive a signing secret — verify it to confirm
                    requests genuinely came from us:
                </p>
                <CodeBlock>{`const crypto = require('crypto');

function verifySignature(rawBody, signatureHeader, secret) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return expected === signatureHeader;
}`}</CodeBlock>
                <p>Payload shape delivered to your endpoint:</p>
                <CodeBlock>{`{
  "event": "node.upload_file.public",
  "node_id": "...",
  "folder_id": "...",
  "file_name": "resume.pdf",
  "size_bytes": 204800,
  "uploaded_at": "2026-08-15T10:00:00Z"
}`}</CodeBlock>
            </Section>

            <Section icon={ChevronRight} title="Rate limits">
                <p>
                    Public upload and token endpoints are rate-limited per IP address to prevent abuse. If
                    you're building a high-volume integration and hit limits during testing, reach out to
                    your organization admin.
                </p>
            </Section>
        </div>
    );
}
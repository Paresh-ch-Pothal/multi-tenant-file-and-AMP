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

            <Section icon={FolderPlus} title="Uploading and organizing files">
                <p>
                    Open a folder, then click <strong>Upload</strong> in the toolbar and pick a file from
                    your device. Files can only be uploaded inside a folder — there's no upload at the very
                    top level, so create at least one folder first if you haven't already.
                </p>
                <p>
                    When creating a folder, you can optionally add a <strong>description</strong>,{' '}
                    <strong>tags</strong> (press Enter after each one), and a <strong>thumbnail image</strong>{' '}
                    to make it easier to recognize at a glance. You can add or change these anytime later by
                    clicking the info (ⓘ) icon next to any file or folder.
                </p>
            </Section>

            <Section icon={Globe} title="Understanding the icons in Files">
                <p>Each row in the Files table has a few small action icons — here's what each one does:</p>
                <ul className="ml-4 list-disc space-y-1.5">
                    <li>
                        <Globe size={13} className="mr-1 inline text-green-600" />
                        <strong>Globe icon</strong> — toggles <em>public upload</em> for a folder. When
                        turned on, anyone with a valid upload link can drop a file into that folder without
                        logging in. Turns green when active.
                    </li>
                    <li>
                        <strong>Eye icon</strong> — toggles whether this file or folder is{' '}
                        <em>visible in the external catalog</em>. Only items you turn this on for can be
                        seen by a developer using an API key — everything else stays completely private and
                        invisible to outside integrations, even if the folder itself is public-upload
                        enabled. Turns the brand color when active.
                    </li>
                    <li>
                        <strong>Info (ⓘ) icon</strong> — opens the <em>edit details</em> panel, where you can
                        change the description, tags, thumbnail image, and external visibility for that item.
                    </li>
                    <li>
                        <strong>Pencil icon</strong> — renames the file or folder.
                    </li>
                    <li>
                        <strong>Trash icon</strong> — deletes the file or folder. Deleting a folder removes
                        everything inside it after you confirm — this cannot be undone.
                    </li>
                </ul>
                <p>
                    Public upload and catalog visibility are independent settings — a folder can accept
                    public uploads without anything inside it being shown externally, and vice versa. Think
                    of the globe icon as "who can put files in," and the eye icon as "who can see this file
                    exists at all outside your organization."
                </p>
            </Section>

            <Section icon={KeyRound} title="Creating an API key for your developer">
                <p>
                    If you're working with a developer to build a custom website or integration, they'll
                    need an API key to read your file catalog or set up public upload links programmatically.
                </p>
                <p>Go to <strong>API Keys</strong> in the sidebar and click <strong>New API key</strong>:</p>
                <ol className="ml-4 list-decimal space-y-1.5">
                    <li>Give it a recognizable name, like "Production Website Key."</li>
                    <li>
                        You'll be shown a <strong>Key ID</strong> and a <strong>Secret</strong> —{' '}
                        <strong>the secret is shown only once</strong> and cannot be recovered afterward.
                        Copy both and send them to your developer securely (not over plain email or chat, if
                        possible).
                    </li>
                    <li>
                        If a key is ever compromised or no longer needed, click <strong>Revoke</strong> next
                        to it — this disables it immediately without affecting your other keys.
                    </li>
                </ol>
                <p>
                    API keys can only read files and folders you've explicitly marked visible in the
                    external catalog (see the eye icon above) — they can never create, edit, or delete
                    anything in your organization.
                </p>
            </Section>

            <Section icon={WebhookIcon} title="Creating a webhook for your developer">
                <p>
                    A webhook lets your developer's server get notified automatically whenever someone
                    uploads a file through a public upload link — useful if they want to process, review,
                    or display new uploads without constantly checking for them.
                </p>
                <p>Go to <strong>Webhooks</strong> in the sidebar and click <strong>New webhook</strong>:</p>
                <ol className="ml-4 list-decimal space-y-1.5">
                    <li>
                        Ask your developer for the URL on their server that should receive the notification,
                        and paste it in.
                    </li>
                    <li>Leave "Public file uploaded" checked (this is currently the only event type available).</li>
                    <li>
                        You'll be shown a <strong>signing secret</strong> — share this with your developer so
                        their server can verify the notification genuinely came from your organization.
                    </li>
                </ol>
                <p>
                    You can delete a webhook anytime from the same page, which stops notifications
                    immediately.
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
                <p>
                    Each item includes a resolved, human-readable path from the root, and — for files — a
                    ready-to-use <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">file_url</code>{' '}
                    you can link or embed directly. This link is temporary (valid for 1 hour) and refreshes
                    automatically every time you re-fetch the catalog.
                </p>
                <CodeBlock>{`{
  "nodes": [
    {
      "id": "66f1...",
      "type": "file",
      "name": "resume.pdf",
      "description": "Final approved resume",
      "tags": ["approved"],
      "thumbnail_url": "https://.../resume-thumb.png",
      "file_url": "https://your-bucket.s3.amazonaws.com/...?X-Amz-Signature=...",
      "path": [
        { "id": "...", "name": "Class 11" },
        { "id": "...", "name": "resumes" }
      ]
    }
  ]
}`}</CodeBlock>
            </Section>

            <Section icon={Code2} title="Getting a single item by ID">
                <p>
                    Once you have a node's <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">id</code>{' '}
                    from the catalog listing, you can fetch its full detail directly — useful for a
                    dedicated "file detail" or "folder view" page on your site.
                </p>
                <CodeBlock>{`curl "https://multi-tenant-file-and-amp.onrender.com/v1/catalog/<node_id>" \\
  -H "X-API-KEY: client_key_live_xxxx" \\
  -H "X-API-SECRET: xxxxxxxxxxxxxxxx"`}</CodeBlock>
                <p>
                    If the ID belongs to a <strong>file</strong>, you'll get its metadata and a{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">file_url</code> to
                    view or download it directly:
                </p>
                <CodeBlock>{`{
  "id": "66f1...",
  "type": "file",
  "name": "resume.pdf",
  "description": "Final approved resume",
  "tags": ["approved"],
  "file_url": "https://your-bucket.s3.amazonaws.com/...?X-Amz-Signature=...",
  "path": [{ "id": "...", "name": "resumes" }],
  "updated_at": "2026-08-15T10:00:00Z"
}`}</CodeBlock>
                <p>
                    If the ID belongs to a <strong>folder</strong>, you'll get the folder's own details plus a{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">children</code>{' '}
                    array listing everything inside it that's also marked visible — the same shape as items
                    from the catalog listing endpoint:
                </p>
                <CodeBlock>{`{
  "id": "66f0...",
  "type": "folder",
  "name": "resumes",
  "path": [{ "id": "...", "name": "Class 11" }],
  "children": [
    {
      "id": "66f1...",
      "type": "file",
      "name": "resume.pdf",
      "file_url": "https://...",
      "thumbnail_url": null
    }
  ],
  "updated_at": "2026-08-15T10:00:00Z"
}`}</CodeBlock>
                <p>
                    Only items marked <em>"visible in external catalog"</em> appear as children — anything
                    the admin hasn't opted to expose is simply omitted, not returned with restricted data.
                </p>
            </Section>

            <Section icon={Globe} title="Enabling a public upload widget">
                <p>
                    A public upload link works in two steps: your backend requests a short-lived token,
                    then the visitor's browser uses that token to actually upload the file. Your API secret
                    is only ever used in step 1 — it must never be exposed in browser/frontend code.
                </p>

                <p className="font-medium text-slate-700 dark:text-slate-300">
                    Step 1 — Your server requests an upload token
                </p>
                <p>
                    Before showing the upload form to a visitor, your backend calls this endpoint using
                    your API key and secret. The folder must already have public upload enabled by an admin.
                </p>
                <CodeBlock>{`curl -X POST "https://multi-tenant-file-and-amp.onrender.com/v1/nodes/<folder_id>/upload-token" \\
  -H "X-API-KEY: client_key_live_xxxx" \\
  -H "X-API-SECRET: xxxxxxxxxxxxxxxx"`}</CodeBlock>
                <p>You'll get back a token valid for 15 minutes, scoped to that one folder only:</p>
                <CodeBlock>{`{
  "upload_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in_seconds": 900
}`}</CodeBlock>

                <p className="font-medium text-slate-700 dark:text-slate-300">
                    Step 2 — The visitor's browser uploads the file using that token
                </p>
                <p>
                    Pass the token to the visitor's page (e.g. as a URL parameter) and have their browser
                    submit the file directly — no API key is needed here, since the token itself is the
                    proof of authorization:
                </p>
                <CodeBlock>{`// runs in the visitor's browser — no API key/secret here
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('parent_id', '<folder_id>');
formData.append('upload_token', '<token from Step 1>');

fetch('https://multi-tenant-file-and-amp.onrender.com/v1/nodes/upload', {
  method: 'POST',
  body: formData,
});`}</CodeBlock>
                <p>
                    Or, if using our ready-made upload page instead of building your own, simply redirect
                    the visitor to:
                </p>
                <CodeBlock>{`https://multi-tenant-file-and-amp.onrender.com/upload/<folder_id>?token=<token from Step 1>`}</CodeBlock>
                <p>
                    The token expires after 15 minutes and only works for the one folder it was issued for
                    — generate a fresh one each time you render the upload form.
                </p>
            </Section>


            <Section icon={WebhookIcon} title="Webhooks — get notified on public uploads">
                <p>
                    A webhook lets your own server react instantly whenever a visitor uploads a file
                    through a public upload link — no polling required. When it happens, we send an HTTP
                    POST request to a URL you register, with a signed payload proving it genuinely came
                    from us.
                </p>

                <p className="font-medium text-slate-700 dark:text-slate-300">
                    Step 1 — Register your endpoint
                </p>
                <p>
                    Go to <strong>Webhooks</strong> in the sidebar and click <strong>New webhook</strong>.
                    Enter the URL on your own server that should receive the event (e.g.{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
                        https://yourserver.com/webhooks/incoming
                    </code>
                    ). You'll be shown a <strong>signing secret</strong> — copy it now, it's only shown once.
                </p>

                <p className="font-medium text-slate-700 dark:text-slate-300">
                    Step 2 — We call your URL when a public upload happens
                </p>
                <p>
                    Every time a visitor successfully uploads a file to a folder with public upload
                    enabled, we send a POST request to your registered URL with this body:
                </p>
                <CodeBlock>{`{
  "event": "node.upload_file.public",
  "node_id": "66f1...",
  "folder_id": "66f0...",
  "file_name": "resume.pdf",
  "size_bytes": 204800,
  "uploaded_at": "2026-08-15T10:00:00Z"
}`}</CodeBlock>
                <p>
                    The request also includes an{' '}
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">
                        X-Webhook-Signature
                    </code>{' '}
                    header — a hash of the request body signed with your secret from Step 1.
                </p>

                <p className="font-medium text-slate-700 dark:text-slate-300">
                    Step 3 — Verify the signature on your server
                </p>
                <p>
                    Before trusting the payload, recompute the signature yourself using the raw request
                    body and your secret, and compare it to the header. This proves the request wasn't
                    forged by someone who simply guessed your URL:
                </p>
                <CodeBlock>{`const crypto = require('crypto');

function isValidWebhook(rawBody, signatureHeader, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return expected === signatureHeader;
}

// inside your route handler:
app.post('/webhooks/incoming', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const isValid = isValidWebhook(req.body, signature, process.env.YOUR_WEBHOOK_SECRET);

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  console.log('Verified event:', event.event, event.file_name);

  res.status(200).send('OK');
});`}</CodeBlock>

                <p className="font-medium text-slate-700 dark:text-slate-300">
                    Notes
                </p>
                <p>
                    Delivery is best-effort — if your server is down or times out (5 second limit), the
                    event is dropped, not retried. Your endpoint should respond quickly and process the
                    event asynchronously if it needs to do heavier work. You can delete a webhook anytime
                    from the <strong>Webhooks</strong> page, which stops delivery immediately.
                </p>
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
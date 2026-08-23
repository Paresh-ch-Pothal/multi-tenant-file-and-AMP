import { useState, useEffect, useCallback } from 'react';
import { Plus, Copy, Check, Webhook as WebhookIcon } from 'lucide-react';
import { type Webhook, type NewWebhookResponse, EVENT_OPTIONS } from '../../types/webhook';
import * as webhookService from '../../services/webhook.services';

import { formatDate } from '../../utils/format';
import { Checkbox } from '../../components/UI/Checkbox';
import { Button } from '../../components/UI/Buttons';
import { Modal } from '../../components/UI/Modal';

import { Badge } from '../../components/UI/Badge';
import { Input } from '../../components/UI/Input';
import { TableEmptyState, TableLoadingRows } from '../../components/UI/TableStates';

export function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['node.upload_file.public']);
  const [newWebhook, setNewWebhook] = useState<NewWebhookResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Webhook | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await webhookService.listWebhooks();
      setWebhooks(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load webhooks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function toggleEvent(event: string, checked: boolean) {
    setSelectedEvents((prev) => (checked ? [...prev, event] : prev.filter((e) => e !== event)));
  }

  async function handleCreate() {
    if (!url.trim() || selectedEvents.length === 0) return;
    try {
      const result = await webhookService.createWebhook(url.trim(), selectedEvents);
      setNewWebhook(result);
      setCreateOpen(false);
      setUrl('');
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create webhook.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await webhookService.deleteWebhook(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete webhook.');
    }
  }

  function copySecret() {
    if (!newWebhook) return;
    navigator.clipboard.writeText(newWebhook.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Webhooks</h1>
          <p className="text-sm text-slate-500">
            Get notified at your own server when events happen — like a public file upload.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> New webhook
        </Button>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">URL</th>
              <th className="px-4 py-2.5">Events</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Created</th>
              <th className="w-20 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableLoadingRows columns={5} />
            ) : webhooks.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                icon={WebhookIcon}
                title="No webhooks configured"
                description="Get notified at your own server when a public upload happens."
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus size={14} /> New webhook
                  </Button>
                }
              />
            ) : (
              webhooks.map((wh) => (
                <tr key={wh._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 text-slate-900">
                      <WebhookIcon size={14} className="shrink-0 text-slate-400" />
                      <span className="truncate max-w-xs">{wh.url}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {wh.events.map((e) => EVENT_OPTIONS.find((o) => o.value === e)?.label || e).join(', ')}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={wh.is_active ? 'success' : 'neutral'}>
                      {wh.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(wh.created_at)}</td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => setDeleteTarget(wh)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* create webhook modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New webhook">
        <div className="space-y-4">
          <Input
            label="Endpoint URL"
            placeholder="https://yourserver.com/webhooks/incoming"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Events</label>
            <div className="space-y-2 rounded border border-slate-200 p-3">
              {EVENT_OPTIONS.map(({ value, label }) => (
                <Checkbox
                  key={value}
                  label={label}
                  checked={selectedEvents.includes(value)}
                  onChange={(checked) => toggleEvent(value, checked)}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!url.trim() || selectedEvents.length === 0}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* shown-once secret modal */}
      <Modal open={!!newWebhook} onClose={() => setNewWebhook(null)} title="Webhook created">
        {newWebhook && (
          <div className="space-y-4">
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {newWebhook.warning}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
                Signing secret
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                  {newWebhook.secret}
                </div>
                <button
                  onClick={copySecret}
                  className="flex items-center gap-1 rounded border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Use this to verify the <code>X-Webhook-Signature</code> header on incoming requests.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setNewWebhook(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* delete confirm */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete webhook">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Delete this webhook? Your server will stop receiving event notifications immediately.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
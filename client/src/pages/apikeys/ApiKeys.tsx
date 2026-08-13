import { useState, useEffect, useCallback } from 'react';
import { Plus, Copy, Check, KeyRound } from 'lucide-react';
import { type ApiKey, type NewApiKeyResponse } from '../../types/apiKeys';
import * as apiKeyService from '../../services/apiKey.services';

import { formatDate } from '../../utils/format';
import { Button } from '../../components/UI/Buttons';
import { Badge } from '../../components/UI/Badge';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [newKey, setNewKey] = useState<NewApiKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiKeyService.listApiKeys();
      setKeys(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load API keys.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!keyName.trim()) return;
    try {
      const result = await apiKeyService.createApiKey(keyName.trim());
      setNewKey(result);
      setCreateOpen(false);
      setKeyName('');
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create API key.');
    }
  }

  async function handleRevoke() {
    if (!revokeTarget) return;
    try {
      await apiKeyService.revokeApiKey(revokeTarget._id);
      setRevokeTarget(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to revoke key.');
    }
  }

  function copySecret() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">API Keys</h1>
          <p className="text-sm text-slate-500">
            For developer integrations — read-only access to list files and folders.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> New API key
        </Button>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Key ID</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Last used</th>
              <th className="w-20 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : keys.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No API keys yet.</td></tr>
            ) : (
              keys.map((key) => (
                <tr key={key._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-900">
                    <div className="flex items-center gap-2">
                      <KeyRound size={14} className="text-slate-400" />
                      {key.name}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500">{key.key_id}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={key.is_active ? 'success' : 'neutral'}>
                      {key.is_active ? 'active' : 'revoked'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                  </td>
                  <td className="px-4 py-2.5">
                    {key.is_active && (
                      <button
                        onClick={() => setRevokeTarget(key)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* create key modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New API key">
        <div className="space-y-4">
          <Input
            label="Key name"
            placeholder="e.g. Production Website Key"
            value={keyName}
            onChange={(e) => setKeyName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!keyName.trim()}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* shown-once secret modal */}
      <Modal open={!!newKey} onClose={() => setNewKey(null)} title="API key created">
        {newKey && (
          <div className="space-y-4">
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {newKey.warning}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Key ID</label>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                {newKey.key_id}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Secret</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                  {newKey.secret}
                </div>
                <button
                  onClick={copySecret}
                  className="flex items-center gap-1 rounded border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setNewKey(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* revoke confirm */}
      <Modal open={!!revokeTarget} onClose={() => setRevokeTarget(null)} title="Revoke API key">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Revoke "{revokeTarget?.name}"? Any integration using this key will stop working immediately.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleRevoke}>Revoke</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
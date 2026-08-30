
import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Copy, Check, KeyRound } from 'lucide-react';
import { type ApiKey, type NewApiKeyResponse } from '../../types/apiKeys';
import * as apiKeyService from '../../services/apiKey.services';

import { formatDate } from '../../utils/format';
import { Button } from '../../components/UI/Buttons';
import { Badge } from '../../components/UI/Badge';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { TableEmptyState, TableLoadingRows } from '../../components/UI/TableStates';
import { ApiKeyUsageModal } from './ApiKeyUsageModel';

export function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<NewApiKeyResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [revoking, setRevoking] = useState(false);
  const [usageTarget, setUsageTarget] = useState<ApiKey | null>(null);

  // guards against overlapping load() calls firing two requests at once
  const loadingRef = useRef(false);

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await apiKeyService.listApiKeys();
      setKeys(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load API keys.');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    if (!keyName.trim() || creating) return;
    setCreating(true);
    try {
      const result = await apiKeyService.createApiKey(keyName.trim());
      setNewKey(result);
      setCreateOpen(false);
      setKeyName('');
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create API key.');
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke() {
    if (!revokeTarget || revoking) return;
    setRevoking(true);
    try {
      await apiKeyService.revokeApiKey(revokeTarget._id);
      setRevokeTarget(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to revoke key.');
    } finally {
      setRevoking(false);
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
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">API Keys</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            For developer integrations — read-only access to list files and folders.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> New API key
        </Button>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Key ID</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Last used</th>
              <th className="w-20 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableLoadingRows columns={5} />
            ) : keys.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                icon={KeyRound}
                title="No API keys yet"
                description="Create a key to let your backend read files programmatically."
                action={
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus size={14} /> New API key
                  </Button>
                }
              />
            ) : (
              keys.map((key) => (
                <tr key={key._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-2.5 text-slate-900 dark:text-white">
                    <button
                      onClick={() => setUsageTarget(key)}
                      className="flex items-center gap-2 hover:text-brand-primary hover:underline"
                    >
                      <KeyRound size={14} className="text-slate-400" />
                      {key.name}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-500 dark:text-slate-400">{key.key_id}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={key.is_active ? 'success' : 'neutral'}>
                      {key.is_active ? 'active' : 'revoked'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">
                    {key.last_used_at ? formatDate(key.last_used_at) : 'Never'}
                  </td>
                  <td className="px-4 py-2.5">
                    {key.is_active && (
                      <button
                        onClick={() => setRevokeTarget(key)}
                        className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline"
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
            <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400">
              {newKey.warning}
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Key ID</label>
              <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {newKey.key_id}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Secret</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 truncate rounded border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {newKey.secret}
                </div>
                <button
                  onClick={copySecret}
                  className="flex items-center gap-1 rounded border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Revoke "{revokeTarget?.name}"? Any integration using this key will stop working immediately.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleRevoke}>Revoke</Button>
          </div>
        </div>
      </Modal>
      <ApiKeyUsageModal apiKey={usageTarget} onClose={() => setUsageTarget(null)} />
    </div>
  );
}
import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type AuditLogEntry, ACTION_OPTIONS } from '../../types/auditLog';
import * as auditLogService from '../../services/auditLog.services';

import { Button } from '../../components/UI/Buttons';
import { Select } from '../../components/UI/Select';
import { Input } from '../../components/UI/Input';
import { Badge } from '../../components/UI/Badge';


function actionLabel(action: string) {
  return ACTION_OPTIONS.find((a) => a.value === action)?.label || action;
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actionFilter, setActionFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await auditLogService.listAuditLogs({
        action: actionFilter || undefined,
        from: fromFilter || undefined,
        to: toFilter || undefined,
        page,
      });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load audit log.');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, fromFilter, toFilter, page]);

  useEffect(() => { load(); }, [load]);

  function actorLabel(entry: AuditLogEntry) {
    if (entry.actor.type === 'api_key') return 'API key';
    if (entry.actor.type === 'public') return 'Public visitor';
    return entry.actor.label || 'User';
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Audit log</h1>
        <p className="text-sm text-slate-500">A record of every change made in your organization.</p>
      </div>

      {/* filters */}
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-4">
        <Select
          label="Action"
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
        >
          <option value="">All actions</option>
          {ACTION_OPTIONS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </Select>
        <Input
          label="From"
          type="date"
          value={fromFilter}
          onChange={(e) => { setFromFilter(e.target.value); setPage(1); }}
        />
        <Input
          label="To"
          type="date"
          value={toFilter}
          onChange={(e) => { setToFilter(e.target.value); setPage(1); }}
        />
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={() => { setActionFilter(''); setFromFilter(''); setToFilter(''); setPage(1); }}
            className="w-full"
          >
            Clear filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      {/* table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Action</th>
              <th className="px-4 py-2.5">Actor</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">IP Address</th>
              <th className="px-4 py-2.5">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No activity found for this filter.</td></tr>
            ) : (
              logs.map((entry) => (
                <tr key={entry._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-medium text-slate-900">{actionLabel(entry.action)}</td>
                  <td className="px-4 py-2.5 text-slate-600">{actorLabel(entry)}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={entry.status === 'success' ? 'success' : 'danger'}>{entry.status}</Badge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{entry.ip_address || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500">{new Date(entry.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Page {pagination.page} of {pagination.pages} · {pagination.total} entries</span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page >= pagination.pages}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
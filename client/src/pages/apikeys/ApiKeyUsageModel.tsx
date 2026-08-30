import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import * as apiKeyService from '../../services/apiKey.services';
import type { ApiKey, ApiKeyUsageResponse } from '../../types/apiKeys';
import { Modal } from '../../components/UI/Modal';


interface ApiKeyUsageModalProps {
    apiKey: ApiKey | null;
    onClose: () => void;
}

export function ApiKeyUsageModal({ apiKey, onClose }: ApiKeyUsageModalProps) {
    const [usage, setUsage] = useState<ApiKeyUsageResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!apiKey) return;
        setLoading(true);
        apiKeyService
            .getApiKeyUsage(apiKey._id)
            .then(setUsage)
            .finally(() => setLoading(false));
    }, [apiKey]);

    const chartData = usage?.history.map((d) => ({
        date: d.date.slice(5), // "MM-DD"
        requests: d.count,
    }));

    return (
        <Modal open={!!apiKey} onClose={onClose} title={apiKey ? `Usage — ${apiKey.name}` : 'Usage'}>
            {loading ? (
                <p className="py-8 text-center text-sm text-slate-400">Loading usage…</p>
            ) : usage ? (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Used today</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{usage.used_today}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Remaining today</p>
                            <p className="text-lg font-semibold text-brand-primary">{usage.remaining_today}</p>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-900">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Daily limit</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{usage.daily_limit}</p>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                            Requests — last 30 days
                        </p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} interval={4} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid #e2e8f0' }}
                                    labelFormatter={(label) => `Date: ${label}`}
                                />
                                <Bar dataKey="requests" fill="var(--brand-primary)" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ) : (
                <p className="py-8 text-center text-sm text-red-500">Failed to load usage data.</p>
            )}
        </Modal>
    );
}
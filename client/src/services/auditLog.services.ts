
import { api } from '../api/apiClient';
import { type AuditLogResponse } from '../types/auditLog';

interface AuditLogFilters {
  action?: string;
  from?: string;
  to?: string;
  page?: number;
}

export async function listAuditLogs(filters: AuditLogFilters): Promise<AuditLogResponse> {
  const { data } = await api.get('/audit', { params: filters });
  return data;
}
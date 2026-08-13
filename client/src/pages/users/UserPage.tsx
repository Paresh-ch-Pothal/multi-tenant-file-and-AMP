import { useState, useEffect, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import { type TenantUser } from '../../types/user';
import { type Role } from '../../types/role';
import * as userService from '../../services/user.services';
import * as roleService from '../../services/role.services';

import { formatDate } from '../../utils/format';
import { Button } from '../../components/UI/Buttons';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { Select } from '../../components/UI/Select';
import { Badge } from '../../components/UI/Badge';

function statusVariant(status: TenantUser['status']) {
  if (status === 'active') return 'success' as const;
  if (status === 'invited') return 'warning' as const;
  return 'neutral' as const;
}

export function UsersPage() {
  const [users, setUsers] = useState<TenantUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([userService.listUsers(), roleService.listRoles()]);
      setUsers(usersData);
      setRoles(rolesData);
      if (rolesData.length > 0 && !roleId) setRoleId(rolesData[0]._id);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load team.');
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleInvite() {
    if (!email.trim() || !roleId) return;
    try {
      await userService.inviteUser(email.trim(), roleId);
      setInviteOpen(false);
      setEmail('');
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to send invite.');
    }
  }

  function roleName(role_id: TenantUser['role_id']) {
    if (typeof role_id === 'object') return role_id.role_name;
    return roles.find((r) => r._id === role_id)?.role_name || '—';
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Team</h1>
          <p className="text-sm text-slate-500">Manage who has access to your organization.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)} disabled={roles.length === 0}>
          <UserPlus size={16} /> Invite member
        </Button>
      </div>

      {roles.length === 0 && !loading && (
        <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Create a role first before inviting team members.
        </div>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Invited</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No team members yet.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-900">{user.email}</td>
                  <td className="px-4 py-2.5 text-slate-500">{roleName(user.role_id)}</td>
                  <td className="px-4 py-2.5"><Badge variant={statusVariant(user.status)}>{user.status}</Badge></td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(user.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite team member">
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            placeholder="jane@acme.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Select label="Role" value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>{r.role_name}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={!email.trim() || !roleId}>Send invite</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
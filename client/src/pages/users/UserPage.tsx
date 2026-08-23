import { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
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
import { TableEmptyState, TableLoadingRows } from '../../components/UI/TableStates';

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

  const [editTarget, setEditTarget] = useState<TenantUser | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRoleId, setEditRoleId] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<TenantUser | null>(null);

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

  function openEdit(user: TenantUser) {
    setEditTarget(user);
    setEditEmail(user.email);
    const currentRoleId = typeof user.role_id === 'object' ? user.role_id?._id : user.role_id;
    setEditRoleId(currentRoleId || '');
  }

  async function handleUpdate() {
    if (!editTarget || !editEmail.trim()) return;
    try {
      await userService.updateUser(editTarget._id, {
        email: editEmail.trim(),
        role_id: editRoleId || null,
      });
      setEditTarget(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update user.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await userService.deleteUser(deleteTarget._id);
      setDeleteTarget(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete user.');
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
              <th className="w-20 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableLoadingRows columns={5} />
            ) : users.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                icon={UserPlus}
                title="No team members yet"
                description="Invite your first team member to start collaborating."
                action={
                  <Button onClick={() => setInviteOpen(true)} disabled={roles.length === 0}>
                    <UserPlus size={14} /> Invite member
                  </Button>
                }
              />
            ) : (
              users.map((user) => (
                <tr key={user._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-900">{user.email}</td>
                  <td className="px-4 py-2.5">
                    {user.role_id ? (
                      <span className="text-slate-500">{roleName(user.role_id)}</span>
                    ) : (
                      <Badge variant="warning">No role assigned</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5"><Badge variant={statusVariant(user.status)}>{user.status}</Badge></td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        title="Edit user"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(user)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete user"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
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

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit team member">
        <div className="space-y-4">
          <Input
            label="Email address"
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            autoFocus
          />
          <Select label="Role" value={editRoleId} onChange={(e) => setEditRoleId(e.target.value)}>
            <option value="">No role assigned</option>
            {roles.map((r) => (
              <option key={r._id} value={r._id}>{r.role_name}</option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!editEmail.trim()}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove team member">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Remove "{deleteTarget?.email}" from your organization? They will lose access immediately.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Remove</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
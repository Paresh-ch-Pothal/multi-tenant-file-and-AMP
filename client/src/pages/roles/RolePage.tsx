import { useState, useEffect, useCallback } from 'react';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { type Role, type Permission, ALL_PERMISSIONS } from '../../types/role';
import * as roleService from '../../services/role.services';
import { Button } from '../../components/UI/Buttons';
import { Input } from '../../components/UI/Input';
import { Modal } from '../../components/UI/Modal';
import { Checkbox } from '../../components/UI/Checkbox';


export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);

  const [editTarget, setEditTarget] = useState<Role | null>(null);
  const [editName, setEditName] = useState('');
  const [editPerms, setEditPerms] = useState<Permission[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleteResult, setDeleteResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roleService.listRoles();
      setRoles(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function togglePerm(perm: Permission, checked: boolean) {
    setSelectedPerms((prev) => (checked ? [...prev, perm] : prev.filter((p) => p !== perm)));
  }

  async function handleCreate() {
    if (!roleName.trim() || selectedPerms.length === 0) return;
    try {
      await roleService.createRole(roleName.trim(), selectedPerms);
      setCreateOpen(false);
      setRoleName('');
      setSelectedPerms([]);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create role.');
    }
  }

  function openEdit(role: Role) {
    setEditTarget(role);
    setEditName(role.role_name);
    setEditPerms(role.permissions);
  }

  function toggleEditPerm(perm: Permission, checked: boolean) {
    setEditPerms((prev) => (checked ? [...prev, perm] : prev.filter((p) => p !== perm)));
  }

  async function handleUpdate() {
    if (!editTarget || !editName.trim() || editPerms.length === 0) return;
    try {
      await roleService.updateRole(editTarget._id, editName.trim(), editPerms);
      setEditTarget(null);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to update role.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const result = await roleService.deleteRole(deleteTarget._id);
      setDeleteResult(`Role deleted. ${result.users_unassigned} user(s) now have no role assigned.`);
      setDeleteTarget(null);
      load();
      setTimeout(() => setDeleteResult(null), 4000);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete role.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Roles</h1>
          <p className="text-sm text-slate-500">Define what team members are allowed to do.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> New role
        </Button>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
              <div className="mt-3 space-y-1.5">
                <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))
        ) : roles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center gap-2 py-12 text-center">
            <Shield size={32} className="text-slate-300" />
            <p className="text-sm font-medium text-slate-700">No roles yet</p>
            <p className="max-w-xs text-xs text-slate-400">Create your first role to start inviting team members.</p>
            <Button onClick={() => setCreateOpen(true)} className="mt-2">
              <Plus size={14} /> New role
            </Button>
          </div>
        ) : (
          roles.map((role) => (
            <div key={role._id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-brand-primary" />
                  <h3 className="font-medium text-slate-900">{role.role_name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(role)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    title="Edit role"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(role)}
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete role"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {role.permissions.map((p) => (
                  <li key={p} className="text-xs text-slate-500">
                    {ALL_PERMISSIONS.find((ap) => ap.value === p)?.label || p}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New role">
        <div className="space-y-4">
          <Input
            label="Role name"
            placeholder="e.g. Resume Reviewer"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            autoFocus
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Permissions</label>
            <div className="space-y-2 rounded border border-slate-200 p-3">
              {ALL_PERMISSIONS.map(({ value, label }) => (
                <Checkbox
                  key={value}
                  label={label}
                  checked={selectedPerms.includes(value)}
                  onChange={(checked) => togglePerm(value, checked)}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!roleName.trim() || selectedPerms.length === 0}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
      {deleteResult && (
        <div className="fixed bottom-4 right-4 rounded border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 shadow-lg">
          {deleteResult}
        </div>
      )}

      <Modal open={!!editTarget} onClose={() => setEditTarget(null)} title="Edit role">
        <div className="space-y-4">
          <Input
            label="Role name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Permissions</label>
            <div className="space-y-2 rounded border border-slate-200 p-3">
              {ALL_PERMISSIONS.map(({ value, label }) => (
                <Checkbox
                  key={value}
                  label={label}
                  checked={editPerms.includes(value)}
                  onChange={(checked) => toggleEditPerm(value, checked)}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!editName.trim() || editPerms.length === 0}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete role">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Delete "{deleteTarget?.role_name}"? Any team members currently assigned this role will
            have their role removed and will lose access until reassigned.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete role</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
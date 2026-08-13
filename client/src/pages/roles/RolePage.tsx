import { useState, useEffect, useCallback } from 'react';
import { Plus, Shield } from 'lucide-react';
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
          <p className="text-sm text-slate-400">Loading…</p>
        ) : roles.length === 0 ? (
          <p className="text-sm text-slate-400">No roles yet — create one to start inviting your team.</p>
        ) : (
          roles.map((role) => (
            <div key={role._id} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-brand-primary" />
                <h3 className="font-medium text-slate-900">{role.role_name}</h3>
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
    </div>
  );
}
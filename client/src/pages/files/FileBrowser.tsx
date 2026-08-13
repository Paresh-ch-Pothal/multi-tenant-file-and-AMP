import { useState, useEffect, useCallback, useRef } from 'react';
import { Folder, File as FileIcon, Plus, Upload, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { type Node } from '../../types/node';
import * as nodeService from '../../services/node.services';

import { formatBytes, formatDate } from '../../utils/format';
import { Button } from '../../components/UI/Buttons';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';

interface Crumb {
  id: string | null;
  name: string;
}

export function FileBrowser() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Crumb[]>([{ id: null, name: 'Home' }]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameTarget, setRenameTarget] = useState<Node | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Node | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (folderId: string | null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await nodeService.listNodes(folderId);
      setNodes(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to load folder contents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(currentFolderId);
  }, [currentFolderId, load]);

  function navigateInto(node: Node) {
    if (node.type !== 'folder') return;
    setCurrentFolderId(node._id);
    setBreadcrumbs((prev) => [...prev, { id: node._id, name: node.name }]);
  }

  function navigateToCrumb(id: string | null) {
    const idx = breadcrumbs.findIndex((c) => c.id === id);
    setBreadcrumbs((prev) => prev.slice(0, idx + 1));
    setCurrentFolderId(id);
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    try {
      await nodeService.createFolder(newFolderName.trim(), currentFolderId);
      setNewFolderName('');
      setCreateFolderOpen(false);
      load(currentFolderId);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to create folder.');
    }
  }

  async function handleRename() {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await nodeService.renameNode(renameTarget._id, renameValue.trim());
      setRenameTarget(null);
      load(currentFolderId);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to rename.');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await nodeService.deleteNode(deleteTarget._id);
      setDeleteTarget(null);
      load(currentFolderId);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to delete.');
    }
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentFolderId) {
      if (!currentFolderId) setError('Select a folder before uploading — you cannot upload to the root.');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      await nodeService.uploadFile(file, currentFolderId);
      load(currentFolderId);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-4">
      {/* breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-slate-500">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.id ?? 'root'} className="flex items-center gap-1">
            {i > 0 && <span className="text-slate-300">/</span>}
            <button
              onClick={() => navigateToCrumb(crumb.id)}
              className={`hover:text-brand-primary ${i === breadcrumbs.length - 1 ? 'font-medium text-slate-900' : ''}`}
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </nav>

      {/* toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">
          {breadcrumbs[breadcrumbs.length - 1].name}
        </h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCreateFolderOpen(true)}>
            <Plus size={16} /> New folder
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload size={16} /> {uploading ? 'Uploading…' : 'Upload'}
          </Button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelected} />
        </div>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Size</th>
              <th className="px-4 py-2.5">Modified</th>
              <th className="w-10 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Loading…</td></tr>
            ) : nodes.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">This folder is empty.</td></tr>
            ) : (
              nodes.map((node) => (
                <tr key={node._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => navigateInto(node)}
                      disabled={node.type !== 'folder'}
                      className="flex items-center gap-2 text-left disabled:cursor-default"
                    >
                      {node.type === 'folder' ? (
                        <Folder size={16} className="shrink-0 text-brand-primary" />
                      ) : (
                        <FileIcon size={16} className="shrink-0 text-slate-400" />
                      )}
                      <span className={node.type === 'folder' ? 'font-medium text-slate-900 hover:underline' : 'text-slate-700'}>
                        {node.name}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {node.file_metadata ? formatBytes(node.file_metadata.size_bytes) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(node.updated_at)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setRenameTarget(node);
                          setRenameValue(node.name);
                        }}
                        title="Rename"
                        aria-label="Rename"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(node)}
                        title="Delete"
                        aria-label="Delete"
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* create folder modal */}
      <Modal open={createFolderOpen} onClose={() => setCreateFolderOpen(false)} title="New folder">
        <div className="space-y-4">
          <Input
            label="Folder name"
            placeholder="e.g. resumes"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCreateFolderOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </div>
        </div>
      </Modal>

      {/* rename modal */}
      <Modal open={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rename">
        <div className="space-y-4">
          <Input
            label="New name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleRename}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* delete confirm modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {deleteTarget?.type === 'folder'
              ? `Delete "${deleteTarget?.name}" and everything inside it? This cannot be undone.`
              : `Delete "${deleteTarget?.name}"? This cannot be undone.`}
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
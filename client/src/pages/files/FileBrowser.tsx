import { useState, useEffect, useCallback, useRef } from 'react';
import { Folder, File as FileIcon, Plus, Upload, Pencil, Trash2, Globe, Eye, Info, FolderOpen } from 'lucide-react';
import { type Node } from '../../types/node';
import * as nodeService from '../../services/node.services';

import { formatBytes, formatDate } from '../../utils/format';
import { Button } from '../../components/UI/Buttons';
import { Modal } from '../../components/UI/Modal';
import { Input } from '../../components/UI/Input';
import { Textarea } from '../../components/UI/Textarea';
import { Checkbox } from '../../components/UI/Checkbox';
import { TagInput } from '../../components/UI/TagInput';
import { FilePicker } from '../../components/UI/FilePicker';
import { TableEmptyState, TableLoadingRows } from '../../components/UI/TableStates';

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
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderTags, setNewFolderTags] = useState<string[]>([]);
  const [newFolderPublicUpload, setNewFolderPublicUpload] = useState(false);
  const [newFolderVisibleExternal, setNewFolderVisibleExternal] = useState(false);
  const [newFolderThumbnail, setNewFolderThumbnail] = useState<File | null>(null);

  const [editDetailsTarget, setEditDetailsTarget] = useState<Node | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editVisibleExternal, setEditVisibleExternal] = useState(false);
  const [editThumbnailFile, setEditThumbnailFile] = useState<File | null>(null);
  const [savingDetails, setSavingDetails] = useState(false);



  const [renameTarget, setRenameTarget] = useState<Node | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Node | null>(null);
  // const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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
      const folder = await nodeService.createFolder(newFolderName.trim(), currentFolderId, {
        description: newFolderDescription.trim() || undefined,
        tags: newFolderTags,
        is_public_upload: newFolderPublicUpload,
        is_visible_external: newFolderVisibleExternal,
      });

      // thumbnail requires the node to exist first — separate call once we have the new folder's id
      if (newFolderThumbnail) {
        try {
          await nodeService.uploadThumbnail(folder._id, newFolderThumbnail);
        } catch {
          // folder was created successfully even if the thumbnail failed — don't block on this
          setError('Folder created, but the thumbnail failed to upload. You can add one later.');
        }
      }

      setNewFolderName('');
      setNewFolderDescription('');
      setNewFolderTags([]);
      setNewFolderPublicUpload(false);
      setNewFolderVisibleExternal(false);
      setNewFolderThumbnail(null);
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

  function openEditDetails(node: Node) {
    setEditDetailsTarget(node);
    setEditDescription(node.description || '');
    setEditTags(node.tags || []);
    setEditVisibleExternal(node.is_visible_external);
    setEditThumbnailFile(null);
  }

  async function handleSaveDetails() {
    if (!editDetailsTarget) return;
    setSavingDetails(true);
    setError(null);
    try {
      await nodeService.updateNodeMetadata(editDetailsTarget._id, {
        description: editDescription.trim(),
        tags: editTags,
        is_visible_external: editVisibleExternal,
      });

      if (editThumbnailFile) {
        await nodeService.uploadThumbnail(editDetailsTarget._id, editThumbnailFile);
      }

      setEditDetailsTarget(null);
      load(currentFolderId);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to save details.');
    } finally {
      setSavingDetails(false);
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
              <TableLoadingRows columns={4} />
            ) : nodes.length === 0 ? (
              <TableEmptyState
                colSpan={4}
                icon={FolderOpen}
                title="This folder is empty"
                description="Upload a file or create a subfolder to get started."
                action={
                  <Button variant="secondary" onClick={() => setCreateFolderOpen(true)}>
                    <Plus size={14} /> New folder
                  </Button>
                }
              />
            ) : (
              nodes.map((node) => (
                <tr key={node._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => navigateInto(node)}
                      disabled={node.type !== 'folder'}
                      className="flex items-center gap-2 text-left disabled:cursor-default"
                    >
                      {node.thumbnail_url ? (
                        <img
                          src={node.thumbnail_url}
                          alt=""
                          className="h-5 w-5 shrink-0 rounded object-cover"
                        />
                      ) : node.type === 'folder' ? (
                        <Folder size={16} className="shrink-0 text-brand-primary" />
                      ) : (
                        <FileIcon size={16} className="shrink-0 text-slate-400" />
                      )}
                      <span className={node.type === 'folder' ? 'font-medium text-slate-900 hover:underline' : 'text-slate-700'}>
                        {node.name}
                      </span>
                      {node.type === 'folder' && node.is_public_upload && (
                        <Globe size={12} className="shrink-0 text-green-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {node.file_metadata ? formatBytes(node.file_metadata.size_bytes) : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">{formatDate(node.updated_at)}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {node.type === 'folder' && (
                        <button
                          onClick={async () => {
                            await nodeService.togglePublicUpload(node._id, !node.is_public_upload);
                            load(currentFolderId);
                          }}
                          title={node.is_public_upload ? 'Disable public upload' : 'Enable public upload'}
                          aria-label="Toggle public upload"
                          className={`rounded p-1 transition-colors ${node.is_public_upload
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            }`}
                        >
                          <Globe size={16} />
                        </button>
                      )}

                      <button
                        onClick={async () => {
                          await nodeService.toggleVisibleExternal(node._id, !node.is_visible_external);
                          load(currentFolderId);
                        }}
                        title={node.is_visible_external ? 'Hide from external catalog' : 'Show in external catalog'}
                        aria-label="Toggle external visibility"
                        className={`rounded p-1 transition-colors ${node.is_visible_external
                          ? 'text-brand-primary hover:bg-brand-primary/10'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }`}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => openEditDetails(node)}
                        title="Edit details"
                        aria-label="Edit details"
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      >
                        <Info size={16} />
                      </button>
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
          <Textarea
            label="Description (optional)"
            placeholder="What's in this folder?"
            value={newFolderDescription}
            onChange={(e) => setNewFolderDescription(e.target.value)}
          />
          <TagInput
            label="Tags (optional)"
            tags={newFolderTags}
            onChange={setNewFolderTags}
          />
          <FilePicker
            label="Thumbnail (optional)"
            file={newFolderThumbnail}
            onChange={setNewFolderThumbnail}
          />
          <div className="space-y-2 rounded border border-slate-200 p-3">
            <Checkbox
              label="Accept public uploads (no login required)"
              checked={newFolderPublicUpload}
              onChange={setNewFolderPublicUpload}
            />
            <Checkbox
              label="Show in external catalog"
              checked={newFolderVisibleExternal}
              onChange={setNewFolderVisibleExternal}
            />
          </div>
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

      {/* edit details modal */}
      <Modal open={!!editDetailsTarget} onClose={() => setEditDetailsTarget(null)} title="Edit details">
        {editDetailsTarget && (
          <div className="space-y-4">
            <FilePicker
              label="Thumbnail"
              file={editThumbnailFile}
              onChange={setEditThumbnailFile}
            />
            {!editThumbnailFile && editDetailsTarget.thumbnail_url && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <img
                  src={editDetailsTarget.thumbnail_url}
                  alt=""
                  className="h-8 w-8 rounded border border-slate-200 object-cover"
                />
                Current thumbnail — pick a new image above to replace it
              </div>
            )}

            <Textarea
              label="Description"
              placeholder="Add a description…"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <TagInput
              label="Tags"
              tags={editTags}
              onChange={setEditTags}
            />

            <Checkbox
              label="Show in external catalog"
              checked={editVisibleExternal}
              onChange={setEditVisibleExternal}
            />

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="secondary" onClick={() => setEditDetailsTarget(null)}>Cancel</Button>
              <Button onClick={handleSaveDetails} disabled={savingDetails}>
                {savingDetails ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        )}
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
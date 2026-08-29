
import { api } from '../api/apiClient';
import { type Node } from '../types/node';

interface CreateFolderOptions {
  description?: string;
  tags?: string[];
  is_public_upload?: boolean;
  is_visible_external?: boolean;
}

export async function listNodes(parentId: string | null): Promise<Node[]> {
  const { data } = await api.get('/nodes', {
    params: parentId ? { parent_id: parentId } : {},
  });
  return data;
}

export async function createFolder(
  name: string,
  parentId: string | null,
  options: CreateFolderOptions = {}
): Promise<Node> {
  const { data } = await api.post('/nodes/createFolder', {
    name,
    parent_id: parentId,
    ...options,
  });
  return data;
}

export async function renameNode(id: string, name: string): Promise<Node> {
  const { data } = await api.patch(`/nodes/${id}`, { name });
  return data;
}

export async function deleteNode(id: string): Promise<{ deleted_count: number; files_deleted: number }> {
  const { data } = await api.delete(`/nodes/${id}`);
  return data;
}

export async function uploadFile(file: File, parentId: string, onProgress?: (pct: number) => void): Promise<Node> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('parent_id', parentId);

  const { data } = await api.post('/nodes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}

export async function togglePublicUpload(id: string, isPublic: boolean): Promise<Node> {
  const { data } = await api.patch(`/nodes/${id}/public-upload`, { is_public_upload: isPublic });
  return data;
}

export async function toggleVisibleExternal(id: string, isVisible: boolean): Promise<Node> {
  const { data } = await api.patch(`/nodes/${id}/metadata`, { is_visible_external: isVisible });
  return data;
}

export async function uploadThumbnail(nodeId: string, file: File): Promise<Node> {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const { data } = await api.post(`/nodes/${nodeId}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

interface UpdateMetadataOptions {
  description?: string;
  tags?: string[];
  is_visible_external?: boolean;
}

export async function updateNodeMetadata(id: string, updates: UpdateMetadataOptions): Promise<Node> {
  const { data } = await api.patch(`/nodes/${id}/metadata`, updates);
  return data;
}

export async function getDownloadUrl(nodeId: string): Promise<{ download_url: string; file_name: string }> {
  const { data } = await api.get(`/nodes/${nodeId}/download-url`);
  return data;
}
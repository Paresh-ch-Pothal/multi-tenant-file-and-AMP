
import { api } from '../api/apiClient';
import { type Node } from '../types/node';

export async function listNodes(parentId: string | null): Promise<Node[]> {
  const { data } = await api.get('/nodes', {
    params: parentId ? { parent_id: parentId } : {},
  });
  return data;
}

export async function createFolder(name: string, parentId: string | null): Promise<Node> {
  const { data } = await api.post('/nodes/createFolder', {
    name,
    parent_id: parentId,
  });
  console.log(data)
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
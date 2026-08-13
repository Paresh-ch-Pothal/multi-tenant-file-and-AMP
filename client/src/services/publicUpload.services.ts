import axios from 'axios';

const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/v1',
});
// deliberately NOT using the shared `api` client — no auth interceptor,
// no 401-redirect-to-login behavior, since this page has no session at all

export async function publicUploadFile(
  file: File,
  folderId: string,
  onProgress?: (pct: number) => void
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('parent_id', folderId);

  const { data } = await publicApi.post('/nodes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
  return data;
}
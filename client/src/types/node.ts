export interface FileMetadata {
  storage_key: string;
  size_bytes: number;
  mime_type: string;
  original_name: string;
}

export interface Node {
  _id: string;
  client_id: string;
  type: 'folder' | 'file';
  name: string;
  parent_id: string | null;
  ancestors: string[];
  is_public_upload: boolean;
  file_metadata: FileMetadata | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
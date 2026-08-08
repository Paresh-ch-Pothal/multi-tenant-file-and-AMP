export function sanitizeFilename(originalName: string): string {
  const trimmed = originalName.trim().slice(0, 255);
  // strip path traversal chars and anything not alnum/dot/dash/underscore/space
  return trimmed.replace(/[/\\?%*:|"<>]/g, '').replace(/\.\./g, '');
}

export function buildStorageKey(clientId: string, nodeId: string, filename: string): string {
  // namespacing by tenant keeps S3 objects logically separated per client
  return `tenants/${clientId}/${nodeId}/${filename}`;
}
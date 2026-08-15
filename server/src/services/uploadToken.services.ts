import jwt from 'jsonwebtoken';

interface UploadTokenPayload {
  folderId: string;
  clientId: string;
  purpose: 'public_upload';
}

export function generateUploadToken(folderId: string, clientId: string): string {
  const payload: UploadTokenPayload = { folderId, clientId, purpose: 'public_upload' };
  return jwt.sign(payload, process.env.JWT_SECRET as string, { expiresIn: '15m' });
}

export function verifyUploadToken(token: string): UploadTokenPayload | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UploadTokenPayload;
    if (decoded.purpose !== 'public_upload') return null;
    return decoded;
  } catch {
    return null;
  }
}
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

export function generateApiKeyPair(): { keyId: string; secret: string } {
  const keyId = `client_key_live_${randomBytes(8).toString('hex')}`;
  const secret = randomBytes(24).toString('hex');
  return { keyId, secret };
}

export async function hashSecret(secret: string): Promise<string> {
  return bcrypt.hash(secret, 10);
}

export async function verifySecret(secret: string, hash: string): Promise<boolean> {
  return bcrypt.compare(secret, hash);
}
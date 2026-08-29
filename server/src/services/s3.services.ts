import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { s3Client, S3_BUCKET, S3_PUBLIC_BUCKET } from '../config/s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function uploadToS3(params: {
  storageKey: string;
  body: Readable | Buffer;
  contentType: string;
}): Promise<void> {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: S3_BUCKET,
      Key: params.storageKey,
      Body: params.body,
      ContentType: params.contentType,
    },
  });

  await upload.done();
}

export async function deleteFromS3(storageKey: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: storageKey })
  );
}

export async function deleteManyFromS3(storageKeys: string[]): Promise<void> {
  if (storageKeys.length === 0) return;

  // S3 batch delete allows max 1000 keys per call
  const chunks: string[][] = [];
  for (let i = 0; i < storageKeys.length; i += 1000) {
    chunks.push(storageKeys.slice(i, i + 1000));
  }

  for (const chunk of chunks) {
    await s3Client.send(
      new DeleteObjectsCommand({
        Bucket: S3_BUCKET,
        Delete: { Objects: chunk.map((key) => ({ Key: key })) },
      })
    );
  }
}


export async function uploadPublicThumbnail(params: {
  storageKey: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_PUBLIC_BUCKET,
      Key: params.storageKey,
      Body: params.body,
      ContentType: params.contentType,
    })
  );

  return `https://${S3_PUBLIC_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.storageKey}`;
}


export async function deleteFromPublicBucket(storageKey: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: S3_PUBLIC_BUCKET, Key: storageKey })
  );
}


export function extractKeyFromPublicUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\//, ''); // strip leading slash
  } catch {
    return null;
  }
}


export async function getSignedFileUrl(storageKey: string, expiresInSeconds = 300): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: storageKey,
  });

  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
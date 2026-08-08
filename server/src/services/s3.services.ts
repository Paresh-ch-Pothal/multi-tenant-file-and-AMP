import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { s3Client, S3_BUCKET } from '../config/s3';

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
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Node } from '../models/node';
import { buildScopeFilter } from '../services/scopedFilter';
import { writeAuditLog } from '../services/auditLog.services';
import { buildStorageKey, sanitizeFilename } from '../services/sanitization';
import { deleteFromPublicBucket, deleteFromS3, deleteManyFromS3, extractKeyFromPublicUrl, uploadPublicThumbnail, uploadToS3 } from '../services/s3.services';
import { generateUploadToken, verifyUploadToken } from '../services/uploadToken.services';


export async function uploadFile(req: Request, res: Response) {
  const file = req.file; // from multer
  const { parent_id, description, tags } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'file is required' });
  }
  if (!parent_id || !Types.ObjectId.isValid(parent_id)) {
    return res.status(400).json({ error: 'valid parent_id is required' });
  }

  // resolve target folder — works for both authenticated and public upload paths
  const parentFolder = await Node.findOne({ _id: parent_id, is_deleted: false, type: 'folder' });
  console.log(parentFolder)
  if (!parentFolder) {
    return res.status(404).json({ error: 'target folder not found' });
  }

  // public upload check — happens AFTER resolving the node, not before (per your doc's Section 7)
  const isAuthenticated = !!req.tenantUser;

  if (!isAuthenticated) {
    if (!parentFolder.is_public_upload) {
      return res.status(403).json({ error: 'this folder does not accept public uploads' });
    }

    const uploadToken = req.body.upload_token || req.headers['x-upload-token'];
    if (!uploadToken) {
      return res.status(401).json({ error: 'upload_token is required for public uploads' });
    }

    const tokenPayload = verifyUploadToken(uploadToken as string);
    if (!tokenPayload) {
      return res.status(401).json({ error: 'invalid or expired upload token' });
    }
    if (tokenPayload.folderId !== parentFolder._id.toString()) {
      return res.status(403).json({ error: 'upload token does not match this folder' });
    }
  }

  // if authenticated, enforce tenant + scope match
  if (isAuthenticated) {
    if (!parentFolder.client_id.equals(req.tenantUser!.client_id)) {
      return res.status(404).json({ error: 'target folder not found' });
    }
  }

  const cleanFilename = sanitizeFilename(file.originalname);

  // 1. insert a "pending" node doc BEFORE streaming to S3 (per your doc's failure-mode mitigation)
  const pendingNode = await Node.create({
    client_id: parentFolder.client_id,
    type: 'file',
    name: cleanFilename,
    parent_id: parentFolder._id,
    ancestors: [...parentFolder.ancestors, parentFolder._id],
    is_public_upload: false,
    file_metadata: {
      storage_key: '', // filled in after upload succeeds
      size_bytes: file.size,
      mime_type: file.mimetype,
      original_name: cleanFilename,
    },
    is_deleted: false,
    created_by: isAuthenticated
      ? { actor_type: 'user', actor_id: req.tenantUser!._id }
      : { actor_type: 'public', actor_id: null },
    upload_status: 'pending', // see schema note below
    description: description || null,
    tags: Array.isArray(tags) ? tags : [],
    thumbnail_url: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  const storageKey = buildStorageKey(
    parentFolder.client_id.toString(),
    pendingNode._id.toString(),
    cleanFilename
  );

  try {
    // 2. stream to S3
    await uploadToS3({
      storageKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    // 3. flip to complete, fill in storage_key
    pendingNode.file_metadata!.storage_key = storageKey;
    (pendingNode as any).upload_status = 'complete';
    await pendingNode.save();

    // 4. audit log — non-blocking on its own failure
    await writeAuditLog({
      clientId: parentFolder.client_id,
      actor: isAuthenticated
        ? { type: 'user', id: req.tenantUser!._id, label: null }
        : { type: 'public', id: null, label: null },
      action: 'node.upload_file',
      target: { node_id: pendingNode._id, parent_id: parentFolder._id },
      metadata: { file_name: cleanFilename, size_bytes: file.size },
      status: 'success',
      req,
    });

    return res.status(201).json(pendingNode);
  } catch (err) {
    console.error(err);

    // S3 upload failed — clean up the pending node doc
    await Node.deleteOne({ _id: pendingNode._id });

    // best-effort cleanup if partial object landed in S3
    await deleteFromS3(storageKey).catch(() => { });

    await writeAuditLog({
      clientId: parentFolder.client_id,
      actor: isAuthenticated
        ? { type: 'user', id: req.tenantUser!._id, label: null }
        : { type: 'public', id: null, label: null },
      action: 'node.upload_file',
      target: { parent_id: parentFolder._id },
      metadata: { file_name: cleanFilename, error: (err as Error).message },
      status: 'failure',
      req,
    });

    return res.status(500).json({ error: 'file upload failed' });
  }
}


export async function createFolder(req: Request, res: Response) {
  try {
    const { name, parent_id, description, tags, is_public_upload, is_visible_external } = req.body;
    const clientId = req.clientId;

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!clientId) return res.status(401).json({ error: 'unauthenticated' });

    let ancestors: Types.ObjectId[] = [];
    let parentObjectId: Types.ObjectId | null = null;

    if (parent_id) {
      if (!Types.ObjectId.isValid(parent_id)) {
        return res.status(400).json({ error: 'invalid parent_id' });
      }
      const parent = await Node.findOne({ _id: parent_id, client_id: clientId, is_deleted: false });
      if (!parent) return res.status(404).json({ error: 'parent folder not found' });
      if (parent.type !== 'folder') return res.status(400).json({ error: 'parent must be a folder' });

      ancestors = [...parent.ancestors, parent._id];
      parentObjectId = parent._id;
    }

    const newFolder = await Node.create({
      client_id: clientId,
      type: 'folder',
      name,
      parent_id: parentObjectId,
      ancestors,
      is_public_upload: typeof is_public_upload === 'boolean' ? is_public_upload : false,
      is_visible_external: typeof is_visible_external === 'boolean' ? is_visible_external : false,
      description: description || null,
      tags: Array.isArray(tags) ? tags : [],
      thumbnail_url: null,
      file_metadata: null,
      is_deleted: false,
      created_by: { actor_type: 'user', actor_id: req.userId || null },
      created_at: new Date(),
      updated_at: new Date(),
    });

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: {
        type: 'user',
        id: req.tenantUser!._id,
        label: null, // could look up email if you want it in the log directly
      },
      action: 'node.create_folder',
      target: { node_id: newFolder._id, parent_id: newFolder.parent_id },
      metadata: { name: newFolder.name },
      status: 'success',
      req,
    });

    return res.status(201).json(newFolder);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export async function listNodes(req: Request, res: Response) {
  try {
    const clientId = req.tenantUser!.client_id; // now comes from RBAC middleware, not JWT directly
    const parentIdParam = req.query.parent_id as string | undefined;

    let parentId: Types.ObjectId | null = null;
    if (parentIdParam) {
      if (!Types.ObjectId.isValid(parentIdParam)) {
        return res.status(400).json({ error: 'invalid parent_id' });
      }
      parentId = new Types.ObjectId(parentIdParam);
    }

    const scopeFilter = buildScopeFilter(req.tenantUser!.scoped_folder_ids); // ← new line

    const children = await Node.find({
      client_id: clientId,
      parent_id: parentId,
      is_deleted: false,
      ...scopeFilter, // ← spread the extra restriction into the query
    }).sort({ type: 1, name: 1 });

    return res.json(children);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}


export async function renameNode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid node id' });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }

    const scopeFilter = buildScopeFilter(req.tenantUser!.scoped_folder_ids);

    const node = await Node.findOne({
      _id: id,
      client_id: req.tenantUser!.client_id,
      is_deleted: false,
      ...scopeFilter,
    });

    if (!node) {
      return res.status(404).json({ error: 'node not found' });
    }

    const oldName = node.name;
    node.name = name;
    node.updated_at = new Date();
    await node.save();

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'node.rename',
      target: { node_id: node._id, parent_id: node.parent_id },
      metadata: { old_name: oldName, new_name: name },
      status: 'success',
      req,
    });

    return res.json(node);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export async function deleteNode(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid node id' });
    }

    const scopeFilter = buildScopeFilter(req.tenantUser!.scoped_folder_ids);
    const clientId = req.tenantUser!.client_id;

    const target = await Node.findOne({ _id: id, client_id: clientId, is_deleted: false, ...scopeFilter });
    if (!target) {
      return res.status(404).json({ error: 'node not found' });
    }

    // 1. find target + all descendants
    const allMatches = await Node.find({
      client_id: clientId,
      is_deleted: false,
      $or: [{ _id: target._id }, { ancestors: target._id }],
    });

    // 2. extract storage_keys for every file
    const storageKeys = allMatches
      .filter((n) => n.type === 'file' && n.file_metadata?.storage_key)
      .map((n) => n.file_metadata!.storage_key);

    // 3. batch delete from S3
    try {
      await deleteManyFromS3(storageKeys);
    } catch (err) {
      // per your doc: log the failure, but still proceed with the DB soft-delete —
      // orphaned S3 objects can be caught by a periodic reconciliation job later
      console.error('partial S3 batch delete failure', err);
    }

    // 4. soft-delete matched node docs
    const idsToDelete = allMatches.map((n) => n._id);
    await Node.updateMany(
      { _id: { $in: idsToDelete } },
      { $set: { is_deleted: true, updated_at: new Date() } }
    );

    // 5. ONE audit log entry summarizing the batch — not one per file
    const action = target.type === 'folder' && allMatches.length > 1 ? 'node.cascade_delete' : 'node.delete';

    await writeAuditLog({
      clientId,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action,
      target: { node_id: target._id, parent_id: target.parent_id },
      metadata: {
        total_nodes_deleted: allMatches.length,
        files_deleted: storageKeys.length,
      },
      status: 'success',
      req,
    });

    return res.json({ deleted_count: allMatches.length, files_deleted: storageKeys.length });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}
// PATCH /api/v1/nodes/:id/metadata
export async function updateNodeMetadata(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { description, tags, is_visible_external } = req.body;

    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid node id' });
    }

    const scopeFilter = buildScopeFilter(req.tenantUser!.scoped_folder_ids);
    const node = await Node.findOne({
      _id: id,
      client_id: req.tenantUser!.client_id,
      is_deleted: false,
      ...scopeFilter,
    });
    if (!node) {
      return res.status(404).json({ error: 'node not found' });
    }

    if (description !== undefined) node.description = description;
    if (tags !== undefined) {
      if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string')) {
        return res.status(400).json({ error: 'tags must be an array of strings' });
      }
      node.tags = tags;
    }
    if (is_visible_external !== undefined) {
      if (typeof is_visible_external !== 'boolean') {
        return res.status(400).json({ error: 'is_visible_external must be true or false' });
      }
      node.is_visible_external = is_visible_external;
    }
    node.updated_at = new Date();
    await node.save();

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'node.metadata_update', // reusing closest existing action — see note below
      target: { node_id: node._id },
      metadata: { updated_fields: Object.keys(req.body) },
      status: 'success',
      req,
    });

    return res.json(node);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

export async function uploadThumbnail(req: Request, res: Response) {
  const file = req.file;
  const { id } = req.params;

  if (!file) {
    return res.status(400).json({ error: 'thumbnail file is required' });
  }
  if (!Types.ObjectId.isValid(id as any)) {
    return res.status(400).json({ error: 'invalid node id' });
  }

  // only allow common image types for a thumbnail
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return res.status(400).json({ error: 'thumbnail must be a JPEG, PNG, or WebP image' });
  }

  const scopeFilter = buildScopeFilter(req.tenantUser!.scoped_folder_ids);
  const node = await Node.findOne({
    _id: id,
    client_id: req.tenantUser!.client_id,
    is_deleted: false,
    ...scopeFilter,
  });
  if (!node) {
    return res.status(404).json({ error: 'node not found' });
  }

  const cleanFilename = sanitizeFilename(file.originalname);
  const storageKey = `tenants/${node.client_id}/thumbnails/${node._id}/${cleanFilename}`;

  try {
    const thumbnailUrl = await uploadPublicThumbnail({
      storageKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const oldThumbnailUrl = node.thumbnail_url;

    node.thumbnail_url = thumbnailUrl;
    await node.save();

    // clean up the old thumbnail from S3 if one existed and was replaced
    if (oldThumbnailUrl) {
      const oldKey = extractKeyFromPublicUrl(oldThumbnailUrl);
      if (oldKey && oldKey !== storageKey) {
        await deleteFromPublicBucket(oldKey).catch(() => { });
      }
    }

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'node.metadata_update',
      target: { node_id: node._id },
      metadata: { updated_field: 'thumbnail' },
      status: 'success',
      req,
    });

    return res.json(node);
  } catch (err) {
    console.error(err);
    await deleteFromPublicBucket(storageKey).catch(() => { });
    return res.status(500).json({ error: 'thumbnail upload failed' });
  }
}


// PATCH /api/v1/nodes/:id/public-upload
export async function togglePublicUpload(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { is_public_upload } = req.body;

    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid node id' });
    }
    if (typeof is_public_upload !== 'boolean') {
      return res.status(400).json({ error: 'is_public_upload must be true or false' });
    }

    const scopeFilter = buildScopeFilter(req.tenantUser!.scoped_folder_ids);
    const node = await Node.findOne({
      _id: id,
      client_id: req.tenantUser!.client_id,
      is_deleted: false,
      ...scopeFilter,
    });
    if (!node) {
      return res.status(404).json({ error: 'node not found' });
    }
    if (node.type !== 'folder') {
      return res.status(400).json({ error: 'only folders can accept public uploads' });
    }

    node.is_public_upload = is_public_upload;
    node.updated_at = new Date();
    await node.save();

    await writeAuditLog({
      clientId: req.tenantUser!.client_id,
      actor: { type: 'user', id: req.tenantUser!._id, label: null },
      action: 'node.metadata_update',
      target: { node_id: node._id },
      metadata: { is_public_upload },
      status: 'success',
      req,
    });

    return res.json(node);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}


// POST /api/v1/nodes/:id/upload-token
// Called by the developer's OWN BACKEND (with API key), never by a browser directly.
export async function createUploadToken(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid node id' });
    }

    const folder = await Node.findOne({
      _id: id,
      client_id: req.tenantUser!.client_id,
      is_deleted: false,
      type: 'folder',
    });

    if (!folder) {
      return res.status(404).json({ error: 'folder not found' });
    }
    if (!folder.is_public_upload) {
      return res.status(400).json({ error: 'this folder does not accept public uploads' });
    }

    const token = generateUploadToken(folder._id.toString(), folder.client_id.toString());

    return res.json({ upload_token: token, expires_in_seconds: 900 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}
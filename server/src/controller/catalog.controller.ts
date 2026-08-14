import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Node } from '../models/node';


// GET /api/v1/catalog/nodes?parent_id=
// Read-only, curated view for external/developer consumption.
// Only returns nodes explicitly marked is_visible_external: true.
export async function listCatalogNodes(req: Request, res: Response) {
  try {
    const clientId = req.tenantUser!.client_id; // set by requireAuthOrApiKey
    const parentIdParam = req.query.parent_id as string | undefined;

    let parentId: Types.ObjectId | null = null;
    if (parentIdParam) {
      if (!Types.ObjectId.isValid(parentIdParam)) {
        return res.status(400).json({ error: 'invalid parent_id' });
      }
      parentId = new Types.ObjectId(parentIdParam);
    }

    const visibleNodes = await Node.find({
      client_id: clientId,
      parent_id: parentId,
      is_visible_external: true,
      is_deleted: false,
    }).sort({ type: 1, name: 1 });

    // resolve ancestor names for each node — batch fetch to avoid N+1 queries
    const allAncestorIds = [...new Set(visibleNodes.flatMap((n) => n.ancestors.map((a) => a.toString())))];
    const ancestorDocs = await Node.find({ _id: { $in: allAncestorIds } }).select('_id name');
    const ancestorNameMap = new Map(ancestorDocs.map((doc) => [doc._id.toString(), doc.name]));

    const result = visibleNodes.map((node) => ({
      id: node._id,
      type: node.type,
      name: node.name,
      description: node.description,
      tags: node.tags,
      thumbnail_url: node.thumbnail_url,
      is_public_upload: node.is_public_upload,
      file_metadata: node.file_metadata,
      // human-readable path from root to this node's PARENT (not including itself)
      path: node.ancestors.map((ancestorId) => ({
        id: ancestorId,
        name: ancestorNameMap.get(ancestorId.toString()) || 'Unknown',
      })),
      updated_at: node.updated_at,
    }));

    return res.json({ nodes: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}

// GET /api/v1/catalog/nodes/:id — single node detail, e.g. for a "file detail" page
export async function getCatalogNode(req: Request, res: Response) {
  try {
    const clientId = req.tenantUser!.client_id;
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ error: 'invalid node id' });
    }

    const node = await Node.findOne({
      _id: id,
      client_id: clientId,
      is_visible_external: true,
      is_deleted: false,
    });

    if (!node) {
      return res.status(404).json({ error: 'not found' });
    }

    const ancestorDocs = await Node.find({ _id: { $in: node.ancestors } }).select('_id name');
    const ancestorNameMap = new Map(ancestorDocs.map((doc) => [doc._id.toString(), doc.name]));

    return res.json({
      id: node._id,
      type: node.type,
      name: node.name,
      description: node.description,
      tags: node.tags,
      thumbnail_url: node.thumbnail_url,
      is_public_upload: node.is_public_upload,
      file_metadata: node.file_metadata,
      path: node.ancestors.map((ancestorId) => ({
        id: ancestorId,
        name: ancestorNameMap.get(ancestorId.toString()) || 'Unknown',
      })),
      updated_at: node.updated_at,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal server error' });
  }
}
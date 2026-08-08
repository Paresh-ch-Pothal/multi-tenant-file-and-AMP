import { Types } from 'mongoose';

/**
 * Returns a Mongo filter fragment enforcing folder-subtree RBAC scoping.
 * Empty scoped_folder_ids = full tree access (no extra filter).
 */
export function buildScopeFilter(scopedFolderIds: Types.ObjectId[]) {
  if (!scopedFolderIds || scopedFolderIds.length === 0) {
    return {}; // no restriction — full access
  }

  return {
    $or: [
      { _id: { $in: scopedFolderIds } },
      { ancestors: { $in: scopedFolderIds } },
    ],
  };
}
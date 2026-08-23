import { logger } from "../middleware/requestLogger";
import { Node } from "../models/node";
import { deleteFromS3 } from "../services/s3.services";


const STALE_PENDING_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes — generous enough that a normal slow upload never gets caught

/**
 * Finds file nodes stuck in 'pending' status for longer than the threshold —
 * these represent uploads that started but never completed (crash, timeout, etc.)
 * and cleans up both the orphaned DB record and any partial S3 object.
 */
export async function runS3Reconciliation(): Promise<{ scanned: number; cleaned: number }> {
    const cutoff = new Date(Date.now() - STALE_PENDING_THRESHOLD_MS);

    const stalePendingNodes = await Node.find({
        type: 'file',
        upload_status: 'pending',
        created_at: { $lt: cutoff },
    });

    logger.info({ count: stalePendingNodes.length }, 'S3 reconciliation: found stale pending nodes');

    let cleaned = 0;

    for (const node of stalePendingNodes) {
        try {
            // best-effort: the S3 object may or may not exist depending on where the crash happened
            if (node.file_metadata?.storage_key) {
                await deleteFromS3(node.file_metadata.storage_key).catch(() => {
                    // object may not exist at all — that's fine, nothing to clean up on the S3 side
                });
            }

            await Node.deleteOne({ _id: node._id });
            cleaned++;

            logger.info({ nodeId: node._id }, 'S3 reconciliation: cleaned up stale pending node');
        } catch (err) {
            logger.error({ err, nodeId: node._id }, 'S3 reconciliation: failed to clean up node');
        }
    }

    return { scanned: stalePendingNodes.length, cleaned };
}
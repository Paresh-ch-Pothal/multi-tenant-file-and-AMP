import { Types } from 'mongoose';
import { Permission } from '../models/TenantRole';

export {};

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
      clientId?: string;
      userId?: string;
      apiKeyId?: string;
      tenantUser?: {
        _id: Types.ObjectId;
        client_id: Types.ObjectId;
        scoped_folder_ids: Types.ObjectId[];
        permissions: Permission[];
      };
    }
  }
}
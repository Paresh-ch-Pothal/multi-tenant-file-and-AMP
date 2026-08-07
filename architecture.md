# Architecture Reference: Multi-Tenant File & Asset Management Platform

> Personal reference doc. White-label **custom domain + dynamic SSL** is out of scope for v1 (subdomain-based branding only). Logging/audit trail is treated as a core subsystem, not an afterthought.

---

## 1. Scope for v1

**In scope**
- Multi-tenant folders/files (unified node model)
- API key auth for developer integrations
- Public unauthenticated upload endpoints (scoped to a folder)
- RBAC with folder-subtree scoping
- Cascading delete (folder → subtree → S3 objects)
- Structured logging + audit trail for all node/file mutations
- Branding via subdomain (`acme.yourapp.com`) — simple lookup, no DNS/SSL automation

**Explicitly out of scope for v1**
- Custom domains (CNAME) + automated SSL provisioning
- Billing / plan tiers (schema field only, no logic)

---

## 2. Suggested Tech Stack

| Layer | Choice | Why |
|---|---|---|
| API | Node.js + Express (or Fastify) | Matches the JS-first schema in the spec; fast to build |
| DB | MongoDB (Atlas free tier) | Adjacency list + `ancestors` array pattern fits documents well |
| Storage | Cloudflare R2 (S3-compatible, no egress fees) or AWS S3 | Either works; R2 is cheaper to demo |
| Auth (staff/admin) | JWT session tokens | Simple, stateless |
| Auth (developer) | API Key + Secret (bcrypt hash) | Matches spec |
| Logging | Pino (structured JSON logs) + a Mongo `audit_logs` collection | Pino for operational logs, Mongo collection for queryable audit trail — see Section 8 |
| Deployment | Railway / Render / Fly.io | One-click deploy, good for demo links |

---

## 3. Database Schemas

### `tenants`
```json
{
  "_id": "tenant_client_101",
  "company_name": "Acme University",
  "plan_tier": "free",
  "is_active": true,
  "created_at": "2026-08-07T20:00:00Z"
}
```

### `tenant_settings` (branding — subdomain only, no custom domain/CNAME)
```json
{
  "_id": "cfg_101",
  "client_id": "tenant_client_101",
  "subdomain": "acme",
  "branding": {
    "app_title": "Acme Document Portal",
    "logo_url": "https://storage.provider.com/tenants/101/logo.png",
    "primary_color": "#1E40AF",
    "secondary_color": "#DB2777"
  },
  "created_at": "2026-08-07T20:00:00Z"
}
```

### `api_keys`
```json
{
  "_id": "key_7890",
  "client_id": "tenant_client_101",
  "key_id": "client_key_live_abc123",
  "secret_hash": "$2b$10$e88a...",
  "name": "Production Website Key",
  "is_active": true,
  "last_used_at": "2026-08-07T21:30:00Z"
}
```

### `tenant_roles`
```json
{
  "_id": "role_reviewer_202",
  "client_id": "tenant_client_101",
  "role_name": "Resume Reviewer",
  "permissions": ["node:read", "node:upload_file", "node:edit"]
}
```

### `tenant_users`
```json
{
  "_id": "user_5544",
  "client_id": "tenant_client_101",
  "email": "reviewer@acme.edu",
  "password_hash": "$2b$10$x7...",
  "role_id": "role_reviewer_202",
  "scoped_folder_ids": ["node_resumes_003"],
  "status": "active"
}
```

### `nodes` (folders + files, unified)
```json
{
  "_id": "node_resumes_003",
  "client_id": "tenant_client_101",
  "type": "folder",
  "name": "resumes",
  "parent_id": "node_student_002",
  "ancestors": ["node_class11_001", "node_student_002"],
  "is_public_upload": true,
  "file_metadata": null,
  "is_deleted": false,
  "created_by": { "actor_type": "user", "actor_id": "user_5544" },
  "created_at": "2026-08-07T20:00:00Z",
  "updated_at": "2026-08-07T20:00:00Z"
}
```
> Added `created_by` and `updated_at` — needed for audit trail joins (Section 8).

### `audit_logs` (NEW — see Section 8 for full design)
```json
{
  "_id": "log_00001",
  "client_id": "tenant_client_101",
  "actor": { "type": "user", "id": "user_5544", "label": "reviewer@acme.edu" },
  "action": "node.upload_file",
  "target": { "node_id": "node_file_9981", "parent_id": "node_resumes_003" },
  "metadata": { "file_name": "resume.pdf", "size_bytes": 204800 },
  "status": "success",
  "ip_address": "203.0.113.4",
  "created_at": "2026-08-07T21:31:02Z"
}
```

---

## 4. Request Flow: File Ingestion

```
[Public Visitor / App Frontend]
        │  file + parent_id
        ▼
[Client Developer Server]  (adds X-API-KEY / X-API-SECRET)
        ▼
[POST /api/v1/nodes/upload]
        │
        ├─► 1. Auth middleware: verify API key, resolve client_id
        ├─► 2. Load target node by parent_id, confirm client_id match
        ├─► 3. If unauthenticated request → require is_public_upload === true
        ├─► 4. Sanitize filename, stream to R2/S3
        ├─► 5. Insert node doc (type: "file")
        ├─► 6. Write audit_logs entry (success or failure — see Section 8)
        └─► 7. Return node summary
```

**Failure modes worth knowing (good interview material):**
- S3 upload succeeds, DB insert fails → orphaned object in storage. Mitigate with a periodic reconciliation job, or insert a `pending` node doc *before* streaming to S3, flip to `complete` after.
- DB insert succeeds, audit log write fails → log write should be fire-and-forget / non-blocking (don't fail the request over a logging error), but flagged via your operational logger (Pino) so you notice.

---

## 5. Folder & File Lifecycle

- **Create folder** — `POST /api/v1/nodes/folders`. Copy parent's `ancestors` + append parent `_id`.
- **Rename** — `PATCH /api/v1/nodes/:id`, updates `name` only.
- **Move** — `PATCH /api/v1/nodes/:id`, updates `parent_id`, recursively recalculates `ancestors` for the node **and all descendants** (this is the expensive write the adjacency-list tradeoff buys you fast reads for).
- **Cascading delete**:
  1. Find all nodes where `_id == target` OR `ancestors` contains `target`
  2. Extract `storage_key` for every `type: "file"` match
  3. Batch delete from S3/R2
  4. Soft-delete (`is_deleted: true`) or hard-delete the matched node docs
  5. Write one audit log entry summarizing the batch (not one per file — see Section 8)

---

## 6. RBAC

**Permissions:** `node:read`, `node:create_folder`, `node:upload_file`, `node:edit`, `node:delete`, `user:manage`, `settings:manage`

**Folder-subtree scoping** — if `scoped_folder_ids` is non-empty, every node query is filtered:
```json
{
  "$or": [
    { "_id": { "$in": user.scoped_folder_ids } },
    { "ancestors": { "$in": user.scoped_folder_ids } }
  ]
}
```
Empty `scoped_folder_ids` = full tree access.

---

## 7. Auth Middleware Pipeline

**Staff/Admin (session):** JWT → decode → attach `req.user`, `req.clientId`.

**Developer (API key):**
1. Extract `X-API-KEY`, look up in `api_keys`
2. Compare `X-API-SECRET` against `secret_hash` (bcrypt)
3. Reject if `is_active === false`
4. Attach `req.clientId`
5. Update `last_used_at` (async, non-blocking)

**Public upload (no auth):** Only reaches the handler if the target node has `is_public_upload: true` — checked *after* resolving the node, not before.

---

## 8. Logging & Audit Trail (core subsystem)

Two separate concerns — don't conflate them:

### 8a. Operational logs (Pino, structured JSON, stdout)
For debugging, uptime, performance. Not user-facing.
- Every request: method, path, `client_id`, status code, duration_ms
- Every error: stack trace, request id
- Correlate with a `request_id` (UUID) generated per request and threaded through to any audit log entry created during that request

```javascript
// middleware/requestLogger.js
import pino from 'pino';
import { randomUUID } from 'crypto';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function requestLogger(req, res, next) {
  req.requestId = randomUUID();
  req.startTime = Date.now();
  res.on('finish', () => {
    logger.info({
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      clientId: req.clientId || null,
      status: res.statusCode,
      durationMs: Date.now() - req.startTime,
    });
  });
  next();
}
```

### 8b. Audit trail (`audit_logs` collection, Mongo)
For "who did what, when" — queryable, tenant-scoped, shown to tenant admins in the UI. This is the part that reads as production-grade in an interview.

**What gets logged (mutations only, not reads):**
| Action | Trigger |
|---|---|
| `node.create_folder` | Folder created |
| `node.upload_file` | File uploaded (auth'd or public) |
| `node.rename` | Name changed |
| `node.move` | `parent_id` changed |
| `node.delete` | Single node deleted |
| `node.cascade_delete` | Folder + subtree deleted (log the count, not each file) |
| `user.invite` | Team member invited |
| `user.role_change` | Role reassigned |
| `apikey.create` / `apikey.revoke` | Developer key lifecycle |
| `settings.update` | Branding/settings changed |

**Schema (repeated from Section 3, with intent):**
```json
{
  "client_id": "tenant_client_101",
  "actor": { "type": "user | api_key | public", "id": "user_5544", "label": "reviewer@acme.edu" },
  "action": "node.upload_file",
  "target": { "node_id": "node_file_9981", "parent_id": "node_resumes_003" },
  "metadata": { "file_name": "resume.pdf", "size_bytes": 204800 },
  "status": "success | failure",
  "request_id": "matches Pino log for cross-reference",
  "ip_address": "203.0.113.4",
  "created_at": "2026-08-07T21:31:02Z"
}
```

**Implementation pattern — write via a single helper, not inline everywhere:**
```javascript
// services/auditLog.js
export async function writeAuditLog({ clientId, actor, action, target, metadata = {}, status, req }) {
  try {
    await db.audit_logs.insertOne({
      client_id: clientId,
      actor,
      action,
      target,
      metadata,
      status,
      request_id: req?.requestId || null,
      ip_address: req?.ip || null,
      created_at: new Date(),
    });
  } catch (err) {
    // Never let audit logging fail the main request — log the failure operationally instead
    logger.error({ err, action }, 'audit log write failed');
  }
}
```

Call it at the point of mutation, after the DB write succeeds:
```javascript
await db.nodes.insertOne(newFileNode);
await writeAuditLog({
  clientId: req.clientId,
  actor: { type: 'api_key', id: req.apiKeyId, label: req.apiKeyName },
  action: 'node.upload_file',
  target: { node_id: newFileNode._id, parent_id: newFileNode.parent_id },
  metadata: { file_name: newFileNode.name, size_bytes: newFileNode.file_metadata.size_bytes },
  status: 'success',
  req,
});
```

**Retention & indexing (mention this even if you don't fully build it — shows you've thought about scale):**
- Index on `{ client_id: 1, created_at: -1 }` for tenant-scoped timeline queries
- Index on `{ client_id: 1, "target.node_id": 1 }` for "show history of this file"
- TTL index or scheduled archival job if logs need to expire (e.g., 90-day retention on a free tier)

**Endpoint to expose it:**
`GET /api/v1/tenant/audit-logs?node_id=&action=&from=&to=` — permission: `settings:manage` (or a new `audit:read`)

---

## 9. API Endpoint Reference

| Method | Endpoint | Auth | Permission | Notes |
|---|---|---|---|---|
| POST | `/api/v1/auth/keys` | Session | `settings:manage` | Generate API key, logs `apikey.create` |
| GET | `/api/v1/auth/keys` | Session | `settings:manage` | List keys |
| GET | `/api/v1/tenant/settings` | Session / subdomain | Public / `settings:read` | Branding config |
| PATCH | `/api/v1/tenant/settings` | Session | `settings:manage` | Logs `settings.update` |
| GET | `/api/v1/tenant/users` | Session | `user:manage` | List team |
| POST | `/api/v1/tenant/users/invite` | Session | `user:manage` | Logs `user.invite` |
| POST | `/api/v1/tenant/roles` | Session | `user:manage` | Define role |
| GET | `/api/v1/nodes` | Session / API key | `node:read` | List by `parent_id`, scoped by RBAC |
| POST | `/api/v1/nodes/folders` | Session / API key | `node:create_folder` | Logs `node.create_folder` |
| POST | `/api/v1/nodes/upload` | Session / API key / Public | `node:upload_file` / public | Logs `node.upload_file` |
| PATCH | `/api/v1/nodes/:id` | Session | `node:edit` | Logs `node.rename` or `node.move` |
| DELETE | `/api/v1/nodes/:id` | Session | `node:delete` | Logs `node.delete` or `node.cascade_delete` |
| GET | `/api/v1/tenant/audit-logs` | Session | `settings:manage` | NEW — query audit trail |

---

## 10. Build Order (v1, no custom domains)

1. **Core node system** — schemas, folder CRUD, `ancestors` logic
2. **Logging foundation** — Pino request logger + `audit_logs` write helper, wired in from day one (retrofitting logging later is painful and it's a cheap win to build early)
3. **Ingestion pipeline** — S3/R2 streaming upload, filename sanitization, public upload check
4. **API key auth** — generation, bcrypt verification middleware
5. **Lifecycle ops** — rename, move (recursive ancestors), cascading delete
6. **RBAC** — roles, permission middleware, folder-subtree scoping
7. **Subdomain branding (lightweight)** — simple lookup by subdomain, no DNS/SSL
8. **Audit log UI/endpoint** — surface the trail you've been writing since step 2

---

## 11. Interview Talking Points Checklist

- [ ] Explain multi-tenancy isolation: every query filtered by `client_id`, no way to cross-tenant leak
- [ ] Explain `ancestors` array tradeoff (fast subtree reads, recursive write cost on move)
- [ ] Walk through the upload request flow end-to-end from memory
- [ ] Explain cascading delete failure handling (partial S3 batch failure)
- [ ] Explain why audit logs are a separate collection from operational logs, and how `request_id` ties them together
- [ ] Explain folder-subtree RBAC query and why empty `scoped_folder_ids` means full access
- [ ] Be honest about what's stubbed (billing, custom domains) and why you scoped them out

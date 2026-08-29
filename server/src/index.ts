import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db';
import { requestLogger, logger } from './middleware/requestLogger';
import authRoutes from './routes/auth.routes';
import nodeRoutes from './routes/node.routes';
import settingsRoutes from './routes/settings.routes';
import auditLogRoutes from './routes/auditLog.routes';
import tennantRoutes from './routes/tenant.routes';
import roleRoutes from './routes/role.routes';
import userRoutes from './routes/user.routes';
import apiKeyRoutes from './routes/apiKey.routes';
import catalogRoutes from './routes/catalog.routes';
import { generalLimiter } from './middleware/rareLimiter.middleware';
import webhookRoutes from './routes/webhook.routes';
import { runS3Reconciliation } from './jobs/s3Reconciliation.job';

dotenv.config();

const app = express();

// const allowedOrigins = [
//   process.env.FRONTEND_URL || 'http://localhost:5173',
//   'http://127.0.0.1:5500', // VS Code Live Server, used for the local dev-tools tester page
//   'http://localhost:5500',
//   '*'
// ];

// const corsOptions = {
//   origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
//     // allow no-origin requests (curl, Postman, file:// pages) and any whitelisted dev origin
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-KEY', 'X-API-SECRET', 'X-Upload-Token'],
//   exposedHeaders: ['Content-Range', 'X-Total-Count'],
//   credentials: true,
//   maxAge: 86400,
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(requestLogger);
app.use('/v1/', generalLimiter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/v1/auth", authRoutes)
app.use("/v1/nodes", nodeRoutes)
app.use("/v1/settings", settingsRoutes)
app.use("/v1/audit", auditLogRoutes)
app.use("/v1/tenant", tennantRoutes)
app.use("/v1/roles", roleRoutes)
app.use("/v1/users", userRoutes)
app.use("/v1/api-keys", apiKeyRoutes)
app.use("/v1/catalog", catalogRoutes);
app.use("/v1/webhooks", webhookRoutes);


const PORT = process.env.PORT || 4000;
const RECONCILIATION_INTERVAL_MS = 60 * 60 * 1000; // hourly

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  // run once shortly after startup, then on a recurring interval
  setTimeout(() => {
    runS3Reconciliation().catch((err) => logger.error({ err }, 'S3 reconciliation job failed'));
  }, 30 * 1000); // wait 30s after boot so it doesn't compete with startup

  setInterval(() => {
    runS3Reconciliation().catch((err) => logger.error({ err }, 'S3 reconciliation job failed'));
  }, RECONCILIATION_INTERVAL_MS);
});
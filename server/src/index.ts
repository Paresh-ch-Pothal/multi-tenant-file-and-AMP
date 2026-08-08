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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/v1/auth",authRoutes)
app.use("/v1/nodes",nodeRoutes)
app.use("v1/settings",settingsRoutes)
app.use("v1/audit",auditLogRoutes)
app.use("v1/tenant",tennantRoutes)
app.use("v1/roles",roleRoutes)


const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});
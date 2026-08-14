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

dotenv.config();

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Total-Count'],
  credentials: true,
  
  maxAge: 86400,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use("/v1/auth",authRoutes)
app.use("/v1/nodes",nodeRoutes)
app.use("/v1/settings",settingsRoutes)
app.use("/v1/audit",auditLogRoutes)
app.use("/v1/tenant",tennantRoutes)
app.use("/v1/roles",roleRoutes)
app.use("/v1/users",userRoutes)
app.use("/v1/api-keys",apiKeyRoutes)
app.use("/v1/catalog", catalogRoutes);


const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});
import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { randomUUID } from 'crypto';

export const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  req.requestId = randomUUID();
  req.startTime = Date.now();

  res.on('finish', () => {
    logger.info({
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      clientId: req.clientId || null,
      status: res.statusCode,
      durationMs: Date.now() - (req.startTime ?? Date.now()),
    });
  });

  next();
}
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Comprehensive HTTP Request logging middleware.
 * Logs method, original URL, response status code, and execution duration.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} [Status ${res.statusCode}] - ${duration}ms`);
  });
  next();
};

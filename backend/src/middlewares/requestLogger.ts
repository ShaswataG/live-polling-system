import type { Request, Response, NextFunction } from 'express';
const logger = require('../utils/logger');

const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
  logger.info(`${req.method} ${req.url}`);
  next();
};

module.exports = requestLogger;
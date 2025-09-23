
import type { Request, Response, NextFunction } from 'express';
const { errorResponse } = require('../utils/apiResponse.js');

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json(errorResponse(err.message || 'Server Error'));
};

module.exports = errorHandler;


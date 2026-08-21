import { errorResponse } from '../utils/apiResponse.js';

/**
 * 404 Not Found Middleware
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Central Error Handler Middleware
 */
export const centralErrorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  console.error(`💥 [Central Error Handler]: ${err.message}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  return errorResponse(
    res,
    statusCode,
    err.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : undefined
  );
};

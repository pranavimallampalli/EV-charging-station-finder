import { sendError } from '../utils/apiResponse.js';

/**
 * 404 handler for undefined API routes
 */
export const notFoundHandler = (req, res) => {
  return sendError(res, 404, `Endpoint not found: ${req.method} ${req.originalUrl}`);
};

/**
 * Global centralized error-handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Application Error:', err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 400, 'Validation Error', messages);
  }

  // Mongoose CastError (e.g. invalid type or ID)
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid value provided for field: ${err.path}`);
  }

  // Duplicate Key Error (MongoDB E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return sendError(res, 409, `Duplicate value for ${field}. A record with this value already exists.`);
  }

  // Generic internal server error
  return sendError(
    res,
    err.statusCode || 500,
    err.message || 'An unexpected internal server error occurred.'
  );
};

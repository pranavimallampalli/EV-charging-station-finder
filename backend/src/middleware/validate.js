import mongoose from 'mongoose';
import { sendError } from '../utils/apiResponse.js';
import { isDBConnected } from '../config/db.js';

/**
 * Middleware to verify database connection before performing database queries
 */
export const requireDB = (req, res, next) => {
  if (!isDBConnected()) {
    return sendError(
      res,
      503,
      'Database service is currently unavailable. Please verify that MongoDB is running and MONGODB_URI is correctly configured.'
    );
  }
  next();
};

/**
 * Middleware to validate MongoDB ObjectId in route parameters
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && id.startsWith('osm-')) {
      return next();
    }
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, `Invalid station ID format: '${id}'. Must be a 24-character hexadecimal ObjectId.`);
    }
    next();
  };
};

/**
 * Middleware to validate required fields for creating a Station
 */
export const validateCreateStation = (req, res, next) => {
  const { name, address, connectors } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.push('Field "name" is required and must be a non-empty string.');
  }

  if (!address || typeof address !== 'object') {
    errors.push('Field "address" is required and must be an object.');
  } else if (!address.city || typeof address.city !== 'string' || !address.city.trim()) {
    errors.push('Field "address.city" is required and must be a non-empty string.');
  }

  if (!connectors || !Array.isArray(connectors) || connectors.length === 0) {
    errors.push('Field "connectors" is required and must be an array with at least one connector entry.');
  }

  if (errors.length > 0) {
    return sendError(res, 400, 'Validation failed: missing or invalid required fields.', errors);
  }

  next();
};

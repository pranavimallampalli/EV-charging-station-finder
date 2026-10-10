/**
 * Standardized API Response Helpers
 */

export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, extra = {}) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  if (extra.count !== undefined) {
    response.count = extra.count;
  }

  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, error = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    error
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

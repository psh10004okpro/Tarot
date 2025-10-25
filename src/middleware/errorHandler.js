/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const logger = require('../utils/logger');

/**
 * Custom Error class
 */
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.code = err.code;

  // Log error
  if (error.statusCode >= 500) {
    logger.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn('Client Error:', {
      message: err.message,
      path: req.path,
      method: req.method,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
    error.code = 'RESOURCE_NOT_FOUND';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error.message = `${field || 'Field'} already exists`;
    error.statusCode = 400;
    error.code = 'DUPLICATE_FIELD';
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => ({
      field: val.path,
      message: val.message,
    }));
    error.message = 'Validation failed';
    error.statusCode = 400;
    error.code = 'VALIDATION_ERROR';
    error.details = errors;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
    error.code = 'INVALID_TOKEN';
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
    error.code = 'TOKEN_EXPIRED';
  }

  // Construct response
  const response = {
    success: false,
    error: {
      message: error.message || 'Server Error',
      code: error.code || 'INTERNAL_ERROR',
    },
  };

  // Add details in development mode or if validation errors
  if (process.env.NODE_ENV === 'development') {
    response.error.details = error.details;
    response.error.stack = err.stack;
  } else if (error.details) {
    response.error.details = error.details;
  }

  res.status(error.statusCode).json(response);
};

/**
 * Not found handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
};

/**
 * Logger Utility
 * Provides logging functionality for the application
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format log message with timestamp
 */
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';

  return `[${timestamp}] [${level}] ${message} ${metaStr}`.trim();
};

/**
 * Log error message
 */
const error = (message, meta = {}) => {
  console.error(formatMessage(LOG_LEVELS.ERROR, message, meta));
};

/**
 * Log warning message
 */
const warn = (message, meta = {}) => {
  console.warn(formatMessage(LOG_LEVELS.WARN, message, meta));
};

/**
 * Log info message
 */
const info = (message, meta = {}) => {
  console.log(formatMessage(LOG_LEVELS.INFO, message, meta));
};

/**
 * Log debug message (only in development)
 */
const debug = (message, meta = {}) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(formatMessage(LOG_LEVELS.DEBUG, message, meta));
  }
};

module.exports = {
  error,
  warn,
  info,
  debug,
  LOG_LEVELS,
};

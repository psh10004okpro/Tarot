/**
 * Helper Utilities
 * Common utility functions
 */

/**
 * Format response for API
 */
const formatResponse = (success, data = null, error = null) => {
  const response = { success };

  if (data) {
    response.data = data;
  }

  if (error) {
    response.error = error;
  }

  return response;
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 20) => {
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  return {
    skip: (parsedPage - 1) * parsedLimit,
    limit: parsedLimit,
    page: parsedPage,
  };
};

/**
 * Calculate pagination metadata
 */
const getPaginationMeta = (total, page, limit) => {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / parseInt(limit)),
  };
};

/**
 * Sanitize user input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove basic HTML characters
};

/**
 * Generate random boolean with probability
 */
const randomBoolean = (probability = 0.5) => {
  return Math.random() < probability;
};

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Sleep utility for async operations
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Check if value is valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

module.exports = {
  formatResponse,
  paginate,
  getPaginationMeta,
  sanitizeInput,
  randomBoolean,
  shuffleArray,
  sleep,
  isValidObjectId,
};

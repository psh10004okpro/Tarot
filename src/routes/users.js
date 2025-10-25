const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePassword,
  getStats,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { updateProfileSchema, updatePasswordSchema } = require('../middleware/validation');

/**
 * User Routes
 * All routes require authentication
 */

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, getProfile);

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

/**
 * @route   PUT /api/v1/users/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/password', protect, validate(updatePasswordSchema), updatePassword);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get user statistics
 * @access  Private
 */
router.get('/stats', protect, getStats);

module.exports = router;

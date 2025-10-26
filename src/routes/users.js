const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePassword,
  getStats,
} = require('../controllers/userController');
const {
  getUserDashboard,
  getCategoryStats,
  getCardFrequency,
  getReadingPatterns,
} = require('../controllers/dashboardController');
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

/**
 * Dashboard Routes
 */

/**
 * @route   GET /api/v1/users/dashboard
 * @desc    Get comprehensive user dashboard
 * @access  Private
 */
router.get('/dashboard', protect, getUserDashboard);

/**
 * @route   GET /api/v1/users/dashboard/categories
 * @desc    Get detailed category statistics
 * @access  Private
 */
router.get('/dashboard/categories', protect, getCategoryStats);

/**
 * @route   GET /api/v1/users/dashboard/cards
 * @desc    Get card frequency analysis
 * @access  Private
 */
router.get('/dashboard/cards', protect, getCardFrequency);

/**
 * @route   GET /api/v1/users/dashboard/patterns
 * @desc    Get time-based reading patterns
 * @access  Private
 */
router.get('/dashboard/patterns', protect, getReadingPatterns);

module.exports = router;

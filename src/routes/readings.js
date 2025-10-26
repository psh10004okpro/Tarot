const express = require('express');
const {
  createReading,
  getMyReadings,
  getReading,
  updateReading,
  deleteReading,
  submitFeedback,
  getPublicReadings,
  getSharedReading,
  toggleReadingVisibility,
  incrementReadingShare,
} = require('../controllers/readingController');
const {
  likeReading,
  unlikeReading,
  getReadingLikes,
  checkLikeStatus,
} = require('../controllers/likeController');
const {
  createComment,
  getReadingComments,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');
const { validate, createReadingSchema, readingFeedbackSchema } = require('../middleware/validation');

const router = express.Router();

/**
 * Reading Routes
 */

// Public routes (must come before /:id to avoid route collision)
router.get('/public', getPublicReadings);
router.get('/shared/:id', getSharedReading);

// User's own readings
router.route('/')
  .get(protect, getMyReadings)
  .post(protect, validate(createReadingSchema), createReading);

// Reading actions
router.post('/:id/feedback', protect, validate(readingFeedbackSchema), submitFeedback);
router.put('/:id/visibility', protect, toggleReadingVisibility);
router.post('/:id/share', incrementReadingShare);

// Social features - Likes
router.route('/:id/like')
  .post(protect, likeReading)
  .delete(protect, unlikeReading);
router.get('/:id/like/status', protect, checkLikeStatus);
router.get('/:id/likes', getReadingLikes);

// Social features - Comments
router.route('/:id/comments')
  .get(getReadingComments)
  .post(protect, createComment);

// Single reading CRUD
router.route('/:id')
  .get(protect, getReading)
  .put(protect, updateReading)
  .delete(protect, deleteReading);

module.exports = router;

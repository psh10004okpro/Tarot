const express = require('express');
const {
  createReading,
  getMyReadings,
  getReading,
  updateReading,
  deleteReading,
  submitFeedback,
} = require('../controllers/readingController');
const { protect } = require('../middleware/auth');
const { validate, createReadingSchema, readingFeedbackSchema } = require('../middleware/validation');

const router = express.Router();

/**
 * Reading Routes
 */

router.route('/')
  .get(protect, getMyReadings)
  .post(protect, validate(createReadingSchema), createReading);

router.post('/:id/feedback', protect, validate(readingFeedbackSchema), submitFeedback);

router.route('/:id')
  .get(protect, getReading)
  .put(protect, updateReading)
  .delete(protect, deleteReading);

module.exports = router;

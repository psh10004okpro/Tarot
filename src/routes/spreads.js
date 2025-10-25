const express = require('express');
const {
  getAllSpreads,
  getSpread,
  createSpread,
  updateSpread,
  deleteSpread,
} = require('../controllers/spreadController');
const { protect, authorize } = require('../middleware/auth');
const { validate, createSpreadSchema } = require('../middleware/validation');

const router = express.Router();

/**
 * Spread Routes
 */

router.route('/')
  .get(getAllSpreads)
  .post(protect, authorize('admin'), validate(createSpreadSchema), createSpread);

router.route('/:id')
  .get(getSpread)
  .put(protect, authorize('admin'), updateSpread)
  .delete(protect, authorize('admin'), deleteSpread);

module.exports = router;

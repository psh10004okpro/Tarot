const express = require('express');
const {
  getAllCards,
  searchCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  getRandomCards,
} = require('../controllers/cardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/**
 * Card Routes
 */

router.route('/')
  .get(getAllCards)
  .post(protect, authorize('admin'), createCard);

router.get('/search', searchCards);
router.get('/random/:count', getRandomCards);

router.route('/:id')
  .get(getCard)
  .put(protect, authorize('admin'), updateCard)
  .delete(protect, authorize('admin'), deleteCard);

module.exports = router;

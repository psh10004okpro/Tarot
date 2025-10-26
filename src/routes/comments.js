const express = require('express');
const {
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * Comment Routes
 * Operations on individual comments
 */

// Comment CRUD
router.route('/:id')
  .put(protect, updateComment)
  .delete(protect, deleteComment);

// Comment likes
router.route('/:id/like')
  .post(protect, likeComment)
  .delete(protect, unlikeComment);

module.exports = router;

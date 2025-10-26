const mongoose = require('mongoose');

/**
 * Like Schema
 * Tracks user likes on public readings
 */
const likeSchema = new mongoose.Schema({
  reading: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reading',
    required: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

// Compound unique index to prevent duplicate likes
likeSchema.index({ reading: 1, user: 1 }, { unique: true });

// Index for querying user's likes
likeSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Like', likeSchema);

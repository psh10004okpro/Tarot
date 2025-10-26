const mongoose = require('mongoose');

/**
 * Comment Schema
 * Stores user comments on public readings
 */
const commentSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    minlength: [1, 'Comment must not be empty'],
    maxlength: [500, 'Comment must be less than 500 characters'],
  },

  // Comment metadata
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  likesCount: {
    type: Number,
    default: 0,
  },

  // Moderation
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: {
    type: Date,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
commentSchema.index({ reading: 1, createdAt: -1 }); // Get comments for a reading
commentSchema.index({ user: 1, createdAt: -1 }); // Get user's comments
commentSchema.index({ reading: 1, likesCount: -1 }); // Get top comments

module.exports = mongoose.model('Comment', commentSchema);

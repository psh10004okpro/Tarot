const mongoose = require('mongoose');

/**
 * Tarot Reading Schema
 * Stores user tarot reading sessions and AI interpretations
 */
const readingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  spread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spread',
    required: true,
  },
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question must be less than 500 characters'],
  },
  cards: [{
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    isReversed: {
      type: Boolean,
      default: false,
    },
  }],
  interpretation: {
    type: String,
    required: true,
  },
  aiModel: {
    type: String,
    default: 'claude-3-opus',
  },
  category: {
    type: String,
    enum: ['general', 'love', 'career', 'spiritual', 'decision'],
    default: 'general',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes must be less than 1000 characters'],
  },
  tags: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
readingSchema.index({ user: 1, createdAt: -1 });
readingSchema.index({ spread: 1 });
readingSchema.index({ category: 1 });

// Validate cards array length matches spread's cardCount
readingSchema.pre('save', async function (next) {
  if (this.isModified('cards') || this.isNew) {
    try {
      const Spread = mongoose.model('Spread');
      const spread = await Spread.findById(this.spread);

      if (!spread) {
        return next(new Error('Spread not found'));
      }

      if (this.cards.length !== spread.cardCount) {
        return next(new Error('Number of cards must match spread cardCount'));
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Reading', readingSchema);

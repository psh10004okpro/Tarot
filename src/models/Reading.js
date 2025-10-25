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
    index: true,
  },
  spread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Spread',
    required: true,
    index: true,
  },

  // User Input
  question: {
    type: String,
    required: [true, 'Question is required'],
    trim: true,
    maxlength: [500, 'Question must be less than 500 characters'],
  },
  questionCategory: {
    type: String,
    enum: ['love', 'career', 'spiritual', 'general', 'health'],
    default: 'general',
  },

  // Cards Drawn
  cardsDrawn: [{
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    orientation: {
      type: String,
      enum: ['upright', 'reversed'],
      default: 'upright',
    },
    positionMeaning: {
      type: String,
    },
  }],

  // AI Interpretation
  aiInterpretation: {
    fullReading: {
      type: String,
      required: true,
    },
    positionReadings: [{
      position: Number,
      interpretation: String,
    }],
    overallMessage: {
      type: String,
    },
    advice: {
      type: String,
    },
    generatedBy: {
      type: String,
      default: 'claude-sonnet-4',
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },

  // User Feedback
  userFeedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    accuracyRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    clarityRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    usefulnessRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    resonated: {
      type: Boolean,
    },
  },

  // Voice Reading
  isVoiceReading: {
    type: Boolean,
    default: false,
  },
  audioUrl: {
    type: String,
  },

  // Metadata
  tags: [{
    type: String,
    trim: true,
  }],
  isFavorite: {
    type: Boolean,
    default: false,
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes must be less than 1000 characters'],
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
readingSchema.index({ user: 1, createdAt: -1 });
readingSchema.index({ spread: 1 });
readingSchema.index({ questionCategory: 1 });
readingSchema.index({ isFavorite: 1 });
readingSchema.index({ isPublic: 1 });

// Validate cards array length matches spread's cardCount
readingSchema.pre('save', async function (next) {
  if (this.isModified('cardsDrawn') || this.isNew) {
    try {
      const Spread = mongoose.model('Spread');
      const spread = await Spread.findById(this.spread);

      if (!spread) {
        return next(new Error('Spread not found'));
      }

      if (this.cardsDrawn.length !== spread.cardCount) {
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

const mongoose = require('mongoose');

/**
 * Tarot Spread Schema
 * Defines different tarot spread patterns and their positions
 */
const spreadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Spread name is required'],
    unique: true,
    trim: true,
  },
  nameKo: {
    type: String,
    required: [true, 'Korean spread name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Spread description is required'],
  },
  cardCount: {
    type: Number,
    required: [true, 'Card count is required'],
    min: [1, 'Spread must have at least 1 card'],
    max: [10, 'Spread cannot have more than 10 cards'],
  },
  positions: [{
    position: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameKo: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    interpretationGuide: {
      type: String,
    },
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner',
  },
  category: {
    type: String,
    enum: ['love', 'career', 'spiritual', 'general', 'health'],
    default: 'general',
  },
  imageLayout: {
    type: String,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  popularity: {
    type: Number,
    default: 0,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Validate positions array length matches cardCount
spreadSchema.pre('save', function (next) {
  if (this.positions.length !== this.cardCount) {
    next(new Error('Number of positions must match cardCount'));
  } else {
    this.updatedAt = new Date();
    next();
  }
});

// Index for efficient queries
spreadSchema.index({ category: 1, difficulty: 1 });
spreadSchema.index({ popularity: -1 });

module.exports = mongoose.model('Spread', spreadSchema);

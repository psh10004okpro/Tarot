const mongoose = require('mongoose');

/**
 * Tarot Card Schema
 * Represents individual tarot cards with their meanings and symbolism
 */
const cardSchema = new mongoose.Schema({
  nameShort: {
    type: String,
    required: [true, 'Card short name is required'],
    unique: true,
    trim: true,
    uppercase: true,
    // Examples: "AR00", "CU01", "WA14"
  },
  name: {
    type: String,
    required: [true, 'Card name is required'],
    trim: true,
    // Examples: "The Fool", "Ace of Cups"
  },
  nameKo: {
    type: String,
    required: [true, 'Korean card name is required'],
    trim: true,
    // Examples: "광대", "컵 에이스"
  },
  arcana: {
    type: String,
    enum: ['Major', 'Minor'],
    required: true,
  },
  suit: {
    type: String,
    enum: ['Wands', 'Cups', 'Swords', 'Pentacles', null],
    default: null,
  },
  number: {
    type: Number,
    required: [true, 'Card number is required'],
    min: 0,
    max: 78,
  },

  // Meanings and Keywords
  meaningUpright: [{
    type: String,
    trim: true,
  }],
  meaningReversed: [{
    type: String,
    trim: true,
  }],
  keywordsUpright: [{
    type: String,
    trim: true,
  }],
  keywordsReversed: [{
    type: String,
    trim: true,
  }],

  // Descriptions
  descriptionShort: {
    type: String,
    maxlength: 200,
  },
  descriptionLong: {
    type: String,
  },

  // Symbolism and Elements
  element: {
    type: String,
    enum: ['Fire', 'Water', 'Air', 'Earth', null],
    default: null,
  },
  symbolism: [{
    type: String,
    trim: true,
  }],

  // Guidance and Questions
  questionsToAsk: [{
    type: String,
    trim: true,
  }],
  affirmation: {
    type: String,
  },

  // Korean Market Specific
  fortunetellingKo: [{
    type: String,
    trim: true,
  }],
  relatedHanja: {
    type: String,
    trim: true,
  },

  // Astrological and Mystical
  astrology: {
    type: String,
  },
  numerology: {
    type: String,
  },

  // Media
  imageUrl: {
    type: String,
  },

  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
cardSchema.index({ nameShort: 1 }, { unique: true });
cardSchema.index({ arcana: 1 });
cardSchema.index({ suit: 1, number: 1 });
cardSchema.index({ keywordsUpright: 'text', keywordsReversed: 'text' });

// Pre-save hook to update timestamps
cardSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Card', cardSchema);

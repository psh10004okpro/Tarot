const mongoose = require('mongoose');

/**
 * Tarot Card Schema
 * Represents individual tarot cards with their meanings and symbolism
 */
const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Card name is required'],
    unique: true,
    trim: true,
  },
  nameKo: {
    type: String,
    required: [true, 'Korean card name is required'],
    trim: true,
  },
  number: {
    type: Number,
    required: [true, 'Card number is required'],
    min: 0,
    max: 77,
  },
  suit: {
    type: String,
    enum: ['major', 'wands', 'cups', 'swords', 'pentacles'],
    required: true,
  },
  arcana: {
    type: String,
    enum: ['major', 'minor'],
    required: true,
  },
  uprightMeaning: {
    type: String,
    required: [true, 'Upright meaning is required'],
  },
  reversedMeaning: {
    type: String,
    required: [true, 'Reversed meaning is required'],
  },
  keywords: [{
    type: String,
    trim: true,
  }],
  symbolism: {
    type: String,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  element: {
    type: String,
    enum: ['fire', 'water', 'air', 'earth', 'spirit', null],
  },
  astrology: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
cardSchema.index({ suit: 1, number: 1 });
cardSchema.index({ arcana: 1 });

module.exports = mongoose.model('Card', cardSchema);

const mongoose = require('mongoose');

/**
 * Tarot Card Schema
 * Represents individual tarot cards with their meanings and symbolism
 * Updated to match tarot_cards_en_keys.json structure
 */
const cardSchema = new mongoose.Schema({
  // Card identification
  card: {
    type: String,
    required: [true, 'Card identifier is required'],
    unique: true,
    trim: true,
    // Examples: "0. THE FOOL / 바보(광대) / 메이저 아르카나"
  },
  nameShort: {
    type: String,
    trim: true,
    uppercase: true,
    index: true,
    // Examples: "AR00", "CU01", "WA14" - generated from card info
  },
  name: {
    type: String,
    trim: true,
    // Examples: "The Fool", "Ace of Cups" - extracted from card field
  },
  nameKo: {
    type: String,
    trim: true,
    // Examples: "광대", "컵 에이스" - extracted from card field
  },
  arcana: {
    type: String,
    enum: ['Major', 'Minor'],
    // Extracted from card field
  },
  suit: {
    type: String,
    enum: ['Wands', 'Cups', 'Swords', 'Pentacles', null],
    default: null,
  },
  number: {
    type: Number,
    min: 0,
    max: 78,
    index: true,
    // Extracted from card field (0-21 for Major, 1-14 for Minor suits)
  },

  // Visual Description
  imageDescription: {
    type: String,
    // Korean description of the card imagery
  },

  // Keywords
  keywords: [{
    type: String,
    trim: true,
  }],

  // Life Aspect Interpretations (All in Korean)
  love: {
    type: String,
    // 연애 운세 해석
  },
  relationship: {
    type: String,
    // 인간관계 해석
  },
  finance: {
    type: String,
    // 금전운 해석
  },
  educationCareerBusiness: {
    type: String,
    // 학업/직업/사업 해석
  },
  reunion: {
    type: String,
    // 재회 해석
  },
  contract: {
    type: String,
    // 계약 해석
  },
  travelMoving: {
    type: String,
    // 여행/이동 해석
  },
  jobChange: {
    type: String,
    // 이직 해석
  },
  health: {
    type: String,
    // 건강 해석
  },
  places: {
    type: String,
    // 장소 관련 해석
  },
  mood: {
    type: String,
    // 기분/감정 상태
  },

  // Symbolism and Mysticism
  numerology: {
    type: String,
    // 숫자학적 의미
  },
  symbolism: {
    type: String,
    // 상징 해석
  },

  // Guidance
  advice: {
    type: String,
    // 조언
  },
  caution: {
    type: String,
    // 주의사항
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
// Note: nameShort and card indexes are already created by 'index: true' and 'unique: true' options
cardSchema.index({ arcana: 1 });
cardSchema.index({ suit: 1, number: 1 });
cardSchema.index({ keywords: 'text' });

// Pre-save hook to update timestamps
cardSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Card', cardSchema);

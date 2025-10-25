const claudeService = require('./claudeService');
const logger = require('../utils/logger');

/**
 * Tarot Service
 * Business logic for tarot readings and AI interpretation
 */

/**
 * Perform AI-powered tarot reading interpretation
 * @param {Object} spread - The spread document
 * @param {Array} selectedCards - The selected card documents
 * @param {Array} cards - Cards with position and reversed status
 * @param {String} question - User's question
 * @param {String} category - Question category (love, career, etc.)
 * @param {Object} userProfile - User profile for personalization
 * @returns {Object} AI interpretation with full reading, position readings, message, and advice
 */
const performTarotReading = async (spread, selectedCards, cards, question, category = 'general', userProfile = null) => {
  try {
    // Prepare card data for Claude service
    const cardsData = cards.map((cardItem, index) => {
      const card = selectedCards[index];

      return {
        position: cardItem.position,
        isReversed: cardItem.isReversed,
        card: {
          _id: card._id,
          name: card.name,
          nameKo: card.nameKo,
          nameShort: card.nameShort,
          number: card.number,
          arcana: card.arcana,
          suit: card.suit,
          meaningUpright: card.meaningUpright,
          meaningReversed: card.meaningReversed,
          keywordsUpright: card.keywordsUpright,
          keywordsReversed: card.keywordsReversed,
        },
      };
    });

    // Prepare reading data for Claude API
    const readingData = {
      question,
      category,
      cards: cardsData,
      spread: {
        _id: spread._id,
        name: spread.name,
        nameKo: spread.nameKo,
        description: spread.description,
        cardCount: spread.cardCount,
        positions: spread.positions,
      },
      userProfile: userProfile || { expertiseLevel: 'beginner' },
    };

    // Call Claude service to generate interpretation
    logger.info('Generating AI interpretation with Claude API');
    const interpretation = await claudeService.generateTarotInterpretation(readingData);

    return interpretation;
  } catch (error) {
    logger.error('Error in performTarotReading:', { error: error.message });

    // Generate fallback interpretation if Claude API fails
    const cardsData = cards.map((cardItem, index) => {
      const card = selectedCards[index];
      return {
        position: cardItem.position,
        isReversed: cardItem.isReversed,
        card,
      };
    });

    return claudeService.generateFallbackInterpretation(cardsData);
  }
};

/**
 * Validate reading request
 * @param {String} spreadId - Spread ID
 * @param {String} question - User's question
 * @returns {Object} Validation result
 */
const validateReadingRequest = (spreadId, question) => {
  const errors = [];

  if (!spreadId) {
    errors.push('Spread ID is required');
  }

  if (!question || question.trim().length === 0) {
    errors.push('Question is required');
  }

  if (question && question.length > 500) {
    errors.push('Question must be less than 500 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  performTarotReading,
  validateReadingRequest,
};
